# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [unreleased]

## [2.3.0]
### Changed
* Updated dependencies ([#246])
* Erroring test reading symbolic link to dir, adds the ability to follow symlinks ([#229])
* Add the packaging metadata to build the metalsmith snap ([#249])
* Security vulnerability in dependency - upgraded ([#258])

### Removed
* Unused dependencies

[#229]: https://github.com/metalsmith/metalsmith/pull/229
[#246]: https://github.com/metalsmith/metalsmith/pull/246
[#249]: https://github.com/metalsmith/metalsmith/pull/249
[#258]: https://github.com/metalsmith/metalsmith/pull/258


## 2.2.2
This version is the same as 2.2.0. See 2.2.1.

## [2.2.1] [YANKED]
### deprecated
Please use version <= 2.2.0 or > 2.3.0. This release contains added functionality that could have undesired behaviour.


## [2.2.0] - August 11, 2016
### Added
* Add support for function ignore matchers ([#179])
* Exposing ignore to CLI ([#232])
* `process` to process files and plugins without writing files out.  ([#244])

### Changed
* only remove contents of destination directory (not the directory itself) when
  `clean` is true ([#221])

[#179]: https://github.com/metalsmith/metalsmith/issues/179
[#221]: https://github.com/metalsmith/metalsmith/pull/221
[#232]: https://github.com/metalsmith/metalsmith/pull/232
[#244]: https://github.com/metalsmith/metalsmith/pull/244


## [2.1.0] - September 24, 2015
### Added
* cli: add support for `frontmatter` option


## [2.0.1] - July 14, 2015
### Fixed
* meta: bumping patch because `2.0.0` was mistakenly published once before


## [2.0.0] - July 14, 2015
### Added
* cli: adding separate `_metalsmith` bin to allow custom transpilers

### Removed
* no longer supporting node 0.10 natively or in tests


## [1.7.0] - April 30, 2015
### Added
* `ignore` support


## [1.6.0] - April 14, 2015
### Added
* `concurrency` support


## [1.5.0] - March 29, 2015
### Added
* ability to pass in plugins to #run


## [1.4.5] - March 27, 2015
### Changed
* improve plugin error handling


## [1.4.4] - March 27, 2015
### Fixed
* fix for `isAbsolute` not being in node `0.10`


## [1.4.3] - March 27, 2015
### Fixed
* fix variable name typo


## [1.4.2] - March 26, 2015
### Changed
* switch to `gray-matter` for frontmatter parsing

### Fixed
* fix bug in frontmatter parser


## [1.4.1] - March 25, 2015
### Added
* nicer error for invalid frontmatter


## [1.4.0] - March 25, 2015
### Added
* support for overriding the read and write directory


## [1.3.0] - February 6, 2015
### Added
* support for local (non-npm, but still node) plugins


## [1.2.0] - February 4, 2015
### Added
* stack trace printing in cli output


## [1.1.1] - January 25, 2015
### Fixed
* update `recursive-readdir` to `1.2.1` to fix #110

[#110]: https://github.com/metalsmith/metalsmith/pull/110


## [1.1.0] - January 25, 2015
### Added
* add type checking to getter/setters
* allow for alternate config file path
* add file-specific errors on writing and reading


## [1.0.1] - September 30, 2014
### Fixed
* move `gnode` to regular dependencies


## [1.0.0] - September 29, 2014
### Added
* generator support for node 0.11
* support for absolute `source` and `directory` paths
* `#directory` getter and setter method
* `#readFile` method to expose the core reading logic
* `#writeFile` method to expose the core writing logic

### Changed
* change `#join` to `#path` and use `path.resolve`

### Fixed
* fix default `clean` setting when running the cli


## [0.11.0] - September 12, 2014
### Fixed
* move `clean` logic to happen at the beginning of a build


## [0.10.0] - August 19, 2014
### Added
* expose `stats` on files


## [0.9.0] - July 13, 2014
### Added
* add `frontmatter` option to disable parsing frontmatter


## [0.8.1] - July 7, 2014
### Changed
* update dependencies


## [0.8.0] - May 6, 2014
### Added
* `clean` option


## [0.7.0] - April 29, 2014
### Added
* let `plugins` be an array in `metalsmith.json`


## [0.6.1] - April 24, 2014
### Added
* update `ware` to `0.3.0` for passing arrays


## [0.6.0] - April 2, 2014
### Added
* `mode` handling for files


## [0.5.0] - March 21, 2014
### Added
* remove destination directory when writing
* expose `#run` to run middleware stack

### Fixed
* fix jade examples


## [0.4.0] - March 14, 2014
### Changed
* change #metadata to set a clone


## [0.3.0] - March 8, 2014
### Changed
* change to not trim file contents


## [0.2.3] - March 7, 2014
### Added
* add setting back to `#metadata`


## [0.2.2] - March 7, 2014
### Fixed
* install error


## [0.2.1] - March 7, 2014
### Changed
* change to `chalk` from `colors`


## [0.2.0] - March 6, 2014
### Removed
* change to `#metadata` just being a getter


## [0.1.0] - February 5, 2014
### Changed
* change to `contents` always being a Buffer


## [0.0.4] - February 5, 2014
### Fixed
* fix corrupted non-utf8 files


## [0.0.3] - February 5, 2014
### Added
* expose `files` dictionary to `build` callback


## [0.0.2] - February 5, 2014
### Changed
* do not mix in global metadata, leave it up to plugins


## 0.0.1 - February 4, 2014
:sparkles:

[unreleased]: https://github.com/metalsmith/metalsmith/compare/v2.3.0...HEAD
[2.3.0]: https://github.com/metalsmith/metalsmith/compare/v2.2.0...v2.3.0
[2.2.1]: https://github.com/metalsmith/metalsmith/compare/v2.2.0...v2.2.1
[2.2.0]: https://github.com/metalsmith/metalsmith/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/metalsmith/metalsmith/compare/v2.0.1...v2.1.0
[2.0.1]: https://github.com/metalsmith/metalsmith/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/metalsmith/metalsmith/compare/v1.7.0...v2.0.0
[1.7.0]: https://github.com/metalsmith/metalsmith/compare/v1.6.0...v1.7.0
[1.6.0]: https://github.com/metalsmith/metalsmith/compare/v1.5.0...v1.6.0
[1.5.0]: https://github.com/metalsmith/metalsmith/compare/v1.4.5...v1.5.0
[1.4.5]: https://github.com/metalsmith/metalsmith/compare/v1.4.4...v1.4.5
[1.4.4]: https://github.com/metalsmith/metalsmith/compare/v1.4.3...v1.4.4
[1.4.3]: https://github.com/metalsmith/metalsmith/compare/v1.4.2...v1.4.3
[1.4.2]: https://github.com/metalsmith/metalsmith/compare/v1.4.1...v1.4.2
[1.4.1]: https://github.com/metalsmith/metalsmith/compare/v1.4.0...v1.4.1
[1.4.0]: https://github.com/metalsmith/metalsmith/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/metalsmith/metalsmith/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/metalsmith/metalsmith/compare/v1.1.1...v1.2.0
[1.1.1]: https://github.com/metalsmith/metalsmith/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/metalsmith/metalsmith/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/metalsmith/metalsmith/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/metalsmith/metalsmith/compare/v0.11.0...v1.0.0
[0.11.0]: https://github.com/metalsmith/metalsmith/compare/v0.10.0...v0.11.0
[0.10.0]: https://github.com/metalsmith/metalsmith/compare/v0.9.0...v0.10.0
[0.9.0]: https://github.com/metalsmith/metalsmith/compare/v0.8.1...v0.9.0
[0.8.1]: https://github.com/metalsmith/metalsmith/compare/v0.8.0...v0.8.1
[0.8.0]: https://github.com/metalsmith/metalsmith/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/metalsmith/metalsmith/compare/v0.6.1...v0.7.0
[0.6.1]: https://github.com/metalsmith/metalsmith/compare/v0.6.0...v0.6.1
[0.6.0]: https://github.com/metalsmith/metalsmith/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/metalsmith/metalsmith/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/metalsmith/metalsmith/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/metalsmith/metalsmith/compare/v0.2.3...v0.3.0
[0.2.3]: https://github.com/metalsmith/metalsmith/compare/v0.2.2...v0.2.3
[0.2.2]: https://github.com/metalsmith/metalsmith/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/metalsmith/metalsmith/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/metalsmith/metalsmith/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/metalsmith/metalsmith/compare/v0.0.4...v0.1.0
[0.0.4]: https://github.com/metalsmith/metalsmith/compare/v0.0.3...v0.0.4
[0.0.3]: https://github.com/metalsmith/metalsmith/compare/v0.0.2...v0.0.3
[0.0.2]: https://github.com/metalsmith/metalsmith/compare/v0.0.1...v0.0.2
