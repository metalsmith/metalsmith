const debug = require('debug')
const utf8 = require('is-utf8')
const { isString } = require('./helpers')

const streamLogHandler =
  (stream) =>
  (...args) =>
    stream.write(require('util').format(...args) + '\n')
debug.log = streamLogHandler(process.stderr)

const options = {}
Object.defineProperties(options, {
  colors: {
    get() {
      return debug.inspectOpts.colors
    },
    set(v) {
      debug.inspectOpts.colors = v
    }
  },
  handle: {
    get() {
      return debug.log
    },
    set(v) {
      debug.log = v
    }
  }
})

// add a %b buffer formatter to print buffer contents.
// useful for checking whether the contents match rendering expectations
debug.formatters.b = function (buffer) {
  if (buffer instanceof Buffer && utf8(buffer)) {
    return `${buffer.toString().slice(0, 200)}...`
  }
  return buffer
}

/**
 * @typedef {import('debug').Debugger} Debugger
 * @property {import('debug').Debugger} info
 * @property {import('debug').Debugger} warn
 * @property {import('debug').Debugger} error
 */

/**
 * Create a new [debug](https://github.com/debug-js/debug#readme) debugger
 * @param {string} namespace Debugger namespace
 * @returns {Debugger}
 * @example
 * ```js
 * const debug = metalsmith.debug('metalsmith-myplugin')
 * debug('a debug log')    // logs 'metalsmith-myplugin a debug log'
 * debug.warn('A warning') // logs 'metalsmith-myplugin:warn A warning'
 * ```
 */
function Debugger(namespace) {
  if (!isString(namespace)) {
    const err = new Error(`invalid debugger namespace "${namespace}"`)
    err.code = 'invalid_debugger_namespace'
    throw err
  }
  // ANSI colors, see https://tintin.mudhalla.net/info/256color/
  // the colors have been chosen to best integrate with dark & light bg
  // and provide consistent coloring of debug/error/warn/info channel messages
  // debug only supports these colors if an extra module is installed, but these are already available in most terminals
  // to be tested on Windows Batch

  const namespacedDebug = debug(namespace)

  namespacedDebug.log = (...args) => options.handle(...args)
  namespacedDebug.color = 247

  const warn = namespacedDebug.extend('warn')
  warn.color = 178

  const info = namespacedDebug.extend('info')
  info.color = 51

  const error = namespacedDebug.extend('error')
  error.color = 196

  const dbugger = Object.assign(namespacedDebug, { warn, info, error })
  return dbugger
}

// We need to proxy some properties through Debugger to get access to them through metalsmith.debug.<option>
function proxy(host, target, option) {
  Object.defineProperty(host, option, {
    get() {
      return target[option]
    },
    set(v) {
      target[option] = v
    }
  })
}

proxy(Debugger, options, 'handle')
proxy(Debugger, options, 'colors')
proxy(Debugger, debug, 'enabled')
proxy(Debugger, debug, 'enable')
proxy(Debugger, debug, 'disable')

module.exports = {
  Debugger,
  fileLogHandler: streamLogHandler
}
