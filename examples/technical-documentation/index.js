var Metalsmith = require("metalsmith");
var markdown = require("metalsmith-markdown");
var twig = require("metalsmith-twig");
var autotoc = require("metalsmith-autotoc");
var headings = require("metalsmith-headings-identifier");
var metallic = require("metalsmith-metallic");
var assets = require("metalsmith-assets");
var collections = require("metalsmith-auto-collections");

Metalsmith(__dirname)
  // metadata
  .metadata({
    title: "API Documentation",
    version: "1.0.0",
    generator: "Metalsmith",
    url: "http://www.metalsmith.io/"
  })
  // markdown (.md) files
  .source("./src")
  // rendered html files
  .destination("./build")
  // remove old files at destination
  .clean(true)
  // render files by markdown
  .use(markdown())
  // group files by collection tag at every file
  .use(
    collections({
      pattern: ['**/*.md', '!*.md']
    })
  )
  // generate toc
  .use(autotoc({ selector: "h2, h3" }))
  // link to headlines and icon
  .use(
    headings({
      linkTemplate: "<a class='anchor' href='#%s'><span></span></a>"
    })
  )
  // code rendering
  .use(metallic())
  // twig templates (default: ./views)
  .use(twig())
  // copy css
  .use(
    assets({
      source: "./assets", // relative to the working directory
      destination: "./media" // relative to the build directory
    })
  )
  // run
  .build(function(err, files) {
    if (err) {
      throw err;
    }
  });
