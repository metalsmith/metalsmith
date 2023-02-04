/* eslint-env node, mocha */
/*
const { writeFile, writeFileSync } = require('fs')
const assert = require('assert')
const path = require('path')
const { rm } = require('../lib/helpers')
const watcher = require('../lib/watcher')
const equal = require('assert-dir-equal')
const Metalsmith = require('..')
const fixture = path.resolve.bind(path, __dirname, 'fixtures')

describe('watcher', function () {
  this.timeout(5000)

  let reruns, toRemove, toAdd, ms

  beforeEach(function () {
    reruns = 0
    toRemove = []
    toAdd = []
    ms = Metalsmith(fixture('watch'))
  })

  afterEach(function (done) {
    Promise.all(toRemove.map((p) => rm(p)))
      .then(() => done())
      .catch(done)
  })

  it('should', function (done) {
    let hasError = undefined
    let fsOperation
    const addPath = fixture('watch/src/added.md')
    toRemove.push(addPath, fixture('watch/expected/added.md'))
    writeFileSync(fixture('watch/expected/added.md'), 'Added')

    ms.clean(true)
      .watch(true)
      .build((err, files) => {
        if (err) hasError = err
        if (hasError) done(err)
        if (reruns === 0) {
          fsOperation = new Promise((resolve, reject) => {
            setTimeout(() => {
              reruns += 1
              writeFile(addPath, 'Added', (err) => {
                if (err) reject(err)
                else resolve()
              })
            }, 100)
          })
        } else if (reruns === 1) {
          fsOperation
            .then(() => {
              try {
                assert.strictEqual(Object.keys(files).length, 3)
                assert.strictEqual(files['added.md'].contents.toString(), 'Added')
                equal(fixture('watch/build'), fixture('watch/expected'))
                console.log(Object.keys(files))
              } catch (err) {
                hasError = err
                console.log(hasError)
              }
            })
            .catch(console.log)
            .finally(() => {
              ms.watch(false).then(() => {
                done(hasError)
              }, done)
            })
        }
      })
  })
})
*/
