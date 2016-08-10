# A simple site example

This website is a dead simple example of how to use the Metalsmith CLI.

## Running this example

To start, install the Metalsmith CLI globally, if you haven't already, using `NPM` from the command line.

```bash
npm install -g metalsmith

```

Then, if you haven't cloned this repository, do it like this:

```bash
git clone git@github.com:metalsmith/metalsmith.git
```


Next, navigate to the directory where this project is.

```bash
cd metalsmith/examples/simple-site

```

Then, install the project's dependencies
```bash
npm install
```

Finally, run the Metalsmith command line tool

```bash
metalsmith
```

That will build the files for you!  Open the file `build/one.html` to view the generated webpage.


## How it was made

### 1. Create a `package.json` for my project

npm comes with a handy command, `npm init`, which will initialize a `package.json` wherever you run it.  A `package.json` file tells npm about the project's dependencies and other information such as the author and copyright information.  So I ran this command and accepted all of its default options:

```bash
npm init
```

### 2. Creating the `metalsmith.json` file

> Note: you can actually just use one file, but I chose to keep them separate for clarity to newcomers.

The next thing to do was start the `metalsmith.json` file, in a text editor.  I started off with the bare bones:

```json
{
  "source": "src",
  "destination": "build"
}
```

Next, I added a couple of plugins.

* `metalsmith-markdown` converts the markdoen (`.md`) files in the source directory to `.html` files.  This will just give us bare HTML for use in the layout.
* `metalsmith-layouts` takes my layout in `layouts` and will use it to make the final, prettier html pages.  From its [documentation](https://github.com/superwolff/metalsmith-layouts), I can see how I specify my layout engine, which will be Handlebars.

Additionally, I had to install each of these plugins with NPM, and I also had to install `handlebars`, because I used it as my template engine.  So this is the command I ran:

```bash
npm install --save metalsmith-markdown metalsmith-layouts handlebars
```

Since I used the `--save` flag, npm will store these dependencies in the `package.json` file, so if I send this project to somebody else, they can easily install the dependencies by running one command (`npm install`).

So finally, my metalsmith.json file looks like this:

```json
{
  "source": "src",
  "destination": "build",
  "plugins": [
    {"metalsmith-markdown": true},
    {"metalsmith-layouts": {"engine": "handlebars"}}
  ]
}
```

Since we need the markdown parsed into *bare* HTML first, and then use **that** for the layout, we put the layout plugin last, because metalsmith runs the plugins one-by-one, in order.

### 3. Create the content

The next thing I did was write the content for the pages using Markdown.  The files are in the `src` directory.  Each file has some front-matter defined that describes the files.  Front matter gets parsed before the files are passed to the plugins, and it will be used by the `metalsmith-layouts` plugin to format each page:

```yaml
---
title: Something
layout:  layout.html
---
# Hey here's the regular markdown content
```

### 4. CSS and layout

Next, I added my `.css` file to the `src` directory (since it gets put into the actual site), and the `layout.html` file to the `layouts` directory.

Notice how I pull the `title` from the front-matter and use it in the template?  Any property could be set in the front-matter and passed through to the template in this manner.

### 5. Building the site

Running the `metalsmith` command from the directory with the `metalsmith.json` file, I can see the build happen!  Files get put in the `build` directory.

## What's next?

As an exercise, try adding some functionality to the project, such as:

* Make it not so dang ugly
* Use a `color` property in each markdown file's front-matter and use it to change the color of the page's title bar
* Links to the previous and next page (using `metalsmith-collections`?)
* Use a CSS preprocessor like Less instead of just plain CSS (hint: `metalsmith-less`)
* Recreate the functionality using Metalsmith's [javascript API](https://github.com/metalsmith/metalsmith#api) and do something **really** cool.
