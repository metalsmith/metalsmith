
var extname = require('path').extname;
var Metalsmith = require('metalsmith');
var myth = require('myth');

/**
 * Build.
 */

var metalsmith = Metalsmith(__dirname)
  .use(concat)
  .build(function(err){
    if (err) throw err;
  });

/**
 * Concat plugin.
 *
 * @param {Object} files
 * @param {Metalsmith} metalsmith
 * @param {Function} done
 */

function concat(files, metalsmith, done){
  var css = '';

  for (var file in files) {
    if ('.css' != extname(file)) continue;
    css += files[file].contents.toString();
    delete files[file];
  }

  css = myth(css);

  files['index.css'] = {
    contents: new Buffer(css)
  };

  done();
}
