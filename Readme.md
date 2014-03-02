
# Metalsmith

  An extremely simple, _pluggable_ way to manipulate directories.

  **It's a static site generator:** using plugins that convert markdown, render templates and handle permalinks.

  **It's a project scaffolder:** using plugins that prompt for placeholders and render templates.

  **It's a build tool:** using plugins that pre-process files and then concatenate them together.

## Installation

    $ npm install metalsmith

## Plugins

  Check out the Wiki for a list of [plugins]().

## How does it work?

  Metalsmith is super simple. It reads all the files in a source directory, runs the contents through a series of middleware that can manipulate as they please, and then writes the contents to a destination directory.

  Each file can contain YAML front-matter that will be attached as metadata, so a simple file like...

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

  ...which any of the plugins can then manipulate.

## Examples

  Check out the [examples directory](examples) to see it in action. There are examples of:

  - [A simple static site generator.](examples/static-site)
  - [A simple project scaffolder.](examples/project-scaffolder)
  - [A simple build tool for Sass files.](examples/build-tool)
  - [An implementation similar to Jekyll with just a few plugins.](examples/jekyll)
  - [An implementation similar to Wintersmith with just a few plugins.](examples/wintersmith)

## CLI

  In addition to a simple [Javascript API](#api), the Metalsmith CLI can read configuration from a `metalsmith.json` file, so that you can build static-site generators similar to [Jekyll](jekyllrb.com) or [Wintersmith](wintersmith.io) easily. Simply...

    $ metalsmith
      
        Metalsmith · reading configuration from: /path/to/metalsmith.json
        Metalsmith · successfully built to: /path/to/build

## API

#### new Metalsmith(dir)

  Create a new `Metalsmith` instance for a working `dir`.

#### #use(plugin)

  Add the given `plugin` function to the middleware stack.

#### #build(fn)

  Build with the given settings and call `fn(err, files)`.

#### #source(path)

  Set the relative `path` to the source directory, or get the full one if no `path` is provided. The source directory defaults to `./src`.

#### #destination(path)

  Set the relative `path` to the destination directory, or get the full one if no `path` is provided. The destination directory defaults to `./build`.

#### #metadata(json)

  Set global metadata, in addition to any YAML front-matter.

#### #join(paths...)
 
  Join any amount of `paths...` to the working directory.

## License

  The MIT License (MIT)

  Copyright &copy; 2013, Segment.io \<friends@segment.io\>

  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.