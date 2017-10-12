---
title: "Metadata"
description: "An extremely simple, pluggable static site generator."
autotoc: false
view: layout.twig
collection: "API"
---

# Metadata API

Add metadata to your files to access these build features. By default, Metalsmith uses a few different metadata fields:

- `contents` - The body content of the file, not including any [YAML frontmatter](https://middlemanapp.com/basics/frontmatter/).
- `mode` - The numeric version of the [file's mode](http://en.wikipedia.org/wiki/Modes_%28Unix%29).

You can add your own metadata in two ways:

- Using [YAML frontmatter](https://middlemanapp.com/basics/frontmatter/) at the top of any file.
- Enabling [a plugin](https://github.com/segmentio/metalsmith/blob/master/Readme.md#plugins) that adds metadata programmatically.

### mode

Set the mode of the file. For example,

```bash
$ cat cleanup.sh

--
mode: 0764
--

rm -rf .
```

would be built with mode `-rwxrw-r--`, i.e. user-executable.
