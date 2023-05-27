const matter = require('gray-matter')
const { isUndefined } = require('./helpers')
const _options = Symbol('options')

const defaultOptions = {
  excerpt: false,
  excerpt_separator: '---',
  language: 'yaml',
  delimiters: '---'
}

/**
 * @param {import('./index').GrayMatterOptions} options
 */
function Matter(options = defaultOptions) {
  this[_options] = Object.assign(Object.create(null), defaultOptions)
  this.options(options)
}

Matter.defaults = defaultOptions

/**
 * Get or set options for parsing & stringifying matter
 * @param {import('.').GrayMatterOptions} [options]
 * @returns {import('.').GrayMatterOptions}
 */
Matter.prototype.options = function (options) {
  if (isUndefined(options)) return Object.assign(Object.create(null), this[_options])
  this[_options] = Object.assign(this[_options], options)
}

/**
 * Parse a string or buffer for front matter and return it as a `File` object.
 * @param {Buffer|string} file
 * @returns {import('.').File}
 */
Matter.prototype.parse = function (fileBuffer) {
  const result = {}
  const parsed = matter(fileBuffer.toString(), this[_options])
  Object.assign(result, parsed.data)
  if (this[_options].excerpt && parsed.excerpt) {
    result.excerpt = parsed.excerpt.trim()

    // we do not want the excerpt + separator to be present in the contents
    parsed.content = parsed.content.replace(
      new RegExp(`^${result.excerpt}\\s*${this[_options].excerpt_separator}\\s*`),
      ''
    )
  }
  result.contents = Buffer.from(parsed.content)
  return result
}

/**
 * Stringify a Metalsmith `File` object's metadata
 * @param {import('.').File} file
 * @returns {string}
 */
Matter.prototype.stringify = function (file) {
  const { contents, ...metadata } = file
  const stringified = matter.stringify(contents, metadata, this[_options])
  return stringified
}

/**
 * Wrap stringified front-matter-compatible data with the matter delimiters
 * @param {string} dataString
 */
Matter.prototype.wrap = function (dataString) {
  return (
    typeof this[_options].delimiters === 'string'
      ? [this[_options].delimiters, dataString.toString(), this[_options].delimiters]
      : [this[_options].delimiters[0], dataString.toString(), this[_options].delimiters[1]]
  ).join('\n')
}

/**
 * @package
 */
module.exports = Matter
