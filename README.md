# Metalsmith

[![npm: version][npm-badge]][npm-url]
[![ci: build][ci-badge]][ci-url]
[![code coverage][codecov-badge]][codecov-url]
[![license: MIT][license-badge]][license-url]
[![Gitter chat][gitter-badge]][gitter-url]

> An extremely simple, _pluggable_ static site generator for NodeJS.

In Metalsmith, all of the logic is handled by plugins. You simply chain them together.

Here's what the simplest blog looks like:

```js
import { fileURLToPath } from 'node:url'
import { dirname } from 'path'
import Metalsmith from 'metalsmith'
import layouts from '@metalsmith/layouts'
import markdown from '@metalsmith/markdown'

const __dirname = dirname(fileURLToPath(import.meta.url))

Metalsmith(__dirname)
  .use(markdown())
  .use(
    layouts({
      pattern: '**/*.html'
    })
  )
  .build(function (err) {
    if (err) throw err
    console.log('Build finished!')
  })
```

## Installation

NPM:

```
npm install metalsmith
```

Yarn:

```
yarn add metalsmith
```

## Quickstart

What if you want to get fancier by hiding unfinished drafts, grouping posts in collections, and using custom permalinks? Just add plugins...

```js
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
import Metalsmith from 'metalsmith'
import collections from '@metalsmith/collections'
import layouts from '@metalsmith/layouts'
import markdown from '@metalsmith/markdown'
import permalinks from '@metalsmith/permalinks'
import drafts from '@metalsmith/drafts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const t1 = performance.now()
const devMode = process.env.NODE_ENV === 'development'

Metalsmith(__dirname) // parent directory of this file
  .source('./src') // source directory
  .destination('./build') // destination directory
  .clean(true) // clean destination before
  .env({
    // pass NODE_ENV & other environment variables
    DEBUG: process.env.DEBUG,
    NODE_ENV: process.env.NODE_ENV
  })
  .metadata({
    // add any variable you want & use them in layout-files
    sitename: 'My Static Site & Blog',
    siteurl: 'https://example.com/',
    description: "It's about saying »Hello« to the world.",
    generatorname: 'Metalsmith',
    generatorurl: 'https://metalsmith.io/'
  })
  .use(drafts(devMode)) // only include drafts when NODE_ENV === 'development'
  .use(
    collections({
      // group all blog posts by adding key
      posts: 'posts/*.md' // collections:'posts' to metalsmith.metadata()
    })
  ) // use `collections.posts` in layouts
  .use(
    markdown({
      // transpile all md file contents into html
      keys: ['description'], // and also file.description
      globalRefs: {
        // define links available to all markdown files
        home: 'https://example.com'
      }
    })
  )
  .use(permalinks()) // change URLs to permalink URLs
  .use(
    layouts({
      // wrap layouts around html
      pattern: '**/*.html'
    })
  )
  .build((err) => {
    // build process
    if (err) throw err // error handling is required
    console.log(`Build success in ${((performance.now() - t1) / 1000).toFixed(1)}s`)
  })
```

## How does it work?

Metalsmith works in three simple steps:

1. Read all the files in a source directory.
2. Invoke a series of plugins that manipulate the files.
3. Write the results to a destination directory!

Each plugin is invoked with the contents of the source directory, and each file can contain YAML front-matter that will be attached as metadata, so a simple file like...

```yml
---
title: A Catchy Title
date: 2024-01-01
---
An informative article.
```

...would be parsed into...

```js
{
  'path/to/my-file.md': {
    title: 'A Catchy Title',
    date: new Date(2024, 1, 1),
    contents: Buffer.from('An informative article'),
    stats: fs.Stats
  }
}
```

...which any of the plugins can then manipulate however they want. Writing plugins is incredibly simple, just take a look at the [example drafts plugin](examples/drafts-plugin/index.js).

Of course they can get a lot more complicated too. That's what makes Metalsmith powerful; the plugins can do anything you want!

## Plugins

A [Metalsmith plugin](https://metalsmith.io/api/#Plugin) is a function that is passed the file list, the metalsmith instance, and a done callback.
It is often wrapped in a plugin initializer that accepts configuration options.

Check out the official plugin registry at: https://metalsmith.io/plugins.  
Find all the core plugins at: https://github.com/search?q=org%3Ametalsmith+metalsmith-plugin  
See [the draft plugin](examples/drafts-plugin) for a simple plugin example.

## API

Check out the full API reference at: https://metalsmith.io/api.

## CLI

In addition to a simple [Javascript API](#api), the Metalsmith CLI can read configuration from a `metalsmith.json` file, so that you can build static-site generators similar to [Jekyll](https://jekyllrb.com) or [Hexo](https://hexo.io) easily. The example blog above would be configured like this:

`metalsmith.json`

```json
{
  "source": "src",
  "destination": "build",
  "clean": true,
  "metadata": {
    "sitename": "My Static Site & Blog",
    "siteurl": "https://example.com/",
    "description": "It's about saying »Hello« to the world.",
    "generatorname": "Metalsmith",
    "generatorurl": "https://metalsmith.io/"
  },
  "plugins": [
    { "@metalsmith/drafts": true },
    { "@metalsmith/collections": { "posts": "posts/*.md" } },
    { "@metalsmith/markdown": true },
    { "@metalsmith/permalinks": "posts/:title" },
    { "@metalsmith/layouts": true }
  ]
}
```

Then run:

```bash
metalsmith

# Metalsmith · reading configuration from: /path/to/metalsmith.json
# Metalsmith · successfully built to: /path/to/build
```

Options recognised by `metalsmith.json` are `source`, `destination`, `concurrency`, `metadata`, `clean` and `frontmatter`.
Checkout the [static site](examples/static-site), [Jekyll](examples/jekyll) examples to see the CLI in action.

### Local plugins

If you want to use a custom plugin, but feel like it's too domain-specific to be published to the world, you can include plugins as local npm modules: (simply use a relative path from your root directory)

```json
{
  "plugins": [{ "./lib/metalsmith/plugin.js": true }]
}
```

## The secret...

We often refer to Metalsmith as a "static site generator", but it's a lot more than that. Since everything is a plugin, the core library is just an abstraction for manipulating a directory of files.

Which means you could just as easily use it to make...

- [A project scaffolder.](examples/project-scaffolder)
- [A build tool for Sass files.](examples/build-tool)
- [A simple static site generator.](examples/static-site)
- [A Jekyll-like static site generator.](examples/jekyll)

## Resources

- [Gitter Matrix community chat](https://app.gitter.im/#/room/#metalsmith_community:gitter.im) for chat, questions
- [X (formerly Twitter) announcements](https://x.com/@metalsmithio) and the [metalsmith.io news page](https://metalsmith.io/news) for updates
- [Awesome Metalsmith](https://github.com/metalsmith/awesome-metalsmith) - great collection of resources, examples, and tutorials
- [emmer.dev on metalsmith](https://emmer.dev/blog/tag/metalsmith/) - A good collection of various how to's for metalsmith
- [glinka.co on metalsmith](https://www.glinka.co/blog/) - Another great collection of advanced approaches for developing metalsmith
- [Getting to Know Metalsmith](http://robinthrift.com/post/getting-to-know-metalsmith/) - a great series about how to use Metalsmith for your static site.

## Troubleshooting

Set `metalsmith.env('DEBUG', '*metalsmith*')` to debug your build. This will log debug logs for all plugins using the built-in `metalsmith.debug` debugger.
For older plugins using [debug](https://github.com/debug-js/debug/) directly, run your build with `export DEBUG=metalsmith-*,@metalsmith/*` (Linux) or `set DEBUG=metalsmith-*,@metalsmith/*` for Windows.

### Node Version Requirements

Future Metalsmith releases will at least support the oldest supported Node LTS versions.

Metalsmith 2.6.x supports NodeJS versions 14.18.0 and higher.  
Metalsmith 2.5.x supports NodeJS versions 12 and higher.  
Metalsmith 2.4.x supports NodeJS versions 8 and higher.  
Metalsmith 2.3.0 and below support NodeJS versions all the way back to 0.12.

### Compatibility & support policy

Metalsmith is supported on all common operating systems (Windows, Linux, Mac).
Metalsmith releases adhere to [semver (semantic versioning)](https://semver.org/) with 2 minor gray-area exceptions for what could be considered breaking changes:

- Major Node version support for EOL (End of Life) versions can be dropped in minor releases
- If a change represents a major improvement that is backwards-compatible with 99% of use cases (not considering outdated plugins), they will be considered eligible for inclusion in minor version updates.

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

[gitter-badge]: https://img.shields.io/badge/[gitter:matrix]-join-blue.svg
[gitter-url]: https://app.gitter.im/#/room/#metalsmith_community:gitter.im
