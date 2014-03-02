
# metalsmith

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
    
    An informative body.
  
  ...would be parsed into...

```js
{
  'path/to/my-file.md': {
    title: 'A Catchy Title',
    date: new Date('2014-12-01'),
    body: new Buffer('An informative body')
  }
}
```

  ...which any of the plugins can then manipulate.

## Examples

  Check out the examples directory to see it in action. There are examples of:

  - A simple static site generator. [here](examples/static-site)
  - A simple project scaffolder. [here](examples/project-scaffolder)
  - A simple build tool for Sass files. [here](examples/build-tool)
  - An implementation similar to [Jekyll](jekyllrb.com) with just a few plugins. [here](examples/jekyll)
  - An implementation similar to [Wintersmith](wintersmith.io) with just a few plugins. [here](examples/wintersmith)

## CLI

  In addition to a simple Javascript API, the Metalsmith CLI can process a middleware configuration from a `metalsmith.json` file, so that you can build static-site generators similar to [Jekyll](jekyllrb.com) or [Wintersmith](wintersmith.io) easily.

      Usage: metalsmith [options]
    
      Options:
      
        -h, --help         output usage information
        -c, --config       set a config file              default: `metalsmith.json`
        -d, --destination  set the destination directory  default: `build`
        -s, --source       set the source directory       default: `src`

## API

#### new Metalsmith(dir)

  Create a new `Metalsmith` instance for a working `dir`.

#### #use(plugin)

  Add the given `plugin` function to the middleware stack.

#### #source(path)

  Set the relative `path` to the source directory, or get the full one if no `path` is provided. The source directory defaults to `./src`.

#### #destination(path)

  Set the relative `path` to the destination directory, or get the full one if no `path` is provided. The destination directory defaults to `./build`.

#### #metadata(json)

  Set global metadata that should be applied to each file, in addition to any YAML front-matter.

#### #join(paths...)
 
  Join any amount of `paths...` to the working directory.

#### #build(fn)

  Build with the given settings and plugins, and call `fn(err)`.

## License

  The MIT License (MIT)

  Copyright @copy; 2013, Segment.io \<friends@segment.io\>

  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.