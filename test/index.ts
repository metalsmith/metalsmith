'use strict';

import { assert } from 'console';
import * as Metalsmith from '../types';
const collections = require('metalsmith-collections');
const layouts = require('metalsmith-layouts');
const markdown = require('metalsmith-markdown');
const permalinks = require('metalsmith-permalinks');
Metalsmith(__dirname)

// Well, here is our elevator pitch. It’s as easy as that:
Metalsmith(__dirname) // __dirname defined by node.js:
    // name of current working directory
    .metadata({
        // add any variable you want
        // use them in layout-files
        sitename: 'My Static Site & Blog',
        siteurl: 'http://example.com/',
        description: "It's about saying »Hello« to the world.",
        generatorname: 'Metalsmith',
        generatorurl: 'http://metalsmith.io/',
    })
    .source('./src') // source directory
    .destination('./build') // destination directory
    .clean(true) // clean destination before
    .use(
        collections({
            // group all blog posts by internally
            posts: 'posts/*.md', // adding key 'collections':'posts'
        }),
    ) // use `collections.posts` in layouts
    .use(markdown()) // transpile all md into html
    .use(
        permalinks({
            // change URLs to permalink URLs
            relative: false, // put css only in /css
        }),
    )
    .use(layouts()) // wrap layouts around html
    .build((err: Error | null) => {
        // build process
        if (err) throw err; // error handling is required
    });

// initialize via default export
Metalsmith(__dirname);
// initialize via default export with variable assignment
const m = Metalsmith(__dirname);
// set relative/absolute working directory
Metalsmith(__dirname).directory('working');
Metalsmith(__dirname).directory('C:\\Projects\\Metalsmith');
// get absolute working directory
const wrk = Metalsmith(__dirname).directory();
// set relative/absolute source directory
Metalsmith(__dirname).source('source');
Metalsmith(__dirname).source('C:\\Projects\\Site');
// get absolute source directory
const src = Metalsmith(__dirname).source();
// set relative/absolute destination directory
Metalsmith(__dirname).destination('build');
Metalsmith(__dirname).destination('C:\\Projects\\Out');
// get absolute destination directory
const dst = Metalsmith(__dirname).destination();
// set max file concurrency
Metalsmith(__dirname).concurrency(50);
// get max file concurrency
const max = Metalsmith(__dirname).concurrency();
// set destination directory cleaning to false
Metalsmith(__dirname).clean(false);
// get destination directory cleaning flag
const clean = Metalsmith(__dirname).clean();
// set frontmatter parsing to false
Metalsmith(__dirname).frontmatter(false);
// get frontmatter parsing flag
const parse = Metalsmith(__dirname).frontmatter();
// set global metadata object
Metalsmith(__dirname).metadata({ sitename: 'My Static Site' });
// get global metadata object
const meta = Metalsmith(__dirname).metadata();
// plugin mock-up
function fakePlugin(files: Metalsmith.Files, metalsmith: Metalsmith, done: Metalsmith.DoneCallback) {
    return;
}
const fakePromiseReturningPlugin:Metalsmith.Plugin = (files, ms) => {
  // this should error
  // return false
  // this should work
  return Promise.resolve()
}
// testing the file interface
const file: Metalsmith.File = {
    contents: Buffer.from('string'),
    custom: ''
};
// testing a custom file interface
const customFile:Metalsmith.File<{
  draft: boolean,
  /** The file's permalink */
  permalink: string
}> = {
  contents: Buffer.from('string'),
  permalink: '',
  draft: false
}
// testing optional file properties
file.mode;
file.stats && file.stats.isSymbolicLink();
// testing the files interface
const files: Metalsmith.Files = {
    'path/to/file.js': file,
};
// testing files iteration & buffer toString
Object.values(files).map(file => {
    return file.contents.toString();
});
Metalsmith(__dirname).ignores;
// uncomment to test readonly protection
// Metalsmith(__dirname).ignores = [];
Metalsmith(__dirname).plugins;
// uncomment to test readonly protection
// Metalsmith(__dirname).plugins = [];
// add a fakePlugin to the metalsmith pipeline
Metalsmith(__dirname).use(fakePlugin).use(fakePromiseReturningPlugin)
// add an ignore file
Metalsmith(__dirname).ignore('corrupted.html');
// get ignored files
const ignored = Metalsmith(__dirname).ignore();

// resolve "path-a" and "path-b" on working directory
const path = Metalsmith(__dirname).path('path-a', 'path-b');

// test the match utility
const matched1 = Metalsmith(__dirname).match('**/*.html')
const matched2 = Metalsmith(__dirname).match('**/*.html', Object.keys({}))
const matched3 = Metalsmith(__dirname).match('**/*.html', Object.keys({}), { dot: true })

// test the debugger
Metalsmith(__dirname).debug.enable('*')
Metalsmith(__dirname).debug.colors = false
Metalsmith(__dirname).debug.enabled = false
Metalsmith(__dirname).debug.disable()
Metalsmith(__dirname).debug.handle()

const debug = Metalsmith(__dirname).debug('metalsmith-plugin')
debug('%s', 'A log')
debug.info('%s', 'An info')
debug.warn('%s', 'A warning')
debug.info('%s', 'An error')

// test matter member
m.matter.options()
m.matter.options({ excerpt_separator: '---' })
m.matter.options({
  excerpt_separator: '---',
  excerpt: true,
  engines: {
    parseOnly(str) {
      return JSON.parse(str)
    },
    parseAndStringify: {
      parse(str) { return JSON.parse(str) },
      stringify(data) { return JSON.stringify(data) }
    }
  }
})
const { contents, mode, stats } = m.matter.parse('str')
m.matter.parse(Buffer.from('str'))
m.matter.stringify({ data: { hello: 'world' }, contents: Buffer.from('body') })
m.matter.wrap(JSON.stringify({ hello: 'world' }))

// test the env method
const env = Metalsmith(__dirname).env()
const envvar = Metalsmith(__dirname).env('DEBUG')
Metalsmith(__dirname).env('DEBUG', true)
Metalsmith(__dirname).env({
  DEBUG: true
})

const callback = (err: Error | null, files: Metalsmith.Files) => {
    if (err) {
        throw err;
    }
};

// build variants
Metalsmith(__dirname).build()
Metalsmith(__dirname).build(callback)
Metalsmith(__dirname).build()
  .then(files => { files })
  .catch(err => { throw err })

// process variants
Metalsmith(__dirname).process(callback)
Metalsmith(__dirname).process()
  .then(files => { files })
  .catch(err => { throw err })

// run variants
Metalsmith(__dirname).run({ fileA: { contents: Buffer.from('a.html') } }, callback);
Metalsmith(__dirname).run({ fileA: { contents: Buffer.from('a.html') } }, [], callback);
Metalsmith(__dirname).run({ fileA: { contents: Buffer.from('a.html') } }, [])
  .then(files => files[0].contents)

// read variants
const filesData1 = Metalsmith(__dirname).read('subdir', (err, file) => {})
const filesData2 = Metalsmith(__dirname).read('a.html')
  .then(files => { return files })
  .catch(err => { throw err })
assert(typeof filesData1 === undefined)
assert(filesData2 instanceof Promise)

// readFile variants
const fileData1 = Metalsmith(__dirname).readFile('a.html', (err, file) => {})
const fileData2 = Metalsmith(__dirname).readFile('a.html')
  .then(files => { files })
  .catch(err => { throw err });
assert(typeof fileData1 === undefined)
assert(fileData2 instanceof Promise)

// write variants
Metalsmith(__dirname).write(files, '.', (err, files) => {
  if (err) throw err
  files.any && files.any.contents
})
Metalsmith(__dirname).write(files, './dist')
  .then(files => { files })
  .catch(err => { throw err })

// writeFile variants
Metalsmith(__dirname).writeFile('test.html', file, err => { if (err) throw err })
Metalsmith(__dirname).writeFile('test.html', file)
  .then(() => {})
  .catch(err => { throw err })
