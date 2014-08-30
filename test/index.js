
var assert = require('assert');
var equal = require('assert-dir-equal');
var exec = require('child_process').exec;
var fs = require('fs');
var Metalsmith = require('..');
var Mode = require('stat-mode');
var noop = function(){};
var path = require('path');
var readdir = require('fs-readdir-recursive');
var rm = require('rimraf').sync;
var stat = fs.statSync;

describe('Metalsmith', function(){
  beforeEach(function(){
    rm('test/tmp');
  });

  it('should expose a constructor', function(){
    assert('function' == typeof Metalsmith);
  });

  it('should not require the "new" keyword', function(){
    var m = Metalsmith('test/tmp');
    assert(m instanceof Metalsmith);
  });

  it('should use "src" as a default source directory', function(){
    var m = Metalsmith('test/tmp');
    assert('src' == m._src);
  });

  it('should use "build" as a default destination directory', function(){
    var m = Metalsmith('test/tmp');
    assert('build' == m._dest);
  });

  it('should default clean to true', function(){
    var m = Metalsmith('test/tmp');
    assert(true === m._clean);
  });

  describe('#use', function(){
    it('should add a plugin to the middleware stack', function(){
      var m = Metalsmith('test/tmp');
      m.use(noop);
      assert(1 == m.ware.fns.length);
    });
  });

  describe('#source', function(){
    it('should set a source directory', function(){
      var m = Metalsmith('test/tmp');
      m.source('dir');
      assert('dir' == m._src);
    });

    it('should get the full path to the source directory', function(){
      var m = Metalsmith('test/tmp');
      assert(-1 != m.source().indexOf('/test/tmp/src'));
    });
  });

  describe('#destination', function(){
    it('should set a destination directory', function(){
      var m = Metalsmith('test/tmp');
      m.destination('dir');
      assert('dir' == m._dest);
    });

    it('should get the full path to the destination directory', function(){
      var m = Metalsmith('test/tmp');
      assert(-1 != m.destination().indexOf('/test/tmp/build'));
    });
  });

  describe('#clean', function(){
    it('should set the clean option', function(){
      var m = Metalsmith('test/tmp');
      m.clean(false);
      assert(false === m._clean);
    });

    it('should get the value of the clean option', function(){
      var m = Metalsmith('test/tmp');
      assert(true === m.clean());
    });
  });

  describe('#frontmatter', function(){
    it('should set the frontmatter option', function(){
      var m = Metalsmith('test/tmp');
      m.frontmatter(false);
      assert(false === m._frontmatter);
    });

    it('should get the value of the frontmatter option', function(){
      var m = Metalsmith('test/tmp');
      assert(true === m.frontmatter());
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
  });

  describe('#join', function(){
    it('should return a path relative to the working directory', function(){
      var m = Metalsmith('test/tmp');
      var path = m.join('one', 'two', 'three');
      assert(-1 != path.indexOf('/test/tmp/one/two/three'));
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

    it('should expose the stats property in each file metadata', function(done) {
      var m = Metalsmith('test/fixtures/expose-stat');
      m.read(function(err, files) {
        var indexMd = files['index.md'];
        assert(indexMd.stats instanceof fs.Stats);
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
        var stats = stat('test/fixtures/write-mode/build/bin');
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
        assert.equal('function', typeof done);
        files.two = 'two';
        done();
      }
    });
  });

  describe('#build', function(){
    it('should do a basic copy with no plugins', function(done){
      Metalsmith('test/fixtures/basic')
        .build(function(err, files){
          if (err) return done(err);
          assert.equal('object', typeof files);
          equal('test/fixtures/basic/build', 'test/fixtures/basic/expected');
          done();
        });
    });

    it('should preserve binary files', function(done){
      Metalsmith('test/fixtures/basic-images')
        .build(function(err, files){
          if (err) return done(err);
          assert.equal('object', typeof files);
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
