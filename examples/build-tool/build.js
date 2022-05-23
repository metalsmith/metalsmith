const extname = require('path').extname
const Metalsmith = require('metalsmith')
const myth = require('myth')

/**
 * Concat plugin.
 *
 * @param {Object} files
 * @param {Metalsmith} metalsmith
 * @param {Function} done
 */

function concat(files, metalsmith, done) {
  let css = ''

  for (const file in files) {
    if ('.css' !== extname(file)) continue
    css += files[file].contents.toString()
    delete files[file]
  }

  css = myth(css)

  files['index.css'] = {
    contents: Buffer.from(css)
  }

  done()
}

/**
 * Build.
 */

Metalsmith(__dirname)
  .use(concat)
  .build(function (err) {
    if (err) throw err
  })
