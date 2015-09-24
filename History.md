
2.1.0 - September 24, 2015
--------------------------
* cli: add support for `frontmatter` option

2.0.1 - July 14, 2015
---------------------
* meta: bumping patch because `2.0.0` was mistakenly published once before

2.0.0 - July 14, 2015
---------------------
* cli: adding separate `_metalsmith` bin to allow custom transpilers
* support: no longer supporting node 0.10 natively or in tests

1.7.0 - April 30, 2015
----------------------
* add `ignore` support

1.6.0 - April 14, 2015
----------------------
* add `concurrency` support

1.5.0 - March 29, 2015
----------------------
* add ability to pass in plugins to #run

1.4.5 - March 27, 2015
----------------------
* improve plugin error handling

1.4.4 - March 27, 2015
----------------------
* fix for `isAbsolute` not being in node `0.10`

1.4.3 - March 27, 2015
----------------------
* fix variable name typo

1.4.2 - March 26, 2015
----------------------
* switch to `gray-matter` for frontmatter parsing
* fix bug in frontmatter parser

1.4.1 - March 25, 2015
----------------------
* add nicer error for invalid frontmatter

1.4.0 - March 25, 2015
----------------------
* add support for overriding the read and write directory

1.3.0 - February 6, 2015
------------------------
* adding support for local (non-npm, but still node) plugins

1.2.0 - February 4, 2015
------------------------
* add stack trace printing to cli output

1.1.1 - January 25, 2015
------------------------
* update `recursive-readdir` to `1.2.1` to fix #110

1.1.0 - January 25, 2015
------------------------
* add type checking to getter/setters
* allow for alternate config file path
* add file-specific errors on writing and reading

1.0.1 - September 30, 2014
--------------------------
* move `gnode` to regular dependencies

1.0.0 - September 29, 2014
--------------------------
* add generator support for node 0.11
* change `#join` to `#path` and use `path.resolve`
* add support for absolute `source` and `directory` paths
* add `#directory` getter and setter method
* add `#readFile` method to expose the core reading logic
* add `#writeFile` method to expose the core writing logic
* fix default `clean` setting when running the cli

0.11.0 - September 12, 2014
---------------------------
* move `clean` logic to happen at the beginning of a build

0.10.0 - August 19, 2014
------------------------
* expose `stats` on files

0.9.0 - July 13, 2014
---------------------
* add `frontmatter` option to disable parsing frontmatter

0.8.1 - July 7, 2014
--------------------
* update dependencies

0.8.0 - May 6, 2014
-------------------
* add `clean` option

0.7.0 - April 29, 2014
----------------------
* let `plugins` be an array in `metalsmith.json`

0.6.1 - April 24, 2014
----------------------
* update `ware` to `0.3.0` for passing arrays

0.6.0 - April 2, 2014
---------------------
* add `mode` handling for files

0.5.0 - March 21, 2014
----------------------
* remove destination directory when writing
* expose `#run` to run middleware stack
* fix jade examples

0.4.0 - March 14, 2014
----------------------
* change #metadata to set a clone

0.3.0 - March 8, 2014
---------------------
* change to not trim file contents

0.2.3 - March 7, 2014
---------------------
* add setting back to `#metadata`

0.2.2 - March 7, 2014
---------------------
* fix install error

0.2.1 - March 7, 2014
---------------------
* change to `chalk` from `colors`

0.2.0 - March 6, 2014
---------------------
* change to `#metadata` just being a getter

0.1.0 - February 5, 2014
------------------------
* change to `contents` always being a Buffer

0.0.4 - February 5, 2014
------------------------
* fix corrupted non-utf8 files

0.0.3 - February 5, 2014
------------------------
* expose `files` dictionary to `build` callback

0.0.2 - February 5, 2014
------------------------
* do not mix in global metadata, leave it up to plugins

0.0.1 - February 4, 2014
------------------------
:sparkles:
