
const assert = require('assert')
const clone = require('clone')
const fs = require('fs-extra')
const is = require('is')
const matter = require('gray-matter')
const Mode = require('stat-mode')
const path = require('path')
const readdir = require('recursive-readdir')
const utf8 = require('is-utf8')
const Ware = require('ware')
const util = require('util')

/**
 * Promise-makers
 */
const rm      = util.promisify(require('rimraf'))


/**
 * Helpers
 */
const absolute = (s) => {return path.resolve(s) === s}


/**
 * Export `Metalsmith`.
 */

module.exports = class Metalsmith {

  /**
   * Initialize a new `Metalsmith` builder with a working `directory`.
   *
   * @param {String} directory
   */
  constructor(directory){
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
   *
   * @param {Function or Array} plugin
   * @return {Metalsmith}
   */

  use(plugin){
    this.plugins.push(plugin)
    return this
  }

  /**
   * Get or set the working `directory`.
   *
   * @param {Object} directory
   * @return {Object or Metalsmith}
   */

  directory(directory){
    if (!arguments.length) return path.resolve(this._directory)
    assert(is.string(directory), 'You must pass a directory path string.')
    this._directory = directory
    return this
  }

  /**
   * Get or set the global `metadata` to pass to templates.
   *
   * @param {Object} metadata
   * @return {Object or Metalsmith}
   */

  metadata(metadata){
    if (!arguments.length) return this._metadata
    assert(is.object(metadata), 'You must pass a metadata object.')
    this._metadata = clone(metadata)
    return this
  }

  /**
   * Get or set the source directory.
   *
   * @param {String} path
   * @return {String or Metalsmith}
   */

  source(path){
    if (!arguments.length) return this.path(this._source)
    assert(is.string(path), 'You must pass a source path string.')
    this._source = path
    return this
  }

  /**
   * Get or set the destination directory.
   *
   * @param {String} path
   * @return {String or Metalsmith}
   */

  destination(path){
    if (!arguments.length) return this.path(this._destination)
    assert(is.string(path), 'You must pass a destination path string.')
    this._destination = path
    return this
  }

  /**
   * Get or set the maximum number of files to open at once.
   *
   * @param {Number} max
   * @return {Number or Metalsmith}
   */

  concurrency(max){
    if (!arguments.length) return this._concurrency
    assert(is.number(max), 'You must pass a number for concurrency.')
    this._concurrency = max
    return this
  }

  /**
   * Get or set whether the destination directory will be removed before writing.
   *
   * @param {Boolean} clean
   * @return {Boolean or Metalsmith}
   */
  clean(clean){
    if (!arguments.length) return this._clean
    assert(is.boolean(clean), 'You must pass a boolean.')
    this._clean = clean
    return this
  }

  /**
   * Optionally turn off frontmatter parsing.
   *
   * @param {Boolean} frontmatter
   * @return {Boolean or Metalsmith}
   */

  frontmatter(frontmatter){
    if (!arguments.length) return this._frontmatter
    assert(is.boolean(frontmatter), 'You must pass a boolean.')
    this._frontmatter = frontmatter
    return this
  }

  /**
   * Add a file or files to the list of ignores.
   *
   * @param {String or Strings} The names of files or directories to ignore.
   * @return {Metalsmith}
   */
  ignore(files){
    if (!arguments.length) return this.ignores.slice()
    this.ignores = this.ignores.concat(files)
    return this
  }

  /**
   * Resolve `paths` relative to the root directory.
   *
   * @param {String} paths...
   * @return {String}
   */

  path(){
    let paths = [].slice.call(arguments)
    paths.unshift(this.directory())
    return path.resolve.apply(path, paths)
  }

  /**
   * Build with the current settings to the destination directory.
   *
   * @return {Object}
   */
  async build() {
    let clean = this.clean()
    let dest = this.destination()
    if (clean) {
      try {
        await rm(path.join(dest, '*'))
      } 
      catch (err) {
        let e = new Error('Error cleaning destination: ' + dest)
        e.original_error = err
        throw e
      }
    }
    
    try {
      let files = await this.process()
      
      try { 
        await this.write(files) 
      } 
      catch (err) { 
        let e = new Error('Error writing files during build()')
        e.original_error = err
        throw e 
      }
      
      return files
    }
    catch (err) {throw err}
  }

  /**
   * Process files through plugins without writing out files.
   *
   * @return {Object}
   */

  async process(){
    let files = await this.read()
    files = await this.run(files)
    return files
  }

  /**
   * Run a set of `files` through the plugins stack.
   *
   * @param {Object} files
   * @param {Array} plugins
   * @return {Object}
   */

  async run(files, plugins){
    let ware = new Ware(plugins || this.plugins)
    let run = util.promisify(ware.run.bind(ware))
    try {
      let res = await run(files, this)
      return res
    } catch (err) {throw err}
  }

  /**
   * Read a dictionary of files from a `dir`, parsing frontmatter. If no directory
   * is provided, it will default to the source directory.
   *
   * @param {String} dir (optional)
   * @return {Object}
   */

  async read(dir){
    dir = dir || this.source()
    let read = this.readFile.bind(this)
    let concurrency = this.concurrency()
    let ignores = this.ignores || null
    let paths
    try { 
      paths = await readdir(dir, ignores) 
    } catch (err) {throw err}
    let files = []
    let complete = 0
    let batch

    while (complete < paths.length) {
      batch = paths.slice(complete, complete + concurrency)
      try {
        let doneBatches = await Promise.all(batch.map(read))
        files = files.concat(doneBatches)
        complete += concurrency
      } catch (err) {throw err}
    }

    return paths.reduce(memoizer, {})
    function memoizer(memo, file, i) {
      file = path.relative(dir, file)
      memo[file] = files[i]
      return memo
    }
  }

  /**
   * Read a `file` by path. If the path is not absolute, it will be resolved
   * relative to the source directory.
   *
   * @param {String} file
   * @return {Object}
   */

  async readFile(file){
    let src = this.source()
    if (!absolute(file)) file = path.resolve(src, file)
    
    let frontmatter = this.frontmatter()
    let ret = {}
    let stats, buffer, parsed
    
    try {
      [stats, buffer] = await Promise.all([fs.stat(file), fs.readFile(file)])
    } 
    catch (err) { 
      err.message = 'Failed to read the file at: ' + file + '\n\n' + err.message
      err.code = 'failed_read'
      throw err
    }
    
    if (frontmatter && utf8(buffer)) {
      try {
        parsed = matter(buffer.toString())
        ret = parsed.data
        ret.contents = Buffer.from(parsed.content)
      } catch (e) {
        let err = new Error('Invalid frontmatter in the file at: ' + file)
        err.code = 'invalid_frontmatter'
        throw err
      }
    } else {
      ret.contents = buffer
    }
    
    ret.mode = Mode(stats).toOctal()
    ret.stats = stats
    return ret
  }

  /**
   * Write a dictionary of `files` to a destination `dir`. If no directory is
   * provided, it will default to the destination directory.
   *
   * @param {Object} files
   * @param {String} dir (optional)
   */

  async write(files, dir){
    dir = dir || this.destination()
    let write = this.writeFile.bind(this)
    let concurrency = this.concurrency()
    let keys = Object.keys(files)
    let complete = 0
    let batch

    while (complete < keys.length) {
      batch = keys.slice(complete, complete + concurrency)
      try {
        await Promise.all(batch.map(writer))
        complete += concurrency
      } catch (e) {throw e}
    }

    function writer(key){
      let file = path.resolve(dir, key)
      return write(file, files[key])
    }
  }

  /**
   * Write a `file` by path with `data`. If the path is not absolute, it will be
   * resolved relative to the destination directory.
   *
   * @param {String} file
   * @param {Object} data
   */

  async writeFile(file, data){
    let dest = this.destination()
    if (!absolute(file)) file = path.resolve(dest, file)

    try {
      await fs.outputFile(file, data.contents)
      try {
        if (data.mode) await fs.chmod(file, data.mode)
      } catch (e) {throw e}
    } catch (e) {
      e.message = 'Failed to write the file at: ' + file + '\n\n' + e.message
      throw e
    }
  }
}
