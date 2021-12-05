var fs = require('fs')
var rmrf = require('rimraf')

/**
 * Type-checkers
 */
function isBoolean(b) {return typeof b === 'boolean'}
function isNumber(n) {return typeof n === 'number' && !Number.isNaN(n)}
function isObject(o) {return o !== null && typeof o === 'object'}
function isString(s) {return typeof s === 'string'}

/**
 * Recursively remove a directory
 * @param {string} p
 * @returns Promise
 */
function rm(p) {
  return new Promise(function(resolve, reject) {
    if (Object.prototype.hasOwnProperty.call(fs, 'rm')) {
      fs.rm(p, {
        recursive: true,
        force: true
      }, (err) => {
        if (err) reject(err)
        else resolve()
      })
    } else {
      // Node 14.14- compat
      rmrf(p, { glob: { dot: true } }, (err) => {
        if (err) reject(err)
        else resolve()
      })
    }
  })
}

var helpers = {
  isBoolean,
  isNumber,
  isString,
  isObject,
  rm
}

module.exports = helpers