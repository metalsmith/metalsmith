---
title: "Introduction"
description: "An extremely simple, pluggable static site generator."
autotoc: true
view: layout.twig
collection: "Getting Started"
---

# Introduction

Metalsmith is an extremely simple, pluggable static site generator. So let us explain why:

## Why is Metalsmith a *pluggable static site generator*?

The task of a static site generator is to produce static build files that can be deployed to a web server. These files are built from source files. Basically for a static site generator this means:

1. from a source directory read the source files and extract their information
2. manipulate the information
3. write the manipulated information to files into a destination directory

Metalsmith is built on this reasoning. It takes the information from the source files from a source directory and it writes the manipulated information to files into a destination directory. All manipulations, however, it exclusively leaves to plugins.

Manipulations can be anything: translating templates, transpiling code, replacing variables, wrapping layouts around content, grouping files, moving files and so on. This is why we say *»Everything is a Plugin«*. And of course, several manipulations can be applied one after another. Obviously, in this case the sequence matters.


## Why is Metalsmith *extremely simple*?

1. When all manipulations are performed by plugins, the only thing Metalsmith has to do in its core is to provide for an underlying logic of actually how manipulations are dealt with and for a defined interface for the plugins. To achieve this, we only needed around 400 lines of code --- have a [look at the source yourself](https://github.com/metalsmith/metalsmith/blob/master/lib/index.js). We believe this is rather simple.

2. For manipulations Metalsmith uses a very clever, but extremely simple idea. All source files are initially converted into JavaScript objects with the usual **`{property: property value}`** pairs. These **`{property: property value}`** pairs contain information on the original file itself (such as its **`birthtime`** or **`path`**) and on its **`content`**. The JavaScript object for each file is then supplemented with all variables either specified in the front-matter of the file or elsewhere. The manipulations performed by the plugins are now nothing else then modifications applied to the JavaScript objects either by changing the properties or the property values.

3. Breaking down Metalsmith into a core and many plugins has several advantages. It reduces complexity. It gives the user the freedom to use exactly only those plugins he or she needs. Furthermore, it distributes the honor and the burden of maintaining the Metalsmith core and its plugins onto the Metalsmith community. With this approach we hope to keep the Metalsmith environment pretty up-to-date.

4. Writing plugins itself is also rather simple. The plugin-interface is easy to understand and most plugins are also rather short.

5. Every site needs JavaScript anyway. Just like the popular task runners [gulp](http://gulpjs.com/) or [grunt](http://gruntjs.com/) Metalsmith is programmed in JavaScript. So, you do not have to rely on a further language such as Ruby, Python or Go. This also helps to keep your workflow simple.