var Metalsmith = require('metalsmith')
var layouts = require('metalsmith-layouts')
var markdown = require('metalsmith-markdown')

Metalsmith(__dirname)
  .metadata({
    title: 'Simple Website',
    description: 'An extremely simple example website for the extremely simple static-site generator',
    twitter: 'metalsmith',
    github: 'metalsmith',
    facebook: 'metalsmith'
  })
  .source('./src')
  .destination('./build')
  .use(markdown())
  .use(layouts({
    engine: 'pug',
    pretty: true,
    directory: 'layouts',
    default: 'default.pug',
    pattern: '**/*.html'
  }))
  .build(function(err, files) {
    if (err) { throw err; }
  })
