
# Metalsmith

[![npm version][npm-badge]][npm-url]
[![Build Status][travis-badge]][travis-url]
[![Coverage Status][coveralls-badge]][coveralls-url]
[![Dependency Status][david-badge]][david-url]
[![Slack chat][slack-badge]][slack-url]

> An extremely simple, _pluggable_ static site generator.

In Metalsmith, all of the logic is handled by plugins. You simply chain them together. Here's what the simplest blog looks like...

```js
Metalsmith(__dirname)
  .use(markdown())
  .use(layouts('handlebars'))
  .build(function(err) {
    if (err) throw err;
    console.log('Build finished!');
  });
```

...but what if you want to get fancier by hiding your unfinished drafts and using custom permalinks? Just add plugins...

```js
Metalsmith(__dirname)
  .use(drafts())
  .use(markdown())
  .use(permalinks('posts/:title'))
  .use(layouts('handlebars'))
  .build(function(err) {
    if (err) throw err;
    console.log('Build finished!');
  });
```

...it's as easy as that!


## Installation

    $ npm install metalsmith


## Plugins

Check out the website for a list of [plugins](http://www.metalsmith.io#the-plugins).


## How does it work?

Metalsmith works in three simple steps:

  1. Read all the files in a source directory.
  2. Invoke a series of plugins that manipulate the files.
  3. Write the results to a destination directory!

Each plugin is invoked with the contents of the source directory, and each file can contain YAML front-matter that will be attached as metadata, so a simple file like...

    ---
    title: A Catchy Title
    date: 2014-12-01
    ---

    An informative article.

  ...would be parsed into...

```js
{
  'path/to/my-file.md': {
    title: 'A Catchy Title',
    date: new Date('2014-12-01'),
    contents: new Buffer('An informative article.')
  }
}
```

...which any of the plugins can then manipulate however they want. And writing the plugins is incredibly simple, just take a look at the [example drafts plugin](examples/drafts-plugin/index.js).

Of course they can get a lot more complicated too. That's what makes Metalsmith powerful; the plugins can do anything you want!


## The secret...

We keep referring to Metalsmith as a "static site generator", but it's a lot more than that. Since everything is a plugin, the core library is actually just an abstraction for manipulating a directory of files.

Which means you could just as easily use it to make...

  - [A simple project scaffolder.](examples/project-scaffolder)
  - [A simple build tool for Sass files.](examples/build-tool)
  - [A simple static site generator.](examples/static-site)
  - [A Jekyll-like static site generator.](examples/jekyll)
  - [A Wintersmith-like static site generator.](examples/wintersmith)


## Resources

  - IRC Channel - it's `#metalsmith` on freenode!
  - [Slack Channel](http://metalsmith-slack.herokuapp.com/)
  - [Getting to Know Metalsmith](https://blog.robinthrift.com/2014/04/13/getting-to-know-metalsmith/) - a great series about how to use Metalsmith for your static site.
  - [Building a Blog With Metalsmith](https://azurelogic.com/posts/building-a-blog-with-metalsmith/) - a blog post about how to create a basic blog with Metalsmith. Check out the related [video of the talk](https://www.youtube.com/watch?v=cAq5_5Yy7Tg) too!
  - [Awesome Metalsmith](https://github.com/lambtron/awesome-metalsmith) - great collection of resources, examples, and tutorials

## CLI

In addition to a simple [Javascript API](#api), the Metalsmith CLI can read configuration from a `metalsmith.json` file, so that you can build static-site generators similar to [Jekyll](http://jekyllrb.com) or [Wintersmith](http://wintersmith.io) easily. The example blog above would be configured like this:

```json
{
  "source": "src",
  "destination": "build",
  "plugins": {
    "metalsmith-drafts": true,
    "metalsmith-markdown": true,
    "metalsmith-permalinks": "posts/:title",
    "metalsmith-layouts": "handlebars"
  }
}
```

You can specify your plugins as either an object or array. Using an array would allow you to specify use of the same plugin multiple times. The above example is then defined as so:

```json
{
  "source": "src",
  "destination": "build",
  "plugins": [
    {"metalsmith-drafts": true},
    {"metalsmith-markdown": true},
    {"metalsmith-permalinks": "posts/:title"},
    {"metalsmith-templates": "handlebars"}
  ]
}
```

And then just install `metalsmith` and the plugins and run the metalsmith CLI...

    $ node_modules/.bin/metalsmith

        Metalsmith · reading configuration from: /path/to/metalsmith.json
        Metalsmith · successfully built to: /path/to/build

Or if you install them globally, you can just use:

    $ metalsmith

        Metalsmith · reading configuration from: /path/to/metalsmith.json
        Metalsmith · successfully built to: /path/to/build

Options recognised by `metalsmith.json` are `source`, `destination`, `concurrency`, `metadata`, `clean` and `frontmatter` - See "*API*" section below for usage.

Checkout the [static site](examples/static-site), [Jekyll](examples/jekyll) or [Wintersmith](examples/wintersmith) examples to see the CLI in action.

If you want to use a custom plugin, but feel like it's too domain-specific to
be published to the world, you can include plugins as local npm modules:
(simply use a relative path from your root directory)

```json
{
  "plugins": {
    "./lib/metalsmith/plugin.js": true
  }
}
```

## API

Checkout the [project scaffolder](examples/project-scaffolder) or [build tool](examples/build-tool) examples to see a real example of the Javascript API in use.

#### new Metalsmith(dir)

Create a new `Metalsmith` instance for a working `dir`.

#### #use(plugin)

Add the given `plugin` function to the middleware stack. Metalsmith uses
[ware](https://github.com/segmentio/ware) to support middleware, so plugins
should follow the same pattern of taking arguments of `(files, metalsmith, callback)`,
modifying the `files` or `metalsmith.metadata()` argument by reference, and then
calling `callback` to trigger the next step.

#### #build(fn)

Build with the given settings and a callback having signature `fn(err, files)`.

#### #source(path)

Set the relative `path` to the source directory, or get the full one if no `path` is provided. The source directory defaults to `./src`.

#### #destination(path)

Set the relative `path` to the destination directory, or get the full one if no `path` is provided. The destination directory defaults to `./build`.

#### #concurrency(max)

Set the maximum number of files to open at once when reading or writing.  Defaults to `Infinity`.  To avoid having too many files open at once (`EMFILE` errors), set the concurrency to something lower than `ulimit -n`.

#### #clean(boolean)

Set whether to remove the destination directory before writing to it, or get the current setting. Defaults to `true`.

#### #frontmatter(boolean)

Set whether to parse YAML frontmatter. Defaults to `true`.

#### #ignore(path)

Ignore files/paths from being loaded into Metalsmith.

`path` can be a string, a function, or an array of strings and/or functions.
Strings use the glob syntax from
[minimatch](https://github.com/isaacs/minimatch) to match files and directories
to ignore. Functions are called with the full path to the file as their first
argument, and the `stat` object returned by Node's `fs.stat` function as their
second argument, and must return either `true` to ignore the file, or `false` to
keep it.

#### #metadata(json)

Get the global metadata. This is useful for plugins that want to set global-level metadata that can be applied to all files.

#### #path(paths...)

Resolve any amount of `paths...` relative to the working directory. This is useful for plugins who want to read extra assets from another directory, for example `./layouts`.

#### #run(files, fn)

Run all of the middleware functions on a dictionary of `files` and callback with `fn(err, files)`, where `files` is the altered dictionary.

#### #process(fn)

Process the files like build without writing any files. Callback signature `fn(err, files)`.

## Metadata API

Add metadata to your files to access these build features. By default, Metalsmith uses a few different metadata fields:

- `contents` - The body content of the file, not including any [YAML frontmatter](https://middlemanapp.com/basics/frontmatter/).
- `mode` - The numeric version of the [file's mode](http://en.wikipedia.org/wiki/Modes_%28Unix%29).

You can add your own metadata in two ways:

- Using [YAML frontmatter](https://middlemanapp.com/basics/frontmatter/) at the top of any file.
- Enabling [a plugin](https://github.com/segmentio/metalsmith/blob/master/Readme.md#plugins) that adds metadata programmatically.

#### mode

Set the mode of the file. For example,

```
$ cat cleanup.sh

--
mode: 0764
--

rm -rf .
```

would be built with mode ```-rwxrw-r--```, i.e. user-executable.


## Troubleshooting

### Node Version Requirements
Metalsmith v2.0 and above uses [generators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator) which has some considerations for `node.js 0.12.x` and below.

#### Using `node.js 0.10.x`
You have two options:

1. Upgrade to latest stable version of `node.js` (>= `0.12.x` — see "*Using `node.js 0.12.x`*" section below)
2. Use Metalsmith v1.7. Put `"metalsmith": "^1.7.0"` in your `package.json` and `npm install` that version.

#### Using `node.js 0.12.x`
You have three options:

1. Run `node.js` with `--harmony_generators` flag set.
    1. `node --harmony_generators my_script.js`
    2. Using `package.json`: `"scripts": {"start": "node --harmony_generators my_script.js"}`. Run with `npm run`
2. `npm install` [harmonize](https://www.npmjs.com/package/harmonize) and require before Metalsmith is used. e.g. `require("harmonize")(["harmony-generators"]);`
3. Use Metalsmith v1.7. Put `"metalsmith": "^1.7.0"` in your `package.json` and `npm install` that version.


## License

The MIT License (MIT)

Copyright &copy; 2014, Segment.io \<friends@segment.io\>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[npm-badge]: https://img.shields.io/npm/v/metalsmith.svg
[npm-url]: https://www.npmjs.com/package/metalsmith
[travis-badge]: https://travis-ci.org/metalsmith/metalsmith.svg
[travis-url]: https://travis-ci.org/metalsmith/metalsmith
[coveralls-badge]:https://coveralls.io/repos/metalsmith/metalsmith/badge.svg?branch=master&service=github
[coveralls-url]: https://coveralls.io/github/metalsmith/metalsmith?branch=master
[david-badge]: https://david-dm.org/metalsmith/metalsmith.svg
[david-url]: https://david-dm.org/metalsmith/metalsmith
[slack-badge]: https://img.shields.io/badge/Slack-Join%20Chat%20→-blue.svg
[slack-url]: http://metalsmith-slack.herokuapp.com/
