
/**
 * Export `Metalsmith`.
 */

const _Metalsmith = require('./lib')

module.exports = function Metalsmith(directory) {
  return new _Metalsmith(directory)
}
