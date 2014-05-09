/**
 * Cli
 *
 * @throws {Error} If could not find "metalsmith.json"
 * @throws {Error} If "metalsmith.json" file is malformed
 * @throws {Error} If failed to require plugin
 */

module.exports = function(file) {

  var exists = require('fs').existsSync;
  var Metalsmith = require(__dirname);
  var resolve = require('path').resolve;

  /**
   * Config.
   */

  var config = resolve(file);
  
  if (!exists(config)) {

    var message = 'could not find a "metalsmith.json" configuration file.'
    
    throw new Error(message);
  
  } 

  try {
  
    var json = require(config);
  
  } catch (e) {

    var message = 'it seems like "metalsmith.json" is malformed.';
  
    throw new Error(message);
  
  }

  /**
   * Settings.
   */

  var src = json.source;
  var dest = json.destination;
  var data = json.metadata;
  var clean = !! json.clean;

  /**
   * Metalsmith.
   */

  var metalsmith = new Metalsmith(process.cwd());
  if (src) metalsmith.source(src);
  if (dest) metalsmith.destination(dest);
  if (data) metalsmith.metadata(data);
  metalsmith.clean(clean);

  /**
   * Plugins.
   */

  var plugins = normalize(json.plugins);
  plugins.forEach(function(plugin){
    for (var name in plugin) {
      var opts = plugin[name];
      var fn;

      try {
      
        fn = require(name);
      
      } catch (e) {

        var message = 'failed to require plugin "' + name + '".';

        throw new Error(message);

      }
    
      metalsmith.use(fn(opts));
    
    }

  });

  /**
   * Normalize an `obj` of plugins.
   *
   * @param {Array or Object} obj
   * @return {Array}
   */

  function normalize(obj){
    if (obj instanceof Array) return obj;
    var ret = [];

    for (var key in obj) {
      var plugin = {};
      plugin[key] = obj[key];
      ret.push(plugin);
    }

    return ret;
  }

  return metalsmith;

}