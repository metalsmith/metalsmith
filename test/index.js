
const util = require('util')
const assert = require('assert')
const equal = require('assert-dir-equal')
const exec = util.promisify(require('child_process').exec)
const fs = require('fs')
const Metalsmith = require('..')
const Mode = require('stat-mode')
const noop = function(){}
const path = require('path')
const rm = require('rimraf').sync
const fixture = path.resolve.bind(path, __dirname, 'fixtures')


describe('Metalsmith', function(){
  beforeEach(function(){
    rm('test/tmp')
  })

  it('should expose a constructor', function(){
    assert.equal(typeof Metalsmith, 'function')
  })

  it.skip('should not require the `new` keyword', function(){
    let m = Metalsmith('test/tmp')
    assert(m instanceof Metalsmith)
  })

  it('should error without a working directory', function(){
    assert.throws(function(){
      Metalsmith()
    }, /You must pass a working directory path\./)
  })

  it('should use `./src` as a default source directory', function(){
    let m = Metalsmith('test/tmp')
    assert.equal(m._source, 'src')
  })

  it('should use `./build` as a default destination directory', function(){
    let m = Metalsmith('test/tmp')
    assert.equal(m._destination, 'build')
  })

  it('should default clean to `true`', function(){
    let m = Metalsmith('test/tmp')
    assert.equal(m._clean, true)
  })

  describe('#use', function(){
    it('should add a plugin to the plugins stack', function(){
      let m = Metalsmith('test/tmp')
      m.use(noop)
      assert.equal(m.plugins.length, 1)
    })
  })

  describe('#ignore', function(){
    it('should add an ignore file to the internal ignores list', function(){
      let m = Metalsmith('test/tmp')
      m.ignore('dirfile')
      assert(1 == m.ignores.length)
    })
  })

  describe('#directory', function(){
    it('should set a working directory', function(){
      let m = Metalsmith('test/tmp')
      m.directory('dir')
      assert.equal(m._directory, 'dir')
    })

    it('should get the working directory', function(){
      let m = Metalsmith('test/tmp')
      assert(~m.directory().indexOf(path.sep + path.join('test', 'tmp')))
    })

    it('should be able to be absolute', function(){
      let m = Metalsmith('test/tmp')
      m.directory('/dir')
      assert.equal(m.directory(), path.resolve('/dir'))
    })

    it('should error on non-string', function(){
      let m = Metalsmith('test/tmp')
      assert.throws(function(){
        m.directory(0)
      })
    })
  })

  describe('#source', function(){
    it('should set a source directory', function(){
      let m = Metalsmith('test/tmp')
      m.source('dir')
      assert.equal(m._source, 'dir')
    })

    it('should get the full path to the source directory', function(){
      let m = Metalsmith('test/tmp')
      assert(~m.source().indexOf(path.resolve(path.join('test', 'tmp', 'src'))))
    })

    it('should be able to be absolute', function(){
      let m = Metalsmith('test/tmp')
      m.source('/dir')
      assert.equal(m.source(), path.resolve('/dir'))
    })

    it('should error on non-string', function(){
      let m = Metalsmith('test/tmp')
      assert.throws(function(){
        m.source(0)
      })
    })
  })

  describe('#destination', function(){
    it('should set a destination directory', function(){
      let m = Metalsmith('test/tmp')
      m.destination('dir')
      assert.equal(m._destination, 'dir')
    })

    it('should get the full path to the destination directory', function(){
      let m = Metalsmith('test/tmp')
      assert(~m.destination().indexOf(path.join('test', 'tmp', 'build')))
    })

    it('should be able to be absolute', function(){
      let m = Metalsmith('test/tmp')
      m.destination('/dir')
      assert.equal(m.destination(), path.resolve('/dir'))
    })

    it('should error on non-string', function(){
      let m = Metalsmith('test/tmp')
      assert.throws(function(){
        m.destination(0)
      })
    })
  })

  describe('#concurrency', function(){
    it('should set a max number for concurrency', function(){
      let m = Metalsmith('test/tmp')
      m.concurrency(15)
      assert.equal(m._concurrency, 15)
    })

    it('should get the max number for concurrency', function(){
      let m = Metalsmith('test/tmp')
      m.concurrency(25)
      assert.equal(m.concurrency(), 25)
    })

    it('should be infinitely concurrent by default', function(){
      let m = Metalsmith('test/tmp')
      assert.equal(m.concurrency(), Infinity)
    })
  })

  describe('#clean', function(){
    it('should set the clean option', function(){
      let m = Metalsmith('test/tmp')
      m.clean(false)
      assert.equal(m._clean, false)
    })

    it('should get the value of the clean option', function(){
      let m = Metalsmith('test/tmp')
      assert.equal(m.clean(), true)
    })

    it('should error on non-boolean', function(){
      let m = Metalsmith('test/tmp')
      assert.throws(function(){
        m.clean(0)
      })
    })
  })

  describe('#frontmatter', function(){
    it('should set the frontmatter option', function(){
      let m = Metalsmith('test/tmp')
      m.frontmatter(false)
      assert.equal(m._frontmatter, false)
    })

    it('should get the value of the frontmatter option', function(){
      let m = Metalsmith('test/tmp')
      assert(m.frontmatter(), true)
    })

    it('should error on non-boolean', function(){
      let m = Metalsmith('test/tmp')
      assert.throws(function(){
        m.frontmatter(0)
      })
    })
  })

  describe('#metadata', function(){
    it('should get metadata', function(){
      let m = Metalsmith('test/tmp')
      assert.deepEqual(m.metadata(), {})
    })

    it('should set a clone of metadata', function(){
      let m = Metalsmith('test/tmp')
      let data = { property: true }
      m.metadata(data)
      assert.notEqual(m.metadata(), data)
      assert.deepEqual(m.metadata(), data)
    })

    it('should error on non-object', function(){
      let m = Metalsmith('test/tmp')
      assert.throws(function(){
        m.metadata(0)
      })
    })
  })

  describe('#path', function(){
    it('should return a path relative to the working directory', function(){
      let m = Metalsmith('test/tmp')
      let actualPath = m.path('one', 'two', 'three')
      assert(~actualPath.indexOf(path.resolve('test/tmp/one/two/three')))
    })
  })

  describe('#read', function(){
    it('should read from a source directory', async function(){
      let m = Metalsmith(fixture('read'))
      let stats = fs.statSync(fixture('read/src/index.md'))
      try {
        let files = await m.read()
        assert.deepEqual(files, {
          'index.md': {
            title: 'A Title',
            contents: Buffer.from('body'),
            mode: stats.mode.toString(8).slice(-4),
            stats: stats }
        }) 
      } catch (err) {throw err}
    })
    
    it('should traverse a symbolic link to a directory', async function(){
      // symbolic links are not really a thing on Windows
      if (process.platform === 'win32') { this.skip() }
      let m = Metalsmith(fixture('read-symbolic-link'))
      let stats = fs.statSync(fixture('read-symbolic-link/src/dir/index.md'))
      try {
        let files = await m.read()
        assert.deepEqual(files, {
          'dir/index.md': {
            title: 'A Title',
            contents: Buffer.from('body'),
            mode: stats.mode.toString(8).slice(-4),
            stats: stats
          }
        }
        )
      } catch (err) {throw err}
    })

    it('should read from a provided directory', async function(){
      let m = Metalsmith(fixture('read-dir'))
      let stats = fs.statSync(fixture('read-dir/dir/index.md'))
      let dir = fixture('read-dir/dir')
      try {
        let files = await m.read(dir)
        assert.deepEqual(files, {
          'index.md': {
            title: 'A Title',
            contents: Buffer.from('body'),
            mode: stats.mode.toString(8).slice(-4),
            stats: stats
          }
        })
      } catch (err) {throw err}
    })

    it('should preserve an existing file mode', async function(){
      let m = Metalsmith(fixture('read-mode'))
      let stats = fs.statSync(fixture('read-mode/src/bin'))
      try {
        let files = await m.read()
        assert.deepEqual(files, {
          'bin': {
            contents: Buffer.from('echo test'),
            mode: stats.mode.toString(8).slice(-4),
            stats: stats
          }
        })
      } catch (err) {throw err}
    })

    it('should expose the stats property in each file metadata', async function(){
      let m = Metalsmith(fixture('expose-stat'))
      let files = await m.read()
      let file = files['index.md']
      assert(file.stats instanceof fs.Stats)
    })

    it('should not parse frontmatter if frontmatter is false', async function(){
      let m = Metalsmith(fixture('read-frontmatter'))
      m.frontmatter(false)
      let files = await m.read()
      assert.equal(files['index.md'].thing, undefined)
    })

    it('should still read all when concurrency is set', async function(){
      let m = Metalsmith('test/fixtures/concurrency')
      m.concurrency(3)
      let files = await m.read()
      assert.equal(Object.keys(files).length, 10)
    })

    it('should ignore the files specified in ignores', async function(){
      let stats = fs.statSync(path.join(__dirname, 'fixtures/basic/src/index.md'))
      let m = Metalsmith('test/fixtures/basic')
      m.ignore('nested')
      let files = await m.read()
      assert.deepEqual(files, {
        'index.md': {
          date: new Date('2013-12-02'),
          title: 'A Title',
          contents: Buffer.from('body'),
          mode: stats.mode.toString(8).slice(-4),
          stats: stats
        }
      })
    })


    it('should ignore the files specified in function-based ignores', async function(){
      let stats = fs.statSync(path.join(__dirname, 'fixtures/basic/src/index.md'))
      let m = Metalsmith('test/fixtures/basic')
      m.ignore(function(filepath, stats) {
        return stats.isDirectory() && path.basename(filepath) === 'nested'
      })
      let files = await m.read()
      assert.deepEqual(files, {
        'index.md': {
          date: new Date('2013-12-02'),
          title: 'A Title',
          contents: Buffer.from('body'),
          mode: stats.mode.toString(8).slice(-4),
          stats: stats
        }
      })
    })
  })

  describe('#write', function(){
    it('should write to a destination directory', async function(){
      let m = Metalsmith(fixture('write'))
      let files = { 'index.md': { contents: Buffer.from('body') }}
      await m.write(files)
      equal(fixture('write/build'), fixture('write/expected'))
    })

    it('should write to a provided directory', async function(){
      let m = Metalsmith(fixture('write-dir'))
      let files = { 'index.md': { contents: Buffer.from('body') }}
      let dir = fixture('write-dir/out')
      await m.write(files, dir)
      equal(fixture('write-dir/out'), fixture('write-dir/expected'))
    })

    it('should chmod an optional mode from file metadata', async function(){
      // chmod is not really working on windows https://github.com/nodejs/node-v0.x-archive/issues/4812#issue-11211650
      if (process.platform === 'win32') { this.skip() }
      let m = Metalsmith(fixture('write-mode'))
      let files = {
        'bin': {
          contents: Buffer.from('echo test'),
          mode: '0777'
        }
      }
      await m.write(files)
      let stats = fs.statSync(fixture('write-mode/build/bin'))
      let mode = Mode(stats).toOctal()
      assert.equal(mode, '0777')
    })

    it('should still write all when concurrency is set', async function(){
      let m = Metalsmith('test/fixtures/concurrency')
      let files = await m.read()
      await m.write(files)
      equal('test/fixtures/concurrency/build', 'test/fixtures/concurrency/expected')
    })
  })

  describe('#run', function(){
    
    it('should apply a plugin', async function(){
      let m = Metalsmith('test/tmp')
      m.use(
        function plugin(files, metalsmith, done){
          assert.equal(files.one, 'one')
          assert.equal(m, metalsmith)
          assert.equal(typeof done, 'function')
          files.two = 'two'
          done()
        }
      )
      try {
        let files = await m.run({ one: 'one' })
        assert.equal(files.one, 'one')
        assert.equal(files.two, 'two')
      } catch (err) {throw err}
    })

    it('should run with a provided plugin', async function(){
      let m = Metalsmith('test/tmp')
      function plugin(files, metalsmith, done){
        assert.equal(files.one, 'one')
        assert.equal(m, metalsmith)
        assert.equal(typeof done, 'function')
        files.two = 'two'
        done()
      }
      try {
        let files = await m.run({ one: 'one' }, [plugin])
        assert.equal(files.one, 'one')
        assert.equal(files.two, 'two')
      } catch (err) {throw err}
    })

    it('should support synchronous plugins', async function(){
      let m = Metalsmith('test/tmp')
      m.use(function plugin(files, metalsmith){
        assert.equal(files.one, 'one')
        assert.equal(m, metalsmith)
        files.two = 'two'
      })
      let files = await m.run({ one: 'one' })
      assert.equal(files.one, 'one')
      assert.equal(files.two, 'two')
    })
  })

  describe('#process', function(){
    it('should return files object with no plugins', async function(){
      let m = Metalsmith(fixture('basic'))
      let files = await m.process()
      assert.equal(typeof files, 'object')
      assert.equal(typeof files['index.md'], 'object')
      assert.equal(files['index.md'].title, 'A Title')
      assert.equal(typeof files[path.join('nested', 'index.md')], 'object')
    })
    
    it('should apply a plugin', async function(){
      let m = Metalsmith(fixture('basic-plugin'))
      m.use(function(files, metalsmith, done){
        Object.keys(files).forEach(function(file){
          let data = files[file]
          data.contents = Buffer.from(data.title)
        })
        done()
      })
      let files = await m.process()
      assert.equal(typeof files, 'object')
      assert.equal(Object.keys(files).length, 2)
      assert.equal(typeof files['one.md'], 'object')
      assert.equal(files['one.md'].title, 'one')
      assert.equal(files['one.md'].contents.toString('utf8'), 'one')
      assert.equal(typeof files['two.md'], 'object')
      assert.equal(files['two.md'].title, 'two')
      assert.equal(files['two.md'].contents.toString('utf8'), 'two')
    })
  })

  describe('#build', function(){
    it('should do a basic copy with no plugins', async function(){
      let m = Metalsmith(fixture('basic'))
      let files = await m.build()
      assert.equal(typeof files, 'object')
      equal(fixture('basic/build'), fixture('basic/expected'))
    })

    it('should preserve binary files', async function(){
      let m = Metalsmith(fixture('basic-images'))
      let files = await m.build()
      assert.equal(typeof files, 'object')
      equal(fixture('basic-images/build'), fixture('basic-images/expected'))
    })

    it('should apply a plugin', async function(){
      function plugin (files, metalsmith, done){
        Object.keys(files).forEach( (file) => {
          let data = files[file]
          data.contents = Buffer.from(data.title)
        })
        done()
      }
      let m = Metalsmith(fixture('basic-plugin')).use(plugin)
      await m.build()
      equal(fixture('basic-plugin/build'), fixture('basic-plugin/expected'))
    })

    it('should remove an existing destination directory', async function(){
      let m = Metalsmith(fixture('build'))
      
      rm(fixture('build/build'))
      fs.mkdirSync(fixture('build/build'))
      try {await exec('touch test/fixtures/build/build/empty.md')}
      catch (e) {throw e}
      
      //let files = { 'index.md': { contents: Buffer.from('body') }}
      await m.build()
      equal(fixture('build/build'), fixture('build/expected'))
    })

    it('should not remove existing destination directory if clean is false', async function(){
      let dir = path.join('test', 'fixtures', 'build-noclean', 'build')
      let cmd = (process.platform === 'win32')
        ? 'if not exist ' + dir + ' mkdir ' + dir + ' & type NUL > ' + dir + '\\empty.md'
        : 'mkdir -p ' + dir + ' && touch ' + dir + '/empty.md'
      
      let m = Metalsmith(fixture('build-noclean'))
      m.clean(false)
      
      try {await exec(cmd)} catch (e) {throw e}
      //let files = { 'index.md': { contents: Buffer.from('body') }}
      await m.build()
      equal(fixture('build-noclean/build'), fixture('build-noclean/expected'))
    })

  })
})

describe('CLI', function(){
  let bin = process.argv0 + ' ' + path.resolve(__dirname, '../bin/metalsmith')

  describe('build', function(){
    it('should error without a metalsmith.json', async function(){
      try {
        await exec(bin, { cwd: fixture('cli-no-config') })
      } catch (err) {
        assert(err)
        assert(~err.message.indexOf('could not find a metalsmith.json configuration file.'))
      }
    })

    it('should grab config from metalsmith.json', async function(){
      try {
        let cwd = fixture('cli-json')
        let env = {'NODE_NO_WARNINGS':false}
        let {stdout} = await exec(bin, {'cwd':cwd, 'env':env})
        equal(fixture('cli-json/destination'), fixture('cli-json/expected'))
        assert(stdout.includes('successfully built to '), '\nSTDOUT WAS: ' + stdout)
        assert(stdout.includes(fixture('cli-json/destination')), '\nSTDOUT WAS: ' + stdout)
      } catch (err) { throw err }
    })

    it('should grab config from a config.json', async function(){
      try {
        let {stdout} = await exec(bin + ' -c config.json', { cwd: fixture('cli-other-config') })
        equal(fixture('cli-other-config/destination'), fixture('cli-other-config/expected'))
        assert(stdout.includes('successfully built to '))
        assert(stdout.includes(fixture('cli-other-config/destination')))
      } catch (err) { throw err }
    })

    it('should require a plugin', async function(){
      try {
        let {stdout} = await exec(bin, { cwd: fixture('cli-plugin-object') })
        equal(fixture('cli-plugin-object/build'), fixture('cli-plugin-object/expected'))
        assert(stdout.includes('successfully built to '))
        assert(stdout.includes(fixture('cli-plugin-object/build')))
      } catch (err) { throw err }
    })

    it('should require plugins as an array', async function(){
      try {
        let {stdout} = await exec(bin, { cwd: fixture('cli-plugin-array') })
        equal(fixture('cli-plugin-array/build'), fixture('cli-plugin-array/expected'))
        assert(stdout.includes('successfully built to '))
        assert(stdout.includes(fixture('cli-plugin-array/build')))
      }
      catch (err) { throw err }
    })

    it('should error when failing to require a plugin', async function(){
      try {
        await exec(bin, { cwd: fixture('cli-no-plugin') })
      } catch (err) {
        assert(err)
        assert(~err.message.indexOf('failed to require plugin "metalsmith-non-existant".'))
      }
    })

    it('should error when failing to use a plugin', async function(){
      try {
        await exec(bin, { cwd: fixture('cli-broken-plugin') })
      } catch (err){
        assert(err)
        assert(~err.message.indexOf('error using plugin "./plugin"...'))
        assert(~err.message.indexOf('Break!'))
        assert(~err.message.indexOf('at module.exports'))
      }
    })

    it('should allow requiring a local plugin', async function(){
      try {
        let {stdout} = await exec(bin, { cwd: fixture('cli-plugin-local') })
        equal(fixture('cli-plugin-local/build'), fixture('cli-plugin-local/expected'))
        assert(stdout.includes('successfully built to '))
        assert(stdout.includes(fixture('cli-plugin-local/build')))
      } catch (err) { throw err }
    })
  })
})
