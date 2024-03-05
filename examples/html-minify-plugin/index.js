var Metalsmith  = require('metalsmith');
var minify      = require('./custom_modules/html-minify');

Metalsmith(__dirname)
  .metadata({
    title: "My html-minify plugin example",
    description: "It's about saying »Hello« to the World with minified html and plugins!",
    generator: "Metalsmith",
    url: "http://www.metalsmith.io/"
  })
  .source('./src')
  .use(minify({
        removeComments  : true
    }
  ))
  .destination('./build')
  .clean(false)
  .build(function(err, files) {
    if (err) { throw err; }
  });
