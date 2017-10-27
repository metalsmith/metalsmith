var Metalsmith = require("metalsmith");
var markdown = require("metalsmith-markdown");
var twig = require("metalsmith-twig");
var headings = require("metalsmith-headings-identifier");
var metallic = require("metalsmith-metallic");
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
  // run
  .build(function(err, files) {
    if (err) {
      throw err;
    }
  });
