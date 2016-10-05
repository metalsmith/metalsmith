var minify = require('html-minifier').minify;

var my_plugin = function (options) {
    return function (files, metalsmith, done) {

        Object.keys(files).forEach(function(file){

            var contents = files[file].contents.toString();

            var minified = minify(contents, options);

            files[file].contents = new Buffer(minified, "utf8");

        });

        done();
    };
};

// Expose the plugin
module.exports = my_plugin;