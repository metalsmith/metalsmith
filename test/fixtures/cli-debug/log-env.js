module.exports = () => (files, metalsmith, done) => {
  console.log(JSON.stringify(metalsmith.env()))
  done()
}