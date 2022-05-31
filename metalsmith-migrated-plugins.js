const { join } = require('path')
const { readFile } = require('fs')
const { isObject } = require('./lib/helpers')

const outdatedPlugins = [
  'markdown',
  'in-place',
  'layouts',
  'collections',
  'drafts',
  'ignore',
  'postcss',
  'permalinks',
  'default-values',
  'metadata',
  'excerpts',
  'autotoc'
]

const renamedPlugins = {
  ignore: 'remove',
  autotoc: 'table-of-contents'
}

// only provided when running npm scripts
// otherwise default to working directory
const projectDir = process.env.INIT_CWD || process.cwd()

// when reading package.json
// always fail silently as to not interrupt the install DX
readFile(join(projectDir, 'package.json'), 'utf-8', (err, data) => {
  if (err) return
  let parsed = false
  try {
    parsed = JSON.parse(data)
  } catch (err) {
    return
  }
  if (!parsed) return

  const toCheck = []

  if (isObject(parsed.devDependencies)) {
    toCheck.push.apply(toCheck, Object.keys(parsed.devDependencies))
  }
  if (isObject(parsed.dependencies)) {
    toCheck.push.apply(toCheck, Object.keys(parsed.dependencies))
  }

  const pluginMap = toCheck.reduce((all, fullname) => {
    if (!fullname.startsWith('metalsmith-')) return all
    const name = fullname.replace(/^metalsmith-/, '')
    if (outdatedPlugins.includes(name)) {
      const newName = renamedPlugins[name] ? renamedPlugins[name] : name
      all[`metalsmith-${name}`] = `@metalsmith/${newName}`
    }
    return all
  }, {})

  if (Object.keys(pluginMap).length) {
    process.stdout.write(
      `\x1b[43m\x1b[30m WARN \x1b[0m\x1b[49m\x1b[33m Metalsmith has detected deprecated core plugins that have moved to the @metalsmith org on NPM:\n\n`
    )
    Object.entries(pluginMap).forEach(([oldName, newName]) => {
      process.stdout.write(`· ${oldName} -> ${newName}\n`)
    })
    process.stdout.write(
      [
        '\nRun the commands below to migrate:',
        ` npm remove ${Object.keys(pluginMap).join(' ')}`,
        ` npm i ${Object.values(pluginMap).join(' ')}\n`,
        'For all available core plugins, see https://github.com/search?q=topic%3Ametalsmith-plugin+org%3Ametalsmith&type=Repositories',
        '\x1b[0m'
      ].join('\n')
    )
  }
})
