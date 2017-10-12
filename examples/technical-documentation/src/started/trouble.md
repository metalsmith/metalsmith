---
title: "Troubleshooting"
description: "An extremely simple, pluggable static site generator."
autotoc: true
view: layout.twig
collection: "Getting Started"
---

# Troubleshooting

## Node Version Requirements
Metalsmith v2.0 and above uses [generators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator) which has some considerations for `node.js 0.12.x` and below.

### Using node.js 0.10.x
You have two options:

1. Upgrade to latest stable version of `node.js` (>= `0.12.x` — see "*Using `node.js 0.12.x`*" section below)
2. Use Metalsmith v1.7. Put `"metalsmith": "^1.7.0"` in your `package.json` and `npm install` that version.

### Using node.js 0.12.x
You have three options:

1. Run `node.js` with `--harmony_generators` flag set.
    1. `node --harmony_generators my_script.js`
    2. Using `package.json`: `"scripts": {"start": "node --harmony_generators my_script.js"}`. Run with `npm run`
2. `npm install` [harmonize](https://www.npmjs.com/package/harmonize) and require before Metalsmith is used. e.g. `require("harmonize")(["harmony-generators"]);`
3. Use Metalsmith v1.7. Put `"metalsmith": "^1.7.0"` in your `package.json` and `npm install` that version.