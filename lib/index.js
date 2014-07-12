
var _ = require('underscore');
var clone = require('clone');
var defaults = require('defaults');
var each = require('async').each;
var EventEmitter = require('events').EventEmitter;
var front = require('front-matter');
var fs = require('fs-extra');
var gaze = require('gaze');
var Mode = require('stat-mode');
var noop = function(){};
var path = require('path');
var readdir = require('recursive-readdir');
var rm = require('rimraf').sync;
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
  this.clean(true);
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
 * Get or set whether the destination directory will be removed before writing.
 * @param  {Boolean} clean
 * @return {Boolean or Metalsmith}
 */
Metalsmith.prototype.clean = function(clean){
  if (!arguments.length) return this._clean;
  this._clean = clean;
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
 * Watch the specified directories and re-trigger the build when files are
 * added, modified and/or deleted.
 *
 * Checkout {@link https://github.com/isaacs/minimatch} for more details on the
 * matching patterns.
 *
 * @param {Object} config Configuration object
 * @param {String|String[]} config.patterns Patterns to be matched. Default to
 * every files in the source directory (recursively)
 * @param {String|String[]} config.events Events to be watched. Can be: 'all',
 * 'changed', 'added' and/or 'deleted'. Default to 'all'
 * @param {Boolean} config.forever Whether to continue when an error occured
 * during the build process. If set to `true`, the process will not stop on an
 * error. If set to `false`, the process will stop on an error. Default to
 * `true`
 * @param {Integer} config.debounceDelay Delay in milliseconds between the time
 * of the first detected modification and the following build. Default to `250`
 * (ms)
 * @param {Object} config.gazeOptions Pass specific options to Gaze. See {@link
 * https://github.com/shama/gaze#properties}. Default to an empty object
 * @param {Function} fn Function called after each build. Also called if an
 * error occurs. Called as `function(err, files, end)`, the `end` parameter is a
 * callback which once called stops the watching.

 * @return {EventEmitter} The following events will be triggered:
 *   - 'error': when an error occured
 *         `function onError(err)`
 *   - 'ready': when the watcher is fully initialized
 *         `function onInitialized(end)`
 *   - 'build': when a modification has been catched and the rebuild is done
 *     (equivalent of the `fn` parameter)
 *         `function onBuild(files, end)`
 *   - 'end': when the watcher is closed and stop watching
 *
 * It is possible to not pass the configuration object and give the callback as
 * the first argument (as to mimic a #build() call).
 */

Metalsmith.prototype.watch = function(config, fn) {
  var emitter = new EventEmitter();

  // Allow to omit the config parameter
  if (typeof config === 'function') {
    fn = config;
    config = {};
  }

  config = config || {};
  config.patterns = config.patterns || (this._src + '/**/*');
  config.events = config.events || 'all';
  if (typeof config.forever !== 'boolean') config.forever = true;
  if (typeof config.debounceDelay !== 'integer') config.debounceDelay = 250;
  config.gazeOptions = config.gazeOptions || {};
  fn = fn || noop;
  var self = this;

  if (!Array.isArray(config.patterns)) config.patterns = [config.patterns];
  config.patterns = config.patterns.map(function(pattern) {
    return self.join(pattern);
  });

  if (!Array.isArray(config.events)) config.events = [config.events];
  if (~config.events.indexOf('all')) {
    config.events = ['changed', 'added', 'deleted'];
  }

  gaze(config.patterns, config.gazeOptions, function(err, watcher) {
    // Once called, stop the watcher
    var end = watcher.close.bind(watcher);

    watcher.on('end', function() {
      emitter.emit('end');
    });

    if (err) {
      emitter.emit('error', err);
      fn(err);
      return;
    }

    emitter.emit('ready', end);

    var onEvent = _.debounce(function(event, filepath) {
      try {
        self.build(function(err, files) {
          if (err) emitter.emit('error', err);
          else     emitter.emit('build', files, end);
          fn(err, files, end);
        });
      } catch (e) {
        emitter.emit('error', e);
        fn(e);
        if (!config.forever) throw e;
      }
    }, config.debounceDelay);

    config.events.forEach(function(event) {
      watcher.on(event, function(filepath) { onEvent(event, filepath); });
    });
  });

  return emitter;
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
  var clean = this.clean();

  if (clean) rm(dest);
  each(Object.keys(files), write, fn);

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
