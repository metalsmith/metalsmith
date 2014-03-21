
var assert = require('assert');
var equal = require('assert-dir-equal');
var exec = require('child_process').exec;
var fs = require('fs');
var Metalsmith = require('..');
var noop = function(){};
var path = require('path');
var readdir = require('fs-readdir-recursive');
var rm = require('rimraf').sync;

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