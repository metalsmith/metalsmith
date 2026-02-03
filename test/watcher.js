const { writeFile, rename } = require('fs/promises')
const assert = require('assert')
const path = require('path')
const { rm } = require('../lib/helpers')
const Metalsmith = require('..')
const fixture = path.resolve.bind(path, __dirname, 'fixtures')

const initialFiles = ['change', 'dir/file', 'remove'].map(path.normalize)

const defaultWatchOpts = {
  alwaysStat: false,
  awaitWriteFinish: false,
  cwd: fixture('watch'),
  ignoreInitial: true,
  ignored: [],
  paths: [fixture('watch/src')]
}

describe('watcher', function () {
  let initialBuild = true

  this.timeout(10000)
  this.beforeEach(() => {
    initialBuild = true
  })
  this.afterEach(async () => {
    return Metalsmith(fixture('watch')).source('contents').destination('src').clean(true).build()
  })

  it('should set proper default options according to metalsmith config', function () {
    const ms = Metalsmith(fixture('watch'))
    ms.watch(true)

    assert.deepStrictEqual(ms.watch(), defaultWatchOpts)
  })

  it("should take into account metalsmith.ignore'd paths", function () {
    const ms = Metalsmith(fixture('watch'))
    ms.ignore('ignored')
    ms.watch(true)

    assert.deepStrictEqual(ms.watch(), { ...defaultWatchOpts, ignored: ['ignored'] })
  })

  it('should allow overwriting certain chokidar options', function () {
    const ms = Metalsmith(fixture('watch'))
    ms.ignore('ignored')
    ms.watch({
      useFsEvents: true,
      awaitWriteFinish: {
        stabilityTreshold: 500
      },
      usePolling: false,
      ignored: []
    })

    assert.deepStrictEqual(ms.watch(), {
      ...defaultWatchOpts,
      useFsEvents: true,
      awaitWriteFinish: {
        stabilityTreshold: 500
      },
      usePolling: false,
      ignored: ['ignored']
    })
  })

  it('should detect added files', async function () {
    const addFile = async () => await writeFile(path.join(fixture('watch/src'), 'added'), '')
    const ms = Metalsmith(fixture('watch'))

    return new Promise((resolve, reject) => {
      ms.watch(true).build((err, files) => {
        if (err) reject(err)
        else {
          if (initialBuild) {
            initialBuild = false
            addFile()
            // this will only trigger if the if clause succeeds in triggering the chokidar watcher
          } else {
            ms.watch(false)
            try {
              assert.deepStrictEqual(Object.keys(files), [...initialFiles, 'added'])
              resolve()
            } catch (err) {
              reject(err)
            }
          }
        }
      })
    })
  })

  it('should detect removed files', async function () {
    const remove = async () => await rm(path.join(fixture('watch/src'), 'remove'))
    const ms = Metalsmith(fixture('watch'))

    return new Promise((resolve, reject) => {
      ms.watch(true).build((err, files) => {
        if (err) reject(err)
        else {
          if (initialBuild) {
            initialBuild = false
            remove()
            // this will only trigger if the if clause succeeds in triggering the chokidar watcher
          } else {
            ms.watch(false)
            try {
              assert.deepStrictEqual(Object.keys(files), initialFiles.slice(0, 2))
              resolve()
            } catch (err) {
              reject(err)
            }
          }
        }
      })
    })
  })

  it('should detect changed files', async function () {
    const change = async () => await writeFile(path.join(fixture('watch/src'), 'change'), 'body')
    const ms = Metalsmith(fixture('watch'))

    return new Promise((resolve, reject) => {
      ms.watch(true).build((err, files) => {
        if (err) reject(err)
        else {
          if (initialBuild) {
            initialBuild = false
            change()
            // this will only trigger if the if clause succeeds in triggering the chokidar watcher
          } else {
            ms.watch(false)
            try {
              assert.strictEqual(files['change'].contents.toString(), 'body')
              resolve()
            } catch (err) {
              reject(err)
            }
          }
        }
      })
    })
  })

  it('should detect moved files', async function () {
    const change = async () =>
      await rename(path.join(fixture('watch/src'), 'change'), path.join(fixture('watch/src'), 'renamed'))
    const ms = Metalsmith(fixture('watch'))
    initialBuild = 0

    return new Promise((resolve, reject) => {
      ms.watch(true).build((err, files) => {
        if (err) reject(err)
        else {
          initialBuild += 1
          if (initialBuild === 1) {
            change()
            // this will only trigger if the if clause succeeds in triggering the chokidar watcher
          } else {
            if (initialBuild === 3) {
              ms.watch(false)
              try {
                assert.deepStrictEqual(Object.keys(files), initialFiles.slice(1).concat(['renamed']))
                resolve()
              } catch (err) {
                reject(err)
              }
            }
          }
        }
      })
    })
  })

  it('should graciously batch file ops', async function () {
    const batch = async () => {
      return Promise.all([
        rename(path.join(fixture('watch/src'), 'change'), path.join(fixture('watch/src'), 'renamed')),
        writeFile(path.join(fixture('watch/src'), 'added'), 'body'),
        new Promise((resolve, reject) => rm(path.join(fixture('watch/src'), 'remove')).then(resolve, reject))
      ])
    }
    const ms = Metalsmith(fixture('watch'))
    // windows file watchers are apparently slower, triggering an extra run
    initialBuild = 0

    return new Promise((resolve, reject) => {
      ms.watch(true).build(async (err, files) => {
        if (err) reject(err)
        else {
          initialBuild += 1
          if (initialBuild === 1) {
            try {
              await batch()
            } catch (err) {
              reject(err)
            }
            // this will only trigger if the if clause succeeds in triggering the chokidar watcher
          } else {
            try {
              if (initialBuild > 10) throw new Error('Strict equality failure after 10 rounds')
              // doing the sort here because the order of execution of the batch is not guaranteed
              assert.deepStrictEqual(
                Object.keys(files).sort(),
                initialFiles.slice(1, 2).concat(['added', 'renamed']).sort()
              )
              ms.watch(false).then(resolve)
            } catch (err) {
              if (err.message.startsWith('Strict equality failure')) {
                reject(err)
              }
            }
          }
        }
      })
    })
  })

  it('should pass synchronous errors to the watch callback', async function () {
    const ms = Metalsmith(fixture('watch'))
    const throwsError = () => {
      throw new Error('failure')
    }

    return new Promise((resolve, reject) => {
      ms.watch(true)
        .use(throwsError)
        .build((err) => {
          try {
            assert(err instanceof Error)
            ms.watch(false).then(resolve)
          } catch (err) {
            reject(err)
          }
        })
    })
  })

  it('should pass asynchronous errors to the watch callback', async function () {
    const ms = Metalsmith(fixture('watch'))
    const throwsError = (files, ms, done) => {
      done(new Error('failure'))
    }

    return new Promise((resolve, reject) => {
      ms.watch(true)
        .use(throwsError)
        .build((err) => {
          try {
            assert(err instanceof Error)
            ms.watch(false).then(resolve)
          } catch (err) {
            reject(err)
          }
        })
    })
  })
})
