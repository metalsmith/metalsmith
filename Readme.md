# Metalsmith

An extremely simple, _pluggable_ static site generator.

In Metalsmith, all of the logic is handled by plugins. You simply chain them together. Here's what the simplest blog looks like...

```js
Metalsmith(__dirname)
  .use(markdown())
  .use(templates('handlebars'))
  .build();
```

...but what if you want to get fancier by hiding your unfinished drafts and using custom permalinks? Just add plugins...

```js
Metalsmith(__dirname)
  .use(drafts())
  .use(markdown())
  .use(permalinks('posts/:title'))
  .use(templates('handlebars'))
  .build();
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
  - [Getting to Know Metalsmith](http://www.robinthrift.com/posts/getting-to-know-metalsmith/) - a great series about how to use Metalsmith for your static site.

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
    "metalsmith-templates": "handlebars"
  }
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

Checkout the [static site](examples/static-site), [Jekyll](examples/jekyll) or [Wintersmith](examples/wintersmith) examples to see the CLI in action.

## API

Checkout the [project scaffolder](examples/project-scaffolder) or [build tool](examples/build-tool) examples to see a real example of the Javascript API in use.

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

#### #clean(boolean)

Set whether to remove the destination directory before writing to it, or get the current setting. Defaults to `true`.

#### #metadata(json)

Get the global metadata. This is useful for plugins that want to set global-level metadata that can be applied to all files.

#### #join(paths...)
 
Join any amount of `paths...` to the working directory. This is useful for plugins who want to read extra assets from another directory, for example `./templates`.

#### #run(files, fn)

Run all of the middleware functions on a dictionary of `files` and callback with `fn(err, files)`, where `files` is the altered dictionary.

## Metadata API

Add metadata to your files to access these build features. 

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


## License

The MIT License (MIT)

Copyright &copy; 2014, Segment.io \<friends@segment.io\>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
