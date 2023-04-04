const chokidar = require('chokidar')
// to be replaced in distant future by native structuredClone when dropping Node <17 support
const cloneDeep = require('lodash.clonedeep')
const crypto = require('crypto')
const { relative } = require('path')
const { rm } = require('./helpers')

function sourceRelPath(p, ms) {
  return relative(ms.source(), ms.path(p))
}
function isInSource(p) {
  return !p.startsWith('..')
}

function computeHashMap(files) {
  return Object.entries(files).reduce((hashes, [path, file]) => {
    hashes[path] = crypto.createHash('md5').update(file.contents).digest('hex')
    return hashes
  }, {})
}

/**
 * @type {Object<string, string>} HashMap
 */

/**
 * Return the keys of `map1` that are different from `map2`
 * @param {HashMap} map1
 * @param {HashMap} map2
 * @returns {Array}
 */
function diffHashMap(map1, map2) {
  return Object.keys(map1).filter((path) => map1[path] !== map2[path])
}

module.exports = function watchable(files, metalsmith) {
  const clean = metalsmith.clean()
  const meta = metalsmith.metadata()
  const fileCache = files
  let lastHashmap

  function rerun() {
    return metalsmith.metadata(meta).run(cloneDeep(fileCache), metalsmith.plugins)
  }

  function transformFilesObj(evt, p, metalsmith) {
    // we only care about in-source files & dirs to update the fileCache
    // other files are eventually added or processed by plugins
    let filesTransform = Promise.resolve()
    const relPath = sourceRelPath(p, metalsmith)

    if (isInSource(relPath)) {
      switch (evt) {
        case 'unlinkDir':
          metalsmith.match(relPath, Object.keys(fileCache)).forEach((r) => delete fileCache[r])
          break
        case 'unlink':
          delete fileCache[relPath]
          break
        case 'add':
        case 'change':
          filesTransform = metalsmith.readFile(metalsmith.path(p)).then((file) => {
            fileCache[relPath] = file
          })
          break
      }
    }

    return filesTransform
  }

  return function watcher({ paths, ...options }, onRebuild) {
    const watcher = chokidar.watch(paths || metalsmith.source(), options)

    const eventqueue = []
    // eslint-disable-next-line no-unused-vars
    let inTheMiddleOfABuild = false
    let run

    watcher.on('all', (evt, p) => {
      // eslint-disable-next-line no-console
      console.log(evt, p)

      // the metalsmith Files object does not output empty dirs,
      // wait for the file add/change events instead
      if (evt === 'addDir') return

      eventqueue.push([evt, p])

      clearTimeout(run)
      run = setTimeout(() => {
        inTheMiddleOfABuild = true
        const fileTransforms = Promise.all(eventqueue.map(([evt, p]) => transformFilesObj(evt, p, metalsmith)))

        fileTransforms.then(() => {
          eventqueue.splice(0, eventqueue.length)
          const latestRun = rerun()

          if (clean) {
            latestRun
              .then(
                (files) => onRebuild(null, files),
                (err) => onRebuild(err)
              )
              .finally(() => {
                inTheMiddleOfABuild = false
              })
            return
          }

          latestRun.then(
            (files) => {
              const newHashMap = computeHashMap(files)
              const changedOrRemoved = diffHashMap(lastHashmap, newHashMap)
              const addedFiles = diffHashMap(newHashMap, lastHashmap).filter((p) => !changedOrRemoved.includes(p))
              const removedFiles = changedOrRemoved.filter((f) => !files[f])
              const changedFiles = changedOrRemoved.filter((f) => !!files[f])
              const output = [...addedFiles, ...changedFiles].reduce((all, current) => {
                all[current] = files[current]
                return all
              }, {})
              lastHashmap = newHashMap
              // eslint-disable-next-line no-console
              console.log({ addedFiles, removedFiles, changedFiles })

              Promise.all(removedFiles.map((f) => rm(f)))
                .then(() => onRebuild(null, output), onRebuild)
                .finally(() => {
                  inTheMiddleOfABuild = false
                })
            },
            (err) => onRebuild(err)
          )
        })
      }, 1000)
    })
    return new Promise((resolve, reject) => {
      rerun()
        .then((files) => {
          if (!clean) lastHashmap = computeHashMap(files)
          watcher.on('ready', () => {
            onRebuild(null, files)
            resolve(function closeWatcher() {
              return watcher.unwatch(paths).close()
            })
          })
        })
        .catch(reject)
    })
  }
}
