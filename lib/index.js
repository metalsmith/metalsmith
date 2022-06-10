'use strict'

const assert = require('assert')
const matter = require('gray-matter')
const Mode = require('stat-mode')
const path = require('path')
const {
  readdir,
  batchAsync,
  isFunction,
  outputFile,
  stat,
  readFile,
  writeStream,
  rm,
  isString,
  isBoolean,
  isObject,
  isNumber,
  isUndefined,
  match
} = require('./helpers')
const utf8 = require('is-utf8')
const Ware = require('ware')
const { Debugger, fileLogHandler } = require('./debug')

const symbol = {
  env: Symbol('env'),
  log: Symbol('log')
}

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
  Object.defineProperty(this, symbol.env, {
    value: Object.create(null),
    enumerable: false
  })
  Object.defineProperty(this, symbol.log, {
    value: null,
    enumerable: false,
    writable: true
  })
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
 * @param {string} [directory]
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
  this._metadata = Object.assign(this._metadata || {}, metadata)
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

/** @typedef {Object} GrayMatterOptions */

/**
 * Optionally turn off frontmatter parsing or pass a [gray-matter options object](https://github.com/jonschlinkert/gray-matter/tree/4.0.2#option)
 *
 * @param {boolean|GrayMatterOptions} [frontmatter]
 * @return {boolean|Metalsmith}
 *
 * @example
 * metalsmith.frontmatter(false)  // turn off front-matter parsing
 * metalsmith.frontmatter()       // returns false
 * metalsmith.frontmatter({ excerpt: true })
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
 * metalsmith.ignore()                      // return a list of ignored file paths
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
 * @param {string[]} [input] array of strings to match against
 * @param {import('micromatch').Options} options - [micromatch options](https://github.com/micromatch/micromatch#options), except `format`
 * @returns {string[]} An array of matching file paths
 */

Metalsmith.prototype.match = function (patterns, input, options) {
  input = input || Object.keys(this._files)
  if (!(input && input.length)) return []
  return match(input, patterns, options)
}

/**
 * Get or set one or multiple metalsmith environment variables. Metalsmith env vars are case-insensitive.
 * @param {string|Object} [vars] name of the environment variable, or an object with `{ name: 'value' }` pairs
 * @param {string|number|boolean} [value] value of the environment variable
 * @returns {string|number|boolean|Object|Metalsmith}
 * @example
 * // pass all Node env variables
 * metalsmith.env(process.env)
 * // get all env variables
 * metalsmith.env()
 * // get DEBUG env variable
 * metalsmith.env('DEBUG')
 * // set DEBUG env variable (chainable)
 * metalsmith.env('DEBUG', '*')
 * // set multiple env variables at once (chainable)
 * // this does not clear previously set variables
 * metalsmith.env({
 *   DEBUG: false,
 *   ENV: 'development'
 * })
 */
Metalsmith.prototype.env = function (vars, value) {
  if (isString(vars)) {
    if (arguments.length === 1) {
      return this[symbol.env][vars.toUpperCase()]
    }
    if (!(isFunction(value) || isObject(value))) {
      this[symbol.env][vars.toUpperCase()] = value
      return this
    }
    throw new TypeError('Environment variable values can only be primitive: Number, Boolean, String or null')
  }
  if (isObject(vars)) {
    Object.entries(vars).forEach(([key, value]) => this.env(key, value))
    return this
  }
  if (isUndefined(vars)) return Object.assign(Object.create(null), this[symbol.env])
}

Metalsmith.prototype.debug = Debugger

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

  const result = (clean ? rm(dest) : Promise.resolve())
    .then(() => {
      if (this.debug.enabled && this.env('DEBUG_LOG')) {
        this[symbol.log] = writeStream(this.path(this.env('DEBUG_LOG')))
        this.debug.handle = fileLogHandler(this[symbol.log])
        this.debug.colors = false

        return new Promise((resolve, reject) => {
          this[symbol.log].on('error', (err) => {
            let error = err
            if (error.code === 'ENOENT') {
              error = new Error(
                `Inexistant directory path "${path.dirname(this.env('DEBUG_LOG'))}" given for DEBUG_LOG`
              )
              error.code = 'invalid_logpath'
              reject(error)
            }
          })
          if (this[symbol.log].pending) {
            this[symbol.log].on('ready', () => resolve())
          } else {
            resolve()
          }
        })
      }
    })
    .then(this.process.bind(this))
    .then((files) => {
      return this.write(files).then(() => {
        if (this[symbol.log]) this[symbol.log].end()
        return files
      })
    })

  /* block required for Metalsmith 2.x callback-flow compat */
  if (isFunction(callback)) {
    result.then((files) => callback(null, files), callback)
  } else {
    return result
  }
}

/**
 * Process files through plugins without writing out files.
 *
 * @method Metalsmith#process
 * @param {BuildCallback} [callback]
 * @return {Promise<Files>|void}
 *
 * @example
 * metalsmith.process((err, files) => {
 *   if (err) throw err
 *   console.log('Success')
 *   console.log(this.metadata())
 * })
 */

Metalsmith.prototype.process = function (callback) {
  const result = this.read(this.source()).then((files) => {
    return this.run(files, this.plugins)
  })

  /* block required for Metalsmith 2.x callback-flow compat */
  if (callback) {
    result.then((files) => callback(null, files), callback)
  } else {
    return result
  }
}

/**
 * Run a set of `files` through the plugins stack.
 *
 * @method Metalsmith#run
 * @package
 * @param {Files} files
 * @param {Plugin[]} plugins
 * @return {Promise<Files>|void}
 */

Metalsmith.prototype.run = function (files, plugins, callback) {
  let debugValue = this.env('DEBUG')
  if (debugValue === false) {
    this.debug.disable()
  } else {
    if (debugValue === true) debugValue = '*'
    this.debug.enable(debugValue)
  }

  /* block required for Metalsmith 2.x callback-flow compat */
  const last = arguments[arguments.length - 1]
  callback = isFunction(last) ? last : undefined
  plugins = Array.isArray(plugins) ? plugins : this.plugins

  this._files = files

  const ware = new Ware(plugins)
  const run = ware.run.bind(ware)

  const result = new Promise((resolve, reject) => {
    run(files, this, (err, files) => {
      if (err) reject(err)
      else resolve(files)
    })
  })

  /* block required for Metalsmith 2.x callback-flow compat */
  if (callback) {
    result.then((files) => callback(null, files, this), callback)
  } else {
    return result
  }
}

/**
 * Read a dictionary of files from a `dir`, parsing frontmatter. If no directory
 * is provided, it will default to the source directory.
 *
 * @method Metalsmith#read
 * @package
 * @param {string} [dir]
 * @return {Promise<Files>|void}
 */

Metalsmith.prototype.read = function (dir, callback) {
  /* block required for Metalsmith 2.x callback-flow compat */
  if (isFunction(dir) || !arguments.length) {
    callback = dir
    dir = this.source()
  }
  const read = this.readFile.bind(this)
  const concurrency = this.concurrency()
  const ignores = this.ignores || null
  const result = readdir(dir, ignores).then((paths) => {
    return batchAsync((p) => read(p), paths, concurrency).then((files) => {
      const result = paths.reduce((memo, file, i) => {
        file = path.relative(dir, file)
        memo[file] = files[i]
        return memo
      }, {})
      return result
    })
  })

  /* block required for Metalsmith 2.x callback-flow compat */
  if (callback) {
    result.then((files) => callback(null, files), callback)
  } else {
    return result
  }
}

/**
 * Read a `file` by path. If the path is not absolute, it will be resolved
 * relative to the source directory.
 *
 * @method Metalsmith#readFile
 * @package
 * @param {string} file
 * @returns {Promise<File>|void}
 */

Metalsmith.prototype.readFile = function (file, callback) {
  const src = this.source()
  if (!path.isAbsolute(file)) file = path.resolve(src, file)
  const frontmatter = this.frontmatter()

  const result = Promise.all([
    // @TODO: this stat should be passed from the readdir function, not done twice
    stat(file),
    readFile(file)
  ])
    .then(([stats, buffer]) => {
      let ret = {}
      if (frontmatter && utf8(buffer)) {
        try {
          const parsed = matter(buffer.toString(), this._frontmatter)
          ret = parsed.data
          if (parsed.excerpt) {
            ret.excerpt = parsed.excerpt
          }
          ret.contents = Buffer.from(parsed.content)
        } catch (e) {
          const err = new Error('Invalid frontmatter in the file at: ' + file)
          err.code = 'invalid_frontmatter'
          return Promise.reject(err)
        }
      } else {
        ret.contents = buffer
      }
      ret.mode = Mode(stats).toOctal()
      ret.stats = stats
      return ret
    })
    .catch((e) => {
      if (e.code == 'invalid_frontmatter') return Promise.reject(e)
      e.message = 'Failed to read the file at: ' + file + '\n\n' + e.message
      e.code = 'failed_read'
      return Promise.reject(e)
    })

  if (isFunction(callback)) {
    result.then(
      (file) => callback(null, file),
      (err) => callback(err)
    )
  } else {
    return result
  }
}

/**
 * Write a dictionary of `files` to a destination `dir`. If no directory is
 * provided, it will default to the destination directory.
 *
 * @method Metalsmith#write
 * @package
 * @param {Files} files
 * @param {string} [dir]
 * @returns {Promise<null>|void}
 */

Metalsmith.prototype.write = function (files, dir, callback) {
  /* block required for Metalsmith 2.x callback-flow compat */
  const last = arguments[arguments.length - 1]
  callback = isFunction(last) ? last : undefined
  dir = dir && !isFunction(dir) ? dir : this.destination()

  const write = this.writeFile.bind(this)
  const concurrency = this.concurrency()
  const keys = Object.keys(files)

  const operation = batchAsync(
    (key) => {
      return write(key, files[key])
    },
    keys,
    concurrency
  )

  /* block required for Metalsmith 2.x callback-flow compat */
  if (callback) {
    operation.then(() => callback(null), callback)
  } else {
    return operation
  }
}

/**
 * Write a `file` by path with `data`. If the path is not absolute, it will be
 * resolved relative to the destination directory.
 *
 * @method Metalsmith#writeFile
 * @package
 * @param {string} file
 * @param {File} data
 * @returns {Promise<void>|void}
 */

Metalsmith.prototype.writeFile = function (file, data, callback) {
  const dest = this.destination()
  if (!path.isAbsolute(file)) file = path.resolve(dest, file)

  const result = outputFile(file, data.contents, data.mode).catch((e) => {
    e.code = 'failed_write'
    e.message = 'Failed to write the file at: ' + file + '\n\n' + e.message
    return Promise.reject(e)
  })

  /* block required for Metalsmith 2.x callback-flow compat */
  if (callback) {
    result.then(callback, callback)
  } else {
    return result
  }
}
