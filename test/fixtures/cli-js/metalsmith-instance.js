const Metalsmith = require('../../..')

module.exports = Metalsmith(__dirname)
  .source('source')
  .destination('destination')
  /* eslint-disable-next-line no-console */
  .use(() => console.log('from instance'))