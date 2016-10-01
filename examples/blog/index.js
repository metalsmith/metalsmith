var Metalsmith  = require('metalsmith');
var markdown    = require('metalsmith-markdown');
var layouts     = require('metalsmith-layouts');
var permalinks  = require('metalsmith-permalinks');
var drafts = require('metalsmith-drafts');
var collections = require('metalsmith-collections');
var discoverPartials = require('metalsmith-discover-partials');


Metalsmith(__dirname)
  .metadata({
    title: "My Blog",
    description: "It's about saying »Hello« to the World.",
    generator: "Metalsmith",
    url: "http://www.metalsmith.io/",
    twitter: "https://twitter.com/",
    facebook: "https://www.facebook.com/",
    github: "https://github.com/"
  })
  .source('./src')
  .destination('./build')
  .clean(false)
    .use(drafts())
  .use(discoverPartials({
      directory: 'layouts/partials',
      pattern: /\.hbs$/
  }))
  .use(collections({
    posts: {
        pattern: 'posts/*.md',
        sortBy: 'date',
        reverse: true
    }
  }))
  .use(markdown())
  .use(permalinks())
  .use(layouts({
    engine: 'handlebars'
  }))
  .build(function(err, files) {
    if (err) { throw err; }
  });
