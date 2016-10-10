var Metalsmith  = require('metalsmith');
var markdown    = require('metalsmith-markdown');
var layouts     = require('metalsmith-layouts');
var permalinks  = require('metalsmith-permalinks');
var collections = require('metalsmith-collections');
var ebook  = require('./custom-modules/metalsmith-ebook');

Metalsmith(__dirname)
  .metadata({
    title: "Ebook Example",
    description: "Generate ebooks easily with Metalsmith!",
    generator: "Metalsmith",
    url: "http://www.metalsmith.io/"
  })
  .source('./src')
  .destination('./build')
  .clean(true)
  .use(collections({
    chapters: {
        pattern: 'chapters/*.md'
    }
  }))
  .use(markdown())
  .use(permalinks())
  .use(layouts({
    engine: 'handlebars'
  }))
  .use(ebook({
    title: "Metalsmith Ebook Example",
    author: "Team Metalsmith",
    pdf: {
      "format": "Letter",        // allowed units: A3, A4, A5, Legal, Letter, Tabloid
      "orientation": "portrait", // portrait or landscape
    }
  }))
  .build(function(err, files) {
      if (err) { 
        throw err; 
      }
  });



