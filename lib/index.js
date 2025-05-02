'use strict'

const assert = require('assert')
const Mode = require('stat-mode')
const path = require('path')
const { fileURLToPath } = require('url')
const watcher = require('./watcher')

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
const Matter = require('./matter')
const utf8 = require('is-utf8')
const Ware = require('ware')
const { Debugger, fileLogHandler } = require('./debug')
const { Stats } = require('fs')
const { mkdir, copyFile } = require('fs/promises')

const symbol = {
  env: Symbol('env'),
  log: Symbol('log'),
  watch: Symbol('watch'),
  statik: Symbol('statik'),
  closeWatcher: Symbol('closeWatcher')
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

/**
 * @constructor
 */
function Metalsmith(directory) {
  if (!(this instanceof Metalsmith)) return new Metalsmith(directory)
  assert(directory, 'You must pass a working directory path.')
  this.plugins = []
  this.ignores = []
  this.matter = new Matter()
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
  Object.defineProperty(this, symbol.watch, {
    value: false,
    enumerable: false,
    writable: true
  })
  Object.defineProperty(this, symbol.closeWatcher, {
    value: null,
    enumerable: false,
    writable: true
  })
  Object.defineProperty(this, symbol.statik, {
    value: [],
    enumerable: false,
    writable: true
  })
}

Object.defineProperty(Metalsmith, 'version', {
  configurable: false,
  writable: false,
  value: '2.6.3'
})

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
  this.matter.options(frontmatter)
  // @TODO: remove in 3.0, meant to be private & here only for backwards-compatibility
  // careful because when false is passed _frontmatter === false whereas .matter.options has default options
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
 * Get or set files to consider static, i.e. that should be copied to `metalsmith.destination()` without being processed by plugins
 * [API Docs](https://metalsmith.io/api/#Metalsmith+statik) | [Source code](https://github.com/metalsmith/metalsmith/blob/v2.6.0/lib/index.js#L316)
 * @param {string|string[]} paths
 * @returns {Metalsmith}
 * @example
 * metalsmith.statik(["assets","CNAME","api/static"]);
 * const statik = metalsmith.statik()
 * statik['library.css'].contents.toString() // 'library.css'
 */
Metalsmith.prototype.statik = function (paths) {
  if (!arguments.length) return this[symbol.statik]
  if (isString(paths)) paths = [paths]
  assert(Array.isArray(paths), `paths must be an array, got ${paths} instead.`)
  this[symbol.statik] = paths
  return this
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

  const result = new Promise((resolve, reject) => {
    if (this.debug.enabled && this.env('DEBUG_LOG')) {
      this[symbol.log] = writeStream(this.path(this.env('DEBUG_LOG')))
      this.debug.handle = fileLogHandler(this[symbol.log])
      this.debug.colors = false

      this[symbol.log].on('error', (err) => {
        let error = err
        if (error.code === 'ENOENT') {
          error = new Error(`Inexistant directory path "${path.dirname(this.env('DEBUG_LOG'))}" given for DEBUG_LOG`)
          error.code = 'invalid_logpath'
          reject(error)
        } else {
          reject(error)
        }
      })
      if (this[symbol.log].pending) {
        this[symbol.log].on('ready', () => resolve())
      } else {
        resolve()
      }
    } else {
      resolve()
    }
  })
    .catch((err) => {
      if (isFunction(callback)) callback(err)
      return Promise.reject(err)
    })
    .then(() => {
      return new Promise((resolve, reject) => {
        this.process((err, files) => {
          if (err) {
            if (isFunction(callback)) {
              callback(err)
              return
            }
            reject(err)
            return
          }

          return (clean ? rm(dest) : Promise.resolve())
            .catch((err) => {
              if (isFunction(callback)) {
                callback(err)
              }
              return Promise.reject(err)
            })
            .then(() =>
              Promise.all(
                Object.keys(this[symbol.statik]).map((staticPath) => {
                  const src = this.path(this.source(), this[symbol.statik][staticPath].contents.toString())
                  const target = path.join(dest, staticPath)
                  return mkdir(path.dirname(target), { recursive: true }).then(() => copyFile(src, target))
                })
              )
            )
            .then(() =>
              this.write(files)
                .catch((err) => {
                  if (isFunction(callback)) callback(err)
                  reject(err)
                })
                .then(() => {
                  if (this[symbol.log]) this[symbol.log].end()
                  if (isFunction(callback)) callback(null, files)
                  resolve(files)
                })
            )
        })
      })
    })

  /* block required for Metalsmith 2.x callback-flow compat */
  if (!isFunction(callback)) {
    return result
  }
}

/**
 * **EXPERIMENTAL — Caution**
 * * not to be used with @metalsmith/metadata <= 0.2.0: a bug may trigger an infinite loop
 * * not to be used with existing watch plugins
 * * metalsmith.process/build are **not awaitable** when watching is enabled.
 *   Instead of running once at the build's end, callbacks passed to these methods will run on every rebuild.
 *
 * Set the list of paths to watch and trigger rebuilds on. The watch method will skip files ignored with `metalsmith.ignore()`
 * and will do partial (true) or full (false) rebuilds depending on the `metalsmith.clean()` setting.
 * It can be used both for rebuilding in-memory with `metalsmith.process` or writing to file system with `metalsmith.build`,
 * @method Metalsmith#watch
 * @param {boolean|string|string[]} [paths]
 * @return {Metalsmith|Promise<void>|boolean|import('chokidar').ChokidarOptions}
 * @example
 *
 * metalsmith
 *   .ignore(['wont-be-watched'])  // ignored
 *   .clean(false)                 // do partial rebuilds
 *   .watch(true)                  // watch all files in metalsmith.source()
 *   .watch(['lib','src'])         // or watch files in directories 'lib' and 'src'
 *
 * if (process.argv[2] === '--dry-run') {
 *   metalsmith.process(onRebuild) // reprocess in memory without writing to disk
 * } else {
 *   metalsmith.build(onRebuild)   // rewrite to disk
 * }
 *
 * function onRebuild(err, files) {
 *   if (err) {
 *     metalsmith.watch(false)            // stop watching
 *      .finally(() => console.log(err))  // and log build error
 *   }
 *   console.log('reprocessed files', Object.keys(files).join(', ')))
 * }
 */
Metalsmith.prototype.watch = function (options) {
  if (isUndefined(options)) return this[symbol.watch]
  if (!options) {
    // if watch has previously been enabled and is now passed false, close the watcher
    this[symbol.watch] = false
    if (options === false && typeof this[symbol.closeWatcher] === 'function') {
      return this[symbol.closeWatcher]()
    }
  } else {
    if (isString(options) || Array.isArray(options)) options = { paths: options }
    else if (options === true) options = { paths: [this.source()] }

    this[symbol.watch] = {
      paths: [this.source()],
      awaitWriteFinish: false,
      ...options,
      alwaysStat: false,
      cwd: this.directory(),
      ignored: this.ignore(),
      ignoreInitial: true
    }
  }
  return this
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
  let result = this.read(this.source())

  if (this.watch()) {
    let msWatcher
    return result.then((files) => {
      msWatcher = watcher(files, this)
      msWatcher(this[symbol.watch], callback).then(
        () => {
          this[symbol.closeWatcher] = msWatcher.close
        },
        (err) => {
          this[symbol.closeWatcher] = msWatcher.close
          return callback(err)
        }
      )
    })
  } else {
    result = result.then((files) => this.run(files, this.plugins))

    /* block required for Metalsmith 2.x callback-flow compat */
    if (callback) {
      result.then((files) => callback(null, files), callback)
    } else {
      return result
    }
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
  const result = readdir(dir, { ignores, root: dir }).then((files) => {
    const relpaths = files.map(([p]) => p)
    /** List of static paths with double globstar variants of directory paths added,
     * so that specifying a dir is the same as specifying 'all files within this dir'
     * @example
     * ['dir/subdir'] => ['dir/subdir','dir/subdir/**']
     **/
    // if this[symbol.statik] has already resolved previously it stores an object of Metalsmith.Files
    // this happens when metalsmith.read() is called again, such as when the same build is done multiple times without reconfiguration
    // but in that case, the first resolution is correct and can be reused
    const expandedPatterns = (Array.isArray(this[symbol.statik]) ? this[symbol.statik] : []).reduce((all, pattern) => {
      all.push(pattern)
      const likelyADirectory = !path.extname(pattern) && !relpaths.includes(pattern)
      if (likelyADirectory) all.push(`${pattern}/**`)
      return all
    }, [])
    const staticPaths = this.match(expandedPatterns, relpaths)

    const statik = {},
      nonStatik = []
    for (const [p, stats] of files) {
      if (staticPaths.includes(p)) {
        statik[p] = Object.create(
          {},
          {
            mode: {
              value: Mode(stats).toOctal(),
              configurable: false,
              enumerable: true
            },
            stats: {
              value: Object.freeze(stats),
              configurable: false,
              enumerable: true
            },
            contents: {
              value: Buffer.from(p),
              configurable: false,
              enumerable: true
            }
          }
        )
      } else {
        nonStatik.push([p, stats])
      }
    }
    this[symbol.statik] = statik

    return batchAsync(
      ([p, stats]) => {
        const s = new String(path.join(dir, p))
        s.stats = stats
        return read(s)
      },
      nonStatik,
      concurrency
    ).then((files) => {
      const result = nonStatik
        .map(([p]) => p)
        .reduce((memo, file, i) => {
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
  // this is a clunky way to allow ms.read to call this fn with new String() and attach a stats property,
  // to avoid stat'ing the file twice or introducing a breaking change to the API.
  // This usage (with preloaded stats) is unlikely to be used by consumers of metalsmith
  const stats = file instanceof String && file.stats
  file = file.toString()
  const src = this.source()
  if (!path.isAbsolute(file)) file = path.resolve(src, file)
  const frontmatter = this.frontmatter()

  const result = Promise.all([stats instanceof Stats ? Promise.resolve(stats) : stat(file), readFile(file)])
    .then(([stats, buffer]) => {
      let ret = {}
      if (frontmatter && utf8(buffer)) {
        try {
          ret = this.matter.parse(buffer)
        } catch {
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
 * @param {BuildCallback} [callback]
 * @returns {Promise<void>|void}
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

/**
 * Like Javascript's dynamic `import()`, with CJS/ESM support for loading default exports, all or a single named export, and JSON files.
 * Relative paths are resolved against `metalsmith.directory()`
 * @param {string} specifier
 * @param {string} [namedExport]
 * @returns {Promise<*>}
 * @example
 * await metalsmith.imports('metalsmith') // Metalsmith
 * await metalsmith.imports('./data.json')  // object
 * await metalsmith.imports('./helpers/index.js', 'formatDate')  // function
 */
Metalsmith.prototype.imports = function (specifier, namedExport) {
  // if specifier is falsy, throw
  if (!specifier) {
    const err = new Error(`Metalsmith#imports() - "${specifier}" is not a valid import specifier.`)
    return Promise.reject(err)
  }

  // if specifier is truthy but not string, consider it resolved
  if (typeof specifier !== 'string') return Promise.resolve(specifier)

  const ext = path.extname(specifier)
  let load = (mod) => import(mod),
    resolved

  if (ext === '.json') load = (mod) => readFile(fileURLToPath(mod), 'utf-8')

  // Don't normalize node_modules specifiers like 'metalsmith' in the following 2 operations
  if (specifier.startsWith('.')) {
    resolved = true
    specifier = path.resolve(this.directory(), specifier)
    // commonjs extensionless import compat, doesn't work for index.js dir imports though
    if (!ext) specifier = `${specifier}.js`
  }

  if (path.isAbsolute(specifier)) {
    specifier = `file://${specifier}`
  }

  return load(specifier)
    .catch((original) => {
      const err = new Error(
        `Metalsmith#imports() could not load module at ${resolved ? 'resolved' : 'import'} path "${specifier}".`
      )
      err.cause = original
      throw err
    })
    .then((s) => {
      if (ext === '.json') {
        try {
          return JSON.parse(s)
        } catch (original) {
          const err = new Error(`Metalsmith#imports could not load "${specifier}" due to invalid JSON.`)
          err.cause = original
          throw err
        }
      }
      if (arguments.length === 1) {
        const namedExports = Object.keys(s).filter((d) => d !== 'default')
        // return first named export
        if (namedExports.length === 1) return s[namedExports[0]]
        // fall back to default
        if (Reflect.has(s, 'default')) return s.default
        // if there are multiple named exports but no default, act as if instructed import * from specifier
        return s
      }

      // if export name exists (either explicit, or implicit 'default') return it, else throw
      if (Reflect.has(s, namedExport)) {
        return s[namedExport]
      }

      throw new Error(`Metalsmith#imports() could not load "${namedExport}" from module "${specifier}`)
    })
}
