import type { Context } from "@netlify/functions";
import xml2js from "xml2js";

export default async (req: Request, context: Context) => {
  const { user_id } = context.params;

  const steam_response = await fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=977D991A5B10029080C3BE87350C09B5&format=json&steamids=${user_id}`);
  const steam_json = await steam_response.json();

  const steam_player = steam_json.response.players[0];
  if (!steam_player) {
    const response = new Response("Player not found", { status: 404 });
    return response;
  }

  const game_id = steam_player.gameid;
  if (!game_id) {
    const response = new Response("Player is not currently in a game", { status: 400 });
    return response;
  }

  const lobby_id = steam_player.lobbysteamid;
  if (!lobby_id) {
    const response = new Response("Player is not currently in a lobby", { status: 400 });
    return response;
  }

  const location = `steam://joinlobby/${game_id}/${lobby_id}/${user_id}`;

  const profile_response = await fetch(`${steam_player.profileurl}?xml=true`);
  const profile_text = await profile_response.text();
  const parser = new xml2js.Parser();
  const doc = await parser.parseStringPromise(profile_text);

  //console.log(profile_text);
  console.log(doc.profile);

  const htmlContent = `
  <html prefix="og: https://ogp.me/ns#">
    <head>
      <meta property="og:title" content="${doc.profile.steamID}" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="${location}" />
      <meta property="og:image" content="${doc.profile.inGameInfo[0].gameIcon[0]}" />
      <meta property="og:description" content="I'm in a lobby for \`${doc.profile.inGameInfo[0].gameName[0]}\`! Join me by clicking the link" />
    </head>
  </html>`;

  const response = new Response(htmlContent, { status: 301 });
  response.headers.set("Location", location);

  return response;
}

export const config: Config = {
  path: "/steamjoin/:user_id",
};
