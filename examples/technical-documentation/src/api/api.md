---
title: "Metalsmith"
description: "An extremely simple, pluggable static site generator."
autotoc: true
view: layout.twig
collection: "API"
---

# API

Checkout the [project scaffolder](https://github.com/metalsmith/metalsmith/tree/master/examples/project-scaffolder) or [build tool](https://github.com/metalsmith/metalsmith/tree/master/examples/build-tool) examples to see a real example of the Javascript API in use.

### new Metalsmith(dir)

Create a new `Metalsmith` instance for a working `dir`.

### .use(plugin)

Add the given `plugin` function to the middleware stack. Metalsmith uses
[ware](https://github.com/segmentio/ware) to support middleware, so plugins
should follow the same pattern of taking arguments of `(files, metalsmith, callback)`,
modifying the `files` or `metalsmith.metadata()` argument by reference, and then
calling `callback` to trigger the next step.

### .build(fn)

Build with the given settings and a callback having signature `fn(err, files)`.

### .source(path)

Set the relative `path` to the source directory, or get the full one if no `path` is provided. The source directory defaults to `./src`.

### .destination(path)

Set the relative `path` to the destination directory, or get the full one if no `path` is provided. The destination directory defaults to `./build`.

### .concurrency(max)

Set the maximum number of files to open at once when reading or writing.  Defaults to `Infinity`.  To avoid having too many files open at once (`EMFILE` errors), set the concurrency to something lower than `ulimit -n`.

### .clean(boolean)

Set whether to remove the destination directory before writing to it, or get the current setting. Defaults to `true`.

### .frontmatter(boolean)

Set whether to parse YAML frontmatter. Defaults to `true`.

### .ignore(path)

Ignore files/paths from being loaded into Metalsmith.

`path` can be a string, a function, or an array of strings and/or functions.
Strings use the glob syntax from
[minimatch](https://github.com/isaacs/minimatch) to match files and directories
to ignore. Functions are called with the full path to the file as their first
argument, and the `lstat` object returned by Node's `fs.lstat` function as their
second argument, and must return either `true` to ignore the file, or `false` to
keep it.

### .metadata(json)

Get the global metadata. This is useful for plugins that want to set global-level metadata that can be applied to all files.

### .path(paths...)

Resolve any amount of `paths...` relative to the working directory. This is useful for plugins who want to read extra assets from another directory, for example `./layouts`.

### .run(files, fn)

Run all of the middleware functions on a dictionary of `files` and callback with `fn(err, files)`, where `files` is the altered dictionary.