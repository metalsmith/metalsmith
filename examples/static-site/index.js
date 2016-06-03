var Metalsmith  = require('metalsmith');
var collection  = require('metalsmith-collections');
var layouts     = require('metalsmith-layouts');
var markdown    = require('metalsmith-markdown');
var permalinks  = require('metalsmith-permalinks');


Metalsmith(__dirname)         // __dirname defined by node.js: name of directory
                              // that has the currently executing script
  .metadata({                 // add any variables you want, use them in layouts
    sitename: "My Static Site & Blog",
    siteurl: "http://example.com/",
    description: "It's about saying »Hello« to the World.",
    generatorname: "Metalsmith",
    generatorurl: "http://metalsmith.io/"
  })
  .source('./src')            // source directory
  .destination('./build')     // destination directory
  .clean(true)                // clean destination directory before new build
  .use(collection({           // group all blog posts by internally
    posts: 'posts/*.md'       // adding key 'collection':'posts' to all matches
  }))                         // `collection.posts` now accessible in layouts
  .use(markdown())            // transpile all md into html
  .use(permalinks({           // change URLs in permalink URLs
    relative: false           // put css only in /css
  }))
  .use(layouts({              // wrap layouts around html
    engine: 'handlebars',     // use the layout engine you like
  }))
  .build(function(err) {      // build process
    if (err) throw err;       // error handling is required
  });
