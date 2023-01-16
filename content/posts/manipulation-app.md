+++
title = "Manipulation.app"
author = ["Sky Leite"]
date = 2021-01-13T18:06:00-03:00
lastmod = 2023-01-16T13:45:30-03:00
categories = ["topic"]
draft = false
+++

I have this insatiable desire to create, and it is ultimately what led me to start my programming career with [Weeb Bot](https://github.com/SkyLeiteF/WeebBot-v2) back in 2016. However, after finishing it I could never bring myself to lead another project to completion. Along with the normal impostor syndrome that comes with working in a field filled with so many incredibly talented people, it led me to develop anxiety over starting new projects and bringing ideas to life. After going through therapy, I'm glad to announce I'm working on yet another project called Manipulation.app, a web application designed to guide you through your crafting experience in Final Fantasy XIV.


## The problem {#the-problem}

In Final Fantasy XIV, one of the best ways of making Gil (in-game money) is through crafting items (food, gear, potions, etc.) through the many different crafting classes and recipes. Each recipe has a certain amount of ingredients that can be either gatherable or craftable items. Once you reach end-game recipes, this can lead to items that require many other craftable items, creating this seemingly un-ending web of gathering and crafting that the game makes no effort of untangling. This is where Manipulation comes in.

Through a feature called "Lists", the user can input an array of items they'd like to craft, and the application creates a list of all the items they'll need to gather and craft to reach the desired outcome, along with their requirements.


## The existing solutions {#the-existing-solutions}

Tools designed to solve this problem have existed for a while in the community, but each of them come with their own myriad of problems. Garland Tools is an incredible database of general information for the game, but doesn't help you to streamline the crafting process that much. FFXIV Teamcraft is much better in that respect, with many other helpful tools, but suffers from significant performance problems, as on every load it downloads every single item, quest, recipe and NPC in the game. This results in an initial load of 11.69MBs of data and a time-to-interactive of 3.11s (which you still have to wait after, for some reason). This is unacceptable.

{{< figure src="https://i.imgur.com/LkgpGnX.jpg" caption="<span class=\"figure-number\">Figure 1: </span>Average FFXIV Teamcraft user on initial load" class="center" >}}

All the data is stored server-side in Manipulation, and through GraphQL it allows the client to pull precisely the data it needs, not wasting a single byte. This improves initial load times, general CPU-time performance (as the browser doesn't have to parse 10MBs of json data) and general responsiveness, especially on mobile (which Manipulation is designed to be fully compatible with). All these improvements come with a higher network footprint, as the application needs to always be connected to the internet to work, but considering Final Fantasy XIV is an online-only I don't consider this to be a problem yet.


## The technology {#the-technology}

Manipulation has a few moving parts that all come together to deliver you the best user experience possible, and in this section I'll talk about them briefly and explain some of the decisions I made along the way.


### Datasync {#datasync}

I consider this to be the most crucial part of the entire application. It's purpose is to download data from the [FFXIV Datamining Repository](https://github.com/xivapi/ffxiv-datamining), parse the (weirdly formatted) CSV files and convert the data to the format used in Manipulation's database. I chose to write Datasync in Rust, as the CSV files are huge and Rust's CSV parser is incredibly fast. Considering the synchronization process will not run more than once a day the speed doesn't matter too much, but it helps a little during development.


### Backend {#backend}

The brain of the application uses Elixir and leverages the fantastic [Phoenix Framework](https://www.phoenixframework.org/). I have lots of reasons for choosing Elixir for this project, but the most significant one is being able to make use of the BEAM, which is a virtual machine that's part of the Erlang ecosystem. If you don't know what that means, it basically makes any program written in this ecosystem incredibly easy to scale, and letting me skip having to learn Kubernetes just yet.

Another important part of the backend is GraphQL. It allows the frontend to request only the data it needs, making network requests significantly less costly and development time much faster. All the backend needs to do is define the schema of the data, and the frontend requests what it needs. No need to figure out everything from the start through REST endpoints!


### Frontend {#frontend}

I love Elm. Developing for the Browser is a much more pleasant experience when instead of writing with no types, you write all your business logic in types first and implementation second. And of course, it all ties together nicely with [the fantastic elm-graphql package by Dillon Kearns](https://package.elm-lang.org/packages/dillonkearns/elm-graphql/latest/). What this package does is use the GraphQL introspection queries to generate a type-safe interface to your API, which gets checked by the compiler just like any other module.


## The release {#the-release}

As of right now, Manipulation.app is not yet released. I'm working on it full-time, and expect an open beta to be completed in a month or so. In the meantime, you can follow the development on [the Github repository](https://github.com/skyleite/craftup) or my account [@kaze@mastodon.technology](https://mastodon.technology/@kaze), and feel free to shoot me an e-mail at [sky@leite.dev](mailto:sky@leite.dev).
