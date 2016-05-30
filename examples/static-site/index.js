var Metalsmith  = require('metalsmith');
var layouts     = require('metalsmith-layouts');
var markdown    = require('metalsmith-markdown');
var permalinks  = require('metalsmith-permalinks');


Metalsmith(__dirname)
  .metadata({
    siteurl: "http://example.com/",
    sitename: "My Static Site & Blog",
    description: "It's about saying »Hello« to the world.",
    generator: "Metalsmith",
    generatorurl: "http://metalsmith.io/"
  })
  .source('./src')
  .destination('./build')
  .clean(true)
  .use(markdown())
  .use(permalinks())
  .use(layouts({
    engine: 'handlebars',
  }))
  .build(function(err, files) {
    if (err) throw err;
  });
