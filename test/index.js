
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
      m.read(function(err, files){
        if (err) return done(err);
        assert.deepEqual(files, {
          'index.md': {
            title: 'A Title',
            contents: new Buffer('body'),
            mode: '0644'
          }
        });
        done();
      });
    });

    it('should preserve an existing file mode', function(done){
      var m = Metalsmith('test/fixtures/read-mode');
      m.read(function(err, files){
        if (err) return done(err);
        assert.deepEqual(files, {
          'bin': {
            contents: new Buffer('echo test'),
            mode: '0777'
          }
        });
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

    it('should remove an existing destination directory', function(done){
      var m = Metalsmith('test/fixtures/write');
      exec('touch test/fixtures/write/build/empty.md', function(err){
        if (err) return done(err);
        var files = { 'index.md': { contents: new Buffer('body') }};
        m.write(files, function(err){
          if (err) return done(err);
          equal('test/fixtures/write/build', 'test/fixtures/write/expected');
          done();
        });
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

    it('should create a symlink using the option in file metadata', function(done){
      var m = Metalsmith('test/fixtures/write-symlink');
      var files = {
        'file': {},
        'link': {
          symlink: 'file'
        }
      };

      m.write(files, function(err){
        var stats = fs.lstatSync('test/fixtures/write-symlink/build/link');
        assert(stats.isSymbolicLink());
        done();
      });
    });
  });

  describe('#run', function(){
    it('should apply a plugin', function(done){
      var m = Metalsmith('test/tmp');
      m.use(plugin)
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
      exec('cd test/fixtures/cli-drafts && ' + bin, function(err, stdout){
        if (err) return done(err);
        equal('test/fixtures/cli-drafts/build', 'test/fixtures/cli-drafts/expected');
        assert(~stdout.indexOf('successfully built to '));
        assert(~stdout.indexOf('test/fixtures/cli-drafts/build'));
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
