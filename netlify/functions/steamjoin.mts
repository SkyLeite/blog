import type { Context } from "@netlify/functions";

export default async (req: Request, context: Context) => {
  const { user_id } = context.params;

  const steam_response = await fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=977D991A5B10029080C3BE87350C09B5&format=json&steamids=${user_id}`);
  const steam_json = await steam_response.json();

  const steam_player = steam_json.response.players[0];
  if (!steam_player) {
    let response = new Response("Player not found", { status: 404 });
    return response;
  }

  const game_id = steam_player.gameid;
  if (!game_id) {
    let response = new Response("Player is not currently in a game", { status: 400 });
    return response;
  }

  const lobby_id = steam_player.lobbysteamid;
  if (!lobby_id) {
    let response = new Response("Player is not currently in a lobby", { status: 400 });
    return response;
  }

  let response = new Response("Moved", { status: 301 });
  response.headers.set("Location", `steam://joinlobby/${game_id}/${lobby_id}/${user_id}`);

  return response;
}

export const config: Config = {
  path: "/steamjoin/:user_id",
};
