
/**
 * Expose `plugin`.
 */

module.exports = plugin;

/**
 * A Metalsmith plugin to hide any files marked as `draft`.
 *
 * @param {Object} files
 * @param {Metalsmith} metalsmith
 * @param {Function} done
 */

function plugin(){
  return function(files, metalsmith, done){
    for (var file in files) {
      if (files[file].draft) delete files[file];
    }
    done();
  };
}