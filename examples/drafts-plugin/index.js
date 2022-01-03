/**
 * A Metalsmith plugin to hide any files marked as `draft`.
 *
 * @return {Function}
 */

function plugin() {
  return function (files) {
    for (var file in files) {
      if (files[file].draft) delete files[file]
    }
  }
}
/**
 * Expose `plugin`.
 */

module.exports = plugin
