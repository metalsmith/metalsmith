
# metalsmith

  An extremely simple, _pluggable_ static site generator.

## Installation

    $ npm install metalsmith

## Example

  With a directory structure like this ...

    /blog
      /src
        /a-post.md
        /another-post.md

  ... running Metalsmith ...

    $ metalsmith

  ... will create:

    /blog
      /build
        /a-post.html
        /another-post.html

## CLI

      Usage: metalsmith [options]
    
      Options:
      
        -h, --help         output usage information
        -c, --config       set a config file
        -d, --destination  set the destination directory
        -s, --source       set the source directory

## Javascript API

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

  MIT