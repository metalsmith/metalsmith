const fs = require('fs')
const { readFile, writeFile, stat, mkdir, chmod, ...fsPromises } = fs.promises
const { resolve, relative, normalize, dirname } = require('path')
const micromatch = require('micromatch')

/**
 * Type-checkers
 */
function isBoolean(b) {
  return typeof b === 'boolean'
}
function isNumber(n) {
  return typeof n === 'number' && !Number.isNaN(n)
}
function isObject(o) {
  return o !== null && typeof o === 'object'
}
function isString(s) {
  return typeof s === 'string'
}
function isUndefined(u) {
  return typeof u === 'undefined'
}
function isFunction(f) {
  return typeof f === 'function'
}

function match(input, patterns, options) {
  if (!(input && input.length)) return []
  options = Object.assign({ dot: true }, options || {}, {
    // required to convert forward to backslashes on Windows and match the file keys properly
    format: normalize
  })
  return micromatch(input, patterns, options).sort()
}

function writeStream(path) {
  return fs.createWriteStream(path, 'utf-8')
}
/**
 * Recursively remove a directory
 * @param {string} p
 * @returns Promise
 */
function rm(p) {
  return fsPromises.rm(p, { recursive: true, force: true })
}

/**
 * Recursive readdir with support for ignores
 * @private
 * @param {String} dir
 * @param {Array<String|Function>} ignores
 */
function readdir(dir, ignores) {
  if (Array.isArray(ignores)) {
    ignores = {
      str: ignores.filter(isString),
      fn: ignores.filter(isFunction)
    }
  }

  if (isString(dir)) {
    dir = {
      current: dir,
      root: dir
    }
  }
  const result = fsPromises
    .readdir(dir.current)
    .then((children) => {
      const filtered = []

      children.forEach((child) => {
        const res = resolve(dir.current, child)
        const rel = relative(dir.root, res)

        if (!match(rel, ignores.str).length) {
          filtered.push(
            stat(res).then((stat) => {
              // it would be better to put this check together with the previous if,
              // but that would break backwards-compatibility with Metalsmith 2.3.0
              // as the stat object needs to be passed to ignore fns
              if (ignores.fn.some((fn) => fn(rel, stat))) {
                return null
              }
              if (stat.isDirectory()) {
                return readdir({ current: res, root: dir.root }, ignores)
              }
              return res
            })
          )
        }
      })
      return Promise.all(filtered)
    })
    .then((files) => {
      const result = files
        // @TODO: this is a catch-all & can probably be finetuned with some more tests
        .filter((file) => !(file instanceof Error) && file !== null)
        .reduce((all, file) => all.concat(file), [])
        .sort()
      return result
    })
    .catch((err) => {
      throw err
    })

  return result
}

/**
 * Run `fn` in parallel on #`concurrency` number of `items`, spread over #`items / concurrency` sequential batches
 * @private
 * @param {() => Promise} fn
 * @param {*[]} items
 * @param {number} concurrency
 * @returns {Promise<*[]>}
 */
function batchAsync(fn, items, concurrency) {
  let batches = Promise.resolve([])
  items = [...items]

  while (items.length) {
    const slice = items.splice(0, concurrency)
    batches = batches.then((previousBatch) => {
      return Promise.all(slice.map((...args) => fn(...args))).then((currentBatch) => [
        ...previousBatch,
        ...currentBatch
      ])
    })
  }

  return batches
}

/**
 * Output a file and create any non-existing directories in the process
 * @private
 **/
function outputFile(file, data, mode) {
  return mkdir(dirname(file), { recursive: true })
    .then(() => writeFile(file, data))
    .then(() => (mode ? chmod(file, mode) : Promise.resolve()))
}

const helpers = {
  isBoolean,
  isNumber,
  isString,
  isObject,
  isUndefined,
  isFunction,
  match,
  rm,
  readdir,
  outputFile,
  stat,
  readFile,
  batchAsync,
  writeStream
}

module.exports = helpers
