import Metalsmith from '../../../index.js'

export default Metalsmith(process.cwd())
  .source('source')
  .destination('destination')
  /* eslint-disable-next-line no-console */
  .use(() => console.log('from instance'))