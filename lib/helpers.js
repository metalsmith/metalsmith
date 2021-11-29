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
 * @param {import('fs').NoParamCallback} [callback]
 * @returns void
 */
function rm(p, callback) {
  if (Object.prototype.hasOwnProperty.call(fs, 'rm')) {
    fs.rm(p, {
      recursive: true,
      force: true
    }, callback)
  } else {
    // Node 14.14- compat
    rmrf(p, { glob: { dot: true } }, callback)
  }
}

var helpers = {
  isBoolean,
  isNumber,
  isString,
  isObject,
  rm
}

module.exports = helpers