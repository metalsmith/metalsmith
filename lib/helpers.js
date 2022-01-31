const fs = require('fs')
const { promisify } = require('util')
const { resolve, relative, normalize } = require('path')
const rmrf = require('rimraf')
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
  input = input || Object.keys(this._files)
  if (!(input && input.length)) return []
  options = Object.assign({ dot: true }, options || {}, {
    // required to convert forward to backslashes on Windows and match the file keys properly
    format: normalize
  })
  return micromatch(input, patterns, options).sort()
}
/**
 * Recursively remove a directory
 * @param {string} p
 * @returns Promise
 */
function rm(p) {
  return new Promise(function (resolve, reject) {
    /* istanbul ignore else */
    if (Object.prototype.hasOwnProperty.call(fs, 'rm')) {
      fs.rm(
        p,
        {
          recursive: true,
          force: true
        },
        (err) => {
          if (err) reject(err)
          else resolve()
        }
      )
    } else {
      // Node 14.14- compat
      rmrf(p, { glob: { dot: true } }, (err) => {
        if (err) reject(err)
        else resolve()
      })
    }
  })
}

/**
 * Recursive readdir with support for ignores
 * @param {String} dir
 * @param {Array<String|Function>} ignores
 * @param {Function} callback - Callback for thunkify @TODO remove in the future
 */
function readdir(dir, ignores, callback) {
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
  const stat = promisify(fs.stat)
  const result = promisify(fs.readdir)
    .bind(fs)(dir.current)
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

  if (callback) {
    result.then(
      (files) => callback(null, files),
      (err) => callback(err)
    )
  } else {
    return result
  }
}

const helpers = {
  isBoolean,
  isNumber,
  isString,
  isObject,
  isUndefined,
  match,
  rm,
  readdir
}

module.exports = helpers
