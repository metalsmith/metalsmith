---
title: "Metalsmith"
description: "An extremely simple, pluggable static site generator."
autotoc: true
view: layout.twig
---

# Welcome

You want to build a website or blog with a static site generator. Well, here is our elevator pitch. It's as easy as that:

```JavaScript
var Metalsmith  = require('metalsmith');
var collections = require('metalsmith-collections');
var layouts     = require('metalsmith-layouts');
var markdown    = require('metalsmith-markdown');
var permalinks  = require('metalsmith-permalinks');


Metalsmith(__dirname)         // __dirname defined by node.js:
                              // name of current working directory
  .metadata({                 // add any variable you want
                              // use them in layout-files
    sitename: "My Static Site & Blog",
    siteurl: "http://example.com/",
    description: "It's about saying »Hello« to the world.",
    generatorname: "Metalsmith",
    generatorurl: "http://metalsmith.io/"
  })
  .source('./src')            // source directory
  .destination('./build')     // destination directory
  .clean(true)                // clean destination before
  .use(collections({          // group all blog posts by internally
    posts: 'posts/*.md'       // adding key 'collections':'posts'
  }))                         // use `collections.posts` in layouts
  .use(markdown())            // transpile all md into html
  .use(permalinks({           // change URLs to permalink URLs
    relative: false           // put css only in /css
  }))
  .use(layouts({              // wrap layouts around html
    engine: 'handlebars',     // use the layout engine you like
  }))
  .build(function(err) {      // build process
    if (err) throw err;       // error handling is required
  });
```

You want to try yourself, if it is really this easy. Have a go:

```bash
$ git clone https://github.com/metalsmith/metalsmith.git
$ cd metalsmith/examples/static-site
$ make
```

## A Little Secret

We keep referring to Metalsmith as a "static site generator", but it's a lot more than that. Since everything is a plugin, the core library is actually just an abstraction for manipulating a directory of files.

Which means you could just as easily use it to make...

```
<ul class="Example-list">
{% for example in examples %}
  <li class="Example">
    <h1 class="Example-title">{{ example.name }}</h1>
    <ol class="Example-step-list">
    {% for step in example.steps %}
      <li class="Example-step ss-{{ step.icon }}">{{ step.text }}</li>
    {% endfor %}
    </ol>
  </li>
{% endfor %}
</ul>
```

The plugins are all reusable. That PDF generator plugin for eBooks? Use it to generate PDFs for each of your blog posts too!

Check out [the code examples](https://github.com/segmentio/metalsmith/tree/master/examples) to get an idea for what's possible.

## License

The MIT License (MIT)

Copyright &copy; 2014, Segment.io \<friends@segment.io\>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
