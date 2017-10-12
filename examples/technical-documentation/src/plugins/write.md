---
title: "Writing A Plugin"
description: "An extremely simple, pluggable static site generator."
autotoc: true
view: layout.twig
collection: "Plugins"
---

# Writing A Plugin

Writing a plugin is not difficult as you have seen above with the `metalsmith-drafts` plugin. In order to achieve more complicated tasks you will most likely find and can use `npm`-packages. Look at how others have done it. Here is an example using `debug` (which we appreciate if you use it) and `multimatch`:

`metalsmith-myplugin`:

```JavaScript
// we would like you to use debug
var debug = require('debug')('metalsmith-myplugin');
var multimatch = require('multimatch');


// Expose `plugin`.
module.exports = plugin;


function plugin(opts){
  opts.pattern = opts.pattern || [];

  return function (files, metalsmith, done){

    setImmediate(done);
    Object.keys(files).forEach(function(file){
      if(multimatch(file, opts.pattern).length) {
        debug('myplugin working on: %s', file);

        //
        // here would be your code
        //

      }

    });

  };
}
```
