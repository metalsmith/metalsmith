# Metalsmith

[![npm: version][npm-badge]][npm-url]
[![ci: build][ci-badge]][ci-url]
[![code coverage][codecov-badge]][codecov-url]
[![license: MIT][license-badge]][license-url]
[![Gitter chat][gitter-badge]][gitter-url]

> An extremely simple, _pluggable_ static site generator.

In Metalsmith, all of the logic is handled by plugins. You simply chain them together. Here's what the simplest blog looks like...

```js
Metalsmith(__dirname)
  .use(markdown())
  .use(layouts('handlebars'))
  .build(function (err) {
    if (err) throw err
    console.log('Build finished!')
  })
```

...but what if you want to get fancier by hiding your unfinished drafts and using custom permalinks? Just add plugins...

```js
Metalsmith(__dirname)
  .use(drafts())
  .use(markdown())
  .use(permalinks('posts/:title'))
  .use(layouts('handlebars'))
  .build(function (err) {
    if (err) throw err
    console.log('Build finished!')
  })
```

...it's as easy as that!

## Installation

NPM:

```
npm install metalsmith
```

Yarn:

```
yarn add metalsmith
```

## Plugins

Check out the website for a list of [plugins](https://metalsmith.io/plugins).

## How does it work?

Metalsmith works in three simple steps:

1. Read all the files in a source directory.
2. Invoke a series of plugins that manipulate the files.
3. Write the results to a destination directory!

Each plugin is invoked with the contents of the source directory, and each file can contain YAML front-matter that will be attached as metadata, so a simple file like...

```md
---
title: A Catchy Title
date: 2021-12-01
---

An informative article.
```

...would be parsed into...

```
{
  'path/to/my-file.md': {
    title: 'A Catchy Title',
    date: <Date >,
    contents: <Buffer 7a 66 7a 67...>
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

- [Gitter community chat](https://gitter.im/metalsmith/community)
- [Getting to Know Metalsmith](http://robinthrift.com/post/getting-to-know-metalsmith/) - a great series about how to use Metalsmith for your static site.
- [Building a Blog With Metalsmith](https://azurelogic.com/posts/building-a-blog-with-metalsmith/) - a blog post about how to create a basic blog with Metalsmith. Check out the related [video of the talk](https://www.youtube.com/watch?v=cAq5_5Yy7Tg) too!
- [Awesome Metalsmith](https://github.com/lambtron/awesome-metalsmith) - great collection of resources, examples, and tutorials

## CLI

In addition to a simple [Javascript API](#api), the Metalsmith CLI can read configuration from a `metalsmith.json` file, so that you can build static-site generators similar to [Jekyll](http://jekyllrb.com) or [Wintersmith](http://wintersmith.io) easily. The example blog above would be configured like this:

```json
{
  "source": "src",
  "destination": "build",
  "plugins": [
    { "@metalsmith/drafts": true },
    { "@metalsmith/markdown": true },
    { "@metalsmith/permalinks": "posts/:title" },
    { "@metalsmith/layouts": {} }
  ]
}
```

You can specify your plugins as either an object or array. Using an array would allow you to specify use of the same plugin multiple times. The above example is then defined as so:

```json
{
  "source": "src",
  "destination": "build",
  "plugins": [
    { "@metalsmith/drafts": true },
    { "@metalsmith/markdown": true },
    { "@metalsmith/permalinks": "posts/:title" },
    { "metalsmith-layouts": true }
  ]
}
```

And then just install `metalsmith` and the plugins and run the metalsmith CLI...

```bash
metalsmith

# Metalsmith · reading configuration from: /path/to/metalsmith.json
# Metalsmith · successfully built to: /path/to/build
```

Options recognised by `metalsmith.json` are `source`, `destination`, `concurrency`, `metadata`, `clean` and `frontmatter` - See "_API_" section below for usage.

Checkout the [static site](examples/static-site), [Jekyll](examples/jekyll) or [Wintersmith](examples/wintersmith) examples to see the CLI in action.

If you want to use a custom plugin, but feel like it's too domain-specific to
be published to the world, you can include plugins as local npm modules:
(simply use a relative path from your root directory)

```json
{
  "plugins": [{ "./lib/metalsmith/plugin.js": true }]
}
```

## API

See [API reference at metalsmith.io](https://metalsmith.io/api)

## Metadata API

Add metadata to your files to access these build features. By default, Metalsmith uses a few different metadata fields:

- `contents` - The body content of the file, not including any [YAML frontmatter](https://middlemanapp.com/basics/frontmatter/).
- `mode` - The numeric version of the [file's mode](http://en.wikipedia.org/wiki/Modes_%28Unix%29).

You can add your own metadata in two ways:

- Using [YAML frontmatter](https://middlemanapp.com/basics/frontmatter/) at the top of any file.
- Enabling [a plugin](https://github.com/metalsmith/metalsmith/blob/master/README.md#plugins) that adds metadata programmatically.

#### mode

Set the mode of the file. For example, a `cleanup.sh` file with the contents

```md
---
mode: 0764
---

#!/bin/sh

rm -rf .
```

would be built with mode `-rwxrw-r--`, i.e. user-executable.

## Troubleshooting

### Node Version Requirements

Metalsmith 3.0.0 will support NodeJS versions 12 and higher.
Metalsmith 2.4.0 supports NodeJS versions 8 and higher.
Metalsmith 2.3.0 and below support NodeJS versions all the way back to 0.12.

## Credits

Special thanks to [Ian Storm Taylor](https://github.com/ianstormtaylor), [Andrew Meyer](https://github.com/Ajedi32), [Dominic Barnes](https://github.com/dominicbarnes), [Andrew Goodricke](https://github.com/woodyrew), [Ismay Wolff](https://github.com/ismay), [Kevin Van Lierde](https://github.com/webketje) and [others](https://github.com/segmentio/metalsmith/graphs/contributors) for their contributions!

## [License](LICENSE)

[npm-badge]: https://img.shields.io/npm/v/metalsmith.svg
[npm-url]: https://www.npmjs.com/package/metalsmith
[ci-badge]: https://github.com/metalsmith/metalsmith/actions/workflows/test.yml/badge.svg
[ci-url]: https://github.com/metalsmith/metalsmith/actions/workflows/test.yml
[codecov-badge]: https://coveralls.io/repos/github/metalsmith/metalsmith/badge.svg?branch=master
[codecov-url]: https://coveralls.io/github/metalsmith/metalsmith?branch=master
[license-badge]: https://img.shields.io/github/license/metalsmith/metalsmith
[license-url]: LICENSE
[gitter-badge]: https://img.shields.io/badge/GITTER-Join-blue.svg
[gitter-url]: https://gitter.im/metalsmith/community
