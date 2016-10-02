# Simple website

This example uses the Javascript API to create a simple site containing links to a Twitter, GitHub, and Facebook page.

## Building the site

1. Clone the `metalsmith` repo: `git clone git@githib.com:metalmsith/metalsmith.git`
2. Navigate to the site in terminal: `cd path/to/metalsmith/examples/simple-website`
3. Install dependencies: `npm i`
4. Run the build script: `node index.js`

## Creating a similar site

#### Initial setup

First, make sure to have `node` & `npm` installed globally. Then, create a working directory, like so:

```bash
mkdir my-website
cd my-website
```

Let's create some folders to work with later:

```bash
mkdir src layouts
```

Next, let's create a `package.json` file:

```bash
npm init
```

Setup is almost done! Final step is to install our dependencies:

```bash
npm install --save metalsmith metalsmith-markdown metalsmith-layouts pug
```

#### The build script

Now that we have our site structure & setup ready, we can start developing! First step is probably to create out our build script. Create a file named `index.js` that looks something like this:

```js
var Metalsmith = require('metalsmith')
var layouts = require('metalsmith-layouts')
var markdown = require('metalsmith-markdown')

Metalsmith(__dirname)
  .metadata({
    title: 'Simple Website',
    description: 'An extremely simple example website for the extremely simple static-site generator',
    twitter: 'metalsmith',
    github: 'metalsmith',
    facebook: 'metalsmith'
  })
  .source('./src')
  .destination('./build')
  .use(markdown())
  .use(layouts({
    engine: 'pug',
    pretty: true,
    directory: 'layouts',
    default: 'default.pug',
    pattern: '**/*.html'
  }))
  .build(function(err, files) {
    if (err) { throw err; }
  })
```

Since the metadata in the file above is creating most of the content in the site, it's a good idea to update that.

Let's look at what our build script does:

1. It defines our dependencies (`var Metalsmith = require('metalsmith')`)
2. It initializes our Metalsmith instance (`Metalsmith(__dirname)`)
3. It defines the metadata for our site to use (`.metadata({...})`)
4. It defines our source and output directories (`.source()` & `.destination()`)
5. It processes the markdown files in the `./src` directory (`.use(markdown())`)
6. It runs our processed markdown through [Pug templates](http://pugjs.org) (`.use(layouts({...}))`)
7. It builds the site to our destination directory (`.build(...)`)

#### Our content & layout

A build script is only good if we have something to build. Let's use the metadata defined in our build script to create a simple homepage with links to our social media destinations. Here's what our `default.pug` layout should look like:

```pug
doctype html
head
  title= title
  meta(name="description", content= description)
body
  h1= title
  p!= description
  .links
    a(href="https://twitter.com/" + twitter) Twitter
    a(href="https://github.com/" + github) GitHub
    a(href="https://facebook.com/" + facebook) Facebook
```

This might look confusing if you've never used Jade/Pug before, but it's very simple. The first word of each line represents an HTML tag (`h1 === <h1>, .links === <div class="links">`). We're then defining our document structure with indentation (Pug is whitespace-sensitive), using `=` to input our metadata into the template, and using `+` to concatenate our Twitter, GitHub, and Facebook usernames into their respective links. Let's save this file as `layouts/defaul.pug`.

Next, we need a file to run through this template. It's a very complicated document:

```md
---
layout: default.pug
---
```

...that's it. The key/value pairs (YAML data) between each line tell Metalsmith how to process our file. Here, we're simply telling Metalsmith to process this file through our `default.pug` template. This file should live at `src/index.md`.

#### Building our site

To build our site, let's move back to terminal.

```bash
node index.js
```

...and our site is built into `/build`!

#### Next steps

Our site is looking mighty plain. Try using `metalsmith-sass`, `metalsmith-postcss`, or one of [the many other plugins](http://www.metalsmith.io/#the-plugins) to add styles to the site. Alternatively, run your typical build system alongside Metalsmith. You can also try adding an icon set, including more information, or adding more pages to the site!
