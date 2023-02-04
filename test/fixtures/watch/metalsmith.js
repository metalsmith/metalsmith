const Metalsmith = require('../../../index')
let buildnum = 0

Metalsmith(__dirname)
  .watch(true)
  .build((err, files) => {
    if (err) throw err
    buildnum++
    process.send({ files: Object.keys(files), buildnum })
  })

process.on('disconnect', () => {})