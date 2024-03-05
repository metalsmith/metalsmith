/* eslint-env mocha, node */

const assert = require('assert')
const equal = require('assert-dir-equal')
const exec = require('child_process').exec
const fs = require('fs')
const Metalsmith = require('..')
const Mode = require('stat-mode')
const noop = function () {}
const path = require('path')
const rm = require('../lib/helpers').rm
const { fileLogHandler } = require('../lib/debug')
const fixture = path.resolve.bind(path, __dirname, 'fixtures')
const d = require('debug')

describe('Metalsmith', function () {
  const cachedDebugLog = d.log
  beforeEach(function () {
    d.colors = true
    d.log = cachedDebugLog
    return rm('test/tmp')
  })

  it('should expose a constructor', function () {
    assert.strictEqual(typeof Metalsmith, 'function')
  })

  it('should not require the `new` keyword', function () {
    const m = Metalsmith('test/tmp')
    assert(m instanceof Metalsmith)
  })

  it('should expose a version property matching package.json version', function () {
    assert.strictEqual(
      Metalsmith.version,
      JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf-8')).version
    )
  })

  it('should error without a working directory', function () {
    assert.throws(function () {
      Metalsmith()
    }, /You must pass a working directory path\./)
  })

  it('should use `./src` as a default source directory', function () {
    const m = Metalsmith('test/tmp')
    assert.strictEqual(m._source, 'src')
  })

  it('should use `./build` as a default destination directory', function () {
    const m = Metalsmith('test/tmp')
    assert.strictEqual(m._destination, 'build')
  })

  it('should default clean to `true`', function () {
    const m = Metalsmith('test/tmp')
    assert.strictEqual(m._clean, true)
  })

  describe('.matter', function () {
    it('#options should set options for matter parsing/stringifying', function () {
      const m = Metalsmith(fixture('test/tmp')).frontmatter({ excerpt: true })
      m.matter.options({ excerpt_separator: '<!-- end -->' })
      const parsed = m.matter.parse(Buffer.from('---\ntitle: Hello World\n---\nIntro\n<!-- end -->\nBody'))
      assert.deepStrictEqual(
        { ...parsed, contents: parsed.contents.toString() },
        {
          title: 'Hello World',
          excerpt: 'Intro',
          contents: 'Body'
        }
      )
    })

    it('#options should be in sync with metalsmith#frontmatter', function () {
      // sync works from frontmatter -> matter.options but not the other way around (and is intended this way)!

      let m = Metalsmith(fixture('test/tmp'))
      // default options
      assert.strictEqual(m.frontmatter(), true)
      assert.deepStrictEqual(m.matter.options(), Object.assign(Object.create(null), m.matter.constructor.defaults))

      m = Metalsmith(fixture('test/tmp'))
      // setting via m.matter.options
      m.matter.options({ excerpt_separator: '<!-- end -->' })
      assert.strictEqual(m.matter.options().excerpt_separator, '<!-- end -->')
      assert.deepStrictEqual(m.frontmatter(), true)

      // setting via m.frontmatter
      m = Metalsmith(fixture('test/tmp'))
      const conf = { delimiters: ['+++', '°°°'] }
      m.frontmatter(conf)
      assert.deepStrictEqual(m.matter.options().delimiters, conf.delimiters)
      assert.deepStrictEqual(
        m.matter.options(),
        Object.assign(Object.create(null), {
          ...m.matter.constructor.defaults,
          delimiters: conf.delimiters
        })
      )
    })

    it('#parse should parse front-matter according to options passed to metalsmith#frontmatter', function () {
      const m = Metalsmith(fixture('test/tmp')).frontmatter({ excerpt: true })
      const parsed = m.matter.parse(Buffer.from('---\ntitle: Hello World\n---\nIntro\n---\nBody'))
      assert.deepStrictEqual(
        { ...parsed, contents: parsed.contents.toString() },
        {
          title: 'Hello World',
          excerpt: 'Intro',
          contents: 'Body'
        }
      )
    })

    it('#parse should parse front-matter with a dynamically defined language', function () {
      const m = Metalsmith(fixture('test/tmp')).frontmatter({ excerpt: true })
      const parsed = m.matter.parse(Buffer.from('---js\n{ sum: 5 + 5 }\n---\nIntro\n---\nBody'))
      assert.deepStrictEqual(
        { ...parsed, contents: parsed.contents.toString() },
        {
          sum: 10,
          excerpt: 'Intro',
          contents: 'Body'
        }
      )
    })

    it('#stringify should stringify a file according to options passed to metalsmith#frontmatter', function () {
      const m = Metalsmith(fixture('test/tmp'))
      const stringified = m.matter.stringify({
        title: 'Hello World',
        excerpt: 'Intro\n',
        contents: 'Body'
      })
      assert.strictEqual(
        stringified,
        ['---', 'title: Hello World', 'excerpt: |', '  Intro', '---', 'Body'].join('\n') + '\n'
      )
    })

    it('#wrap should wrap a file according to options passed to metalsmith#frontmatter', function () {
      const m = Metalsmith(fixture('test/tmp'))
      const stringifiedData = `{"title": "Hello World","excerpt": "Intro","contents": "Body"}`

      const wrapped = m.matter.wrap(stringifiedData)
      assert.strictEqual(wrapped, ['---', stringifiedData, '---'].join('\n'))

      m.matter.options({ delimiters: ['~~~', '+++'] })
      const wrapped2 = m.matter.wrap(stringifiedData)
      assert.strictEqual(wrapped2, ['~~~', stringifiedData, '+++'].join('\n'))
    })
  })

  describe('#use', function () {
    it('should add a plugin to the plugins stack', function () {
      const m = Metalsmith('test/tmp')
      m.use(noop)
      assert.strictEqual(m.plugins.length, 1)
    })
  })

  describe('#ignore', function () {
    it('should add an ignore file to the internal ignores list', function () {
      const m = Metalsmith('test/tmp')
      m.ignore('dirfile')
      assert(1 == m.ignores.length)
    })

    it('should return the ignore list without arguments', function () {
      const m = Metalsmith('test/tmp')
      m.ignore('dirfile')
      assert(m.ignore()[0] === 'dirfile')
    })
  })

  describe('#directory', function () {
    it('should set a working directory', function () {
      const m = Metalsmith('test/tmp')
      m.directory('dir')
      assert.strictEqual(m._directory, 'dir')
    })

    it('should get the working directory', function () {
      const m = Metalsmith('test/tmp')
      assert(~m.directory().indexOf(path.sep + path.join('test', 'tmp')))
    })

    it('should be able to be absolute', function () {
      const m = Metalsmith('test/tmp')
      m.directory('/dir')
      assert.strictEqual(m.directory(), path.resolve('/dir'))
    })

    it('should error on non-string', function () {
      const m = Metalsmith('test/tmp')
      assert.throws(function () {
        m.directory(0)
      })
    })
  })

  describe('#source', function () {
    it('should set a source directory', function () {
      const m = Metalsmith('test/tmp')
      m.source('dir')
      assert.strictEqual(m._source, 'dir')
    })

    it('should get the full path to the source directory', function () {
      const m = Metalsmith('test/tmp')
      assert(~m.source().indexOf(path.resolve(path.join('test', 'tmp', 'src'))))
    })

    it('should be able to be absolute', function () {
      const m = Metalsmith('test/tmp')
      m.source('/dir')
      assert.strictEqual(m.source(), path.resolve('/dir'))
    })

    it('should error on non-string', function () {
      const m = Metalsmith('test/tmp')
      assert.throws(function () {
        m.source(0)
      })
    })
  })

  describe('#destination', function () {
    it('should set a destination directory', function () {
      const m = Metalsmith('test/tmp')
      m.destination('dir')
      assert.strictEqual(m._destination, 'dir')
    })

    it('should get the full path to the destination directory', function () {
      const m = Metalsmith('test/tmp')
      assert(~m.destination().indexOf(path.join('test', 'tmp', 'build')))
    })

    it('should be able to be absolute', function () {
      const m = Metalsmith('test/tmp')
      m.destination('/dir')
      assert.strictEqual(m.destination(), path.resolve('/dir'))
    })

    it('should error on non-string', function () {
      const m = Metalsmith('test/tmp')
      assert.throws(function () {
        m.destination(0)
      })
    })
  })

  describe('#env', function () {
    it('should initialize an empty object as environment', function () {
      const m = Metalsmith('test/tmp')
      assert(m.env().hasOwnProperty === undefined)
      assert(Object.keys(m.env()).length === 0)
    })

    it('should not be accessible directly from the Metalsmith instance', function () {
      const m = Metalsmith('test/tmp')
      assert(!Object.keys(m).includes('env') && !Object.keys(m).includes('_env'))
    })

    it('should allow getting & chainable setting single environment variables', function () {
      const m = Metalsmith('test/tmp').env('DEBUG', true).env('ENV', 'development')

      assert(m.env('DEBUG'))
      assert(m.env('ENV') === 'development')
    })

    it('should throw on non-primitive values', function () {
      assert.throws(() => Metalsmith('test/tmp').env('DEBUG', {}))
      assert.throws(() => Metalsmith('test/tmp').env('DEBUG', () => {}))
    })

    it('should treat a lowercase and uppercase variable as the same', function () {
      const m = Metalsmith('test/tmp')
      m.env('debug', true)
      m.env('DEBUG', false)
      assert(m.env('debug') === m.env('DEBUG'))
    })

    it('should allow setting a batch of environment variables', function () {
      const m = Metalsmith('test/tmp').env({ DEBUG: true, ENV: 'development' })

      assert.deepStrictEqual(m.env(), Object.assign(Object.create(null), { DEBUG: true, ENV: 'development' }))
    })

    it('should provide out of the box support for process.env', function () {
      const npmvar = process.env.npm_config_shell
      const m = Metalsmith('test/tmp').env(process.env)
      const uppercased = Object.entries(process.env).reduce((vars, [name, value]) => {
        vars[name.toUpperCase()] = value
        return vars
      }, {})
      assert.deepStrictEqual(m.env(), Object.assign(Object.create(null), uppercased))

      m.env('npm_config_shell', '/bin/not-really')
      assert.strictEqual(process.env.npm_config_shell, npmvar)
    })
  })

  describe('#concurrency', function () {
    it('should set a max number for concurrency', function () {
      const m = Metalsmith('test/tmp')
      m.concurrency(15)
      assert.strictEqual(m._concurrency, 15)
    })

    it('should get the max number for concurrency', function () {
      const m = Metalsmith('test/tmp')
      m.concurrency(25)
      assert.strictEqual(m.concurrency(), 25)
    })

    it('should be infinitely concurrent by default', function () {
      const m = Metalsmith('test/tmp')
      assert.strictEqual(m.concurrency(), Infinity)
    })

    it('should error on non-number', function () {
      const m = Metalsmith('test/tmp')
      const badArgs = [NaN, 'hi', process, false, '1', '2', '3']
      badArgs.forEach(function (bad) {
        assert.throws(function () {
          m.concurrency(bad), TypeError
        })
      })
    })
  })

  describe('#clean', function () {
    it('should set the clean option', function () {
      const m = Metalsmith('test/tmp')
      m.clean(false)
      assert.strictEqual(m._clean, false)
    })

    it('should get the value of the clean option', function () {
      const m = Metalsmith('test/tmp')
      assert.strictEqual(m.clean(), true)
    })

    it('should error on non-boolean', function () {
      const m = Metalsmith('test/tmp')
      assert.throws(function () {
        m.clean(0)
      })
    })
  })

  describe('#frontmatter', function () {
    it('should set the frontmatter option', function () {
      const m = Metalsmith('test/tmp')
      m.frontmatter(false)
      assert.strictEqual(m._frontmatter, false)
    })

    it('should allow a gray-matter options object as input', function () {
      const m = Metalsmith('test/tmp')
      m.frontmatter({ delimiters: '~~~' })
      assert.deepEqual(m._frontmatter, { delimiters: '~~~' })
    })

    it('should get the value of the frontmatter option', function () {
      const m = Metalsmith('test/tmp')
      assert(m.frontmatter(), true)
    })

    it('should error on non-boolean or non-object', function () {
      const m = Metalsmith('test/tmp')
      assert.throws(function () {
        m.frontmatter(0)
      })
    })
  })

  describe('#metadata', function () {
    it('should get metadata', function () {
      const m = Metalsmith('test/tmp')
      assert.deepEqual(m.metadata(), {})
    })

    it('should assign to existing metadata', function () {
      const m = Metalsmith('test/tmp')
      m.metadata({ property: true })
      const data = m.metadata()
      m.metadata({ otherProperty: false })
      assert.strictEqual(m.metadata(), data)
      m.metadata({})
      assert.deepEqual(m.metadata(), data)
    })

    it('should error on non-object', function () {
      const m = Metalsmith('test/tmp')
      assert.throws(function () {
        m.metadata(0)
      })
    })
  })

  describe('#path', function () {
    it('should return a path relative to the working directory', function () {
      const m = Metalsmith('test/tmp')
      const actualPath = m.path('one', 'two', 'three')
      assert(~actualPath.indexOf(path.resolve('test/tmp/one/two/three')))
    })
  })

  describe('#match', function () {
    it('should match a glob pattern', function (done) {
      const m = Metalsmith(fixture('match'))
      m.process(function (err) {
        if (err) done(err)
        const matches = m.match('**/*.md').join(',')
        assert.strictEqual(matches, `index.md,${path.join('nested', 'index.md')}`)
        done()
      })
    })

    it('should not error on falsy input', function (done) {
      const m = Metalsmith(fixture('match'))
      m.process(function (err) {
        if (err) done(err)
        const matches = m.match()
        assert.deepStrictEqual(matches, [])
        done()
      })
    })

    it('should support negation & OR patterns', function (done) {
      const m = Metalsmith(fixture('match'))
      m.process(function (err) {
        if (err) done(err)
        const negationMatches = m.match('!index.md')
        const orMatches = m.match('*.{jpg,md}')
        assert.deepStrictEqual(negationMatches, ['.htaccess', path.join('nested', 'index.md'), 'team.jpg'])
        assert.deepStrictEqual(orMatches, ['index.md', 'team.jpg'])
        done()
      })
    })

    it('should include dotfiles, unless specified otherwise', function (done) {
      const m = Metalsmith(fixture('match'))
      m.process(function (err, files) {
        if (err) done(err)
        const matchesAll = m.match('**')
        const matchesNoDot = m.match('**', Object.keys(files), { dot: false })
        assert.deepStrictEqual(matchesAll, ['.htaccess', 'index.md', path.join('nested', 'index.md'), 'team.jpg'])
        assert.deepStrictEqual(matchesNoDot, ['index.md', path.join('nested', 'index.md'), 'team.jpg'])
        done()
      })
    })

    it('should not transform backslashes to forward slashes in the returned matches', function (done) {
      const m = Metalsmith(fixture('match'))
      m.use(function windowsPaths(files) {
        Object.keys(files).forEach((key) => {
          if (key.indexOf('/') === -1) return
          files[key.replace(/\//g, '\\')] = files[key]
          delete files[key]
        })
      }).process(function (err) {
        if (err) done(err)
        const matches = m.match('**/*.md')
        assert.deepStrictEqual(matches, ['index.md', 'nested\\index.md'])
        done()
      })
    })
  })

  describe('#debug', function () {
    it('should allow plugins to use debug instances', function (done) {
      const m = Metalsmith(fixture('basic'))
      const fakeStream = []
      m.debug.colors = true
      m.debug.handle = fileLogHandler({
        write(arg) {
          fakeStream.push(arg)
        }
      })

      m.env('debug', true)
        .use(function plugin(files, m, next) {
          const debug = m.debug('metalsmith:test')
          debug('A log')
          debug.warn('A warning')
          debug.error('An error')
          debug.info('An info')
          next()
        })
        .process(() => {
          assert.deepStrictEqual(fakeStream, [
            '  \x1B[38;5;247;1mmetalsmith:test \x1B[0mA log \x1B[38;5;247m+0ms\x1B[0m\n',
            '  \x1B[38;5;178;1mmetalsmith:test:warn \x1B[0mA warning \x1B[38;5;178m+0ms\x1B[0m\n',
            '  \x1B[38;5;196;1mmetalsmith:test:error \x1B[0mAn error \x1B[38;5;196m+0ms\x1B[0m\n',
            '  \x1B[38;5;51;1mmetalsmith:test:info \x1B[0mAn info \x1B[38;5;51m+0ms\x1B[0m\n'
          ])
          done()
        })
    })

    it('should error when an invalid namespace is passed', function () {
      const m = Metalsmith(fixture('test/tmp'))
      try {
        m.debug(new Error())
      } catch (err) {
        assert.strictEqual(err.code, 'invalid_debugger_namespace')
      }
    })

    it('should error when an invalid namespace is passed', function () {
      const m = Metalsmith(fixture('test/tmp'))
      try {
        m.debug(new Error())
      } catch (err) {
        assert.strictEqual(err.code, 'invalid_debugger_namespace')
      }
    })

    it("should convert metalsmith.env('debug', true) to debug all namespaces", function (done) {
      const m = Metalsmith(fixture('basic'))
      m.debug.colors = true

      let fakeStream
      m.debug.handle = fileLogHandler({
        write(arg) {
          fakeStream = arg
        }
      })
      m.env({
        debug: true
      })
      m.use(function plugin(files, m, next) {
        const debug = m.debug('metalsmith:test')
        debug('A log')
        next()
      }).process((err) => {
        if (err) done(err)
        assert.strictEqual(fakeStream, '  \x1B[38;5;247;1mmetalsmith:test \x1B[0mA log \x1B[38;5;247m+0ms\x1B[0m\n')
        done()
      })
    })

    it("should be disabled when metalsmith.env('debug') === false", function (done) {
      const m = Metalsmith(fixture('basic'))
      let fakeStream = null
      m.debug.handle = fileLogHandler({
        write(arg) {
          fakeStream = arg
        }
      })

      m.env('debug', false)
        .use(function plugin(files, m, next) {
          const debug = m.debug('metalsmith:test')
          debug('A log')
          next()
        })
        .process(() => {
          assert.strictEqual(fakeStream, null)
          done()
        })
    })

    it("should write a log file when metalsmith.env('debug_log') is set to a valid path", function (done) {
      const m = Metalsmith(fixture('debug-log'))

      m.env('debug', true)
        .env('debug_log', fixture('debug-log/metalsmith.log'))
        .use(function plugin(files, m, next) {
          const debug = m.debug('metalsmith:test')
          debug('A log')
          next()
        })
        .build((err) => {
          if (err) {
            done(err)
          } else {
            assert(
              require('fs')
                .readFileSync(fixture('debug-log/metalsmith.log'), 'utf-8')
                .match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z metalsmith:test A log\n/),
              true
            )
            done()
          }
        })
    })

    it("should error when metalsmith.env('debug_log') dir does not exist", function (done) {
      const m = Metalsmith(fixture('debug-log'))

      m.env('debug', true)
        .env('debug_log', fixture('debug-log/inexistant/metalsmith.log'))
        .use(function plugin(files, m, next) {
          const debug = m.debug('metalsmith:test')
          debug('A log')
          next()
        })
        .build((err) => {
          if (err) {
            assert.strictEqual(err.code, 'invalid_logpath')
            assert(err.message.match(/Inexistant directory path ".*" given for DEBUG_LOG/))
            done()
          } else {
            done(new Error('No error was thrown'))
          }
        })
    })

    it('should provide a debug %b formatter', function (done) {
      const m = Metalsmith(fixture('debug-log'))
      let fakeStream = null
      m.debug.handle = fileLogHandler({
        write(arg) {
          fakeStream = arg
        }
      })

      m.env('debug', true)
        .use(function plugin(files, m, next) {
          const debug = m.debug('metalsmith:test')
          debug(
            '%b',
            Buffer.from(
              'We keep referring to Metalsmith as a "static site generator", but it\'s a lot more than that. Since everything is a plugin, the core library is actually just an abstraction for manipulating a directory of files.'
            )
          )
          next()
        })
        .process(() => {
          assert(
            fakeStream.endsWith(
              'We keep referring to Metalsmith as a "static site generator", but it\'s a lot more than that. Since everything is a plugin, the core library is actually just an abstraction for manipulating a directory...\n'
            )
          )
          done()
        })
    })
  })

  describe('#read', function () {
    it('should read from a source directory', function (done) {
      const m = Metalsmith(fixture('read'))
      const stats = fs.statSync(fixture('read/src/index.md'))
      m.read(function (err, files) {
        if (err) return done(err)
        assert.deepEqual(files, {
          'index.md': {
            title: 'A Title',
            contents: Buffer.from('body'),
            mode: stats.mode.toString(8).slice(-4),
            stats: stats
          }
        })
        done()
      })
    })

    it('should only return a promise when callback is omitted', function (done) {
      const m = Metalsmith(fixture('read'))

      assert.strictEqual(
        m.read(() => {}),
        undefined
      )

      const stats = fs.statSync(fixture('read/src/index.md'))
      m.read()
        .then((files) => {
          assert.deepEqual(files, {
            'index.md': {
              title: 'A Title',
              contents: Buffer.from('body'),
              mode: stats.mode.toString(8).slice(-4),
              stats: stats
            }
          })
          done()
        })
        .catch(done)
    })

    it('should traverse a symbolic link to a directory', function (done) {
      // symbolic links are not really a thing on Windows
      if (process.platform === 'win32') {
        this.skip()
      }
      const m = Metalsmith(fixture('read-symbolic-link'))
      const stats = fs.statSync(fixture('read-symbolic-link/src/dir/index.md'))
      m.read(function (err, files) {
        if (err) return done(err)
        assert.deepEqual(files, {
          'dir/index.md': {
            title: 'A Title',
            contents: Buffer.from('body'),
            mode: stats.mode.toString(8).slice(-4),
            stats: stats
          }
        })
        done()
      })
    })

    it('should properly handle broken symbolic links', function (done) {
      // symbolic links are not really a thing on Windows
      if (process.platform === 'win32') {
        this.skip()
      }
      const m = Metalsmith(fixture('read-symbolic-link-broken'))
      const ignored = Metalsmith(fixture('read-symbolic-link-broken')).ignore('dir')

      Promise.all([
        new Promise((resolve, reject) => {
          m.read((err) => {
            resolve(err)
            reject(
              new Error('Metalsmith#read should throw when it encounters a broken symbolic link that is not ignored')
            )
          })
        }),
        new Promise((resolve, reject) => {
          ignored.read((err, files) => {
            resolve(files)
            reject(err)
          })
        })
      ]).then(([regular, ignored]) => {
        assert.strictEqual(regular instanceof Error, true)
        assert.deepStrictEqual(ignored, {})
        done()
      })
    })

    it('should read from a provided directory', function (done) {
      const m = Metalsmith(fixture('read-dir'))
      const stats = fs.statSync(fixture('read-dir/dir/index.md'))
      const dir = fixture('read-dir/dir')
      m.read(dir, function (err, files) {
        if (err) return done(err)
        assert.deepEqual(files, {
          'index.md': {
            title: 'A Title',
            contents: Buffer.from('body'),
            mode: stats.mode.toString(8).slice(-4),
            stats: stats
          }
        })
        done()
      })
    })

    it('should preserve an existing file mode', function (done) {
      const m = Metalsmith(fixture('read-mode'))
      const stats = fs.statSync(fixture('read-mode/src/bin'))
      m.read(function (err, files) {
        if (err) return done(err)
        assert.deepEqual(files, {
          bin: {
            contents: Buffer.from('echo test'),
            mode: stats.mode.toString(8).slice(-4),
            stats: stats
          }
        })
        done()
      })
    })

    it('should expose the stats property in each file metadata', function (done) {
      const m = Metalsmith(fixture('expose-stat'))
      m.read(function (err, files) {
        const file = files['index.md']
        assert(file.stats instanceof fs.Stats)
        done()
      })
    })

    it('should not parse frontmatter if frontmatter is false', function (done) {
      const m = Metalsmith(fixture('read-frontmatter'))
      m.frontmatter(false)
      m.read(function (err, files) {
        if (err) return done(err)
        assert.strictEqual(files['index.md'].thing, undefined)
        done()
      })
    })

    it('should be able to read frontmatter in JSON format', function (done) {
      let files
      Metalsmith(fixture('read-frontmatter'))
        .use((fileObj) => {
          files = fileObj
        })
        .process(function (err) {
          if (err) throw err
          assert.strictEqual(files['json.md'].json, true)
          done()
        })
    })

    it('should handle custom gray-matter frontmatter options', function (done) {
      const toml = require('toml')
      let files
      Metalsmith(fixture('read-frontmatter-custom'))
        .frontmatter({
          engines: {
            toml: toml.parse.bind(toml)
          },
          language: 'toml',
          excerpt_separator: '~~~',
          delimiters: '~~~',
          excerpt: true
        })
        .use((fileObj) => {
          files = fileObj
        })
        .process(function (err) {
          if (err) throw err
          assert.strictEqual(files['index.md'].thing, true)
          assert.strictEqual(files['index.md'].excerpt.trim(), 'An excerpt')
          done()
        })
    })

    it('should still read all when concurrency is set', function (done) {
      const m = Metalsmith('test/fixtures/concurrency')
      m.concurrency(3)
      m.read(function (err, files) {
        if (err) return done(err)
        assert.strictEqual(Object.keys(files).length, 10)
        done()
      })
    })

    it('should ignore the files specified in ignores', function (done) {
      const stats = fs.statSync(path.join(__dirname, 'fixtures/basic/src/index.md'))
      const m = Metalsmith('test/fixtures/basic')
      m.ignore('nested')
      m.read(function (err, files) {
        if (err) return done(err)
        assert.deepEqual(files, {
          'index.md': {
            date: new Date('2013-12-02'),
            title: 'A Title',
            contents: Buffer.from('body'),
            mode: stats.mode.toString(8).slice(-4),
            stats: stats
          }
        })
        done()
      })
    })

    it('should ignore the files specified in function-based ignores', function (done) {
      const stats = fs.statSync(path.join(__dirname, 'fixtures/basic/src/index.md'))
      const m = Metalsmith('test/fixtures/basic')
      m.ignore(function (filepath, stats) {
        return stats.isDirectory() && path.basename(filepath) === 'nested'
      })
      m.read(function (err, files) {
        if (err) return done(err)
        assert.deepEqual(files, {
          'index.md': {
            date: new Date('2013-12-02'),
            title: 'A Title',
            contents: Buffer.from('body'),
            mode: stats.mode.toString(8).slice(-4),
            stats: stats
          }
        })
        done()
      })
    })

    it('should properly handle both path & glob ignore args (relative to Metalsmith.source directory)', function (done) {
      Promise.all([
        new Promise((resolve, reject) => {
          const m = Metalsmith('test/fixtures/ignore-complex')
          m.ignore(['./some_dir'])
          m.read(function (err, files) {
            if (err) return reject(err)
            resolve(files)
          })
        }),
        new Promise((resolve, reject) => {
          const m = Metalsmith('test/fixtures/ignore-complex')
          m.ignore('**/some_dir/**/*.html')
          m.read(function (err, files) {
            if (err) return reject(err)
            resolve(files)
          })
        })
      ])
        .then(([relpathfiles, globfiles]) => {
          assert.strictEqual(Object.keys(relpathfiles).length, 2)
          assert.strictEqual(Object.keys(globfiles).length, 0)
          done()
        })
        .catch(done)
    })
  })

  describe('#readFile', function () {
    it('should read non-absolute files', function (done) {
      const m = Metalsmith(fixture('read'))
      const stats = fs.statSync(fixture('read/src/index.md'))
      const expected = {
        title: 'A Title',
        contents: Buffer.from('body'),
        mode: stats.mode.toString(8).slice(-4),
        stats: stats
      }
      m.readFile('index.md', function (err, file) {
        if (err) return done(err)
        assert.deepEqual(file, expected)
        done()
      })
    })

    it('should error when reading invalid frontmatter', function (done) {
      const m = Metalsmith(fixture('read-invalid-frontmatter'))
      m.frontmatter(true)
      m.readFile('index.md', function (err) {
        assert(err instanceof Error)
        assert(err.code === 'invalid_frontmatter')
        done()
      })
    })

    it('should error when failing to read files', function (done) {
      if (process.platform === 'win32') {
        this.skip()
      }

      fs.chmodSync(path.resolve(fixture('read-failure'), 'chmodded-000.md'), '000')
      const m = Metalsmith(fixture('read-failure'))
      m.readFile('chmodded-000.md', function (err) {
        fs.chmodSync(path.resolve(fixture('read-failure'), 'chmodded-000.md'), '644')
        assert(err instanceof Error)
        assert(err.code === 'failed_read')
        done()
      })
    })

    it('should only return a promise when callback is omitted', function (done) {
      const m = Metalsmith(fixture('read'))

      assert.strictEqual(
        m.readFile('index.md', () => {}),
        undefined
      )

      const stats = fs.statSync(fixture('read/src/index.md'))
      const expected = {
        title: 'A Title',
        contents: Buffer.from('body'),
        mode: stats.mode.toString(8).slice(-4),
        stats: stats
      }
      m.readFile('index.md')
        .then((file) => {
          assert.deepEqual(file, expected)
          done()
        })
        .catch(done)
    })
  })

  describe('#write', function () {
    it('should write to a destination directory', function (done) {
      const m = Metalsmith(fixture('write'))

      assert.strictEqual(
        m.write([], () => {}),
        undefined
      )

      const files = { 'index.md': { contents: Buffer.from('body') } }
      m.write(files)
        .then(() => {
          equal(fixture('write/build'), fixture('write/expected'))
          done()
        })
        .catch(done)
    })

    it('should only return a promise when callback is omitted', function (done) {
      const m = Metalsmith(fixture('write'))
      const files = { 'index.md': { contents: Buffer.from('body') } }
      m.write(files, function (err) {
        if (err) return done(err)
        equal(fixture('write/build'), fixture('write/expected'))
        done()
      })
    })

    it('should write to a provided directory', function (done) {
      const m = Metalsmith(fixture('write-dir'))
      const files = { 'index.md': { contents: Buffer.from('body') } }
      const dir = fixture('write-dir/out')
      m.write(files, dir, function (err) {
        if (err) return done(err)
        equal(fixture('write-dir/out'), fixture('write-dir/expected'))
        done()
      })
    })

    it('should chmod an optional mode from file metadata', function (done) {
      // chmod is not really working on windows https://github.com/nodejs/node-v0.x-archive/issues/4812#issue-11211650
      if (process.platform === 'win32') {
        this.skip()
      }
      const m = Metalsmith(fixture('write-mode'))
      const files = {
        bin: {
          contents: Buffer.from('echo test'),
          mode: '0777'
        }
      }

      m.write(files, function () {
        const stats = fs.statSync(fixture('write-mode/build/bin'))
        const mode = Mode(stats).toOctal()
        assert.strictEqual(mode, '0777')
        done()
      })
    })

    it('should still write all when concurrency is set', function (done) {
      const m = Metalsmith('test/fixtures/concurrency')
      m.concurrency(3)
      m.read(function (err, files) {
        if (err) return done(err)
        m.write(files, function (err) {
          if (err) return done(err)
          equal('test/fixtures/concurrency/build', 'test/fixtures/concurrency/expected')
          done()
        })
      })
    })
  })

  describe('#writeFile', function () {
    it('should write non-absolute files', function (done) {
      const m = Metalsmith(fixture('write-file'))
      const file = 'index.md'
      const data = { contents: Buffer.from('body') }

      const expected = fixture('write-file/expected')

      m.writeFile(file, data, function (err) {
        if (err) return done(err)
        equal(fixture('write-file/build'), expected)
        assert.strictEqual(
          fs.readFileSync(fixture('write-file/build/index.md'), 'utf8'),
          fs.readFileSync(fixture('write-file/expected/index.md'), 'utf8')
        )
        done()
      })
    })

    it('should only return a promise when callback is omitted', function (done) {
      const m = Metalsmith(fixture('write-file'))
      const file = 'index.md'
      const data = { contents: Buffer.from('body') }

      assert.strictEqual(
        m.writeFile(file, data, () => {}),
        undefined
      )

      const expected = fixture('write-file/expected')

      m.writeFile(file, data)
        .then(() => {
          equal(fixture('write-file/build'), expected)
          assert.strictEqual(
            fs.readFileSync(fixture('write-file/build/index.md'), 'utf8'),
            fs.readFileSync(fixture('write-file/expected/index.md'), 'utf8')
          )
          done()
        })
        .catch(done)
    })

    it('should error on write failure', function (done) {
      // chmodded files are unpredictable at best on Windows
      if (process.platform === 'win32') {
        this.skip()
      }
      fs.chmodSync(path.resolve(fixture('write-failure'), 'unwritable'), '555')
      const m = Metalsmith(fixture('write-failure')).destination('unwritable/build')
      m.writeFile('index.md', { contents: Buffer.from('test') }, function (err) {
        fs.chmodSync(path.resolve(fixture('write-failure'), 'unwritable'), '755')
        assert(err instanceof Error)
        assert(err.code === 'failed_write')
        done()
      })
    })
  })

  describe('#run', function () {
    it('should only return a promise when callback is omitted', function (done) {
      const m = Metalsmith(fixture('test/tmp'))
      m.use(plugin)

      function plugin(files, metalsmith, done) {
        assert.strictEqual(files.one, 'one')
        assert.strictEqual(m, metalsmith)
        assert.strictEqual(typeof done, 'function')
        files.two = 'two'
        done()
      }

      assert.strictEqual(
        m.run({ one: 'one' }, () => {}),
        undefined
      )

      m.run({ one: 'one' })
        .then((files) => {
          assert.strictEqual(files.one, 'one')
          assert.strictEqual(files.two, 'two')
          done()
        })
        .catch(done)
    })

    it('should apply a plugin', function (done) {
      const m = Metalsmith('test/tmp')
      m.use(plugin)
      m.run({ one: 'one' }, function (err, files) {
        assert.strictEqual(files.one, 'one')
        assert.strictEqual(files.two, 'two')
        done()
      })

      function plugin(files, metalsmith, done) {
        assert.strictEqual(files.one, 'one')
        assert.strictEqual(m, metalsmith)
        assert.strictEqual(typeof done, 'function')
        files.two = 'two'
        done()
      }
    })

    it('should run with a provided plugin', function (done) {
      const m = Metalsmith('test/tmp')
      m.run({ one: 'one' }, [plugin], function (err, files) {
        assert.strictEqual(files.one, 'one')
        assert.strictEqual(files.two, 'two')
        done()
      })

      function plugin(files, metalsmith, done) {
        assert.strictEqual(files.one, 'one')
        assert.strictEqual(m, metalsmith)
        assert.strictEqual(typeof done, 'function')
        files.two = 'two'
        done()
      }
    })

    it('should support synchronous plugins', function (done) {
      const m = Metalsmith('test/tmp')
      m.use(plugin)
      m.run({ one: 'one' }, function (err, files) {
        assert.strictEqual(files.one, 'one')
        assert.strictEqual(files.two, 'two')
        done()
      })

      function plugin(files, metalsmith) {
        assert.strictEqual(files.one, 'one')
        assert.strictEqual(m, metalsmith)
        files.two = 'two'
      }
    })
  })

  describe('#process', function () {
    it('should only return a promise when callback is omitted', function (done) {
      const m = Metalsmith(fixture('basic'))

      assert.strictEqual(
        m.process(() => {}),
        undefined
      )

      m.process()
        .then((files) => {
          assert.strictEqual(typeof files, 'object')
          assert.strictEqual(typeof files['index.md'], 'object')
          assert.strictEqual(files['index.md'].title, 'A Title')
          assert.strictEqual(typeof files[path.join('nested', 'index.md')], 'object')
          done()
        })
        .catch(done)
    })
    it('should return files object with no plugins', function (done) {
      Metalsmith(fixture('basic')).process(function (err, files) {
        if (err) return done(err)
        assert.strictEqual(typeof files, 'object')
        assert.strictEqual(typeof files['index.md'], 'object')
        assert.strictEqual(files['index.md'].title, 'A Title')
        assert.strictEqual(typeof files[path.join('nested', 'index.md')], 'object')
        done()
      })
    })
    it('should apply a plugin', function (done) {
      Metalsmith(fixture('basic-plugin'))
        .use(function (files, metalsmith, done) {
          Object.keys(files).forEach(function (file) {
            const data = files[file]
            data.contents = Buffer.from(data.title)
          })
          done()
        })
        .process(function (err, files) {
          if (err) return done(err)
          assert.strictEqual(typeof files, 'object')
          assert.strictEqual(Object.keys(files).length, 2)
          assert.strictEqual(typeof files['one.md'], 'object')
          assert.strictEqual(files['one.md'].title, 'one')
          assert.strictEqual(files['one.md'].contents.toString('utf8'), 'one')
          assert.strictEqual(typeof files['two.md'], 'object')
          assert.strictEqual(files['two.md'].title, 'two')
          assert.strictEqual(files['two.md'].contents.toString('utf8'), 'two')
          done()
        })
    })
  })

  describe('#build', function () {
    it('should do a basic copy with no plugins', function (done) {
      Metalsmith(fixture('basic')).build(function (err, files) {
        if (err) return done(err)
        assert.strictEqual(typeof files, 'object')
        equal(fixture('basic/build'), fixture('basic/expected'))
        done()
      })
    })

    it('should return a promise only when callback is omitted', function (done) {
      const m = Metalsmith(fixture('basic'))

      //2 builds on the same metalsmith instance have to be executed sequentially in order not to create race conditions
      const promiseReturnValue = m
        .build()
        .then(
          () =>
            new Promise((resolve, reject) => {
              const returnValue = m.build((err) => {
                if (err) reject(err)
                resolve(returnValue)
              })
            })
        )
        .then((callbackReturnValue) => {
          assert.strictEqual(typeof callbackReturnValue, 'undefined')
          assert(promiseReturnValue instanceof Promise)
          done()
        })
        .catch(done)
    })

    it('should execute a callback if one is supplied', function (done) {
      Metalsmith(fixture('basic')).build((err, files) => {
        assert.strictEqual(typeof files, 'object')
        done()
      })
    })

    it('should return errors in the build callback/.catch', function (done) {
      Metalsmith(fixture('inexistant-source-dir')).build((err) => {
        assert(err instanceof Error)
        done()
      })
    })

    it('should preserve binary files', function (done) {
      Metalsmith(fixture('basic-images')).build(function (err, files) {
        if (err) return done(err)
        assert.strictEqual(typeof files, 'object')
        equal(fixture('basic-images/build'), fixture('basic-images/expected'))
        done()
      })
    })

    it('should apply a plugin', function (done) {
      Metalsmith(fixture('basic-plugin'))
        .use(function (files, metalsmith, done) {
          Object.keys(files).forEach(function (file) {
            const data = files[file]
            data.contents = Buffer.from(data.title)
          })
          done()
        })
        .build(function (err) {
          if (err) return done(err)
          equal(fixture('basic-plugin/build'), fixture('basic-plugin/expected'))
          done()
        })
    })

    it('should remove an existing destination directory', function (done) {
      const m = Metalsmith(fixture('build'))
      const cmd = 'touch test/fixtures/build/build/empty.md' + ' test/fixtures/build/build/.dotfile'
      rm(fixture('build/build')).then((err) => {
        if (err) return done(err)
        fs.mkdirSync(fixture('build/build'))
        exec(cmd, function (err) {
          if (err) return done(err)
          m.build(function (err) {
            if (err) return done(err)
            equal(fixture('build/build'), fixture('build/expected'), {
              filter: function () {
                return true
              }
            })
            done()
          })
        })
      })
    })

    it('should not remove existing destination directory if clean is false', function (done) {
      const dir = path.join('test', 'fixtures', 'build-noclean', 'build')
      const cmd =
        process.platform === 'win32'
          ? 'if not exist ' + dir + ' mkdir ' + dir + ' & type NUL > ' + dir + '\\empty.md'
          : 'mkdir -p ' + dir + ' && touch ' + dir + '/empty.md'
      const m = Metalsmith(fixture('build-noclean'))
      m.clean(false)
      exec(cmd, function (err) {
        if (err) return done(err)
        m.build(function (err) {
          if (err) return done(err)
          equal(fixture('build-noclean/build'), fixture('build-noclean/expected'))
          done()
        })
      })
    })
  })
})

describe('CLI', function () {
  const bin = 'node ' + path.resolve(__dirname, '../bin/metalsmith')

  describe('build', function () {
    it('should error without a metalsmith.json', function (done) {
      const expected = "could not find configuration file 'metalsmith.json'."
      exec(bin, { cwd: fixture('cli-no-config') }, function (err) {
        assert(err)
        assert(err.message.slice(-expected.length), expected)
        done()
      })
    })

    it('should grab config from metalsmith.json', function (done) {
      exec(bin, { cwd: fixture('cli-json') }, function (err, stdout) {
        if (err) return done(err)
        equal(fixture('cli-json/destination'), fixture('cli-json/expected'))
        assert(~stdout.indexOf('successfully built to '))
        assert(~stdout.indexOf(fixture('cli-json/destination')))
        done()
      })
    })

    it('should grab config from a config.json', function (done) {
      exec(bin + ' -c config.json', { cwd: fixture('cli-other-config') }, function (err, stdout) {
        if (err) return done(err)
        equal(fixture('cli-other-config/destination'), fixture('cli-other-config/expected'))
        assert(~stdout.indexOf('successfully built to '))
        assert(~stdout.indexOf(fixture('cli-other-config/destination')))
        done()
      })
    })

    it('should grab config from <configname>.(c|m)js', function (done) {
      // below tests belong together, they need to be sequential because they operate on the same dirs
      new Promise((resolve, reject) => {
        exec(bin, { cwd: fixture('cli-js') }, function (err, stdout) {
          if (err) reject(err)
          try {
            equal(fixture('cli-js/destination'), fixture('cli-js/expected'))
            assert(~stdout.indexOf('successfully built to '))
            assert(~stdout.indexOf(fixture('cli-js/destination')))
          } catch (err) {
            reject(err)
          }
          resolve()
        })
      })
        .then(
          () =>
            new Promise((resolve, reject) => {
              exec(bin + ' -c config.cjs', { cwd: fixture('cli-js') }, function (err, stdout) {
                if (err) reject(err)
                try {
                  equal(fixture('cli-js/destination'), fixture('cli-js/expected'))
                  assert(~stdout.indexOf('successfully built to '))
                  assert(~stdout.indexOf(fixture('cli-js/destination')))
                } catch (err) {
                  reject(err)
                }
                resolve()
              })
            })
        )
        .then(
          () =>
            new Promise((resolve, reject) => {
              exec(bin + ' -c other-config.cjs', { cwd: fixture('cli-js') }, function (err, stdout) {
                if (err) reject(err)
                try {
                  equal(fixture('cli-js/destination'), fixture('cli-js/expected'))
                  assert(~stdout.indexOf('successfully built to '))
                  assert(~stdout.indexOf(fixture('cli-js/destination')))
                } catch (err) {
                  reject(err)
                }
                resolve()
              })
            })
        )
        // support Metalsmith instance exports
        .then(
          () =>
            new Promise((resolve, reject) => {
              exec(bin + ' -c metalsmith-instance.js', { cwd: fixture('cli-js') }, function (err, stdout) {
                if (err) reject(err)
                try {
                  equal(fixture('cli-js/destination'), fixture('cli-js/expected'))
                  assert(~stdout.indexOf('from instance'))
                  assert(~stdout.indexOf(fixture('cli-js/destination')))
                } catch (err) {
                  reject(err)
                }
                resolve()
              })
            })
        )
        // support .mjs CLI-style configs
        .then(
          () =>
            new Promise((resolve, reject) => {
              exec(bin + ' -c config.mjs', { cwd: fixture('cli-js') }, function (err, stdout) {
                if (err) reject(err)
                try {
                  equal(fixture('cli-js/destination'), fixture('cli-js/expected'))
                  assert(~stdout.indexOf('successfully built to '))
                  assert(~stdout.indexOf(fixture('cli-js/destination')))
                } catch (err) {
                  reject(err)
                }
                resolve()
              })
            })
        )
        // support ESM Metalsmith instance exports
        .then(
          () =>
            new Promise((resolve, reject) => {
              exec(bin + ' -c metalsmith-instance.mjs', { cwd: fixture('cli-js') }, function (err, stdout) {
                if (err) reject(err)
                try {
                  equal(fixture('cli-js/destination'), fixture('cli-js/expected'))
                  assert(~stdout.indexOf('successfully built to '))
                  assert(~stdout.indexOf(fixture('cli-js/destination')))
                } catch (err) {
                  reject(err)
                }
                resolve()
              })
            })
        )
        .then(done)
        .catch(done)
    })

    it('should require a plugin', function (done) {
      exec(bin, { cwd: fixture('cli-plugin-object') }, function (err, stdout) {
        if (err) return done(err)
        equal(fixture('cli-plugin-object/build'), fixture('cli-plugin-object/expected'))
        assert(~stdout.indexOf('successfully built to '))
        assert(~stdout.indexOf(fixture('cli-plugin-object/build')))
        done()
      })
    })

    it('should require plugins as an array', function (done) {
      exec(bin, { cwd: fixture('cli-plugin-array') }, function (err, stdout) {
        if (err) return done(err)
        equal(fixture('cli-plugin-array/build'), fixture('cli-plugin-array/expected'))
        assert(~stdout.indexOf('successfully built to '))
        assert(~stdout.indexOf(fixture('cli-plugin-array/build')))
        done()
      })
    })

    it('should error when failing to require a plugin', function (done) {
      exec(bin, { cwd: fixture('cli-no-plugin') }, function (err) {
        assert(err)
        assert(~err.message.indexOf('failed to require plugin "metalsmith-non-existant".'))
        done()
      })
    })

    it('should error when failing to use a plugin', function (done) {
      exec(bin, { cwd: fixture('cli-broken-plugin') }, function (err) {
        assert(err)
        assert(~err.message.indexOf('error using plugin "./plugin"...'))
        assert(~err.message.indexOf('Break!'))
        assert(~err.message.indexOf('at module.exports'))
        done()
      })
    })

    it('should allow requiring a local plugin', function (done) {
      exec(bin, { cwd: fixture('cli-plugin-local') }, function (err, stdout) {
        equal(fixture('cli-plugin-local/build'), fixture('cli-plugin-local/expected'))
        assert(~stdout.indexOf('successfully built to '))
        assert(~stdout.indexOf(fixture('cli-plugin-local/build')))
        done()
      })
    })

    it('should support the env method', function (done) {
      exec(bin, { cwd: fixture('cli-env'), env: { ...process.env, NODE_ENV: 'development' } }, function (err, stdout) {
        equal(fixture('cli-env/build'), fixture('cli-env/expected'))
        assert(~stdout.indexOf('successfully built to '))
        assert(~stdout.indexOf(fixture('cli-env/build')))
        done()
      })
    })

    it('should work when run from a directory that is not Metalsmith#directory', function (done) {
      exec(bin, { cwd: fixture('cli-from-unexpected-folder') }, function (err, stdout) {
        equal(fixture('cli-from-unexpected-folder/build'), fixture('cli-from-unexpected-folder/expected'))
        assert(~stdout.indexOf('successfully built to '))
        assert(~stdout.indexOf(fixture('cli-from-unexpected-folder/build')))
        done()
      })
    })

    it('should not output a build when the --dry-run option is used', function (done) {
      exec(`${bin} --dry-run`, { cwd: fixture('cli-dry-run') }, function (err) {
        assert.strictEqual(err, null)
        fs.stat(fixture('cli-dry-run/build'), (err) => {
          assert.strictEqual(err.code, 'ENOENT')
          done()
        })
      })
    })

    it('should override metalsmith.json env vars when resp. --env vars are provided', function (done) {
      exec(`${bin} --env NODE_ENV=development`, { cwd: fixture('cli-debug') }, function (err, stdout) {
        const match = stdout.split('\n')[0]
        assert.strictEqual(match, '{"DEBUG":false,"NODE_ENV":"development","CLI":true}')
        done()
      })
    })

    it('should override metalsmith.json and --env DEBUG env var when --debug option is used', function (done) {
      exec(
        `${bin} --env DEBUG= --debug @metalsmith/markdown`,
        { cwd: fixture('cli-debug') },
        function (err, stdout, stderr) {
          assert(~stderr.indexOf('@metalsmith/markdown:info Rendering file "index.md" as "index.html"'))
          done()
        }
      )
    })
  })
})
