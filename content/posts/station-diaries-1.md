+++
title = "Station Diaries #1 - Start of Something New"
author = ["Sky Leite"]
date = 2019-09-02T23:42:00-03:00
lastmod = 2021-09-11T18:26:25-03:00
tags = ["programming", "station"]
categories = ["topic"]
draft = false
+++

With how accessible internet connections are these days, the explosion of
streaming almost feels like a natural progression of the way we consume media.
In the case of music, we've never experience so much convenience since all you
have to do to listen to your favorite album is to launch Spotify, type its name
and click play.

That said, this convenience comes with important and potentially dangerous
pitfalls such as giving Spotify data about what you listen, when you listen and
where you listen. This should be enough reason to consider an alternative if
privacy is at all important to you, but if that's not the case maybe the case
for artist profits should be. [Spotify pays, at maximum, US$0.0084 per stream to
the holder of the music rights](https://www.cnbc.com/2018/01/26/how-spotify-apple-music-can-pay-musicians-more-commentary.html) (which includes the record label, producers,
artists, songwriters, and who knows what else). This means that 1 million
streams, an impressive feat if you ask me, generates US$7,000 (which the artist
might not get even half of).

With those concerns in mind I decided to start [Station](https://github.com/SkyLeiteF/station), a self-hosted music
streaming service, in hopes of encouraging people to start buying music once
again or suport their favorite artists in some other way (like going to concerts!).
The idea is that you set it up once and are on your way to having your very own
Spotify, running wherever you'd like. You and other users can add music to
the library to be shared with eachother effortlessly, without giving up the
convenience of modern streaming services.

Welcome to Station Diaries, a series of posts where I'll detail progress on this
admittedly ambitious project.

## How? {#how}

I've been writing JavaScript for a good 3 years now and my first instinct was to
use it for this project as well. It took some convincing but I decided to try
.NET Core and it's been a good (albeit rocky) journey, even if I still think
it's weird to write code in an environment where so much is abstracted away from
the programmer.

Since I'm already learning an entire new language and framework, I decided to
also go with a different approach with regards to databases. I have had so many
terrible experiences with ORMs in the past that I couldn't justify giving yet
another one a try, which led to using stored procedures / functions for
everything that deals with the database. Creating a user? `SELECT * FROM createuser(email, password)`. It is definitely weird writing SQL as functions,
especially considering there is no linting / completion / syntax checking
whatsoever, but it's honestly not much different from writing JavaScript and
running your code with pretty much no confidence that it will run. I must say I
didn't miss the feeling of shock when you run code and it _works_, though.

## What? {#what}

Some key characteristics I believe will make Station a pleasure to use and
maintain are:

1.  Plugin system
    The application was designed from the start to work in a plugin system. By
    default it has no knowledge of how and where to acquire tracks, it only
    parses data returned from plugins. This allows users to extend the upload
    system with whatever sources they'd like (Soundcloud, YouTube, etc) without
    risking the application's legitimacy. Station in no way wants to promote
    piracy, but there are completely valid reasons to acquire music from the
    listed sources, so a plugin system puts that responsibility on the plugin
    loaded by the user.

2.  MusicBrainz integration
    Music organization is a nightmare. There are so many edge cases that I could
    spend the time it takes to finish a Dream Theater album and still not be
    done. Because of that, Station uses the MusicBrainz database as the ultimate
    source of truth; if a track cannot be found on it, expect undefined behavior
    and dead animals. This can be a burden for a user, but it can be easily fixed
    by adding your entry to the MusicBrainz database, improving Station for
    yourself and MusicBrainz for everyone :)

As of writing this post, I have mostly figured out the song creation part which
I believe to be the most crucial and sensitive part of the application. The
current process of uploading a new song works as follows:

1.  \`SongWorker\` class receives a response from a plugin, which includes a byte
    array representing the music file, it's name, artist, album, duration and,
    optionally, a MusicBrainz ID.

2.  Worker tries to find more information about the track on MusicBrainz. If it
    fails, it aborts the operation entirely.

3.  Creates `Artist`, `Album`, `Song` and `Upload` objects accordingly and
    returns the new `Song` object to the user.

The logic is simple, but it involves a lot of (admittedly ugly) code that I'm
hoping to clean out later.

Currently I'm working on the authentication system using ASP.NET's
`AuthenticationHandler` and a system of claims. There are no permissions in
place at the moment, as my current goal is to get an MVP working as soon as possible.

That's all I got for now. Thanks for reading this far and if you'd like to
contribute feel free to check [Station's repository on Github](https://github.com/SkyLeite/Station) or contact me at
[sky@leite.dev](mailto:sky@leite.dev). Issues, PRs and comments are, as always, welcome :)
