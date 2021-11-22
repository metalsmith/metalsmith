const Metalsmith  = require('metalsmith');
const markdown    = require('metalsmith-markdown');
const layouts     = require('metalsmith-layouts');
const permalinks  = require('metalsmith-permalinks');
const collections = require('metalsmith-collections');

Metalsmith(__dirname)
  .metadata({
    title: 'My Static Site & Blog',
    description: 'It\'s about saying »Hello« to the World.',
    generator: 'Metalsmith',
    url: 'http://www.metalsmith.io/'
  })
  .source('./src')
  .destination('./build')
  .clean(true)
  .use(collections({
    posts: 'posts/*.md'
  }))
  .use(markdown())
  .use(permalinks())
  .use(layouts())
  .build(function(err, files) {
    if (err) { throw err; }
  });
