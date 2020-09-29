+++
author = ["Rodrigo Leite"]
lastmod = 2020-09-29T12:57:45-03:00
draft = false
+++

## Pages {#pages}

### About {#about}

Hello! I'm Rodrigo Leite, a 21 years old Software Engineer from Brazil.
Fascinated by programming from a very young age, my first "real" project was a
Discord bot used to alert users of random events in the japanese game Phantasy
Star Online 2. It was a moderate hit, and the fact that it impacted the lives of
so many people (including myself) was a huge influence on my career.

My goal with this blog is to share some of the knowledge I've gained over the
years, and also improve my writing. There's also a therapeutical aspect to it I
haven't figured out yet :P

If you wish to contact me, feel free to shoot me an email at [rodrigo@leite.dev](mailto:rodrigo@leite.dev)
or a toot at [@rodrigo@pleroma.leite.dev](https://pleroma.leite.dev/rodrigo).

### Library {#library}

This page lists helpful articles I came across online. Maybe they'll help you
too :)

- [My one-liner Linux Dropbox Client](http://lpan.io/one-liner-dropbox-client/) (by \\@l_pan\_) - No HTTPS
- [How To Ask Questions The Smart Way](http://www.catb.org/~esr/faqs/smart-questions.html) (by [Eric Steven Raymond](mailto:esr@thyrsus.com) and [Rick Moen](mailto:respond-auto@linuxmafia.com))
- [Imwheel (changing mouse wheel behavior on Xorg)](https://wiki.archlinux.org/index.php/IMWheel) (by the Arch community)

## Posts {#posts}

### Topic {#topic}

#### <span class="org-todo done DONE">DONE</span> Understanding Asynchronous Javascript {#understanding-asynchronous-javascript}

The most common issue I've seen beginners face when learning Javascript is its
asynchronous nature. Understandably of course, as it's considerably different
from writing fully synchronous code, which is what is usually taught first. My
goal with this article is to provide a comprehensible and easily approachable explanation
for newcomers to Javascript or asynchronous programming in general.

Take the following sample:

```js
const add = (a, b) => {
  return a + b;
};

const result = add(20, 10);
return result;
```

In it, the interpreter does the following:

1.  Define a constant named \`add\` that holds an arrow function
2.  Define a constant named \`result\` that holds the return value of \`add(20,
    10)\`
3.  Return the value of the constant \`result\`

As you already know, that means the code runs in the order it's read, from top
to bottom and left to right. This is very useful for simple programs because it
keeps the code clean, concise and easy to follow, but such approach poses
problems for more complex projects.

For example, say you have a file called `notes.txt` and you want to read and
count how many notes it has. Assuming the file has one note per line, we can
achieve this goal like so:

```js
const fs = require("fs"); // Load the `fs` module.
// It is responsible for interacting with the filesystem

const fileLocation = "notes.txt";
const fileData = fs.readFileSync(fileLocation); // Read our file into memory
const notes = fileData.split("\n"); // Split our file by the newline character

console.log(`You have ${notes.length} notes`); // Finally, log the result
```

Great! This example works perfectly, but it's not very elegant. If we're
processing a large file, this operation could take a relatively long time and
confuse the end user, since the process will completely freeze until the file is
read. A common way of adressing this issue is with loading spinners,
but due to Javascript's single-threaded nature that's not possible, as it would
require running code simultaneously... right?

<!--list-separator-->

- What is asynchronous?

  Asynchronous code is simply some piece of code that doesn't necessarily run at the same time
  as another. This is useful in our example because it means we can run the code
  for our loading spinner while the file is being processed. Crazy, right? Here's
  how I would do it, using the [cli-spinner](https://github.com/helloIAmPau/node-spinner) library for simplicity:

  ```js
  // Load the `fs` module.
  // It is responsible for interacting with the filesystem
  const fs = require("fs");
  const Spinner = require("cli-spinner").Spinner;

  const fileLocation = "notes.txt";
  const spinner = new Spinner("Processing...");

  // Define the function we want to be
  // run when the file is done being read
  const done = (error, fileData) => {
    if (error) {
      console.error(`ERROR: ${error}`);
      return;
    }

    // Split our file by the newline character
    const notes = fileData.split("\n");

    // Stop the spinner
    spinner.stop();

    // Finally, log the result
    console.log(`You have ${notes.length} notes`);
  };

  // Read the file, and pass a reference to our function
  // to be run once the file is done reading
  fs.readFile(fileLocation, done);

  // Start our spinner
  spinner.start();
  ```

  Note how we don't manipulate the data instantly. The `fs.readFile` function
  expects a reference to a function as the second parameter, which is then called
  when the data we need is ready. In the meantime, however, the node process is free
  to do whatever else it wants (in this case, show our little spinner). This is
  called a _callback_, and for the longest time it was the _de facto_ way of doing
  asynchronous programming in Javascript. But such approach is not perfect.

<!--list-separator-->

- The problem with callbacks

  Expanding our example, say that in addition to displaying how many notes the
  user has, we also want to display how big the file is. To do so, we use the
  `fs.stat` function, and like with `fs.readFile`, we also need to use callbacks.
  Since we want to display that information _after_ we read the file, we must
  register our new callback in the `done` function, like so:

  ```js
  // Define the function we want to be
  // run when the file is done being read
  const done = (error, fileData) => {
    if (error) {
      console.error(`ERROR: ${error}`);
      return;
    }

    // Split our file by the newline character
    const notes = fileData.split("\n");

    // Stop the spinner
    spinner.stop();

    // Finally, log the result
    console.log(`You have ${notes.length} notes`);

    fs.stat(fileLocation, (err, fileInformation) => {
      if (err) {
        console.error(`ERROR: ${err}`);
        return;
      }

      console.log(`Your file has ${fileInformation.size} bytes of information`);
    });
  };
  ```

  Instead of defining a second function for this, we use an inline arrow function
  for convenience. As you can see, this introduces a couple problems, both of
  which get progressively worse the more callbacks we need to chain together:

  1.  One more level of nesting, making our code hard to read
  2.  We need to come up with new names for our callback parameters, as the previous variables
      are still in scope.

  We can work around these issues by making each callback it's own top-level
  function, but that is cumbersome for simple operations like this. With these
  issues in mind, the community came up with Promises, which aim to provide more
  flexibility and reduce nesting when working with asynchronous Javascript.

<!--list-separator-->

- Promises

  Promises not only offer a cleaner way of chaining asynchronous operations, but
  by nature also allow you to do all sorts of cool things like running multiple
  asynchronous operations in parallel or even "racing" promises, where only
  the first to complete is used.

  Here's how our example looks when using promises instead of callbacks:

  ```js
  // Load the `fs` module.
  // It is responsible for interacting with the filesystem
  const fs = require("fs").promises;
  const Spinner = require("cli-spinner").Spinner;

  const fileLocation = "notes.txt";
  const spinner = new Spinner("Processing...");

  // Read the file
  fs.readFile(fileLocation)
    .then((data) => {
      // Split our file by the newline character
      const notes = fileData.split("\n");

      // Finally, log the result
      console.log(`You have ${notes.length} notes`);

      // We are done with our first promise, so we can return another one
      // Since fs.stat returns a promise, we can conveniently return it
      return fs.stat(fileLocation);
    })
    .then((data) => {
      // Here `data` refers to the data returned by `fs.stat`
      console.log(`Your file has ${fileInformation.size} bytes of information`);

      // Stop our spinner
      spinner.stop();
    })
    .catch((error) => {
      console.error(`ERROR: ${error}`);
    });

  spinner.start();
  ```

  Even if you don't yet understand how that works, you can see how the code looks a lot
  cleaner. To start using promises, you need to understand a couple of
  things.

  A promise is an object like any other. While it can vary by implementation, you
  can assume _every_ promise has at least these two methods:

  1.  `.then()` :: Takes a function as the first argument to be run when the promise _resolves_
      (completes). Basically your way of saying "do this, _then_ that"

  2.  `.catch()` :: Like `.then()`, takes a function as the first argument to be run when the
      promise _rejects_ (errors). It is important to **always** _catch_ (handle) promise
      _rejections_, even if you just log them somewhere. If you don't, you'll get a
      warning in the console and in the future a crash in your application.

  With that in mind, the usual workflow when working with promises is:

  1.  Call a function that returns a promise (in this case, `fs.readFile`)
  2.  Call `.then()` on the returned promise with a callback for what we want to do
      with the data
  3.  If chaining, call another function that returns a promise and return it. This
      can be done indefinitely, of course.
  4.  Call `.catch()` to handle whatever errors our promise chain can potentially throw.

  This is the most basic overview of how asynchronous operations work in
  Javascript. There's a lot more to cover, like `async/await` and `Promise.all()`,
  but this should be enough to get you started. If you have any questions, refer
  to the FAQ and feel free to post a comment if that doesn't help or if you
  believe this article can be improved.

<!--list-separator-->

- FAQ

  1.  Q: Can I get data out of a callback / promise?

      A: No. Since callbacks / promises run at some indeterminate time in the
      future, trying to do so will lead you to all sorts of weird bugs that are
      hard to trace back. Usually you should treat data that's inside a callback /
      function as 100% limited to that scope, that way you can avoid these problems altogether.

  2.  Q: Can I wait for a promise to complete before doing something else?

      A: No. If you want to run an operation after a promise resolves, you must do
      it inside the callback of `.then()`.

#### <span class="org-todo done DONE">DONE</span> Station Diaries #1 - Start of Something New {#station-diaries-1-start-of-something-new}

With how accessible internet connections are these days, the explosion of
streaming almost feels like a natural progression of the way we consume media.
In the case of music, we've never experience so much convenience since all you
have to do to listen to your favorite album is to launch Spotify, type its name
and click play.

That said, this convenience comes with important and potentially dangerous
pitfalls such as giving Spotify data about what you listen, when you listen and
where you listen. This should be enough reason to consider an alternative if
privacy is at all important to you, but if that's not the case maybe the case
for artist profits should be. [Spotify pays, at maximum, US\$0.0084 per stream to
the holder of the music rights](https://www.cnbc.com/2018/01/26/how-spotify-apple-music-can-pay-musicians-more-commentary.html) (which includes the record label, producers,
artists, songwriters, and who knows what else). This means that 1 million
streams, an impressive feat if you ask me, generates US\$7,000 (which the artist
might not get even half of).

With those concerns in mind I decided to start [Station](https://github.com/RodrigoLeiteF/station), a self-hosted music
streaming service, in hopes of encouraging people to start buying music once
again or suport their favorite artists in some other way (like going to concerts!).
The idea is that you set it up once and are on your way to having your very own
Spotify, running wherever you'd like. You and other users can add music to
the library to be shared with eachother effortlessly, without giving up the
convenience of modern streaming services.

Welcome to Station Diaries, a series of posts where I'll detail progress on this
admittedly ambitious project.

<!--list-separator-->

- How?

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

<!--list-separator-->

- What?

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
  contribute feel free to check [Station's repository on Github](https://github.com/RodrigoLeiteF/Station) or contact me at
  [rodrigo@leite.dev](mailto:rodrigo@leite.dev). Issues, PRs and comments are, as always, welcome :)
