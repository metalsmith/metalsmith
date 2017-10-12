---
title: "Metadata & debugging"
description: "An extremely simple, pluggable static site generator."
autotoc: true
view: layout.twig
collection: "Getting Started"
---

# Metadata & debugging

For Metalsmith we have stated that everything is a plugin. That is true, but in addition the Metalsmith core also provides for a **`metadata()`** function. You can specify arbitrary **`{property: property value}`** pairs and these information will be globally accessible from each plugin.

```JavaScript
var debug = require('metalsmith-debug');

...

Metalsmith(__dirname)            
  .source('sourcepath')      
  .destination('destpath')   
  .clean(false)
  .metadata({
      author: 'John Doe',
      site: 'http://example.com'
  })
  .use(markdown())
  .use(layouts({
    engine: 'handlebars'
  }))
  .use(debug())             // displays debug info on the console
  .build(function(err) {         
    if (err) throw err;
  });
```

As you have seen in the code above, we have also introduced a plugin named [**`metalsmith-debug`**](https://github.com/mahnunchik/metalsmith-debug). For this plugin to actually show debug information you need to define an environment variable `DEBUG` and set it to:

```bash
$ DEBUG=metalsmith:*
```

The source and destination path, the metadata and all files are then logged to the console.