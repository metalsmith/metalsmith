
var clone = require('clone');
var defaults = require('defaults');
var each = require('async').each;
var front = require('front-matter');
var fs = require('fs-extra');
var Mode = require('stat-mode');
var noop = function(){};
var path = require('path');
var readdir = require('recursive-readdir');
var rm = require('rimraf');
var utf8 = require('is-utf8');
var Ware = require('ware');

/**
 * Expose `Metalsmith`.
 */

module.exports = Metalsmith;

/**
 * Initialize a new `Metalsmith` builder with a working `dir`.
 *
 * @param {String} dir
 */

function Metalsmith(dir){
  if (!(this instanceof Metalsmith)) return new Metalsmith(dir);
  this.dir = path.resolve(dir);
  this.ware = new Ware();
  this.data = {};
  this.source('src');
  this.destination('build');
  this.cleanIgnore([]);
}

/**
 * Add a `plugin` to the middleware stack.
 *
 * @param {Function} plugin
 * @return {Metalsmith}
 */

Metalsmith.prototype.use = function(plugin){
  this.ware.use(plugin);
  return this;
};

/**
 * Get or set the global `metadata` to pass to templates.
 *
 * @param {Object} metadata
 * @return {Object or Metalsmith}
 */

Metalsmith.prototype.metadata = function(metadata){
  if (!arguments.length) return this.data;
  this.data = clone(metadata);
  return this;
};

/**
 * Get or set the source directory.
 *
 * @param {String} path
 * @return {String or Metalsmith}
 */

Metalsmith.prototype.source = function(path){
  if (!arguments.length) return this.join(this._src);
  this._src = path;
  return this;
};

/**
 * Get or set the destination directory.
 *
 * @param {String} path
 * @return {String or Metalsmith}
 */

Metalsmith.prototype.destination = function(path){
  if (!arguments.length) return this.join(this._dest);
  this._dest = path;
  return this;
};

/**
 * Get or set files/directories under destination to skip when cleaning.
 * Note that this only checks immediate children of the destination directory,
 * and does not support globbing.
 *
 * @param {String or Array} files
 * @return {Array or Metalsmith}
 */

Metalsmith.prototype.cleanIgnore = function(files){
  if (!arguments.length) {
    var destination = this.destination();
    return this._cleanIgnore.map(function(file){
      return path.join(destination, file);
    }, this);
  }

  this._cleanIgnore = Array.isArray(files) ? files : [files];
  return this;
};

/**
 * Join path `strs` with the working directory.
 *
 * @param {String} strs...
 * @return {String}
 */

Metalsmith.prototype.join = function(){
  var strs = [].slice.call(arguments);
  strs.unshift(this.dir);
  return path.join.apply(path, strs);
};

/**
 * Build with the current settings to the dest directory.
 *
 * @param {Function} fn
 */

Metalsmith.prototype.build = function(fn){
  fn = fn || noop;
  var self = this;

  this.read(function(err, files){
    if (err) return fn(err);
    self.run(files, function(err, files){
      if (err) return fn(err);
      self.write(files, function(err){
        fn(err, files);
      });
    });
  });
};

/**
 * Run a set of `files` through the middleware stack.
 *
 * @param {Object} files
 * @param {Function} fn
 */

Metalsmith.prototype.run = function(files, fn){
  this.ware.run(files, this, fn);
};

/**
 * Read the source directory, parsing front matter and call `fn(files)`.
 *
 * @param {Function} fn
 * @api private
 */

Metalsmith.prototype.read = function(fn){
  var files = {};
  var src = this.source();

  readdir(src, function(err, arr){
    if (err) return fn(err);
    each(arr, read, function(err){
      fn(err, files);
    });
  });

  function read(file, done){
    var name = path.relative(src, file);
    fs.stat(file, function(err, stats){
      if (err) return done(err);
      fs.readFile(file, function(err, buffer){
        if (err) return done(err);
        var file = {};

        if (utf8(buffer)) {
          var parsed = front(buffer.toString());
          file = parsed.attributes;
          file.contents = new Buffer(parsed.body);
        } else {
          file.contents = buffer;
        }

        file.mode = Mode(stats).toOctal();
        files[name] = file;
        done();
      });
    });
  }
};

/**
 * Write a dictionary of `files` to the dest directory.
 *
 * @param {Object} files
 * @param {Function} fn
 * @api private
 */

Metalsmith.prototype.write = function(files, fn){
  var dest = this.destination();
  var cleanIgnore = this.cleanIgnore();

  if (cleanIgnore.length) {
    var cleanIgnoreMap = {};
    cleanIgnore.forEach(function(file){
      cleanIgnoreMap[file] = true;
    });
    fs.readdir(dest, function (err, topFiles) {
      // Ignore errors (e.g. the destination folder didn't exist yet)
      if (err) return writeAll();

      topFiles = topFiles.map(function(file){
        return path.join(dest, file);
      }).filter(function(file){
        return !(cleanIgnoreMap.hasOwnProperty(file));
      });
      each(topFiles, rm, writeAll);
    });
  } else {
    rm(dest, writeAll);
  }

  function writeAll(err){
    if (err) return fn(err);
    each(Object.keys(files), write, fn);
  }

  function write(file, done){
    var data = files[file];
    var out = path.join(dest, file);
    return fs.outputFile(out, data.contents, function(err){
      if (err) done(err);
      if (!data.mode) return done();
      fs.chmod(out, data.mode, done);
    });
  }
};
