
var assert = require('assert')
var equal = require('assert-dir-equal')
var exec = require('child_process').exec
var fs = require('fs')
var Metalsmith = require('..')
var Mode = require('stat-mode')
var noop = function(){}
var path = require('path')
var rm = require('rimraf').sync
var fixture = path.resolve.bind(path, __dirname, 'fixtures')


/* Use `Buffer.from` whenever possible.
 * See:
 *    - https://nodejs.org/api/buffer.html#buffer_new_buffer_string_encoding
 *    - https://nodejs.org/api/buffer.html#buffer_class_method_buffer_from_string_encoding
 */
function getBuffer(arg) {
  if (Buffer.hasOwnProperty('from')){
    return Buffer.from(arg)
  }
  return new Buffer(arg)
}

describe('Metalsmith', function(){
  beforeEach(function(){
    rm('test/tmp')
  })

  it('should expose a constructor', function(){
    assert.equal(typeof Metalsmith, 'function')
  })

  it('should not require the `new` keyword', function(){
    var m = Metalsmith('test/tmp')
    assert(m instanceof Metalsmith)
  })

  it('should error without a working directory', function(){
    assert.throws(function(){
      Metalsmith()
    }, /You must pass a working directory path\./)
  })

  it('should use `./src` as a default source directory', function(){
    var m = Metalsmith('test/tmp')
    assert.equal(m._source, 'src')
  })

  it('should use `./build` as a default destination directory', function(){
    var m = Metalsmith('test/tmp')
    assert.equal(m._destination, 'build')
  })

  it('should default clean to `true`', function(){
    var m = Metalsmith('test/tmp')
    assert.equal(m._clean, true)
  })

  describe('#use', function(){
    it('should add a plugin to the plugins stack', function(){
      var m = Metalsmith('test/tmp')
      m.use(noop)
      assert.equal(m.plugins.length, 1)
    })
  })

  describe('#ignore', function(){
    it('should add an ignore file to the internal ignores list', function(){
      var m = Metalsmith('test/tmp')
      m.ignore('dirfile')
      assert(1 == m.ignores.length)
    })

    it('should return the ignore list without arguments', function() {
      var m = Metalsmith('test/tmp')
      m.ignore('dirfile')
      assert(m.ignore()[0] === 'dirfile')
    })
  })

  describe('#directory', function(){
    it('should set a working directory', function(){
      var m = Metalsmith('test/tmp')
      m.directory('dir')
      assert.equal(m._directory, 'dir')
    })

    it('should get the working directory', function(){
      var m = Metalsmith('test/tmp')
      assert(~m.directory().indexOf(path.sep + path.join('test', 'tmp')))
    })

    it('should be able to be absolute', function(){
      var m = Metalsmith('test/tmp')
      m.directory('/dir')
      assert.equal(m.directory(), path.resolve('/dir'))
    })

    it('should error on non-string', function(){
      var m = Metalsmith('test/tmp')
      assert.throws(function(){
        m.directory(0)
      })
    })
  })

  describe('#source', function(){
    it('should set a source directory', function(){
      var m = Metalsmith('test/tmp')
      m.source('dir')
      assert.equal(m._source, 'dir')
    })

    it('should get the full path to the source directory', function(){
      var m = Metalsmith('test/tmp')
      assert(~m.source().indexOf(path.resolve(path.join('test', 'tmp', 'src'))))
    })

    it('should be able to be absolute', function(){
      var m = Metalsmith('test/tmp')
      m.source('/dir')
      assert.equal(m.source(), path.resolve('/dir'))
    })

    it('should error on non-string', function(){
      var m = Metalsmith('test/tmp')
      assert.throws(function(){
        m.source(0)
      })
    })
  })

  describe('#destination', function(){
    it('should set a destination directory', function(){
      var m = Metalsmith('test/tmp')
      m.destination('dir')
      assert.equal(m._destination, 'dir')
    })

    it('should get the full path to the destination directory', function(){
      var m = Metalsmith('test/tmp')
      assert(~m.destination().indexOf(path.join('test', 'tmp', 'build')))
    })

    it('should be able to be absolute', function(){
      var m = Metalsmith('test/tmp')
      m.destination('/dir')
      assert.equal(m.destination(), path.resolve('/dir'))
    })

    it('should error on non-string', function(){
      var m = Metalsmith('test/tmp')
      assert.throws(function(){
        m.destination(0)
      })
    })
  })

  describe('#concurrency', function(){
    it('should set a max number for concurrency', function(){
      var m = Metalsmith('test/tmp')
      m.concurrency(15)
      assert.equal(m._concurrency, 15)
    })

    it('should get the max number for concurrency', function(){
      var m = Metalsmith('test/tmp')
      m.concurrency(25)
      assert.equal(m.concurrency(), 25)
    })

    it('should be infinitely concurrent by default', function(){
      var m = Metalsmith('test/tmp')
      assert.equal(m.concurrency(), Infinity)
    })

    it('should error on non-number', function() {
      var m = Metalsmith('test/tmp')
      var badArgs = [NaN, 'hi', process, false, '1', '2', '3']
      badArgs.forEach( function(bad) {
        assert.throws(function() {
          m.concurrency(bad),
          TypeError
        })
      })
    })

  })

  describe('#clean', function(){
    it('should set the clean option', function(){
      var m = Metalsmith('test/tmp')
      m.clean(false)
      assert.equal(m._clean, false)
    })

    it('should get the value of the clean option', function(){
      var m = Metalsmith('test/tmp')
      assert.equal(m.clean(), true)
    })

    it('should error on non-boolean', function(){
      var m = Metalsmith('test/tmp')
      assert.throws(function(){
        m.clean(0)
      })
    })
  })

  describe('#frontmatter', function(){
    it('should set the frontmatter option', function(){
      var m = Metalsmith('test/tmp')
      m.frontmatter(false)
      assert.equal(m._frontmatter, false)
    })

    it('should get the value of the frontmatter option', function(){
      var m = Metalsmith('test/tmp')
      assert(m.frontmatter(), true)
    })

    it('should error on non-boolean', function(){
      var m = Metalsmith('test/tmp')
      assert.throws(function(){
        m.frontmatter(0)
      })
    })
  })

  describe('#metadata', function(){
    it('should get metadata', function(){
      var m = Metalsmith('test/tmp')
      assert.deepEqual(m.metadata(), {})
    })

    it('should set a clone of metadata', function(){
      var m = Metalsmith('test/tmp')
      var data = { property: true }
      m.metadata(data)
      assert.notEqual(m.metadata(), data)
      assert.deepEqual(m.metadata(), data)
    })

    it('should error on non-object', function(){
      var m = Metalsmith('test/tmp')
      assert.throws(function(){
        m.metadata(0)
      })
    })
  })

  describe('#path', function(){
    it('should return a path relative to the working directory', function(){
      var m = Metalsmith('test/tmp')
      var actualPath = m.path('one', 'two', 'three')
      assert(~actualPath.indexOf(path.resolve('test/tmp/one/two/three')))
    })
  })

  describe('#read', function(){
    it('should read from a source directory', function(done){
      var m = Metalsmith(fixture('read'))
      var stats = fs.statSync(fixture('read/src/index.md'))
      m.read(function(err, files){
        if (err) return done(err)
        assert.deepEqual(files, {
          'index.md': {
            title: 'A Title',
            contents: getBuffer('body'),
            mode: stats.mode.toString(8).slice(-4),
            stats: stats
          }
        })
        done()
      })
    })

    it('should traverse a symbolic link to a directory', function(done){
      // symbolic links are not really a thing on Windows
      if (process.platform === 'win32') { this.skip() }
      var m = Metalsmith(fixture('read-symbolic-link'))
      var stats = fs.statSync(fixture('read-symbolic-link/src/dir/index.md'))
      m.read(function(err, files){
        if (err) return done(err)
        assert.deepEqual(files, {
          'dir/index.md': {
            title: 'A Title',
            contents: getBuffer('body'),
            mode: stats.mode.toString(8).slice(-4),
            stats: stats
          }
        })
        done()
      })
    })

    it('should read from a provided directory', function(done){
      var m = Metalsmith(fixture('read-dir'))
      var stats = fs.statSync(fixture('read-dir/dir/index.md'))
      var dir = fixture('read-dir/dir')
      m.read(dir, function(err, files){
        if (err) return done(err)
        assert.deepEqual(files, {
          'index.md': {
            title: 'A Title',
            contents: getBuffer('body'),
            mode: stats.mode.toString(8).slice(-4),
            stats: stats
          }
        })
        done()
      })
    })

    it('should preserve an existing file mode', function(done){
      var m = Metalsmith(fixture('read-mode'))
      var stats = fs.statSync(fixture('read-mode/src/bin'))
      m.read(function(err, files){
        if (err) return done(err)
        assert.deepEqual(files, {
          'bin': {
            contents: getBuffer('echo test'),
            mode: stats.mode.toString(8).slice(-4),
            stats: stats
          }
        })
        done()
      })
    })

    it('should expose the stats property in each file metadata', function(done){
      var m = Metalsmith(fixture('expose-stat'))
      m.read(function(err, files) {
        var file = files['index.md']
        assert(file.stats instanceof fs.Stats)
        done()
      })
    })

    it('should not parse frontmatter if frontmatter is false', function(done){
      var m = Metalsmith(fixture('read-frontmatter'))
      m.frontmatter(false)
      m.read(function(err, files){
        if (err) return done(err)
        assert.equal(files['index.md'].thing, undefined)
        done()
      })
    })

    it('should still read all when concurrency is set', function(done){
      var m = Metalsmith('test/fixtures/concurrency')
      m.concurrency(3)
      m.read(function(err, files){
        if (err) return done(err)
        assert.equal(Object.keys(files).length, 10)
        done()
      })
    })

    it('should ignore the files specified in ignores', function(done){
      var stats = fs.statSync(path.join(__dirname, 'fixtures/basic/src/index.md'))
      var m = Metalsmith('test/fixtures/basic')
      m.ignore('nested')
      m.read(function(err, files){
        if (err) return done(err)
        assert.deepEqual(files, {
          'index.md': {
            date: new Date('2013-12-02'),
            title: 'A Title',
            contents: getBuffer('body'),
            mode: stats.mode.toString(8).slice(-4),
            stats: stats
          }
        })
        done()
      })
    })


    it('should ignore the files specified in function-based ignores', function(done){
      var stats = fs.statSync(path.join(__dirname, 'fixtures/basic/src/index.md'))
      var m = Metalsmith('test/fixtures/basic')
      m.ignore(function(filepath, stats) {
        return stats.isDirectory() && path.basename(filepath) === 'nested'
      })
      m.read(function(err, files){
        if (err) return done(err)
        assert.deepEqual(files, {
          'index.md': {
            date: new Date('2013-12-02'),
            title: 'A Title',
            contents: getBuffer('body'),
            mode: stats.mode.toString(8).slice(-4),
            stats: stats
          }
        })
        done()
      })
    })
  })

  describe('#readFile', function() {

    it('should read non-absolute files', function(done) {
      var m = Metalsmith(fixture('read'))
      var stats = fs.statSync(fixture('read/src/index.md'))
      var expected = {
        title: 'A Title',
        contents: getBuffer('body'),
        mode: stats.mode.toString(8).slice(-4),
        stats: stats
      }
      m.readFile('index.md', function(err, file) {
        if (err) return done(err)
        assert.deepEqual(file, expected)
        done()
      })
    })

    it('should error when reading invalid frontmatter', function(done) {
      var m = Metalsmith(fixture('read-invalid-frontmatter'))
      m.frontmatter(true)
      m.readFile('index.md', function(err, file) {
        if (err) {
          assert(err instanceof Error)
          assert.throws(
            function () { throw err },
            /invalid frontmatter/i
          )
          return file
        }
        throw new Error('This should not execute!')
      })
      done()
    })
  })

  describe('#write', function(){
    it('should write to a destination directory', function(done){
      var m = Metalsmith(fixture('write'))
      var files = { 'index.md': { contents: getBuffer('body') }}
      m.write(files, function(err){
        if (err) return done(err)
        equal(fixture('write/build'), fixture('write/expected'))
        done()
      })
    })

    it('should write to a provided directory', function(done){
      var m = Metalsmith(fixture('write-dir'))
      var files = { 'index.md': { contents: getBuffer('body') }}
      var dir = fixture('write-dir/out')
      m.write(files, dir, function(err){
        if (err) return done(err)
        equal(fixture('write-dir/out'), fixture('write-dir/expected'))
        done()
      })
    })

    it('should chmod an optional mode from file metadata', function(done){
      // chmod is not really working on windows https://github.com/nodejs/node-v0.x-archive/issues/4812#issue-11211650
      if (process.platform === 'win32') { this.skip() }
      var m = Metalsmith(fixture('write-mode'))
      var files = {
        'bin': {
          contents: getBuffer('echo test'),
          mode: '0777'
        }
      }

      m.write(files, function(err){
        var stats = fs.statSync(fixture('write-mode/build/bin'))
        var mode = Mode(stats).toOctal()
        assert.equal(mode, '0777')
        done()
      })
    })

    it('should still write all when concurrency is set', function(done){
      var m = Metalsmith('test/fixtures/concurrency')
      m.read(function(err, files){
        if (err) return done(err)
        m.write(files, function(err){
          if (err) return done(err)
          equal('test/fixtures/concurrency/build', 'test/fixtures/concurrency/expected')
          done()
        })
      })
    })
  })

  describe('#writeFile', function() {
    it('should write non-absolute files', function(done) {
      var m = Metalsmith(fixture('write-file'))
      var file = 'index.md'
      var data = { contents: getBuffer('body') }

      var expected = fixture('write-file/expected')

      m.writeFile(file, data, function(err) {
        if (err) return done(err)
        equal(fixture('write-file/build'), expected)
        assert.equal(
          fs.readFileSync(fixture('write-file/build/index.md'),    'utf8'),
          fs.readFileSync(fixture('write-file/expected/index.md'), 'utf8')
        )
        done()
      })
    })
  })

  describe('#run', function(){
    it('should apply a plugin', function(done){
      var m = Metalsmith('test/tmp')
      m.use(plugin)
      m.run({ one: 'one' }, function(err, files, metalsmith){
        assert.equal(files.one, 'one')
        assert.equal(files.two, 'two')
        done()
      })

      function plugin(files, metalsmith, done){
        assert.equal(files.one, 'one')
        assert.equal(m, metalsmith)
        assert.equal(typeof done, 'function')
        files.two = 'two'
        done()
      }
    })

    it('should run with a provided plugin', function(done){
      var m = Metalsmith('test/tmp')
      m.run({ one: 'one' }, [plugin], function(err, files, metalsmith){
        assert.equal(files.one, 'one')
        assert.equal(files.two, 'two')
        done()
      })

      function plugin(files, metalsmith, done){
        assert.equal(files.one, 'one')
        assert.equal(m, metalsmith)
        assert.equal(typeof done, 'function')
        files.two = 'two'
        done()
      }
    })

    it('should support synchronous plugins', function(done){
      var m = Metalsmith('test/tmp')
      m.use(plugin)
      m.run({ one: 'one' }, function(err, files, metalsmith){
        assert.equal(files.one, 'one')
        assert.equal(files.two, 'two')
        done()
      })

      function plugin(files, metalsmith){
        assert.equal(files.one, 'one')
        assert.equal(m, metalsmith)
        files.two = 'two'
      }
    })
  })

  describe('#process', function(){
    it('should return files object with no plugins', function(done){
      Metalsmith(fixture('basic'))
        .process(function(err, files){
          if (err) return done(err)
          assert.equal(typeof files, 'object')
          assert.equal(typeof files['index.md'], 'object')
          assert.equal(files['index.md'].title, 'A Title')
          assert.equal(typeof files[path.join('nested', 'index.md')], 'object')
          done()
        })
    })
    it('should apply a plugin', function(done){
      Metalsmith(fixture('basic-plugin'))
        .use(function(files, metalsmith, done){
          Object.keys(files).forEach(function(file){
            var data = files[file]
            data.contents = getBuffer(data.title)
          })
          done()
        })
        .process(function(err, files){
          if (err) return done(err)
          assert.equal(typeof files, 'object')
          assert.equal(Object.keys(files).length, 2)
          assert.equal(typeof files['one.md'], 'object')
          assert.equal(files['one.md'].title, 'one')
          assert.equal(files['one.md'].contents.toString('utf8'), 'one')
          assert.equal(typeof files['two.md'], 'object')
          assert.equal(files['two.md'].title, 'two')
          assert.equal(files['two.md'].contents.toString('utf8'), 'two')
          done()
        })
    })
  })

  describe('#build', function(){
    it('should do a basic copy with no plugins', function(done){
      Metalsmith(fixture('basic'))
        .build(function(err, files){
          if (err) return done(err)
          assert.equal(typeof files, 'object')
          equal(fixture('basic/build'), fixture('basic/expected'))
          done()
        })
    })

    it('should preserve binary files', function(done){
      Metalsmith(fixture('basic-images'))
        .build(function(err, files){
          if (err) return done(err)
          assert.equal(typeof files, 'object')
          equal(fixture('basic-images/build'), fixture('basic-images/expected'))
          done()
        })
    })

    it('should apply a plugin', function(done){
      Metalsmith(fixture('basic-plugin'))
        .use(function(files, metalsmith, done){
          Object.keys(files).forEach(function(file){
            var data = files[file]
            data.contents = getBuffer(data.title)
          })
          done()
        })
        .build(function(err){
          if (err) return done(err)
          equal(fixture('basic-plugin/build'), fixture('basic-plugin/expected'))
          done()
        })
    })

    it('should remove an existing destination directory', function(done){
      var m = Metalsmith(fixture('build'))
      var cmd =
        'touch test/fixtures/build/build/empty.md' +
        ' test/fixtures/build/build/.dotfile'
      rm(fixture('build/build'), { glob: { dot: true } })
      fs.mkdirSync(fixture('build/build'))
      exec(cmd, function (err) {
        if (err) return done(err)
        m.build(function(err){
          if (err) return done(err)
          equal(fixture('build/build'), fixture('build/expected'), {
            filter: function () { return true }
          })
          done()
        })
      })
    })

    it('should not remove existing destination directory if clean is false', function(done){
      var dir = path.join('test', 'fixtures', 'build-noclean', 'build')
      var cmd = process.platform === 'win32'
        ? 'if not exist ' + dir + ' mkdir ' + dir + ' & type NUL > ' + dir + '\\empty.md'
        : 'mkdir -p ' + dir + ' && touch ' + dir + '/empty.md'
      var m = Metalsmith(fixture('build-noclean'))
      m.clean(false)
      exec(cmd, function(err){
        if (err) return done(err)
        m.build(function(err){
          if (err) return done(err)
          equal(fixture('build-noclean/build'), fixture('build-noclean/expected'))
          done()
        })
      })
    })

  })
})

describe('CLI', function(){
  var bin = 'node ' + path.resolve(__dirname, '../bin/metalsmith')

  describe('build', function(){
    it('should error without a metalsmith.json', function(done){
      exec(bin, { cwd: fixture('cli-no-config') }, function(err, stdout){
        assert(err)
        assert(~err.message.indexOf('could not find a metalsmith.json configuration file.'))
        done()
      })
    })

    it('should grab config from metalsmith.json', function(done){
      exec(bin, { cwd: fixture('cli-json') }, function(err, stdout){
        if (err) return done(err)
        equal(fixture('cli-json/destination'), fixture('cli-json/expected'))
        assert(~stdout.indexOf('successfully built to '))
        assert(~stdout.indexOf(fixture('cli-json/destination')))
        done()
      })
    })

    it('should grab config from a config.json', function(done){
      exec(bin + ' -c config.json', { cwd: fixture('cli-other-config') }, function(err, stdout){
        if (err) return done(err)
        equal(fixture('cli-other-config/destination'), fixture('cli-other-config/expected'))
        assert(~stdout.indexOf('successfully built to '))
        assert(~stdout.indexOf(fixture('cli-other-config/destination')))
        done()
      })
    })

    it('should require a plugin', function(done){
      exec(bin, { cwd: fixture('cli-plugin-object') }, function(err, stdout, stderr){
        if (err) return done(err)
        equal(fixture('cli-plugin-object/build'), fixture('cli-plugin-object/expected'))
        assert(~stdout.indexOf('successfully built to '))
        assert(~stdout.indexOf(fixture('cli-plugin-object/build')))
        done()
      })
    })

    it('should require plugins as an array', function(done){
      exec(bin, { cwd: fixture('cli-plugin-array') }, function(err, stdout){
        if (err) return done(err)
        equal(fixture('cli-plugin-array/build'), fixture('cli-plugin-array/expected'))
        assert(~stdout.indexOf('successfully built to '))
        assert(~stdout.indexOf(fixture('cli-plugin-array/build')))
        done()
      })
    })

    it('should error when failing to require a plugin', function(done){
      exec(bin, { cwd: fixture('cli-no-plugin') }, function(err){
        assert(err)
        assert(~err.message.indexOf('failed to require plugin "metalsmith-non-existant".'))
        done()
      })
    })

    it('should error when failing to use a plugin', function(done){
      exec(bin, { cwd: fixture('cli-broken-plugin') }, function(err){
        assert(err)
        assert(~err.message.indexOf('error using plugin "./plugin"...'))
        assert(~err.message.indexOf('Break!'))
        assert(~err.message.indexOf('at module.exports'))
        done()
      })
    })

    it('should allow requiring a local plugin', function(done){
      exec(bin, { cwd: fixture('cli-plugin-local') }, function(err, stdout, stderr){
        equal(fixture('cli-plugin-local/build'), fixture('cli-plugin-local/expected'))
        assert(~stdout.indexOf('successfully built to '))
        assert(~stdout.indexOf(fixture('cli-plugin-local/build')))
        done()
      })
    })
  })
})
