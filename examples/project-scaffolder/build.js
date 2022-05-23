const async = require('async')
const Metalsmith = require('metalsmith')
const prompt = require('cli-prompt')
const render = require('consolidate').handlebars.render

/**
 * Build.
 */

Metalsmith(__dirname)
  .use(ask)
  .use(template)
  .build(function (err) {
    if (err) throw err
  })

/**
 * Prompt plugin.
 *
 * @param {Object} files
 * @param {Metalsmith} metalsmith
 * @param {Function} done
 */

function ask(files, metalsmith, done) {
  const prompts = ['name', 'repository', 'description', 'license']
  const metadata = metalsmith.metadata()

  async.eachSeries(prompts, run, done)

  function run(key, done) {
    prompt('  ' + key + ': ', function (val) {
      metadata[key] = val
      done()
    })
  }
}

/**
 * Template in place plugin.
 *
 * @param {Object} files
 * @param {Metalsmith} metalsmith
 * @param {Function} done
 */

function template(files, metalsmith, done) {
  const keys = Object.keys(files)
  const metadata = metalsmith.metadata()

  async.each(keys, run, done)

  function run(file, done) {
    const str = files[file].contents.toString()
    render(str, metadata, function (err, res) {
      if (err) return done(err)
      files[file].contents = Buffer.from(res)
      done()
    })
  }
}
