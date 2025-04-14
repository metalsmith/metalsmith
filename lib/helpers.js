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
/**
 *
 * @param {string} dir
 * @param {{ignores?: string|Function[], root?: string }} opts
 * @returns {Promise<[string,fs.Stats][]>}
 */
function readdir(dir, opts) {
  const { ignores, root } = { ignores: [], root: '.', ...(opts || {}) }
  const patternIgnores = ignores.filter(isString)
  const fnIgnores = ignores.filter(isFunction)

  const abspaths = [],
    relpaths = []
  const statAndSubdirCalls = []
  const resolutions = []
  const result = fsPromises.readdir(dir).then((descendants) => {
    descendants.forEach((dpath) => {
      const abspath = resolve(dir, dpath)
      const relpath = relative(root, abspath)

      if (!match(relpath, patternIgnores).length) {
        abspaths.push(abspath)
        relpaths.push(relpath)
      }
    })

    abspaths.forEach((abspath, i) => {
      statAndSubdirCalls.push(
        stat(abspath).then((stats) => {
          const isFnIgnored = fnIgnores.some((fn) => fn(relpaths[i], stats))
          if (isFnIgnored) return
          if (stats.isDirectory()) {
            const promised = readdir(abspath, { root, ignores }).then((descendants) => {
              resolutions.push(...descendants)
            })
            return promised
          }
          resolutions.push([relpaths[i], stats])
        })
      )
    })

    return Promise.all(statAndSubdirCalls)
      .then(() => resolutions.sort((a, b) => (a[0] > b[0] ? 1 : -1)))
      .catch((err) => {
        throw err
      })
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
