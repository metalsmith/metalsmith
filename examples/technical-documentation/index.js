var Metalsmith  = require('metalsmith');
var markdown    = require('metalsmith-markdown');
var twig        = require('metalsmith-twig');
var autotoc     = require('metalsmith-autotoc');
var headings    = require('metalsmith-headings-identifier');
var metallic    = require('metalsmith-metallic');
var assets      = require('metalsmith-assets');

Metalsmith(__dirname)
  .metadata({
    title: "API Documentation",
    version: "1.3.5",
    generator: "Metalsmith",
    url: "http://www.metalsmith.io/"
  })
  .source('./src')
  .destination('./build')
  .clean(true)
  .use(markdown())
  .use(plugin())
  .use(autotoc({selector: 'h2, h3'}))
  .use(headings({
    linkTemplate: "<a class='anchor' href='#%s'><span></span></a>"
  }))
  .use(metallic())
  .use(twig())
  .use(assets({
    source: './assets', // relative to the working directory
    destination: './media' // relative to the build directory
  }))
  .build(function(err, files) {
    if (err) { throw err; }
  });

function plugin() {
  return function(files, metalsmith, done){
    console.log(metalsmith);
    Object.keys(files).forEach((file) => {
       console.log(files[file]);
    });
    done();
  };
}