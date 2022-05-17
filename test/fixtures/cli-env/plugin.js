
/**
 * Plugin.
 */

module.exports = function(){
  return function(files, metalsmith){
    files['env.json'].contents = Buffer.from(JSON.stringify(metalsmith.env()));
  };
};
