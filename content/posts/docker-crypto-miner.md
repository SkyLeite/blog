+++
title = "Lessons I learned from getting infected by a crypto miner"
author = ["Sky Leite"]
date = 2021-10-08T23:26:00-03:00
lastmod = 2021-10-08T23:26:14-03:00
categories = ["topic"]
draft = false
+++

It's always so funny to me when someone gets pwned. I love it when my peers tell me stories of their family members getting phished out of their Facebook or Roblox accounts, mostly because it reinforces the belief that it could never happen to me. Surely I'm smart enough to not click a random link in an e-mail from support@g00g133.com. But if you read the title of this article you already know where that led me.

## Satisfactory {#satisfactory}

As every good story, this one starts with a terrible video game. Satisfactory is a game about building factories (think Factorio in 3D), which is a great pitch for a multiplayer game, and fortunately Satisfactory has full multiplayer support for up to 128 players. Except, of course, for the minor fact that it only works 5% of the time. Because of that, my friend and I simply cannot connect to each other for seemingly no reason, even though we can connect to other people and play (even to the same person!).

This led me to a seemingly infinite rabbit hole of networking, a subject I'm terrible at, trying to figure out why in hell we cannot build a factory together. I forwarded ports, messed with the firewall, disabled NAT (do not do this) and even enabled DMZ for my machine (DO NOT DO THIS!!!) effectively stripping my network of any modicum of security it previously had. Unfortunately my efforts were useless, so I decided to do something better with my life than wrestle with video games that do not want to be played.

## The next day {#the-next-day}

I run a few Docker containers for development at work, mainly Redis and Postgres. Because the application itself is not run in Docker, I have Postgres' ports expose to the host. And because this is only for development, I never bothered to change the default credentials.

After I was done with work, I decided to play some Factorio, a game I haven't played in a while. Since it's also about building factories but was made by moderately competent engineers, it served as a nice break from Satisfactory. For some reason, my machine was running unusually slow and I decided to investigate. Running `htop` left me flabbergasted: a single procress I had never heard of, `/tmp/kdevtmpfsi/`, was pinning all my CPU cores to 100%.

"Surely this is just some KDE dependency or something. Let me google that name real quick" - A big idiot

## The retribution {#the-retribution}

It was a crypto miner. "How could this happen?", I thought to myself. It didn't take long to figure out what happened, since apparently there is a sea of unsuspecting idiots like myself who ran into the exact same problem. So here's all the information I got, condensed in a way that's easily digestible.

- Assume everything in your Docker Compose is vulnerable

It doesn't matter how prestigious of a name your database manager has. It doesn't matter if it was made by Facebook, Google or the fucking Pope. As I just learned, even a project as big as Postgres (or Redis) can be vulnerable to Remote Code Execution.

- Do not use default credentials (yes, even for development)

It will come back to bite you. All it takes is one slip up, and you'll be exposed.

- Tag your images to major versions

For example, if your image is tagged to `postgres:12-alpine` and a new security patch gets released, it will be updated. If you are targeting a minor version, such as `postgres:12.4-alpine`, security patches will not be applied should your containers be redeployed.

- Docker does not care about your firewall

It has been brought to my attention that, for some reason, [Docker completely bypasses UFW](https://www.techrepublic.com/article/how-to-fix-the-docker-and-ufw-security-flaw/). I'm not entirely sure if it applies to other firewalls as well, but to be completely safe, assume it applies to all firewalls and enable whichever one you have on your router.

- For the love of fuck, don't expose your machine to the internet

The world waiting for you at the other end of the Ethernet cable does not care about your friday night plans.

## Conclusion {#conclusion}

Someone in China is probably a few dollars richer now, and all I got in return was more awareness about security and online responsibility. At least all it cost me was a few CPU cores.
