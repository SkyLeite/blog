+++
title = "Porting a mod of a mod of Doom to WebAssembly"
author = ["Sky Leite"]
date = 2023-07-08T19:59:00-03:00
lastmod = 2023-07-09T16:30:28-03:00
tags = ["games", "programming"]
categories = ["topic"]
draft = false
+++

2023/07/09 EDIT: Fuck it I ported the other game too LOL. [Play Sonic Robo Blast 2 here](https://skyleite.github.io/SRB2-WASM/)

You read the title correctly. This is a blog post about how I ported a mod of a mod of Doom to WebAssembly, essentially allowing it to run in any device with a web browser from the past decade.

You've probably come across videos and stories of Doom, the 1980s video game, running on various devices like [an ATM](https://www.youtube.com/watch?v=D0rStdHowAg), [an iPod Nano](https://www.youtube.com/watch?v=uF3tKA2pXpg), or even [a pregnancy test](https://twitter.com/Foone/status/1302287398949142533). There's clearly something that nerds find appealing about running video games on unexpected devices, and I am, for better or worse, included in that group.

I've never been too familiar with low level programming or the C family of languages, so this seemed like magic to me. Not just the fact that these devices are capable of running Doom at all (to varying degrees of stretching of the word "run"), but also that someone, somewhere, was interested enough to actually take a project like this to completion, for no reason other than the fact that it would be funny. And yet, here I am, staring at my web browser running code that was written before I was even born, just to show me Sonic the Hedgehog racing Erika Furudo from Umineko in Rainbow Road.

If you have no idea what I'm talking about, let me explain. The game in question is called Sonic Robo Blast 2 Kart, a mod of the popular fan-made game Sonic Robo Blast 2, which itself is a mod of Doom based on the Doom Legacy engine. Doom came out in December 10th 1993, Sonic Robo Blast 2 came out in February 1998 (when I was 1 year old) and Sonic Robo Blast 2 Kart came out in 2018. The latter two games are still being worked on to this day, which is par for the course for the endearingly deranged Sonic community.

I've been playing Sonic Robo Blast 2 Kart (from now on abbreviated as SRB2Kart) on and off since release, with not much interest due to the game's delay-based netcode, which essentially means it sucks to play with anyone who's physically far away from you. This changed some time ago when I discovered the brazilian community for the game, which runs regular tournaments, 24/7 servers filled to the brim with brazilian memes (like the Fiat Uno with a ladder on top, fabled to be the fastest car in existance). It was then that I learned how much fun SRB2Kart could be, and began playing more often, which led me to consider bringing it up as a potential game for my team at work to play during our Social hours. Unfortunately, the requirement to download anything is a huge barrier for playing anything ad-hoc, so I held off on it for a while, until one day I realized there was a chance this game could run perfectly on the browser. I mean, [QuakeJS](http://www.quakejs.com/) did it so why can't we?

On July 3rd, 2023 I decided to consider doing it myself, and sent [Tyron](https://worldsbe.st/) a message on Discord to ask if someone had already done this work. The following excerpt sums it up pretty well:

{{< figure src="https://i.ibb.co/2hhP82g/image.png" caption="<span class=\"figure-number\">Figure 1: </span>Maybe I should've listened" class="center" >}}

Nonetheless, I decided to tread forward.


## The Nix arc {#the-nix-arc}

If you know anything about me, it's that I love Nix. With all of its flaws, doing things declaractively and functionally just makes sense to my autistic brain, so I gravitate towards tools that let me work in these paradigms. Naturally, my first instinct was to take advantage of the existing SRB2Kart package on Nixpkgs, and simply override the things I needed to compile it locally. That worked, of course, but only because I had no idea how much the game's source code would have to change to make this even possible.

The next step would be to find out how to use WebAssembly at all. I came across a compiler toolchain called Emscripten, which is supposed to be a drop-in replacement for traditional C/C++ compilers like GCC and Clang, allowing you to target WebAssembly. Since it was also already packaged in Nixpkgs, with even a helpful function that overrides the compiler for you in an existing package, I figured it would be a piece of cake. As you can tell from my tone, it wasn't.

First of all, none of the dependencies worked. This is obvious in hindsight, but it turns out you can't just use good old `SDL2` (or other C libraries for that matter) with Emscripten. They need to be specifically ported to with with it, so I had to figure that out. Thankfully the tool provides ready-made ports for some popular libraries, which luckily matched 1:1 with the libraries SRB2Kart needs, so it was just a matter of setting a few compiler flags.

The catch, however, is that `emcc` (the Emscripten compiler) grabs those ports at compile time from the internet, and Nix doesn't allow internet access during the build phase to prevent exactly this kind of behavior and keep builds pure and predictable. `emcc` has a flag called `EMCC_LOCAL_PORTS` which, in theory, is supposed to let you specify a local directory containing these ports so it doesn't have to download the off the internet. After an hour or so of banging my head against the wall, I came across [this 4 year old issue on Github](https://github.com/emscripten-core/emscripten/issues/8466) which states that it's only possible to use `EMCC_LOCAL_PORTS` for `SDL2`, which is only 1/3 of the libraries I need to build the project. Instead of submitting a Pull Request to Emscripten like a good citizen, I decided to scrap Nix entirely for the moment and use [a good old shell script](https://github.com/SkyLeite/Kart-Public-WASM/blob/ed4069b48c2a5d6bb07c3904f3d8a845e86e174d/build.sh).


## The Last Time I Did Any Of This I Was In University {#the-last-time-i-did-any-of-this-i-was-in-university}

Now that `emcc` seemed to be working, including the acquisition of library ports, I had to face the decrepit elephant in the room: C. I've been a Software Engineer for over half a decade at this point, so you'd think using the language that everyone learns in university wouldn't be a problem. I imagine that's usually the case, but there are a few caveats:

1.  I dropped out of university after 4 months (three times, actually, but that's a story for another day)
2.  This is a project dating back to the 1980s
3.  The source code includes ports for every device imaginable, including the Nintendo DS, the original Xbox, the Dreamcast, and even MS-DOS if you can believe it

Much to my surprise, C turned out to be rather polite for a language older than I am, save for a few compiler warnings. Most of my time was actually spent learning and wrangling `CMake`, the build system (or, if you're a pedantic nerd, the build system **generator**) used by the project. Since it targets so many different platoforms, the `CMake` code was littered with IF branches to figure out what it was even supposed to build in the first place. Once I realized that I could just ignore branches dealing with Windows or the Samsung FamilyHub Smart Fridge, I eventually landed in `src/sdl/CMakeLists.txt`, which is the file that describes how to build the `SDL2` target. Bingo.

The project has a few `CMake` modules whose sole purpose is to figure out where the required libraries like `SDL2` and `ZLIB` are, and my inexperience with the tool led me to believe they were important. I spent a good few hours trying to figure out how to appease them, only to later figure out that they were getting in my way for no reason, as `emcc` handled such dependencies instead by manually linking to its own ports. That turned out to be a complete waste of time, but if I'm ever in a Saw situation where I have to compile Doom from source to save my life I have a decent shot at surviving.

Eventually, after much trial and error, the build worked seemingly out of nowhere and I was left with 2 files: `srb2kart.js` and `srb2kart.wasm`. Reading the Emscripten docs I found out that I had the option to tell the compiler to also generate an `HTML` file to have something of a building block. Once that was done (by hardcoding the output name to `srb2kart.html`) I was left staring at a quite fancy web page, with a black square clearly meant for the game to show up, and... nothing. When I opened the browser console I could see that the game was attempting to initialize since it was at least printing to `stdout`, but it seemed to be looking for... assets? And then I remembered that in the `srb2kart` package there is code for downloading a file called `AssetsLinuxOnly.zip`. I manually downloaded it, instructed Emscripten to embed the files in it to the executable, compiled... And it worked! When I saw the splash screen I was immediately filled with the feeling of accomplishment. I wasn't there but I bet this is how Neil Armstrong felt when his feet touched the moon, or when Hatsune Miku released the first version of Minecraft.


## (Somewhat) familiar territory {#somewhat--familiar-territory}

After the game initially compiled, and I was done picking up my jaw from the floor, I began actually playing, and was surprised to find out how much worked out of the box. Audio worked. Controller input worked. Split-screen worked. I could even play on my iPad using the Magic Keyboard. In that moment I felt like a citizen of the perfect timeline, where systems interacted perfectly, and every device shared APIs making every piece of software completely cross-platform. The web can be truly magical when things work, huh.

And then, of course, like the web developer that I am, I immediately installed a Javascript framework and Webpack. It was actually Elm, which is a programming language and not a framework, but I'm not one to let facts get in the way of humor. Anyways, from here on it was sort of smooth sailing. Using Emscripten I could call C functions directly from JS, even if in a limited fashion since I can only pass primitive values and not structs or arrays. This opens the flood gates for any kind of integration I can think of, with the amount of fucks given being the only restricting factor to something actually existing.

Over the next couple of days, I implemented a way to add Addons to the game straight from your computer with a simple button press, fullscreen support and a handy Help menu. The experience is quite decent already if I do say so myself!


## The Rest of The Fucking Owl {#the-rest-of-the-fucking-owl}

So... Now what? I do have quite a few plans for this, actually! Here's a list in no particular order:

-   Netplay (this will be absurdly complex since SRB2 uses UDP for connections, which is not supported in browsers. I will have to either settle for web-to-web multiplayer, or add support for something like WebRTC to SRB2Kart v1.7 [presuming the maintainers would even agree to that!])

-   Improved management of addons, like adding and removing in bulk, persisting addons through sessions, etc.

-   Download addons from the SRB2 Message Board directly to a running instance of SRB2Kart

-   Adjust client settings from JavaScript, which would allow persisting such settings between sessions

-   Improved presentation. The website looks and feels somewhat janky at the moment

-   Host assets on Cloudflare to improve load times

-   Disable in-game menus that don't work like Multiplayer

-   Download your own replays

-   Share lists of addons with friends using simple URLs

-   Direct links to races with pre-defined addons, so modders can have something like a "Try in SRB2Kart Web" button in their threads

-   Do everything all over again for (non-kart) Sonic Robo Blast 2 so everyone can bask in the glory of SRB2Infinity

If this was interesting to you, feel free to head to <https://skyleite.github.io/Kart-Public-WASM/> and try it out for yourself. Please forgive any jank you might encounter. I would be glad to receive any piece of feedback through the comments, [e-mail](mailto:sky@leite.dev), or [the project's Github repository](https://github.com/SkyLeite/Kart-Public-WASM/blob/ed4069b48c2a5d6bb07c3904f3d8a845e86e174d/build.sh).
