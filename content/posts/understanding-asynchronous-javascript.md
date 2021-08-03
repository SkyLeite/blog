+++
title = "Understanding Asynchronous Javascript"
author = ["Sky Leite"]
date = 2019-06-30T03:09:00-03:00
lastmod = 2021-08-03T17:47:30-03:00
tags = ["programming", "javascript"]
categories = ["topic"]
draft = false
+++

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

## What is asynchronous? {#what-is-asynchronous}

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

## The problem with callbacks {#the-problem-with-callbacks}

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

## Promises {#promises}

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

## FAQ {#faq}

1.  Q: Can I get data out of a callback / promise?

    A: No. Since callbacks / promises run at some indeterminate time in the
    future, trying to do so will lead you to all sorts of weird bugs that are
    hard to trace back. Usually you should treat data that's inside a callback /
    function as 100% limited to that scope, that way you can avoid these problems altogether.

2.  Q: Can I wait for a promise to complete before doing something else?

    A: No. If you want to run an operation after a promise resolves, you must do
    it inside the callback of `.then()`.
