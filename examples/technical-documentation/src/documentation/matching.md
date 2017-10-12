---
title: "Matching"
description: "An extremely simple, pluggable static site generator."
autotoc: true
view: layout.twig
collection: "Documentation"
---

# Matching

Even though we touched on the topic already, we did not tackle it explicitly. We mentioned that plugins usually run through all files presented to `metalsmith`. This happens in a loop like this:

```JavaScript
Object.keys(files).forEach(function(file){
  //
  // here would be your code
  //
});
```

The question now is, how does for instance a markdown-engine know, which files to transpile? The answer is easy. Per default, `metalsmith-markdown` is checking if `file` has a `.md` or `.markdown` extension. Remember, `file` is a JavaScript object that has its full filename (including its path) as a value.
If the check is not true it jumps over it, otherwise it is passing the file to the engine. After processing it, `metalsmith-markdown` replaces the `.md` extension with an `.html` and the next plugin can now check against the new filename and so on.

A process such as this is called check for pattern matching. Many `metalsmith`-plugins employ such matching. Either they check against internally set requirements or patterns or they offer an explicit option to check against user defined matches, like we have already seen in the `writemetadata`-plugin:

```JavaScript
.use(writemetadata({            // write the JS object
  pattern: ['**/*'],            // for each file into .json
  ignorekeys: ['next', 'previous'],
  bufferencoding: 'utf8'        // also put 'content' into .json
}))
```

Pattern matching is normally based on [glob](https://github.com/isaacs/node-glob) pattern. Many plugins employ either own functions or rely on [`minimatch`](https://www.npmjs.com/package/minimatch) or [`multimatch`](https://www.npmjs.com/package/multimatch).


```JavaScript
var multimatch = require('multimatch');

[...]

  // Checks whether files should be processed
  // length is zero if no matching pattern was found
  if (multimatch(file, opts.pattern).length) {

    // process file

  }
```