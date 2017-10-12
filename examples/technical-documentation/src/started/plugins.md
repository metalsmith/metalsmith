---
title: "Plugins"
description: "An extremely simple, pluggable static site generator."
autotoc: true
view: layout.twig
collection: "Getting Started"
---

# Everything is a Plugin - A first example

All of the logic in Metalsmith is handled by plugins. You simply chain them together. Here's what the simplest blog looks like. It uses only two plugins, **`markdown()`** and **`layouts()`**...

```js
Metalsmith(__dirname)          // instantiate Metalsmith in the cwd
  .source('sourcepath')        // specify source directory
  .destination('destpath')     // specify destination directory
  .use(markdown())             // transpile markdown into html
  .use(layouts({               // wrap a handlebars-layout
    engine: 'handlebars'       // around transpiled html-files
  }))    
  .build(function(err) {       // this is the actual build process
    if (err) throw err;    // throwing errors is required
  });
```


... and by the way, if you do not want your destination directory to be cleaned before a new build, just add <b>`.clean(false)`</b>. But what if you want to get fancier by hiding your unfinished drafts and using permalinks? Just add plugins...

```js
Metalsmith(__dirname)
  .source('sourcepath')      
  .destination('destpath')
  .clean(false)                  // do not clean destination
                                 // directory before new build   
  .use(drafts())                 // only files that are NOT drafts
  .use(markdown())
  .use(permalinks())             // make a permalink output path
  .use(layouts({
    engine: 'handlebars'
  }))
  .build(function(err) {    
    if (err) throw err;
  });
```

...it's as easy as that!

A small comment. Instead of [Handlebars](http://handlebarsjs.com/) you can also use other templating languages such as [Jade/Pug](http://jade-lang.com/).
