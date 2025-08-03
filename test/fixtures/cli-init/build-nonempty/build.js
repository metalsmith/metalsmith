import { performance } from 'node:perf_hooks'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { readFileSync } from 'node:fs'

// metalsmith-related
import Metalsmith from 'metalsmith'
import markdown from '@metalsmith/markdown'
import layouts from '@metalsmith/layouts'
import permalinks from '@metalsmith/permalinks'
import js from '@metalsmith/js-bundle'
import defaultValues from '@metalsmith/default-values'
import refs from '@metalsmith/refs'
import remove from '@metalsmith/remove'

// local plugins
import buildDebug from './lib/metalsmith/build-debug.js'

// other
import browserSync from 'browser-sync'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const packagejson = JSON.parse(readFileSync(join(__dirname, 'package.json')))

const env = {
  BASEURI: process.env.BASEURI || '',
  NODE_ENV: process.env.NODE_ENV || 'production',
  DEBUG: process.env.DEBUG || false
}

if (process.env.TZ) env.TZ = process.env.TZ

const isDev = env.NODE_ENV === 'development'
const watch = process.argv.includes('--watch')

// functions to extend Nunjucks environment
const thisYear = () => new Date().getFullYear()

// Define engine options for the layouts and/or in-place plugin
const engineOptions = {
  filters: {
    thisYear
  }
}

let devServer = null
let t1 = performance.now()

const ms = Metalsmith(__dirname)
const debug = ms.debug('build')

ms.matter.options({
  excerpt: true,
  excerpt_separator: ['---', '<!--more-->']
})

ms.source('src')
  .destination('build')
  // faster builds in dev/watch mode: skip emptying the destination dir
  // before rebuilding, skip reloading files from disk
  .clean(!(isDev || watch))
  .watch(watch ? ['src', 'lib'] : false)
  // pass NODE_ENV & other environment variables to plugins via metalsmith.env()
  .env(env)
  // add any variable you want & use them in layouts and other plugins
  .metadata({
    // serve your project from any subfolder path
    baseuri: env.BASEURI,
    scripts: ['script.js'],
    styles: ['https://unpkg.com/style.css', 'style.css'],
    lang: 'en',
    isDev,
    build: {
      date: new Date(),
      pkgVersion: `v${packagejson.version}`,
      msVersion: `v${packagejson.dependencies.metalsmith.replace(/\^/g, '')}`,
      nodeVersion: process.version
    }
  })
  // add a small inline log plugin with our build debugger
  .use(buildDebug(debug))
  // assign properties to matched files dynamically for further processing
  .use(
    defaultValues({
      pattern: '**/*.md',
      defaults: {
        'refs.site': 'id:site-data',
        layout: 'default.njk'
      }
    })
  )
  // attach id's to each content file and facilitate cross-referencing file data
  .use(refs())
  // remove metadata source files and only render demo page in development mode
  .use(remove('data/**'))
  // render markdown
  .use(markdown())
  // add a 'permalink' to each html file and move them from :dir/:name.html to :dir/:name/index.html
  .use(
    permalinks({
      trailingSlash: true
    })
  )
  // wrap files in layouts
  .use(
    layouts({
      directory: 'lib/layouts',
      pattern: '**/*.html',
      engineOptions
    })
  )
  // process JS with esbuild
  .use(
    js({
      entries: {
        'assets/js/script': 'src/assets/js/script.js'
      }
    })
  )

if (!isDev) {
  // .use(plugin)'s that do post-processing not desired during development,
  // eg html minification, gzipping, JS minification
}

// When it is not run directly, the Metalsmith build can be run with the Metalsmith CLI, imported
// by other JS scripts for unit testing or combining metalsmith builds
const isMainScript = process.argv[1] === fileURLToPath(import.meta.url)

if (isMainScript) {
  ms.build((err) => {
    if (err) {
      ms.watch(false)
      throw err
    }

    debug('Finished building to %s in %ss', ms.destination(), ((performance.now() - t1) / 1000).toFixed(1))
    if (ms.watch()) {
      if (!devServer) {
        const options = {
          host: process.env.HOST || 'localhost',
          server: ms.destination(),
          port: process.env.PORT || 3000,
          injectChanges: false,
          reloadThrottle: 0
        }
        debug('Starting dev-server at %s:%s with options %O', options.host, options.port, options)
        devServer = browserSync.create()
        devServer.init(options)
      } else {
        debug('reloading')
        t1 = performance.now()
        devServer.reload()
      }
    }
  })
}

export default ms
