
var assert = require('assert');
var equal = require('assert-dir-equal');
var exec = require('child_process').exec;
var fs = require('fs');
var Metalsmith = require('..');
var Mode = require('stat-mode');
var noop = function(){};
var path = require('path');
var rm = require('rimraf').sync;

describe('Metalsmith', function(){
  beforeEach(function(){
    rm('test/tmp');
  });

  it('should expose a constructor', function(){
    assert.equal(typeof Metalsmith, 'function');
  });

  it('should not require the `new` keyword', function(){
    var m = Metalsmith('test/tmp');
    assert(m instanceof Metalsmith);
  });

  it('should error without a working directory', function(){
    assert.throws(function(){
      Metalsmith();
    }, /You must pass a working directory path\./);
  });

  it('should use `./src` as a default source directory', function(){
    var m = Metalsmith('test/tmp');
    assert.equal(m._source, 'src');
  });

  it('should use `./build` as a default destination directory', function(){
    var m = Metalsmith('test/tmp');
    assert.equal(m._destination, 'build');
  });

  it('should default clean to `true`', function(){
    var m = Metalsmith('test/tmp');
    assert.equal(m._clean, true);
  });

  describe('#use', function(){
    it('should add a plugin to the middleware stack', function(){
      var m = Metalsmith('test/tmp');
      m.use(noop);
      assert.equal(m.ware.fns.length, 1);
    });
  });

  describe('#directory', function(){
    it('should set a working directory', function(){
      var m = Metalsmith('test/tmp');
      m.directory('dir');
      assert.equal(m._directory, 'dir');
    });

    it('should get the working directory', function(){
      var m = Metalsmith('test/tmp');
      assert(~m.directory().indexOf('/test/tmp'));
    });

    it('should be able to be absolute', function(){
      var m = Metalsmith('test/tmp');
      m.directory('/dir');
      assert.equal(m.directory(), '/dir');
    });
  });

  describe('#source', function(){
    it('should set a source directory', function(){
      var m = Metalsmith('test/tmp');
      m.source('dir');
      assert.equal(m._source, 'dir');
    });

    it('should get the full path to the source directory', function(){
      var m = Metalsmith('test/tmp');
      assert(~m.source().indexOf('/test/tmp/src'));
    });

    it('should be able to be absolute', function(){
      var m = Metalsmith('test/tmp');
      m.source('/dir');
      assert.equal(m.source(), '/dir');
    });
  });

  describe('#destination', function(){
    it('should set a destination directory', function(){
      var m = Metalsmith('test/tmp');
      m.destination('dir');
      assert.equal(m._destination, 'dir');
    });

    it('should get the full path to the destination directory', function(){
      var m = Metalsmith('test/tmp');
      assert(~m.destination().indexOf('/test/tmp/build'));
    });

    it('should be able to be absolute', function(){
      var m = Metalsmith('test/tmp');
      m.destination('/dir');
      assert.equal(m.destination(), '/dir');
    });
  });

  describe('#clean', function(){
    it('should set the clean option', function(){
      var m = Metalsmith('test/tmp');
      m.clean(false);
      assert.equal(m._clean, false);
    });

    it('should get the value of the clean option', function(){
      var m = Metalsmith('test/tmp');
      assert.equal(m.clean(), true);
    });
  });

  describe('#frontmatter', function(){
    it('should set the frontmatter option', function(){
      var m = Metalsmith('test/tmp');
      m.frontmatter(false);
      assert.equal(m._frontmatter, false);
    });

    it('should get the value of the frontmatter option', function(){
      var m = Metalsmith('test/tmp');
      assert(m.frontmatter(), true);
    });
  });

  describe('#metadata', function(){
    it('should get metadata', function(){
      var m = Metalsmith('test/tmp');
      assert.deepEqual(m.metadata(), {});
    });

    it('should set a clone of metadata', function(){
      var m = Metalsmith('test/tmp');
      var data = { property: true };
      m.metadata(data);
      assert.notEqual(m.metadata(), data);
      assert.deepEqual(m.metadata(), data);
    });

    it('should return an object literal when undefined', function(){
      var m = Metalsmith('test/tmp');
      m.metadata(undefined);
      assert(m.metadata(), {});
    });

    it('should return an object literal when setting non-object', function(){
      var m = Metalsmith('test/tmp');
      m.metadata(false);
      assert(m.metadata(), {});

      m.metadata([]);
      assert(m.metadata(), {});

      m.metadata('test-string');
      assert(m.metadata(), {});
    });
  });

  describe('#path', function(){
    it('should return a path relative to the working directory', function(){
      var m = Metalsmith('test/tmp');
      var path = m.path('one', 'two', 'three');
      assert(~path.indexOf('/test/tmp/one/two/three'));
    });
  });

  describe('#read', function(){
    it('should read from a source directory', function(done){
      var m = Metalsmith('test/fixtures/read');
      var stats = fs.statSync(path.join(__dirname, 'fixtures/read/src/index.md'));
      m.read(function(err, files){
        if (err) return done(err);
        assert.deepEqual(files, {
          'index.md': {
            title: 'A Title',
            contents: new Buffer('body'),
            mode: stats.mode.toString(8).slice(-4),
            stats: stats
          }
        });
        done();
      });
    });

    it('should preserve an existing file mode', function(done){
      var m = Metalsmith('test/fixtures/read-mode');
      var stats = fs.statSync(path.join(__dirname, 'fixtures/read-mode/src/bin'));
      m.read(function(err, files){
        if (err) return done(err);
        assert.deepEqual(files, {
          'bin': {
            contents: new Buffer('echo test'),
            mode: stats.mode.toString(8).slice(-4),
            stats: stats
          }
        });
        done();
      });
    });

    it('should expose the stats property in each file metadata', function(done){
      var m = Metalsmith('test/fixtures/expose-stat');
      m.read(function(err, files) {
        var file = files['index.md'];
        assert(file.stats instanceof fs.Stats);
        done();
      });
    });

    it('should not parse frontmatter if frontmatter is false', function(done){
      var m = Metalsmith('test/fixtures/read-frontmatter');
      m.frontmatter(false);
      m.read(function(err, files){
        if (err) return done(err);
        assert.equal(files['index.md'].thing, undefined);
        done();
      });
    });
  });

  describe('#write', function(){
    it('should write to a destination directory', function(done){
      var m = Metalsmith('test/fixtures/write');
      var files = { 'index.md': { contents: new Buffer('body') }};
      m.write(files, function(err){
        if (err) return done(err);
        equal('test/fixtures/write/build', 'test/fixtures/write/expected');
        done();
      });
    });

    it('should chmod an optional mode from file metadata', function(done){
      var m = Metalsmith('test/fixtures/write-mode');
      var files = {
        'bin': {
          contents: new Buffer('echo test'),
          mode: '0777'
        }
      };

      m.write(files, function(err){
        var stats = fs.statSync('test/fixtures/write-mode/build/bin');
        var mode = Mode(stats).toOctal();
        assert.equal(mode, '0777');
        done();
      });
    });
  });

  describe('#run', function(){
    it('should apply a plugin', function(done){
      var m = Metalsmith('test/tmp');
      m.use(plugin);
      m.run({ one: 'one' }, function(err, files, metalsmith){
        assert.equal(files.one, 'one');
        assert.equal(files.two, 'two');
        done();
      });

      function plugin(files, metalsmith, done){
        assert.equal(files.one, 'one');
        assert.equal(m, metalsmith);
        assert.equal(typeof done, 'function');
        files.two = 'two';
        done();
      }
    });

    it('should support synchronous plugins', function(done){
      var m = Metalsmith('test/tmp');
      m.use(plugin);
      m.run({ one: 'one' }, function(err, files, metalsmith){
        assert.equal(files.one, 'one');
        assert.equal(files.two, 'two');
        done();
      });

      function plugin(files, metalsmith){
        assert.equal(files.one, 'one');
        assert.equal(m, metalsmith);
        files.two = 'two';
      }
    });
  });

  describe('#build', function(){
    it('should do a basic copy with no plugins', function(done){
      Metalsmith('test/fixtures/basic')
        .build(function(err, files){
          if (err) return done(err);
          assert.equal(typeof files, 'object');
          equal('test/fixtures/basic/build', 'test/fixtures/basic/expected');
          done();
        });
    });

    it('should preserve binary files', function(done){
      Metalsmith('test/fixtures/basic-images')
        .build(function(err, files){
          if (err) return done(err);
          assert.equal(typeof files, 'object');
          equal('test/fixtures/basic-images/build', 'test/fixtures/basic-images/expected');
          done();
        });
    });

    it('should apply a plugin', function(done){
      Metalsmith('test/fixtures/basic-plugin')
        .use(function(files, metalsmith, done){
          Object.keys(files).forEach(function(file){
            var data = files[file];
            data.contents = new Buffer(data.title);
          });
          done();
        })
        .build(function(err){
          if (err) return done(err);
          equal('test/fixtures/basic-plugin/build', 'test/fixtures/basic-plugin/expected');
          done();
        });
    });

    it('should remove an existing destination directory', function(done){
      var m = Metalsmith('test/fixtures/build');
      rm('test/fixtures/build/build');
      fs.mkdirSync('test/fixtures/build/build');
      exec('touch test/fixtures/build/build/empty.md', function(err){
        if (err) return done(err);
        var files = { 'index.md': { contents: new Buffer('body') }};
        m.build(function(err){
          if (err) return done(err);
          equal('test/fixtures/build/build', 'test/fixtures/build/expected');
          done();
        });
      });
    });

    it('should not remove existing destination directory if clean is false', function(done){
      var m = Metalsmith('test/fixtures/build-noclean');
      m.clean(false);
      exec('mkdir -p test/fixtures/build-noclean/build && touch test/fixtures/build-noclean/build/empty.md', function(err){
        if (err) return done(err);
        var files = { 'index.md': { contents: new Buffer('body') }};
        m.build(function(err){
          if (err) return done(err);
          equal('test/fixtures/build-noclean/build', 'test/fixtures/build-noclean/expected');
          done();
        });
      });
    });

  });
});

describe('CLI', function(){
  var bin = __dirname + '/../bin/metalsmith';

  describe('build', function(){
    it('should error without a metalsmith.json', function(done){
      exec('cd test/fixtures/cli-no-config && ' + bin, function(err, stdout){
        assert(err);
        debugger;
        assert(~err.message.indexOf('could not find a "metalsmith.json" configuration file.'));
        done();
      });
    });

    it('should grab config from metalsmith.json', function(done){
      exec('cd test/fixtures/cli-json && ' + bin, function(err, stdout){
        if (err) return done(err);
        equal('test/fixtures/cli-json/destination', 'test/fixtures/cli-json/expected');
        assert(~stdout.indexOf('successfully built to '));
        assert(~stdout.indexOf('test/fixtures/cli-json/destination'));
        done();
      });
    });

    it('should require a plugin', function(done){
      exec('cd test/fixtures/cli-plugin-object && ' + bin, function(err, stdout){
        if (err) return done(err);
        equal('test/fixtures/cli-plugin-object/build', 'test/fixtures/cli-plugin-object/expected');
        assert(~stdout.indexOf('successfully built to '));
        assert(~stdout.indexOf('test/fixtures/cli-plugin-object/build'));
        done();
      });
    });

    it('should require plugins as an array', function(done){
      exec('cd test/fixtures/cli-plugin-array && ' + bin, function(err, stdout){
        if (err) return done(err);
        equal('test/fixtures/cli-plugin-array/build', 'test/fixtures/cli-plugin-array/expected');
        assert(~stdout.indexOf('successfully built to '));
        assert(~stdout.indexOf('test/fixtures/cli-plugin-array/build'));
        done();
      });
    });

    it('should error when failing to require a plugin', function(done){
      exec('cd test/fixtures/cli-no-plugin && ' + bin, function(err, stdout){
        assert(err);
        assert(~err.message.indexOf('failed to require plugin "metalsmith-non-existant".'));
        done();
      });
    });
  });
});
