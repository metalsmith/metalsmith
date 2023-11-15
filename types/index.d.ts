/// <reference types="node" />

import { Stats } from 'fs';
import { Mode } from 'stat-mode';
import { Debugger as DebugDebugger } from 'debug';
import { GrayMatterFile } from 'gray-matter';
import { WatchOptions } from 'chokidar';
import micromatch = require('micromatch');
declare class Metalsmith {
    /**
     * Initialize a new `Metalsmith` builder with a working `directory`.
     **/
    constructor(directory:string)
    /**
     * 
     */
    matter: {
      /**
       * Return matter options to use for parsing & stringification  
       * [API Docs](https://metalsmith.io/api/#Metalsmith+matter+options) | [Source code](https://github.com/metalsmith/metalsmith/blob/v2.6.0/lib/matter.js#L27)
       */
      options(): Metalsmith.MatterOptions
      /**
       * Set matter options to use for parsing & stringification  
       * [API Docs](https://metalsmith.io/api/#Metalsmith+matter+options) | [Source code](https://github.com/metalsmith/metalsmith/blob/v2.6.0/lib/matter.js#L27)
       */
      options(options: Metalsmith.MatterOptions): void
      /**
       * Parse a string or buffer for front matter and return it as a {@linkcode Metalsmith.File} object.  
       * [API Docs](https://metalsmith.io/api/#Metalsmith+matter+parse) | [Source code](https://github.com/metalsmith/metalsmith/blob/v2.6.0/lib/matter.js#L37)
       * @example
       * metalsmith.matter.parse(Buffer.from('---\ntitle: Hello World\n---\nIntro\n---'))
       * === {
       *   contents: Buffer<'Hello world'>,
       *   title: 'Hello World',
       *   excerpt: 'Intro'
       * }
       */
      parse(contents: Buffer|string): Metalsmith.File,
      /**
       * Stringify a {@linkcode Metalsmith.File} object to a string with frontmatter and contents  
       * [API Docs](https://metalsmith.io/api/#Metalsmith+matter+stringify) | [Source code](https://github.com/metalsmith/metalsmith/blob/v2.6.0/lib/matter.js#L59)
       * @example
       * metalsmith.matter.stringify({
       *   contents: Buffer.from('body'),
       *   title: 'Hello World',
       *   excerpt: 'Intro'
       * }) === `
       *   title: Hello World
       *   excerpt: Intro
       *   ---
       *   body
       * `
       */
      stringify(file: Metalsmith.File): string
      /**
       * Wrap stringified front-matter-compatible data with the matter delimiters  
       * [API Docs](https://metalsmith.io/api/#Metalsmith+matter+wrap) | [Source code](https://github.com/metalsmith/metalsmith/blob/v2.6.0/lib/matter.js#L69)
       */
      wrap(stringifiedData: Buffer|string): string
    }
    /**
     * Set the working `directory`. Relative paths resolve to `process.cwd()`  
     * [API Docs](https://metalsmith.io/api/#Metalsmith+directory) | [Source code](https://github.com/metalsmith/metalsmith/blob/v2.6.0/lib/index.js#L181)
     * @example
     * new Metalsmith(__dirname)             // set the path of the working directory through the constructor
     * metalsmith.directory('./other/path')  // set the path of the working directory
     */
    directory(directory: string): Metalsmith;
    /**
     * Get the absolute path of the working directory.  
     * [API Docs](https://metalsmith.io/api/#Metalsmith+directory) | [Source code](https://github.com/metalsmith/metalsmith/blob/v2.6.0/lib/index.js#L181)
     * @example
     * const msdir = metalsmith.directory();
     */
    directory(): string;
    /**
     * Set the path of the `source` directory, relative to `metalsmith.directory()`  
     * [API Docs](https://metalsmith.io/api/#Metalsmith+source) | [Source code](https://github.com/metalsmith/metalsmith/blob/v2.6.0/lib/index.js#L217)
     * @default 'src'
     * @example
     * metalsmith.source('src');
     */
    source(path: string): Metalsmith;
    /**
     * Get the absolute path of the `source` directory.  
     * [API](https://metalsmith.io/api/#Metalsmith+source) | [Source code](https://github.com/metalsmith/metalsmith/blob/v2.6.0/lib/index.js#L217)
     * @example
     * const src = metalsmith.source();
     */
    source(): string;
    /**
     * Set the path of the `destination` directory.  
     * [API Docs](https://metalsmith.io/api/#Metalsmith+destination) | [Source code](https://github.com/metalsmith/metalsmith/blob/v2.6.0/lib/index.js#L235)
     * @default 'build'
     * @example
     * metalsmith.destination('build');
     */
    destination(
      /** Relative or absolute `destination` directory path. */
      path: string
    ): Metalsmith;
    /**
     * Get the absolute path of the `destination` directory.  
     * [API Docs](https://metalsmith.io/api/#Metalsmith+destination) | [Source code](https://github.com/metalsmith/metalsmith/blob/v2.6.0/lib/index.js#L235)
     * @example
     * const dest = metalsmith.destination()
     */
    destination(): string;
    /**
     * Set the `max` number of files to open at once. Useful if you encounter `EMFILE` errors, see [Node.js docs](https://nodejs.org/api/errors.html#errors_common_system_errors)  
     * [API Docs](https://metalsmith.io/api/#Metalsmith+concurrency) | [Source code](https://github.com/metalsmith/metalsmith/blob/v2.6.0/lib/index.js#L253)
     * @default Infinity
     * @example
     * metalsmith.concurrency(50)
     */
    concurrency(
      /** Maximum number of file descriptors to open simultaneously. Defaults to `Infinity` */
      max: number
    ): Metalsmith;
    /**
     * Get the `max` number of files to open at once.  
     * [API](https://metalsmith.io/api/#Metalsmith+concurrency) | [Source](https://github.com/metalsmith/metalsmith/blob/v2.6.0/lib/index.js#L253)
     * @example
     * const max = metalsmith.concurrency()
     */
    concurrency(): number;
    /**
     * Set whether {@linkcode Metalsmith.directory} will be `cleaned` before writing. Defaults to `true`.  
     * [API Docs](https://metalsmith.io/api/#Metalsmith+clean) | [Source code](https://github.com/metalsmith/metalsmith/blob/v2.6.0/lib/index.js#L270)
     * @default true
     * @example
     * metalsmith.clean(false)
     */
    clean(clean: boolean): Metalsmith;
    /**
     * Get whether the destination directory will be `cleaned` before writing.  
     * [API Docs](https://metalsmith.io/api/#Metalsmith+clean) | [Source code](https://github.com/metalsmith/metalsmith/blob/v2.6.0/lib/index.js#L270)
     * @example
     * const clean = metalsmith.clean()
     */
    clean(): boolean;
    /**
     * Set the flag on whether to parse YAML `frontmatter`  
     * [API Docs](https://metalsmith.io/api/#Metalsmith+frontmatter) | [Source code](https://github.com/metalsmith/metalsmith/blob/v2.6.0/lib/index.js#L291)
     * @default true
     * @example
     * metalsmith.frontmatter(false);
     */
    frontmatter(frontmatter?: boolean | {}): Metalsmith;
    /**
     * Get the flag on whether to parse YAML `frontmatter`  
     * [API Docs](https://metalsmith.io/api/#Metalsmith+frontmatter) | [Source code](https://github.com/metalsmith/metalsmith/blob/v2.6.0/lib/index.js#L291)
     * @example
     * const on = metalsmith.frontmatter() // true or false
     */
    frontmatter(): boolean;
    /** Consult [chokidar.watchOptions](https://github.com/paulmillr/chokidar#api) in use by `metalsmith.watch`.  
     * [API Docs](https://metalsmith.io/api/#Metalsmith+watch) | [Source code](https://github.com/metalsmith/metalsmith/blob/v2.6.0/lib/index.js#L510)
     * @example
     * metalsmith.watch()
     * // {
     * //   paths: [metalsmith.source()],
     * //   ignoreInitial: true,
     * //   awaitWriteFinish: false,
     * //   ignore: metalsmith.ignore(),
     * //   alwaysStat: false
     * // }
     */
    watch(): false|WatchOptions
    /**
     * Set the list of paths to watch and trigger rebuilds on. The watch method will skip files ignored with {@linkcode Metalsmith.ignore}
     * and will do partial (true) or full (false) rebuilds depending on the {@linkcode Metalsmith.clean} setting.
     * It can be used both for rebuilding in-memory with {@linkcode Metalsmith.process} or writing to file system with {@linkcode Metalsmith.build}.  
     * [API Docs](https://metalsmith.io/api/#Metalsmith+watch) | [Source code](https://github.com/metalsmith/metalsmith/blob/v2.6.0/lib/index.js#L510)
     * @default false
     * @example
     * metalsmith
     *   .ignore(['wont-be-watched'])  // ignored
     *   .clean(false)                 // do partial rebuilds
     *   .watch(true)                  // watch all files in metalsmith.source()
     *   .watch(['lib','src'])         // or watch files in directories 'lib' and 'src'
     */
    watch(
      /** `true` or `false` to watch {@linkcode Metalsmith.source}, or one or more paths/ globs, or a subset of chokidar watchOptions */
      watch: boolean|string|string[]|Omit<WatchOptions, 'ignoreInitial'|'ignored'|'alwaysStat'|'cwd'>
    ): Metalsmith;
    /**
     * Get a single metalsmith environment variable. Metalsmith env vars are case-insensitive.  
     * [API Docs](https://metalsmith.io/api/#Metalsmith+env) | [Source code](https://github.com/metalsmith/metalsmith/blob/v2.6.0/lib/index.js#L372)
     * @example
     * const env = metalsmith.env('NODE_ENV')
     * if (env === 'development') { ... }
     */
    env(name:string): number|boolean|string|null;
    /**
     * Get all metalsmith environment variables. Metalsmith env vars are returned in capital-case.  
     * [API Docs](https://metalsmith.io/api/#Metalsmith+env) | [Source code](https://github.com/metalsmith/metalsmith/blob/v2.6.0/lib/index.js#L372)
     * @example
     * const env = metalsmith.env();
     * console.log(env) // { NODE_ENV: 'development' }
     */
    env(): Object;
    /**
     * Set a single metalsmith environment variable (chainable). Metalsmith env vars are case-insensitive.  
     * [API Docs](https://metalsmith.io/api/#Metalsmith+env) | [Source code](https://github.com/metalsmith/metalsmith/blob/v2.6.0/lib/index.js#L372)
     * @example
     * metalsmith
     *  .env('NODE_ENV', process.env.NODE_ENV)
     *  .env('DEBUG', '@metalsmith/*')
     */
    env(name:string, value: number|boolean|string|null): Metalsmith;
    /**
     * Add multiple metalsmith environment variables at once (chainable). Metalsmith env vars are case-insensitive.  
     * This signature will overwrite but not remove existing metalsmith environment variables  
     * [API Docs](https://metalsmith.io/api/#Metalsmith+env) | [Source code](https://github.com/metalsmith/metalsmith/blob/v2.6.0/lib/index.js#L372)
     * @example
     * metalsmith.env({
     *  NODE_ENV: process.env.NODE_ENV,
     *  DEBUG: '@metalsmith/*'
     * })
     */
    env(env: {[key:string]: (number|boolean|string|null)}): Metalsmith;
    /**
     * Assign values to the global `metadata` object.  
     * [API Docs](https://metalsmith.io/api/#Metalsmith+metadata) | [Source code](https://github.com/metalsmith/metalsmith/blob/v2.6.0/lib/index.js#L199)
     * @example
     * metalsmith.metadata({
     *   sitename: "My Static Site",
     *   baseurl: process.env.NODE_ENV === 'development' ? 'http://localhost:8080' : 'https://johndoe.com'
     * });
     */
    metadata(metadata: object): Metalsmith;
    /**
     * Get the global `metadata` object.  
     * [API Docs](https://metalsmith.io/api/#Metalsmith+metadata) | [Source code](https://github.com/metalsmith/metalsmith/blob/v2.6.0/lib/index.js#L199)
     * @example
     * const metadata = metalsmith.metadata();
     */
    metadata(): object;
    /**
     * Add a `plugin` function to the stack.  
     * [API Docs](https://metalsmith.io/api/#Metalsmith+use) | [Source code](https://github.com/metalsmith/metalsmith/blob/v2.6.0/lib/index.js#L164)
     * @example
     * import markdown from '@metalsmith/markdown'
     * metalsmith.use(markdown({ gfm: true }))
     */
    use(plugin: Metalsmith.Plugin | Metalsmith.Plugin[]): Metalsmith;
    /**
     * Set the {@linkcode Metalsmith.ignores} files/paths to ignore loading into Metalsmith.  
     * [API Docs](https://metalsmith.io/api/#Metalsmith+ignore) | [Source code](https://github.com/metalsmith/metalsmith/blob/v2.6.0/lib/index.js#L316)
     * @example
     * metalsmith.ignore("corrupted.html");
     * metalsmith.ignore(function (filepath: string, stats: Stats) {
     *   return stats.isDirectory() && path.basename(filepath) === 'nested';
     * });
     */
    ignore(files: string | string[] | Metalsmith.Ignore | Metalsmith.Ignore[]): Metalsmith;
    /**
     * Get the array of {@linkcode Metalsmith.ignores} files/paths.  
     * [API Docs](https://metalsmith.io/api/#Metalsmith+ignore) | [Source code](https://github.com/metalsmith/metalsmith/blob/v2.6.0/lib/index.js#L316)
     * @example
     * const ignored = metalsmith.ignore();
     */
    ignore(): string[];
    /**
     * Match filepaths in the source directory by [glob](https://en.wikipedia.org/wiki/Glob_(programming)) pattern.
     * If `input` is not specified, patterns are matched against `Object.keys(files)`  
     * [API Docs](https://metalsmith.io/api/#Metalsmith+match) | [Source code](https://github.com/metalsmith/metalsmith/blob/v2.6.0/lib/index.js#L346)
     * @example
     * // match all .html files at the source dir root but omit files starting with a dot:
     * metalsmith.match('*.html', Object.keys(files), { dot: false })
     */
    match(pattern:string|string[], input?:string[], options?:Omit<micromatch.Options, 'format'>): string[];
    /**
     * Resolve `paths` relative to the root directory.  
     * [API Docs](https://metalsmith.io/api/#Metalsmith+path) | [Source code](https://github.com/metalsmith/metalsmith/blob/v2.6.0/lib/index.js#L332)
     * @example
     * const path = metalsmith.path("./dist", "assets");
     */
    path(...paths: string[]): string;
    /**
     * Perform the build with the current settings outputting to {@linkcode Metalsmith.destination}.  
     * [API Docs](https://metalsmith.io/api/#Metalsmith+build) | [Source code](https://github.com/metalsmith/metalsmith/blob/v2.6.0/lib/index.js#L407)
     * @example
     * metalsmith.build()
     *   .then(files => console.log(`Build success. Processed ${files.length}`))
     *   .catch(err => { throw err })
     */
    build(): Promise<Metalsmith.Files>;
    /**
     * Perform the build with the current settings outputting to {@linkcode Metalsmith.destination}.  
     * [API Docs](https://metalsmith.io/api/#Metalsmith+build) | [Source code](https://github.com/metalsmith/metalsmith/blob/v2.6.0/lib/index.js#L407)
     * @example
     * metalsmith.build((err, files) => {
     *   if (err) throw err
     *   console.log(`Build success. Processed ${files.length}`)
     * });
     */
    build(callback: Metalsmith.Callback): void;
    /**
     * Process files through {@linkcode Metalsmith.plugins} without writing out files.  
     * [API Docs](https://metalsmith.io/api/#Metalsmith+process) | [Source code](https://github.com/metalsmith/metalsmith/blob/v2.6.0/lib/index.js#L549)
     * @example
     * metalsmith.process()
     *  .then(files => console.log(`Done processing ${files.length} files.`))
     *  .catch(err => { throw err })
     */
    process(): Promise<Metalsmith.Files>;
    /**
     * Process files through {@linkcode Metalsmith.plugins} without writing out files.  
     * [API Docs](https://metalsmith.io/api/#Metalsmith+process) | [Source code](https://github.com/metalsmith/metalsmith/blob/v2.6.0/lib/index.js#L549)
     * @example
     * metalsmith.process((err, files) => {
     *   if (err) throw err
     *   console.log(`Done processing ${files.length} files.`))
     * })
     */
    process(callback: Metalsmith.Callback): void;
    /**
     * Run a set of files through the plugins stack.  
     * [API Docs](https://metalsmith.io/api/#Metalsmith+run) | [Source code](https://github.com/metalsmith/metalsmith/blob/v2.6.0/lib/index.js#L581)
     * @example
     * const file = { contents: Buffer.from('contents') }
     * metalsmith.run({ 'index.html': file } , (err, files) => { if (err) {throw err;}});
     */
    run(
      files: Metalsmith.Files,
      callback: Metalsmith.Callback
    ): void;
    /**
     * `Run` a set of files through the plugins stack.  
     * [API Docs](https://metalsmith.io/api/#Metalsmith+run) | [Source code](https://github.com/metalsmith/metalsmith/blob/v2.6.0/lib/index.js#L581)
     * @example
     * const file = { contents: Buffer.from('contents') }
     * metalsmith.run({ 'index.html': file }, metalsmith.plugins, (err, files) => { if (err) {throw err;}});
     */
    run(
      files: Metalsmith.Files,
      /** Defaults to {@linkcode Metalsmith.plugins} */
      plugins: Metalsmith.Plugin[],
      callback: Metalsmith.Callback
    ): void;
    /**
     * `Run` a set of files through the plugins stack.  
     * [API Docs](https://metalsmith.io/api/#Metalsmith+run) | [Source code](https://github.com/metalsmith/metalsmith/blob/v2.6.0/lib/index.js#L581)
     * @example
     * const file = { contents: Buffer.from('contents') }
     * metalsmith.run({ 'index.html': file }, metalsmith.plugins)
     *   .then(files => {})
     *   .catch(err => { if (err) {throw err;}});
     */
    run(
      files: Metalsmith.Files,
      /** Defaults to {@linkcode Metalsmith.plugins} */
      plugins?: Metalsmith.Plugin[]
    ): Promise<Metalsmith.Files>;
    /**
     * Read a dictionary of files from a `dir`, parsing frontmatter *(promise variant)*.  
     * If no directory is provided, it will default to {@linkcode Metalsmith.source}.  
     * [API Docs](https://metalsmith.io/api/#Metalsmith+read) | [Source code](https://github.com/metalsmith/metalsmith/blob/v2.6.0/lib/index.js#L625)
     * @example
     * metalsmith.read('relative/to/msdir')
     *  .then(files => console.log(files))
     *  .catch(err => { throw err })
     */
    read(
      /** Directory to read. Defaults to {@linkcode Metalsmith.source} */
      dir?: string
    ): Promise<Metalsmith.Files>;
    /**
     * Read a dictionary of files from a `dir`, parsing frontmatter.  
     * If no directory is provided, it will default to {@linkcode Metalsmith.source}.  
     * [API Docs](https://metalsmith.io/api/#Metalsmith+read) | [Source code](https://github.com/metalsmith/metalsmith/blob/v2.6.0/lib/index.js#L625)
     * @example
     * metalsmith.read('relative/to/msdir', (err, files) => {
     *   if (err) throw err
     *   console.log(files)
     * });
     */
    read(
      /** Directory to read. Defaults to {@linkcode Metalsmith.source} */
      dir: string,
      callback: Metalsmith.Callback
    ): void
    /**
     * Read a `file` by path. Relative paths resolve to {@linkcode Metalsmith.source}.  
     * [API Docs](https://metalsmith.io/api/#Metalsmith+readFile) | [Source code](https://github.com/metalsmith/metalsmith/blob/v2.6.0/lib/index.js#L663)
     * @example
     * metalsmith.readFile('index.md')
     *  .then(file => {
     *    const { contents, stat, mode, ...metadata } = file
     *  })
     *  .catch(err => { throw err });
     */
    readFile(file: string): Promise<Metalsmith.File>;
    /**
     * Read a `file` by path. Relative paths resolve to {@linkcode Metalsmith.source}.  
     * [API Docs](https://metalsmith.io/api/#Metalsmith+readFile) | [Source code](https://github.com/metalsmith/metalsmith/blob/v2.6.0/lib/index.js#L663)
     * @example
     * metalsmith.readFile("a.html", (err, file) => {
     *   if (err) throw err
     *   const { contents, stat, mode, ...metadata } = file
     * });
     */
    readFile(file: string, callback: (err:Error|null, file?:Metalsmith.File) => void): void;
    /**
     * Write an object of {@linkcode Metalsmith.Files} to a destination `dir`. Relative paths resolve to {@linkcode Metalsmith.destination}.  
     * [API Docs](https://metalsmith.io/api/#Metalsmith+write) | [Source code](https://github.com/metalsmith/metalsmith/blob/v2.6.0/lib/index.js#L719)
     * @example
     * const files = {
     *   'index.html': { contents: Buffer.from('...') }
     * }
     * metalsmith.write(files, metalsmith.path("./dist"));
     */
    write(files: Metalsmith.Files, dir: string, callback: Metalsmith.Callback): void;
    /**
     * Write an object of {@linkcode Metalsmith.Files} to a destination `dir`. Relative paths resolve to {@linkcode Metalsmith.destination}.  
     * [API Docs](https://metalsmith.io/api/#Metalsmith+write) | [Source code](https://github.com/metalsmith/metalsmith/blob/v2.6.0/lib/index.js#L719)
     * @example
     * metalsmith.write({fileA: "a.html"} , metalsmith.path("./dist"));
     */
    write(files: Metalsmith.Files, callback: Metalsmith.Callback): void;
    /**
     * Write an object of {@linkcode Metalsmith.Files} to a destination `dir`. Relative paths resolve to {@linkcode Metalsmith.destination}.  
     * [API Docs](https://metalsmith.io/api/#Metalsmith+write) | [Source code](https://github.com/metalsmith/metalsmith/blob/v2.6.0/lib/index.js#L719)
     * @example
     * const file = { contents: Buffer.from('...')
     * metalsmith.write({ 'index.html': file })
     *  .then(() => console.log('Files written'))
     *  .catch(err => { throw err })
     */
    write(files: Metalsmith.Files, dir?:string): Promise<void>;
    /**
     * Write {@linkcode Metalsmith.File|data} to `filepath`. Relative paths resolve to {@linkcode Metalsmith.destination}.  
     * [API Docs](https://metalsmith.io/api/#Metalsmith+writeFile) | [Source code](https://github.com/metalsmith/metalsmith/blob/v2.6.0/lib/index.js#L650)
     * @example
     * const file = { contents: Buffer.from('File Contents') }
     * metalsmith.writeFile("test.html", file)
     *  .then(() => console.log('File written'))
     *  .catch(err => { throw err })
     */
    writeFile(filepath: string, data: Metalsmith.File): Promise<void>;
    /**
     * Write {@linkcode Metalsmith.File|data} to `filepath`. Relative paths resolve to {@linkcode Metalsmith.destination}.    
     * [API Docs](https://metalsmith.io/api/#Metalsmith+writeFile) | [Source code](https://github.com/metalsmith/metalsmith/blob/v2.6.0/lib/index.js#L650)
     * @example
     * const file = { contents: Buffer.from('File Contents') }
     * metalsmith.writeFile("test.html", file, (err) => {
     *   if (err) throw err
     *   console.log('File written')
     * })
     */
    writeFile(filepath: string, data: Metalsmith.File, callback:(error:Error|null) => void): void;

    /**
     * Initialize a plugin {@linkcode Metalsmith.Debugger}  
     * [API Docs](https://metalsmith.io/api/#Metalsmith+debug) | [Source code](https://github.com/metalsmith/metalsmith/blob/v2.6.0/lib/debug.js)
     * @example
     * const debugger = metalsmith.debug('metalsmith-myplugin')
     *
     * debug('a log')           // logs 'metalsmith-myplugin a log'
     * debug.info('an info')    // logs 'metalsmith-myplugin:info an info'
     * debug.warn('a warning')  // logs 'metalsmith-myplugin:warn a warning'
     * debug.error('an error')  // logs 'metalsmith-myplugin:error an error'
     */
    debug: {
    (
      /** A metalsmith plugin debug namespace */
      namespace:string
    ): Metalsmith.Debugger;

      enable(namespaces:string): void;
      disable(): void;
      handle(...args:any[]): void;
      colors: boolean;
      enabled: boolean;
    }

    /**
     * The (read-only) list of plugins `use`'d by the current metalsmith instance.
     * When read from inside a plugin, the list is guaranteed to be complete
     */
    readonly plugins: Metalsmith.Plugin[];

    /**
     * The (read-only) list of ignores of the current metalsmith instance
     */
    readonly ignores: string[];
}

/**
 * Initialize a new `Metalsmith` builder with a working `directory`.  
 * [API Docs](https://metalsmith.io/api/#Metalsmith) | [Source code](https://github.com/metalsmith/metalsmith/blob/v2.6.0/lib/index.js#L119)
 * @example
 * import { fileURLToPath } from 'url'
 * import { dirname } from 'path'
 * import Metalsmith from 'metalsmith'
 * 
 * const __dirname = dirname(fileURLToPath(import.meta.url))
 * const metalsmith = Metalsmith(__dirname)
 */
declare function Metalsmith(directory: string): Metalsmith;

declare namespace Metalsmith {
    /**
     * A Metalsmith plugin is a function that is passed the file list, the metalsmith instance, and a `done` callback.
     * Calling the callback is required for asynchronous plugins, and optional for synchronous plugins.
     */
    type Plugin = (files: Files, metalsmith: Metalsmith, callback: DoneCallback) => void|Promise<void>;
    type DoneCallback = (err?: Error) => void;
    type Callback = (err: Error | null, files: Files) => void;
    type Ignore = (path: string, stat: Stats) => void;

    /**
     * Metalsmith representation of a file
     */
    type File<AdditionalProperties extends Record<string, unknown> = Record<string, unknown>> = {
        /** A Node {@linkcode Buffer} that can be `.toString`'ed to obtain its human-readable contents */
        contents: Buffer;
        /** A Node {@linkcode Stats} object with extra filesystem metadata and methods (like {@linkcode Stats.isFile}) */
        stats?: Stats;
        /** Octal permission {@linkcode Mode} of a file */
        mode?: string;
    } & AdditionalProperties

    /**
     * Metalsmith representation of the files in {@linkcode Metalsmith.source}.
     * The keys represent the file paths and the values are {@linkcode Metalsmith.File} objects
     */
    interface Files {
        [filepath: string]: File;
    }
    /** Metalsmith debugger */
    interface Debugger extends DebugDebugger {
      info: DebugDebugger;
      warn: DebugDebugger;
      error: DebugDebugger;
    }

    interface MatterOptions {
      language?: string
      excerpt?: boolean | ((file:GrayMatterFile<string>, options: Metalsmith.MatterOptions) => {})
      excerpt_separator?: string
      delimiters?: string | string[]
      engines?: {
        [engine:string]: ((file:string) => any) | {
          parse: (file:string) => any
          stringify?: (data:any) => string
        }
      }
    }
}

export = Metalsmith;
