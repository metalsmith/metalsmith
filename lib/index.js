
var defaults = require('defaults');
var each = require('async').each;
var front = require('front-matter');
var fs = require('fs-extra');
var noop = function(){};
var path = require('path');
var readdir = require('recursive-readdir');
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
  this.data = metadata;
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
  var ware = this.ware;
  var self = this;

  this.read(function(err, files){
    if (err) return fn(err);
    ware.run(files, self, function(err){
      if (err) return fn(err);
      self.write(files, function(err){
        fn(err, files);
      });
    });
  });
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
    fs.readFile(file, function(err, buffer){
      if (err) return done(err);
      files[name] = { contents: buffer };
      if (utf8(buffer)) {
        var parsed = front(buffer.toString());
        files[name] = parsed.attributes;
        files[name].contents = new Buffer(parsed.body.trim());
      }
      done();
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

  each(Object.keys(files), write, fn);

  function write(file, done){
    var data = files[file];
    var out = path.join(dest, file);
    return fs.outputFile(out, data.contents, done);
  }
};
