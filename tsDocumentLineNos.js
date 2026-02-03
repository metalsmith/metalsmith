const { readFileSync } = require('fs')

const Matter = readFileSync('./lib/matter.js', 'utf-8')
const Metalsmith = readFileSync('./lib/index.js', 'utf-8')

function documentLineNos(ctor, lines) {
  const regexp = new RegExp(ctor + '\\.prototype\\.(.*?)\\s*=')
  return {
    [ctor]: lines
      .split('\n')
      .map((l, i) => ({ line: l, index: i + 1 }))
      .filter((l) => l.line.trim().startsWith(ctor + '.prototype'))
      .map(({ line, index }) => `${index}:${line.match(regexp)[1]}`)
  }
}

console.log(documentLineNos('Metalsmith', Metalsmith))
console.log(documentLineNos('Matter', Matter))
