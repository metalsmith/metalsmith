var Metalsmith  = require('metalsmith');
var markdown    = require('metalsmith-markdown');
var layouts     = require('metalsmith-layouts');
var permalinks  = require('metalsmith-permalinks');
var collections = require('metalsmith-collections');
var feed        = require('metalsmith-feed');


Metalsmith(__dirname)
  .metadata({
    title: "RSS Feed Example",
    description: "It's about saying »Hello« to the World and letting the world keep up with your blog via RSS feed.",
    generator: "Metalsmith",
    url: "http://www.metalsmith.io/",
    site:{
      title: "RSS Feed Example",
      url: "http://www.metalsmith.io/",
      author: "George RR Martin"
    }
  })
  .source('./src')
  .destination('./build')
  .use(collections({
    posts: {
        pattern: 'posts/*.md'
    }
  }))
  .use(feed({
    collection: 'posts'
  }))
  .use(markdown())
  .use(permalinks())
  .use(layouts({
    engine: 'handlebars'
  }))
  .build(function(err, files) {
    if (err) { throw err; }
  });
