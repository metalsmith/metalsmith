const assert = require('assert')
const clone = require('clone')
const fs = require('co-fs-extra')
const matter = require('gray-matter')
const Mode = require('stat-mode')
const path = require('path')
let { readdir } = require('./helpers')
const { rm, isString, isBoolean, isObject, isNumber, isUndefined, match } = require('./helpers')
const thunkify = require('thunkify')
const unyield = require('unyield')
const utf8 = require('is-utf8')
const Ware = require('ware')

/**
 * Metalsmith representation of the files in `metalsmith.source()`.
 * The keys represent the file paths and the values are {@link File} objects
 * @typedef {Object.<string, File>} Files
 */

/**
 * Metalsmith file. Defines `mode`, `stats` and `contents` properties by default, but may be altered by plugins
 *
 * @typedef File
 * @property {Buffer} contents - A NodeJS [buffer](https://nodejs.org/api/buffer.html) that can be `.toString`'ed to obtain its human-readable contents
 * @property {import('fs').Stats} stats - A NodeJS [fs.Stats object](https://nodejs.org/api/fs.html#fs_class_fs_stats) object with extra filesystem metadata and methods
 * @property {string} mode - Octal permission mode, see https://en.wikipedia.org/wiki/File-system_permissions#Numeric_notation
 */

/**
 * A callback to run when the Metalsmith build is done
 *
 * @callback BuildCallback
 * @param {Error} [error]
 * @param {Files} files
 * @this {Metalsmith}
 *
 * @example
 * function onBuildEnd(error, files) {
 *   if (error) throw error
 *   console.log('Build success')
 * }
 */

/**
 * A callback to indicate that a plugin's work is done
 *
 * @callback DoneCallback
 * @param {Error} [error]
 *
 * @example
 * function plugin(files, metalsmith, done) {
 *   // ..do stuff
 *   done()
 * }
 */

/**
 * A Metalsmith plugin is a function that is passed the file list, the metalsmith instance, and a `done` callback.
 * Calling the callback is required for asynchronous plugins, and optional for synchronous plugins.
 *
 * @callback Plugin
 * @param {Files} files
 * @param {Metalsmith} metalsmith
 * @param {DoneCallback} done
 *
 * @example
 * function drafts(files, metalsmith) {
 *   Object.keys(files).forEach(path => {
 *     if (files[path].draft) {
 *       delete files[path]
 *     }
 *   })
 * }
 *
 * metalsmith.use(drafts)
 */

/**
 * Thunks.
 * @private
 */
readdir = thunkify(readdir)

/**
 * Export `Metalsmith`.
 */

module.exports = Metalsmith

/**
 * Initialize a new `Metalsmith` builder with a working `directory`.
 *
 * @callback Metalsmith
 * @param {string} directory
 * @property {Plugin[]} plugins
 * @property {string[]} ignores
 * @return {Metalsmith}
 */

function Metalsmith(directory) {
  if (!(this instanceof Metalsmith)) return new Metalsmith(directory)
  assert(directory, 'You must pass a working directory path.')
  this.plugins = []
  this.ignores = []
  this.directory(directory)
  this.metadata({})
  this.source('src')
  this.destination('build')
  this.concurrency(Infinity)
  this.clean(true)
  this.frontmatter(true)
}

/**
 * Add a `plugin` function to the stack.
 * @param {Plugin} plugin
 * @return {Metalsmith}
 *
 * @example
 * metalsmith
 *  .use(drafts())   // use the drafts plugin
 *  .use(markdown()) // use the markdown plugin
 */

Metalsmith.prototype.use = function (plugin) {
  this.plugins.push(plugin)
  return this
}

/**
 * Get or set the working `directory`.
 *
 * @param {Object} [directory]
 * @return {string|Metalsmith}
 *
 * @example
 * new Metalsmith('.')                   // set the path of the working directory through the constructor
 * metalsmith.directory()                // returns '.'
 * metalsmith.directory('./other/path')  // set the path of the working directory
 */

Metalsmith.prototype.directory = function (directory) {
  if (!arguments.length) return path.resolve(this._directory)
  assert(isString(directory), 'You must pass a directory path string.')
  this._directory = directory
  return this
}

/**
 * Get or set the global `metadata`.
 *
 * @param {Object} [metadata]
 * @return {Object|Metalsmith}
 *
 * @example
 * metalsmith.metadata({ sitename: 'My blog' });  // set metadata
 * metalsmith.metadata()                          // returns { sitename: 'My blog' }
 */

Metalsmith.prototype.metadata = function (metadata) {
  if (isUndefined(metadata)) return this._metadata
  assert(isObject(metadata), 'You must pass a metadata object.')
  this._metadata = clone(metadata)
  return this
}

/**
 * Get or set the source directory.
 *
 * @param {string} [path]
 * @return {string|Metalsmith}
 *
 * @example
 * metalsmith.source('./src');    // set source directory
 * metalsmith.source()            // returns './src'
 */

Metalsmith.prototype.source = function (path) {
  if (isUndefined(path)) return this.path(this._source)
  assert(isString(path), 'You must pass a source path string.')
  this._source = path
  return this
}

/**
 * Get or set the destination directory.
 *
 * @param {string} [path]
 * @return {string|Metalsmith}
 *
 * @example
 * metalsmith.destination('build'); // set destination
 * metalsmith.destination()         // returns 'build'
 */

Metalsmith.prototype.destination = function (path) {
  if (!arguments.length) return this.path(this._destination)
  assert(isString(path), 'You must pass a destination path string.')
  this._destination = path
  return this
}

/**
 * Get or set the maximum number of files to open at once.
 *
 * @param {number} [max]
 * @returns {number|Metalsmith}
 *
 * @example
 * metalsmith.concurrency(20)   // set concurrency to max 20
 * metalsmith.concurrency()     // returns 20
 */

Metalsmith.prototype.concurrency = function (max) {
  if (isUndefined(max)) return this._concurrency
  assert(isNumber(max), 'You must pass a number for concurrency.')
  this._concurrency = max
  return this
}

/**
 * Get or set whether the destination directory will be removed before writing.
 *
 * @param {boolean} [clean]
 * @return {boolean|Metalsmith}
 *
 * @example
 * metalsmith.clean(true)  // clean the destination directory
 * metalsmith.clean()      // returns true
 */
Metalsmith.prototype.clean = function (clean) {
  if (isUndefined(clean)) return this._clean
  assert(isBoolean(clean), 'You must pass a boolean.')
  this._clean = clean
  return this
}

/**
 * Optionally turn off frontmatter parsing.
 *
 * @param {boolean} [frontmatter]
 * @return {boolean|Metalsmith}
 *
 * @example
 * metalsmith.frontmatter(false)  // turn off front-matter parsing
 * metalsmith.frontmatter()       // returns false
 */

Metalsmith.prototype.frontmatter = function (frontmatter) {
  if (isUndefined(frontmatter)) return this._frontmatter
  assert(
    isBoolean(frontmatter) || isObject(frontmatter),
    'You must pass a boolean or a gray-matter options object: https://github.com/jonschlinkert/gray-matter/tree/4.0.2#options'
  )
  this._frontmatter = frontmatter
  return this
}

/**
 * Get or set the list of filepaths or glob patterns to ignore
 *
 * @method Metalsmith#ignore
 * @param {string|string[]} [files] - The names or glob patterns of files or directories to ignore.
 * @return {Metalsmith|string[]}
 *
 * @example
 * metalsmith.ignore()
 * metalsmith.ignore('layouts')             // ignore the layouts directory
 * metalsmith.ignore(['.*', 'data.json'])   // ignore dot files & a data file
 */
Metalsmith.prototype.ignore = function (files) {
  if (isUndefined(files)) return this.ignores.slice()
  this.ignores = this.ignores.concat(files)
  return this
}

/**
 * Resolve `paths` relative to the metalsmith `directory`.
 *
 * @param {...string} paths
 * @return {string}
 *
 * @example
 * metalsmith.path('./path','to/file.ext')
 */

Metalsmith.prototype.path = function (...paths) {
  return path.resolve.apply(path, [this.directory(), ...paths])
}

/**
 * Match filepaths in the source directory by [glob](https://en.wikipedia.org/wiki/Glob_(programming)) pattern.
 * If `input` is not specified, patterns are matched against `Object.keys(files)`
 *
 * @param {string|string[]} patterns - one or more glob patterns
 * @param {import('micromatch').Options} options - [micromatch options](https://github.com/micromatch/micromatch#options), except `format`
 * @param {string[]} [input] array of strings to match against
 * @returns {string[]} An array of matching file paths
 */

Metalsmith.prototype.match = function (patterns, input, options) {
  input = input || Object.keys(this._files)
  if (!(input && input.length)) return []
  return match(input, patterns, options)
}

/**
 * Build with the current settings to the destination directory.
 *
 * @param {BuildCallback} [callback]
 * @return {Promise<Files>}
 * @fulfills {Files}
 * @rejects {Error}
 *
 * @example
 * metalsmith.build(function(error, files) {
 *   if (error) throw error
 *   console.log('Build success!')
 * })
 */

Metalsmith.prototype.build = function (callback) {
  const clean = this.clean()
  const dest = this.destination()
  let _files

  return (
    (clean ? rm(dest) : Promise.resolve())
      .then(() => {
        return new Promise((resolve, reject) => {
          this.process((err, files) => {
            if (err) reject(err)
            resolve(files)
          })
        })
      })
      .then((files) => {
        _files = files
        return new Promise((resolve, reject) => {
          this.write(files, null, (err) => {
            if (err) reject(err)
            resolve(files)
          })
        })
      })
      .then((files) => {
        if (callback) callback(null, files)
        else return Promise.resolve(files)
      })
      // this catch block is required to support backwards-compatibility and pass the error to callback-driven flows
      .catch(
        /* istanbul ignore next */ (err) => {
          if (callback) callback(err, _files)
          else return Promise.reject(err)
        }
      )
  )
}

/**
 * Process files through plugins without writing out files.
 *
 * @method Metalsmith#process
 * @param {BuildCallback} [callback]
 * @return {Files}
 *
 * @example
 * metalsmith.process(err => {
 *   if (err) throw err
 *   console.log('Success')
 *   console.log(this.metadata())
 * })
 */

Metalsmith.prototype.process = unyield(function* () {
  let files = yield this.read()
  files = yield this.run(files)
  return files
})

/**
 * Run a set of `files` through the plugins stack.
 *
 * @method Metalsmith#run
 * @package
 * @param {Files} files
 * @param {Plugin[]} plugins
 * @return {Object}
 */

Metalsmith.prototype.run = unyield(function* (files, plugins) {
  this._files = files
  const ware = new Ware(plugins || this.plugins)
  const run = thunkify(ware.run.bind(ware))
  const res = yield run(files, this)
  return res[0]
})

/**
 * Read a dictionary of files from a `dir`, parsing frontmatter. If no directory
 * is provided, it will default to the source directory.
 *
 * @method Metalsmith#read
 * @package
 * @param {string} [dir]
 * @return {Object}
 */

Metalsmith.prototype.read = unyield(function* (dir) {
  dir = dir || this.source()
  const read = this.readFile.bind(this)
  const concurrency = this.concurrency()
  const ignores = this.ignores || null
  const paths = yield readdir(dir, ignores)
  let files = []
  let complete = 0
  let batch

  while (complete < paths.length) {
    batch = paths.slice(complete, complete + concurrency)
    batch = yield batch.map(read)
    files = files.concat(batch)
    complete += concurrency
  }

  return paths.reduce(memoizer, {})

  function memoizer(memo, file, i) {
    file = path.relative(dir, file)
    memo[file] = files[i]
    return memo
  }
})

/**
 * Read a `file` by path. If the path is not absolute, it will be resolved
 * relative to the source directory.
 *
 * @method Metalsmith#readFile
 * @package
 * @param {string} file
 * @returns {File}
 */

Metalsmith.prototype.readFile = unyield(function* (file) {
  const src = this.source()
  let ret = {}

  if (!path.isAbsolute(file)) file = path.resolve(src, file)

  try {
    const frontmatter = this.frontmatter()
    const stats = yield fs.stat(file)
    const buffer = yield fs.readFile(file)
    let parsed

    if (frontmatter && utf8(buffer)) {
      try {
        parsed = matter(buffer.toString(), this._frontmatter)
      } catch (e) {
        const err = new Error('Invalid frontmatter in the file at: ' + file)
        err.code = 'invalid_frontmatter'
        throw err
      }
      ret = parsed.data
      if (parsed.excerpt) {
        ret.excerpt = parsed.excerpt
      }
      ret.contents = Buffer.from(parsed.content)
    } else {
      ret.contents = buffer
    }

    ret.mode = Mode(stats).toOctal()
    ret.stats = stats
  } catch (e) {
    if (e.code == 'invalid_frontmatter') throw e
    e.message = 'Failed to read the file at: ' + file + '\n\n' + e.message
    e.code = 'failed_read'
    throw e
  }

  return ret
})

/**
 * Write a dictionary of `files` to a destination `dir`. If no directory is
 * provided, it will default to the destination directory.
 *
 * @method Metalsmith#write
 * @package
 * @param {Files} files
 * @param {string} [dir]
 */

Metalsmith.prototype.write = unyield(function* (files, dir) {
  dir = dir || this.destination()
  const write = this.writeFile.bind(this)
  const concurrency = this.concurrency()
  const keys = Object.keys(files)
  let complete = 0
  let batch

  while (complete < keys.length) {
    batch = keys.slice(complete, complete + concurrency)
    yield batch.map(writer)
    complete += concurrency
  }

  function writer(key) {
    const file = path.resolve(dir, key)
    return write(file, files[key])
  }
})

/**
 * Write a `file` by path with `data`. If the path is not absolute, it will be
 * resolved relative to the destination directory.
 *
 * @method Metalsmith#writeFile
 * @package
 * @param {string} file
 * @param {File} data
 */

Metalsmith.prototype.writeFile = unyield(function* (file, data) {
  const dest = this.destination()
  if (!path.isAbsolute(file)) file = path.resolve(dest, file)

  try {
    yield fs.outputFile(file, data.contents)
    if (data.mode) yield fs.chmod(file, data.mode)
  } catch (e) {
    e.code = 'failed_write'
    e.message = 'Failed to write the file at: ' + file + '\n\n' + e.message
    throw e
  }
})
