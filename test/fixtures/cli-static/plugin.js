const { dirname, basename, extname, join } = require('path')
/**
 * Plugin.
 */

module.exports = () => (files, ms) => {
  for (const [path, file] of Object.entries(files))  {
    files[join(dirname(path), `${basename(path, extname(path))}.altered${extname(path)}`)] = file
    delete files[path]
  }
  const statik = ms.statik()
  for (const [path, file] of Object.entries(statik))  {
    statik[join(dirname(path), `${basename(path, extname(path))}.static${extname(path)}`)] = file
    delete statik[path]
  }
}
