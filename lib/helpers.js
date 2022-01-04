const fs = require('fs')
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

const helpers = {
  isBoolean,
  isNumber,
  isString,
  isObject,
  isUndefined,
  match,
  rm
}

module.exports = helpers
