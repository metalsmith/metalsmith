# Change Log
All notable changes to this project will be documented in this file.

This project adheres to [Semantic Versioning](http://semver.org).

This document follows the guidelines of [Keep A Changelog](http://keepachangelog.com).

## [Unreleased]


### Added
* ESLint (...finally!) (#305) (@Zearin)

### Removed
* **Remove Dependencies:**
  - `absolute` (save ≈21k!) (c05f9e2) (@Zearin)
  - `is` (save ≈74k!) (7eaac9e2, 54dba0c1) (@Zearin)

### Updated
Thanks to ESLint, we’ve tidied up Metalsmith’s source code a bit.

* **Dependencies:**
    - `graymatter`: 2.0.0 ▶︎ 2.1.0 (030cd8c, 5446866) (@moozzyk)

* Update `CHANGELOG.md` format to follow “[Keep A Changelog](http://keepachangelog.com)” (#266) (@Zearin)


### Fixed
* Fix test error on Windows (#158) (@moozzyk)


### Security
* Use `Buffer.from()` in supporting versions of Node.js possible (@Zearin)

**The new `npm audit` command is awesome.**  You should use it in your own projects!

#### `npm audit` vulnerability fixes
* **Development Dependencies:**
    - `coveralls`: 2.11.6 ▶︎ 3.0.1 (#308) (@Zearin)
        Fix 5 “Moderate” vulnerabilities
    - `metalsmith-markdown`: 0.2.1 ▶︎ 0.2.2 (#312) (@Zearin)
        Fix 1 “Low” vulnerability



## [2.3.0] - 2016-10-28
### Added
* Add packaging metadata to build the metalsmith snap ([#249])

### Updated
* Update dependencies ([#246])

### Removed
* Remove unused dependencies

### Fixed
* Fix error when reading a symbolic link to a dir ([#229])

### Security
* Upgrade dependency to include security fix ([#258])

[#229]: https://github.com/metalsmith/metalsmith/pull/229
[#246]: https://github.com/metalsmith/metalsmith/pull/246
[#249]: https://github.com/metalsmith/metalsmith/pull/249
[#258]: https://github.com/metalsmith/metalsmith/pull/258


## [2.2.2] - 2016-10-28
This version is the same as 2.2.0, and was released to counteract the accidental
release of 2.2.1. (See 2.2.1 for details.)


## [2.2.1] - 2016-10-27 [YANKED]
This release is identical to 2.3.0, but was mistakenly released as a
SemVer-patch version when it should have been released as a SemVer-minor
version. **Please use versions `<= 2.2.0` or `>= 2.2.2` instead.**


## [2.2.0] - 2016-08-11
### Added
* Add ability to use functions for `ignore` matchers ([#179])
* Add CLI option: `ignore` ([#232])
* Add `process` to process files and plugins without writing files ([#244])

### Changed
* Only remove the contents of the `destination` directory (not the directory itself) when `clean` is `true` ([#221])

[#179]: https://github.com/metalsmith/metalsmith/issues/179
[#221]: https://github.com/metalsmith/metalsmith/pull/221
[#232]: https://github.com/metalsmith/metalsmith/pull/232
[#244]: https://github.com/metalsmith/metalsmith/pull/244


## [2.1.0] - 2015-09-24
### Added
* Add CLI option: `frontmatter`


## [2.0.1] - 2015-07-14
### Fixed
* META: bump patch because `2.0.0` was mistakenly already published


## [2.0.0] - 2015-07-14
### Added
* CLI: Add separate `_metalsmith` bin (to allow custom transpilers)

### Removed
* Drop support for Node 0.10 (native and tests)


## [1.7.0] - 2015-04-30
### Added
* Add `ignore`


## [1.6.0] - 2015-04-14
### Added
* Add `concurrency`


## [1.5.0] - 2015-03-29
### Added
* Add ability to pass in plugins to `#run`


## [1.4.5] - 2015-03-27
### Changed
* Improve plugin error handling


## [1.4.4] - 2015-03-27
### Fixed
* Workaround the absence of `isAbsolute` from Node 0.10


## [1.4.3] - 2015-03-27
### Fixed
* Fix typo in variable name


## [1.4.2] - 2015-03-26
### Changed
* Use `gray-matter` to parse frontmatter

### Fixed
* Fix bug in frontmatter parser


## [1.4.1] - 2015-03-25
### Changed
* Nicer errors for invalid frontmatter


## [1.4.0] - 2015-03-25
### Added
* Add ability to override the read and write directory


## [1.3.0] - 2015-02-06
### Added
* Add support for local (non-npm, but still node) plugins


## [1.2.0] - 2015-02-04
### Added
* Add stack trace to CLI output


## [1.1.1] - 2015-01-25
### Fixed
* Update `recursive-readdir` to `1.2.1` to fix [#110]

[#110]: https://github.com/metalsmith/metalsmith/pull/110


## [1.1.0] - 2015-01-25
### Added
* Add type checking to getter/setters
* Add support for alternate config file path
* Add file-specific errors on writing and reading


## [1.0.1] - 2014-09-30
### Changed
* Move `gnode` to regular dependencies


## [1.0.0] - 2014-09-29
### Added
* Add generator support for Node 0.11
* Add absolute path support for `source` and `directory`
* Add `#directory` getter and setter method
* Add `#readFile` method to expose the core reading logic
* Add `#writeFile` method to expose the core writing logic

### Changed
* Change `#join` to `#path` and use `path.resolve`

### Fixed
* CLI: Fix default `clean` setting


## [0.11.0] - 2014-09-12
### Changed
* Move `clean` logic to happen at the beginning of a build


## [0.10.0] - 2014-08-19
### Added
* Expose `stats` on files


## [0.9.0] - 2014-070-13
### Added
* Add `frontmatter` option (to disable frontmatter parsing, if desired)


## [0.8.1] - 2014-070-07
### Changed
* Update dependencies


## [0.8.0] - 2014-05-06
### Added
* Add `clean` option


## [0.7.0] - 2014-04-29
### Changed
* In `metalsmith.json`: Allow `plugins` be an array


## [0.6.1] - 2014-04-24
### Changed
* Update `ware` to `0.3.0` for passing arrays


## [0.6.0] - 2014-04-02
### Added
* `mode` handling for files


## [0.5.0] - 2014-03-21
### Added
* Remove `destination` directory when writing
* Expose `#run` to run middleware stack

### Fixed
* Fix jade examples


## [0.4.0] - 2014-03-14
### Changed
* Change `#metadata` to set a clone


## [0.3.0] - 2014-03-08
### Changed
* File contents are no longer trimmed


## [0.2.3] - 2014-03-07
### Added
* Add setting back to `#metadata`


## [0.2.2] - 2014-03-07
### Fixed
* Fix installation error


## [0.2.1] - 2014-03-07
### Changed
* CLI: use `chalk` instead of `colors`


## [0.2.0] - 2014-03-06
### Changed
* `#metadata` is now just a getter


## [0.1.0] - 2014-02-05
### Changed
* `contents` are now always a `Buffer`


## [0.0.4] - 2014-02-05
### Fixed
* Fix corrupted non-utf8 files


## [0.0.3] - 2014-02-05
### Added
* Expose `files` dictionary to `build` callback


## [0.0.2] - 2014-02-05
### Changed
* Do not mix in global metadata; leave it up to plugins


## 0.0.1 - 2014-02-04
:sparkles:

[Unreleased]: https://github.com/metalsmith/metalsmith/compare/v2.3.0...HEAD
[2.3.0]: https://github.com/metalsmith/metalsmith/compare/v2.2.2...v2.3.0
[2.2.2]: https://github.com/metalsmith/metalsmith/compare/v2.2.0...v2.2.2
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
