var Metalsmith = require('metalsmith');
var pug        = require('metalsmith-pug');

Metalsmith(__dirname)
    .source('./src')
    .destination('./build')
    .clean(false)

    // Middleware to load in a JSON file specified in
    // YAML front matter. This takes the `jsonFileLocation`
    // attribute, opens that path, and loads it into
    // `jsonData` in each page's metadata
    .use(function(pages, metalsmith, done){
        for(var pageUrl in pages){
            if(typeof pages[pageUrl].jsonFileLocation != 'undefined'){
                pages[pageUrl].jsonData = require(pages[pageUrl].jsonFileLocation);
                console.log("Loaded json data for page " + pageUrl);
            }
        }

        done();
    })

    // Apply the metalsmith-pug middleware to render Pug
    // templates with the metalsmith file metadata.
    .use(pug({
        // Expose the Metalsmith per-page metadata to
        // the Pug template.
        useMetadata: true
    }))

    // Run the build
    .build(function(err){
        if(err) { throw err; }
        console.log("Done build")
    })