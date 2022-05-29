const metalsmith = require('.')

const ms = new metalsmith('./test/tmp').source('.').env({
  DEBUG: true
})

const app = ms.debug('app')
app('hey')

ms.use(() => {
  const test = ms.debug('testest')
  test.warn('warn')
  test.error('err')
  test.info('info')
  test('heyhey')
})
ms.build().then(
  (files) => {
    console.log('done')
  },
  (err) => {
    console.log(err)
  }
)

/* const first = Debugger('first')
const second = Debugger('second')

first.useColors = true
first('first log')

second.useColors = false
second('second log')
second.warn('second warn')
console.log(second.useColors, second.warn.useColors)

 */
