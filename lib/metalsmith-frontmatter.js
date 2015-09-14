var matter = require('gray-matter');
var utf8 = require('is-utf8');

module.exports = frontmatter;

// In ECMAScript 6 this can be replaced with `Object.assign`
function mergeProperties(target, source){
  for (var propertyName in source) {
    target[propertyName] = source[propertyName];
  }
}

function extractFrontmatter(file, filePath){
  if (utf8(file.contents)) {
    try {
      parsed = matter(file.contents.toString());
    } catch (e) {
      var errMsg = 'Invalid frontmatter in file'
      if (filePath !== undefined) errMsg += ": " + filePath;
      var err = new Error(errMsg);
      err.code = 'invalid_frontmatter';
      err.cause = e;
      throw err;
    }

    mergeProperties(file, parsed.data);
    file.contents = new Buffer(parsed.content);
  }
}

/**
 * Metalsmith plugin to extract metadata from frontmatter in file contents.
 *
 * @return {Function}
 */

function frontmatter(){
  return function(files){
    for (path in files) {
      extractFrontmatter(files[path], path)
    }
  };
}

frontmatter.extractFrontmatter = extractFrontmatter;
