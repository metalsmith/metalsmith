const Metalsmith = require('metalsmith')
const markdown = require('@metalsmith/markdown')
const layouts = require('metalsmith-layouts')
const permalinks = require('@metalsmith/permalinks')
const collections = require('metalsmith-collections')

Metalsmith(__dirname)
  .metadata({
    sitename: 'My Static Site & Blog',
    description: "It's about saying »Hello« to the World.",
    generator: 'Metalsmith',
    url: 'https://metalsmith.io/'
  })
  .source('./src')
  .destination('./build')
  .clean(true)
  .use(
    collections({
      posts: 'posts/*.md'
    })
  )
  .use(markdown())
  .use(permalinks())
  .use(
    layouts({
      engineOptions: {
        helpers: {
          formattedDate: function (date) {
            return new Date(date).toLocaleDateString()
          }
        }
      }
    })
  )
  .build(function (err, files) {
    if (err) throw err
  })
