---
title: "How does it work"
description: "An extremely simple, pluggable static site generator."
autotoc: true
view: layout.twig
collection: "Documentation"
---

# How does it work

## More details

Metalsmith works in three simple steps:

  1. Read all the files in a source directory and transform them into a JavaScript object of JavaScript objects.
  2. Invoke a series of plugins that manipulate these objects.
  3. According to the information contained in the resulting objects write them as files into a destination directory

Every file in the source directory is transformed into a JavaScript Object. For instance,

`my-file.md:`

```Markdown
---
title: A Catchy Title
draft: false
---

An unfinished article...
```

becomes

```JavaScript
{
  'relative_to_sourcepath/my-file.md': {
    title: 'A Catchy Title',
    draft: false,
    contents: 'An unfinished article...',
    mode: '0664',
    stats: {
      /* keys with information on the file */
    }    
  }
}
```

where the content of the file is always put into the property value of **`contents`**. For illustration purposes only we display the value of **`contents`** as a string. Technically, however, the property value of **`contents`** is realised as a `new Buffer('...')` object, in order to also handle straight binary data well. **`mode`** contains the permission the file has and **`stats`** has more technical information on the file such as `size` or `birthtime`. Furthermore, the file is also parsed for YAML-front-matter information, which will then also be put into the JS Object. Thus, we finally have an JavaScript object of JavaScript objects. This encompassing JavaScript object is usally called **`files`** since it contains all the JavaScript objects that represent the files.

```JavaScript
{
  "relative_to_sourcepath/file1.md": {
    title: 'A Catchy Title',
    draft: false,
    contents: 'An unfinished article...',
    mode: '0664',
    stats: {
      /* keys with information on the file */
    }    
  },
  "relative_to_sourcepath/file2.md": {
    title: 'An Even Better Title',
    draft: false,
    contents: 'One more unfinished article...',
    mode: '0664',
    stats: {
      /* keys with information on the file */
    }    
  }
}
```

The plugins can manipulate the JavaScript objects representing the original files however they want, and writing one is super simple. Here's the code for the **`drafts()`** plugin from above. You can also find the code in the [github repository for `metalsmith-drafts`](https://github.com/segmentio/metalsmith-drafts). The code just runs through the JS object **`files`** and deletes all contained JavaScript objects that have a property value of **`true`** for the property **`draft`**:

```JavaScript
/**
 * Expose `plugin`.
 */
module.exports = plugin;

/**
 * Metalsmith plugin to hide drafts from the output.
 *
 * @return {Function}
 */

function plugin() {
  return function(files, metalsmith, done){
    setImmediate(done);
    Object.keys(files).forEach(function(file){
      var data = files[file];
      if (data.draft) delete files[file];
    });
  };
}
```

Of course plugins can get a lot more complicated too. That's what makes Metalsmith powerful; the plugins can do anything you want and the community has written a large amount of plugins already.

<i><b>Note:</b> The order the plugins are invoked is the order they are in the build script or the metalsmith.json file for cli implementations.  This is important for using a plugin that requires a plugins output to work.</i>

If you are still struggling with the concept we like to recommend you the [**`writemetadata()`**](https://github.com/Waxolunist/metalsmith-writemetadata) plugin. It is a metalsmith plugin that writes the **`{property: property value}`** pairs excerpted from the JavaScript objects representing the files to the filesystem as .json files. You can then view the .json files to find out how files are represented internally in Metalsmith.

```JavaScript
Metalsmith(__dirname)            
  .source('sourcepath')      
  .destination('destpath')   
  .use(markdown())          
  .use(layouts({
    engine: 'handlebars'
  }))
  .use(writemetadata({            // write the JS object
    pattern: ['**/*'],            // for each file into .json
    ignorekeys: ['next', 'previous'],
    bufferencoding: 'utf8'        // also put 'content' into .json
  }))
  .build(function(err) {         
    if (err) throw err;          
  });
```

We believe, that understanding the internal representation of files as JavaScript objects is really key to fully grasp the concept of Metalsmith. To see this, we look at what happens in the second example chain above:

So, within the Markdown chain above after applying **`.use(markdown())`** the initial representation of the `my-file.md` becomes `my-file.html`...

```JavaScript
{
  'relative_to_sourcepath/my-file.html': {
    title: 'A Catchy Title',
    draft: false,
    contents: '<p>An unfinished article...</p>',
    ...
  }
}

```

end after applying **`.use(permalinks())`** it becomes:

```JavaScript
{
  'relative_to_sourcepath/my-file/index.html': {
    title: 'A Catchy Title',
    draft: false,
    contents: '<p>An unfinished article...</p>',
    path: 'myfile',
    ...
  }
}

```

Note, that `permalinks()` is also adding a `path`--property by default.

Assuming somewhere amongst the source files we have defined a very simple standard handlebars layout file...

`layout.html`

{% raw %}
```Handlebars
<!doctype html>
<html>
<head>
  <title>{{title}}</title>
</head>
<body>
  {{{contents}}}
</body>
</html>
```
{% endraw %}

... after applying **`.use(layouts())`** in our Metalsmith chain our JavaScript object becomes:

```JavaScript
{
  'relative_to_sourcepath/my-file/index.html': {
    title: 'A Catchy Title',
    draft: false,
    contents: '<!doctype html><html><head>
               <title>A Catchy Title</title></head><body>
               <p>An unfinished article...</p>
               </body></html>',
    path: 'myfile',
    ...      
  }
}

```

Finally when the **`.build(function(err))`** is performed our JavaScript object is written to `relative_to_destpath/myfile/index.html`. So you see, how the chain works. It's rather straight forward, isn't it?

## Further information

Yes, we know. The documentation can be improved. If you want to help, give us a shout. But in the meantime have a look at the [Awesome Metalsmith list](https://github.com/metalsmith/awesome-metalsmith). There you will find references to a number of excellent tutorials, examples and use cases.