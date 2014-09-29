
var assert = require('assert');
var clone = require('clone');
var front = require('front-matter');
var fs = require('co-fs-extra');
var Mode = require('stat-mode');
var path = require('path');
var readdir = require('recursive-readdir');
var rm = require('rimraf');
var thunkify = require('thunkify');
var unyield = require('unyield');
var utf8 = require('is-utf8');
var Ware = require('ware');

/**
 * Thunks.
 */

readdir = thunkify(readdir);
rm = thunkify(rm);

/**
 * Export `Metalsmith`.
 */

module.exports = Metalsmith;

/**
 * Initialize a new `Metalsmith` builder with a working `directory`.
 *
 * @param {String} directory
 */

function Metalsmith(directory){
  if (!(this instanceof Metalsmith)) return new Metalsmith(directory);
  assert(directory, 'You must pass a working directory path.');
  this.ware = new Ware();
  this.directory(directory);
  this.metadata({});
  this.source('src');
  this.destination('build');
  this.clean(true);
  this.frontmatter(true);
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
 * Get or set the working `directory`.
 *
 * @param {Object} directory
 * @return {Object or Metalsmith}
 */

Metalsmith.prototype.directory = function(directory){
  if (!arguments.length) return path.resolve(this._directory);
  this._directory = directory;
  return this;
};

/**
 * Get or set the global `metadata` to pass to templates.
 *
 * @param {Object} metadata
 * @return {Object or Metalsmith}
 */

Metalsmith.prototype.metadata = function(metadata){
  if (!arguments.length) return this._metadata;
  this._metadata = clone(metadata);
  return this;
};

/**
 * Get or set the source directory.
 *
 * @param {String} path
 * @return {String or Metalsmith}
 */

Metalsmith.prototype.source = function(path){
  if (!arguments.length) return this.path(this._source);
  this._source = path;
  return this;
};

/**
 * Get or set the destination directory.
 *
 * @param {String} path
 * @return {String or Metalsmith}
 */

Metalsmith.prototype.destination = function(path){
  if (!arguments.length) return this.path(this._destination);
  this._destination = path;
  return this;
};

/**
 * Get or set whether the destination directory will be removed before writing.
 *
 * @param {Boolean} clean
 * @return {Boolean or Metalsmith}
 */
Metalsmith.prototype.clean = function(clean){
  if (!arguments.length) return this._clean;
  this._clean = !! clean;
  return this;
};

/**
 * Optionally turn off frontmatter parsing.
 *
 * @param {Boolean} frontmatter
 * @return {Boolean or Metalsmith}
 */

Metalsmith.prototype.frontmatter = function(frontmatter){
  if (!arguments.length) return this._frontmatter;
  this._frontmatter = !! frontmatter;
  return this;
};

/**
 * Resolve `paths` relative to the root directory.
 *
 * @param {String} paths...
 * @return {String}
 */

Metalsmith.prototype.path = function(){
  var paths = [].slice.call(arguments);
  paths.unshift(this.directory());
  return path.resolve.apply(path, paths);
};

/**
 * Build with the current settings to the dest directory.
 *
 * @return {Object}
 */

Metalsmith.prototype.build = unyield(function*(){
  var clean = this.clean();
  var dest = this.destination();
  if (clean) yield rm(dest);

  var files = yield this.read();
  files = yield this.run(files);
  yield this.write(files);
  return files;
});

/**
 * Run a set of `files` through the middleware stack.
 *
 * @param {Object} files
 * @return {Object}
 */

Metalsmith.prototype.run = unyield(function*(files){
  var run = thunkify(this.ware.run.bind(this.ware));
  var res = yield run(files, this);
  return res[0];
});

/**
 * Read the source directory, parsing front matter and call `fn(files)`.
 *
 * @return {Object}
 */

Metalsmith.prototype.read = unyield(function*(){
  var src = this.source();
  var read = this.readFile.bind(this);
  var paths = yield readdir(src);
  var files = yield paths.map(read);

  return paths.reduce(function(memo, file, i){
    file = path.relative(src, file);
    memo[file] = files[i];
    return memo;
  }, {});
});

/**
 * Read a single file by file `path`.
 *
 * @param {String} path
 * @return {Object}
 */

Metalsmith.prototype.readFile = unyield(function*(path){
  var frontmatter = this.frontmatter();
  var stats = yield fs.stat(path);
  var buffer = yield fs.readFile(path);
  var file = {};

  if (frontmatter && utf8(buffer)) {
    var parsed = front(buffer.toString());
    file = parsed.attributes;
    file.contents = new Buffer(parsed.body);
  } else {
    file.contents = buffer;
  }

  file.mode = Mode(stats).toOctal();
  file.stats = stats;
  return file;
});

/**
 * Write a dictionary of `files` to the dest directory.
 *
 * @param {Object} files
 */

Metalsmith.prototype.write = unyield(function*(files){
  var write = this.writeFile.bind(this);
  yield Object.keys(files).map(function(file){
    return write(file, files[file]);
  });
});

/**
 * Write a `file` with `data` to the destination directory.
 *
 * @param {String} file
 * @param {Object} data
 */

Metalsmith.prototype.writeFile = unyield(function*(file, data){
  var dest = this.destination();
  var out = path.resolve(dest, file);
  yield fs.outputFile(out, data.contents);
  if (data.mode) yield fs.chmod(out, data.mode);
});
