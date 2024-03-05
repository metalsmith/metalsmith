# Change Log

All notable changes to this project will be documented in this file.

This project adheres to [Semantic Versioning](http://semver.org).

This document follows the guidelines of [Keep A Changelog](http://keepachangelog.com).

## [2.6.3] - 2024-03-05

### Removed

- Drops support for Node < 14.18.0 (4 minor versions) to be able to use 'node:' protocol imports" [`b170cf0`](https://github.com/metalsmith/metalsmith/commit/b170cf0)

### Updated

- Updated README.md code samples, links, and troubleshooting section
- **Dependencies:** [`774a164`](https://github.com/metalsmith/metalsmith/commit/774a164)
  - `chokidar`: 3.5.3 ▶︎ 3.6.0

### Fixed

- Fixes ms.watch(false) unreliable behavior when the build errors. [`0d8d791`](https://github.com/metalsmith/metalsmith/commit/0d8d791)

## [2.6.2] - 2023-11-15

### Fixed

- TS fixes: add generic to Metalsmith.File, bring back Metalsmith.DoneCallback, add Metalsmith.Plugin promise signature [`3ae6275`](https://github.com/metalsmith/metalsmith/commit/3ae6275)
- [#394] Avoid leaking unhandled rejections in build/watch promises. [`cac48fc`](https://github.com/metalsmith/metalsmith/commit/cac48fc), [`5b48dce`](https://github.com/metalsmith/metalsmith/commit/5b48dce)
- Fix a typo in CLI help message [`642a176`](https://github.com/metalsmith/metalsmith/commit/642a176)

[#394]: https://github.com/metalsmith/metalsmith/issues/394

## [2.6.1] - 2023-07-10

### Added

- Documents metalsmith.watch() getter signature in TS [`34239d9`](https://github.com/metalsmith/metalsmith/commit/34239d9)

### Updated

- Normalizes ms.watch().paths to an array, allows access to a subset of chokidar options as advertised [`a719025`](https://github.com/metalsmith/metalsmith/commit/a719025)
- Sets chokidar watchOption awaitWriteFinish to false, and batch timer to 0 to speed up watching [`5a516b2`](https://github.com/metalsmith/metalsmith/commit/5a516b2)

### Fixed

- Fixes [#389]: ensure not missing watcher ready event to successfully launch build [`23b0944`](https://github.com/metalsmith/metalsmith/commit/23b0944)
- Fixes formatting issue in types JSdoc comments [`05265ce`](https://github.com/metalsmith/metalsmith/commit/05265ce)

[#389]: https://github.com/metalsmith/metalsmith/issues/389

## [2.6.0] - 2023-05-30

### Added

- [#356] Added Typescript support [`58d22a3`](https://github.com/metalsmith/metalsmith/commit/58d22a3)
- Added --debug and --dry-run options to metalsmith (build) command [`2d84fbe`](https://github.com/metalsmith/metalsmith/commit/2d84fbe)
- Added --env option to metalsmith (build) command [`9661ddc`](https://github.com/metalsmith/metalsmith/commit/9661ddc)
- Added Metalsmith CLI support for loading a .(c)js config. Reads from metalsmith.js as second default after metalsmith.json [`45a4afe`](https://github.com/metalsmith/metalsmith/commit/45a4afe)
- Added support for running (C/M)JS config files from CLI [`424e6ec`](https://github.com/metalsmith/metalsmith/commit/424e6ec)
- **Dependencies:**
  - `chokidar` [`9d40674`](https://github.com/metalsmith/metalsmith/commit/9d40674)
  - `lodash.clonedeepwith` [`e12537f`](https://github.com/metalsmith/metalsmith/commit/e12537f)

### Removed

- [#231] Dropped support for Node < 14.14.0 [`80d8508`](https://github.com/metalsmith/metalsmith/commit/80d8508)
- **Dependencies:**
  - `rimraf`: replaced with native Node.js methods [`ae05945`](https://github.com/metalsmith/metalsmith/commit/ae05945)
  - `cross-spawn`: [`baee1de`](https://github.com/metalsmith/metalsmith/commit/baee1de)

### Updated

- Modernized Metalsmith CLI, prepared transition to imports instead of require [`24fcffb`](https://github.com/metalsmith/metalsmith/commit/24fcffb) [`4929bc2`](https://github.com/metalsmith/metalsmith/commit/4929bc2)
- **Dependencies:**
  - `commander`: 6.2.1 -> 10.0.1 [`24fcffb`](https://github.com/metalsmith/metalsmith/commit/24fcffb) [`0810728`](https://github.com/metalsmith/metalsmith/commit/0810728)

### Fixed

- Fixes a duplicate empty input check in metalsmith.match [`60e173a`](https://github.com/metalsmith/metalsmith/commit/60e173a)
- Gray-matter excerpts are removed from contents instead of being duplicated to the `excerpt` property [`2bfe800`](https://github.com/metalsmith/metalsmith/commit/2bfe800)
- Gray-matter excerpts are trimmed [`acb363e`](https://github.com/metalsmith/metalsmith/commit/acb363e)

[#231]: https://github.com/metalsmith/metalsmith/issues/231

## [2.5.1] - 2022-10-07

### Updated

- **Dependencies:** [`774a164`](https://github.com/metalsmith/metalsmith/commit/774a164)
  - `debug`: 4.3.3 ▶︎ 4.3.4
- Clarified semver policy in README.md
- Added SECURITY.md

### Fixed

- Fixes [#373](https://github.com/metalsmith/metalsmith/issues/374): do not crash when postinstall script fails in specific environments

## [2.5.0] - 2022-06-10

Important note to [metalsmith-watch](https://github.com/FWeinb/metalsmith-watch#readme) users:
Although 2.5.0 is a semver-minor release, it breaks compatibility with metalsmith-watch, which relies on the Metalsmith < 2.4.x private method signature using the outdated unyield package. See [issue #374](https://github.com/metalsmith/metalsmith/issues/374) for more details.

### Added

- [#354] Added `Metalsmith#env` method. Supports passing `DEBUG` and `DEBUG_LOG` amongst others. Sets `CLI: true` when run from the metalsmith CLI. [`b42df8c`](https://github.com/metalsmith/metalsmith/commit/b42df8c), [`446c676`](https://github.com/metalsmith/metalsmith/commit/446c676), [`33d936b`](https://github.com/metalsmith/metalsmith/commit/33d936b), [`4c483a3`](https://github.com/metalsmith/metalsmith/commit/4c483a3)
- [#356] Added `Metalsmith#debug` method for creating plugin debuggers
- [#362] Upgraded all generator-based methods (`Metalsmith#read`,`Metalsmith#readFile`,`Metalsmith#write`,`Metalsmith#writeFile`, `Metalsmith#run` and `Metalsmith#process`) to dual callback-/ promise-based methods [`16a91c5`](https://github.com/metalsmith/metalsmith/commit/16a91c5), [`faf6ab6`](https://github.com/metalsmith/metalsmith/commit/faf6ab6), [`6cb6229`](https://github.com/metalsmith/metalsmith/commit/6cb6229)
- Added org migration notification to postinstall script to encourage users to upgrade [`3a11a24`](https://github.com/metalsmith/metalsmith/commit/3a11a24)

### Removed

- [#231] Dropped support for Node < 12 [`0a53007`](https://github.com/metalsmith/metalsmith/commit/0a53007)
- **Dependencies:**
  - `thunkify`: replaced with promise-based implementation [`faf6ab6`](https://github.com/metalsmith/metalsmith/commit/faf6ab6)
  - `unyield` replaced with promise-based implementation [`faf6ab6`](https://github.com/metalsmith/metalsmith/commit/faf6ab6)
  - `co-fs-extra`: replaced with native Node.js methods [`faf6ab6`](https://github.com/metalsmith/metalsmith/commit/faf6ab6)
  - `chalk`: not necessary for the few colors used by Metalsmith CLI [`1dae1cb`](https://github.com/metalsmith/metalsmith/commit/a1dae1cb)
  - `clone`: see [#247] [`a871af6`](https://github.com/metalsmith/metalsmith/commit/a871af6)

### Updated

- Restructured and updated `README.md` [`0da0c4d`](https://github.com/metalsmith/metalsmith/commit/0da0c4d)
- [#247] Calling `Metalsmith#metadata` no longer clones the object passed to it, overwriting the previous metadata, but merges it into existing metadata.

[#362]: https://github.com/metalsmith/metalsmith/issues/362
[#354]: https://github.com/metalsmith/metalsmith/issues/354
[#355]: https://github.com/metalsmith/metalsmith/issues/355
[#356]: https://github.com/metalsmith/metalsmith/issues/356
[#247]: https://github.com/metalsmith/metalsmith/issues/247

### Fixed

- [#355] Proper path resolution for edge-cases using CLI, running metalsmith from outside or subfolder of `metalsmith.directory()`[`5d75539`](https://github.com/metalsmith/metalsmith/commit/5d75539)

## [2.4.3] - 2022-05-16

### Updated

- **Dependencies:** [`774a164`](https://github.com/metalsmith/metalsmith/commit/774a164)
  - `micromatch`: 4.0.4 ▶︎ 4.0.5
- Updated README.md

### Fixed

- Fixes repeat `metalsmith.match` file cache in repeat runs without re-read, see https://github.com/metalsmith/layouts/issues/183 [`a727309`](https://github.com/metalsmith/metalsmith/commit/a727309)

## [2.4.2] - 2022-02-13

### Updated

- **Dependencies:** [`af9dec0`](https://github.com/metalsmith/metalsmith/commit/af9dec0)
  - `chalk`: 3.0.0 ▶︎ 4.1.2
- Updated README.md

### Fixed

- Fixed Metalsmith JSDoc type hints in VS code [`ebf82f4`](https://github.com/metalsmith/metalsmith/commit/ebf82f4)
- Added package integrity test [`c539c67`](https://github.com/metalsmith/metalsmith/commit/c539c67)

## [2.4.1] - 2022-01-31

### Fixed

Bugfix: include index.js in package.json files

## [2.4.0] - 2022-01-31

### Added

- [#338] Added `Metalsmith#match` method. Plugins no longer need to require a matching library [`705c4bb`](https://github.com/metalsmith/metalsmith/commit/705c4bb), [`f01c724`](https://github.com/metalsmith/metalsmith/commit/f01c724)
- [#358] Added TS-style JSdocs [`828b17e`](https://github.com/metalsmith/metalsmith/commit/828b17e)
- Use native `fs.rm` instead of `rimraf` when available (Node 14.4+) [`fcbb76e`](https://github.com/metalsmith/metalsmith/commit/fcbb76e), [`66e4376`](https://github.com/metalsmith/metalsmith/commit/66e4376)
- [#226] Allow passing a gray-matter options object to `Metalsmith#frontmatter` [`a6438d2`](https://github.com/metalsmith/metalsmith/commit/a6438d2)
- Modernized dev setup [`ef7b781`](https://github.com/metalsmith/metalsmith/commit/ef7b781)
- Added 8 new tests (match method, front-matter options, path & symbolic link handling)
- Files object file paths are now guaranteed to be sorted aphabetically. [`4eb1184`](https://github.com/metalsmith/metalsmith/commit/4eb1184)
- [#211] `Metalsmith#build` now returns a promise which you can attach a `then/catch` to or `await`. The build callback model is still available. [`6d5a42d`](https://github.com/metalsmith/metalsmith/commit/6d5a42d)

### Removed

- [#231] Dropped support for Node < 8 [`2db47f5`](https://github.com/metalsmith/metalsmith/commit/75e6878), [`75e6878`](https://github.com/metalsmith/metalsmith/commit/75e6878)
- **Dependencies:**
  - `has-generators`: obsolete in supported Node versions [`2db47f5`](https://github.com/metalsmith/metalsmith/commit/2db47f5)
  - `absolute` replaced with native Node `path.isAbsolute` [`c05f9e2`](https://github.com/metalsmith/metalsmith/commit/c05f9e2) (@Zearin)
  - `is` replaced with own implementation [`7eaac9e2`](https://github.com/metalsmith/metalsmith/commit/7eaac9e2), [`54dba0c1`](https://github.com/metalsmith/metalsmith/commit/54dba0c1) (@Zearin)
  - `recursive-readdir`: replaced with own implementation [`4eb1184`](https://github.com/metalsmith/metalsmith/commit/4eb1184)

### Updated

- **Dependencies:** [`75e6878`](https://github.com/metalsmith/metalsmith/commit/75e6878)

  - `chalk`: 1.1.3 ▶︎ 3.0.0
  - `gray-matter`: 2.0.0 ▶︎ 4.0.3
  - `stat-mode`: 0.2.0 ▶︎ 1.0.0
  - `rimraf`: 2.2.8 ▶︎ 3.0.2
  - `ware`: 1.2.0 ▶︎ 1.3.0
  - `commander` (used in CLI): 2.15.1 ▶︎ 6.2.1
  - `win-fork` (used in CLI): replaced with `cross-spawn`:7.0.3

- Updated `CHANGELOG.md` format to follow “[Keep A Changelog](http://keepachangelog.com)” (#266) (@Zearin)

### Fixed

- [#206] `Metalsmith#ignore` now only matches paths relative to `Metalsmith#source` (as it should). See linked issue for details [`4eb1184`](https://github.com/metalsmith/metalsmith/commit/4eb1184)
- [#226] Metalsmith will no longer 'swallow' errors on invalid front-matter, they will be passed to `Metalsmith#build` [`a6438d2`](https://github.com/metalsmith/metalsmith/commit/a6438d2)
- Fix test error on Windows [#158] (@moozzyk)
- [#281] Metalsmith now properly handles symbolic links (will throw an ENOENT error or they can be `Metalsmith#ignore`'d) [`4eb1184`](https://github.com/metalsmith/metalsmith/commit/4eb1184)
- [#178] `Metalsmith#ignore` now removes the matched files _before_ they are `statted` for glob-based ignores (saving some perf & potential errors).
- [#295] Metalsmith now catches all FS errors and passes them to the build callback/ thenable appropriately.

### Security

- Replace all occurences of `new Buffer` with `Buffer.from`

#### `npm audit` vulnerability fixes

- **Development Dependencies:**
  - `coveralls`: 2.11.6 ▶︎ 3.0.1 (#308) (@Zearin)
    Fix 5 “Moderate” vulnerabilities
  - `metalsmith-markdown`: 0.2.1 ▶︎ 0.2.2 (#312) (@Zearin)
    Fix 1 “Low” vulnerability

[#158]: https://github.com/metalsmith/metalsmith/issues/158
[#178]: https://github.com/metalsmith/metalsmith/issues/178
[#206]: https://github.com/metalsmith/metalsmith/issues/206#issuecomment-1008289480
[#211]: https://github.com/metalsmith/metalsmith/issues/211
[#226]: https://github.com/metalsmith/metalsmith/issues/226
[#231]: https://github.com/metalsmith/metalsmith/issues/231
[#281]: https://github.com/metalsmith/metalsmith/issues/281
[#295]: https://github.com/metalsmith/metalsmith/issues/295
[#338]: https://github.com/metalsmith/metalsmith/issues/338
[#358]: https://github.com/metalsmith/metalsmith/issues/358

## [2.3.0] - 2016-10-28

### Added

- Add packaging metadata to build the metalsmith snap ([#249])

### Updated

- Update dependencies ([#246])

### Removed

- Remove unused dependencies

### Fixed

- Fix error when reading a symbolic link to a dir ([#229])

### Security

- Upgrade dependency to include security fix ([#258])

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

- Add ability to use functions for `ignore` matchers ([#179])
- Add CLI option: `ignore` ([#232])
- Add `process` to process files and plugins without writing files ([#244])

### Changed

- Only remove the contents of the `destination` directory (not the directory itself) when `clean` is `true` ([#221])

[#179]: https://github.com/metalsmith/metalsmith/issues/179
[#221]: https://github.com/metalsmith/metalsmith/pull/221
[#232]: https://github.com/metalsmith/metalsmith/pull/232
[#244]: https://github.com/metalsmith/metalsmith/pull/244

## [2.1.0] - 2015-09-24

### Added

- Add CLI option: `frontmatter`

## [2.0.1] - 2015-07-14

### Fixed

- META: bump patch because `2.0.0` was mistakenly already published

## [2.0.0] - 2015-07-14

### Added

- CLI: Add separate `_metalsmith` bin (to allow custom transpilers)

### Removed

- Drop support for Node 0.10 (native and tests)

## [1.7.0] - 2015-04-30

### Added

- Add `ignore`

## [1.6.0] - 2015-04-14

### Added

- Add `concurrency`

## [1.5.0] - 2015-03-29

### Added

- Add ability to pass in plugins to `#run`

## [1.4.5] - 2015-03-27

### Changed

- Improve plugin error handling

## [1.4.4] - 2015-03-27

### Fixed

- Workaround the absence of `isAbsolute` from Node 0.10

## [1.4.3] - 2015-03-27

### Fixed

- Fix typo in variable name

## [1.4.2] - 2015-03-26

### Changed

- Use `gray-matter` to parse frontmatter

### Fixed

- Fix bug in frontmatter parser

## [1.4.1] - 2015-03-25

### Changed

- Nicer errors for invalid frontmatter

## [1.4.0] - 2015-03-25

### Added

- Add ability to override the read and write directory

## [1.3.0] - 2015-02-06

### Added

- Add support for local (non-npm, but still node) plugins

## [1.2.0] - 2015-02-04

### Added

- Add stack trace to CLI output

## [1.1.1] - 2015-01-25

### Fixed

- Update `recursive-readdir` to `1.2.1` to fix [#110]

[#110]: https://github.com/metalsmith/metalsmith/pull/110

## [1.1.0] - 2015-01-25

### Added

- Add type checking to getter/setters
- Add support for alternate config file path
- Add file-specific errors on writing and reading

## [1.0.1] - 2014-09-30

### Changed

- Move `gnode` to regular dependencies

## [1.0.0] - 2014-09-29

### Added

- Add generator support for Node 0.11
- Add absolute path support for `source` and `directory`
- Add `#directory` getter and setter method
- Add `#readFile` method to expose the core reading logic
- Add `#writeFile` method to expose the core writing logic

### Changed

- Change `#join` to `#path` and use `path.resolve`

### Fixed

- CLI: Fix default `clean` setting

## [0.11.0] - 2014-09-12

### Changed

- Move `clean` logic to happen at the beginning of a build

## [0.10.0] - 2014-08-19

### Added

- Expose `stats` on files

## [0.9.0] - 2014-070-13

### Added

- Add `frontmatter` option (to disable frontmatter parsing, if desired)

## [0.8.1] - 2014-070-07

### Changed

- Update dependencies

## [0.8.0] - 2014-05-06

### Added

- Add `clean` option

## [0.7.0] - 2014-04-29

### Changed

- In `metalsmith.json`: Allow `plugins` be an array

## [0.6.1] - 2014-04-24

### Changed

- Update `ware` to `0.3.0` for passing arrays

## [0.6.0] - 2014-04-02

### Added

- `mode` handling for files

## [0.5.0] - 2014-03-21

### Added

- Remove `destination` directory when writing
- Expose `#run` to run middleware stack

### Fixed

- Fix jade examples

## [0.4.0] - 2014-03-14

### Changed

- Change `#metadata` to set a clone

## [0.3.0] - 2014-03-08

### Changed

- File contents are no longer trimmed

## [0.2.3] - 2014-03-07

### Added

- Add setting back to `#metadata`

## [0.2.2] - 2014-03-07

### Fixed

- Fix installation error

## [0.2.1] - 2014-03-07

### Changed

- CLI: use `chalk` instead of `colors`

## [0.2.0] - 2014-03-06

### Changed

- `#metadata` is now just a getter

## [0.1.0] - 2014-02-05

### Changed

- `contents` are now always a `Buffer`

## [0.0.4] - 2014-02-05

### Fixed

- Fix corrupted non-utf8 files

## [0.0.3] - 2014-02-05

### Added

- Expose `files` dictionary to `build` callback

## [0.0.2] - 2014-02-05

### Changed

- Do not mix in global metadata; leave it up to plugins

## 0.0.1 - 2014-02-04

:sparkles:

[unreleased]: https://github.com/metalsmith/metalsmith/compare/v2.3.0...HEAD
[2.4.0]: https://github.com/metalsmith/metalsmith/compare/v2.3.0...v2.4.0
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
