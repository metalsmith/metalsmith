# Issue 412: Watch mode broken in 2.7.0

## The Bug

Metalsmith 2.7.0 bundles chokidar 4.0.3, which dropped glob/anymatch support. Metalsmith's `.watch()` API still accepts and passes glob patterns to chokidar without expansion. Chokidar 4 silently ignores these patterns, resulting in zero source files being watched.

### Example

```js
metalsmith.watch([
  'src/**/*',
  'lib/layouts/**/*',
  'lib/assets/**/*',
  'lib/data/**/*'
])
```

With chokidar 4, these glob patterns are silently ignored. Only literal directory paths like `src` work.

### Secondary Issue

When `.clean(true)` is set (the default), watch-mode rebuilds can fail with `ENOTEMPTY` because Metalsmith tries to `rmdir` the build directory while Browser-Sync (or similar) is serving from it.

---

## Fix 1: Glob Pattern Normalization (Completed)

### File: `lib/index.js`

1. **Added `micromatch.scan` import** (micromatch is already a dependency):
   ```js
   const { scan } = require('micromatch')
   ```

2. **Added `normalizeWatchPaths()` function** that processes the user's watch paths before they reach chokidar:
   - Uses `micromatch.scan()` to parse each path
   - **Glob expansion**: Extracts the base directory from glob patterns (e.g., `src/**/*` becomes `src`, `lib/layouts/**/*.njk` becomes `lib/layouts`)
   - **Negation mapping**: Moves negation patterns (`!node_modules`) to chokidar's `ignored` option instead of `paths`
   - **Deduplication**: Removes paths that are subdirectories of other watched paths (e.g., if both `src` and `src/sub` are listed, only `src` is kept)

3. **Updated `Metalsmith.prototype.watch()`** to:
   - Default `options.paths` to `[this.source()]` when not provided (fixes crash when only chokidar options are passed without paths)
   - Normalize string paths to arrays
   - Call `normalizeWatchPaths()` before constructing the final chokidar options

### New Tests (All Passing)

In `test/watcher.js`, 4 new tests:
- `should expand glob patterns to base directories for chokidar 4 compatibility`
- `should move negation patterns to the ignored option`
- `should deduplicate paths that are subdirectories of other watched paths`
- `should handle a single string path`

---

## Fix 2: FSEvents Stabilization Delay (Completed)

### File: `lib/watcher.js`

Chokidar 4 uses native FSEvents on macOS. The `ready` event can fire before native watchers are truly active, causing file operations performed immediately after the initial build callback to be missed (especially `unlink` events).

**Change**: Added a 100ms stabilization delay after chokidar's `ready` event before resolving the `watcherReady` promise. This gives FSEvents time to fully activate its native watchers.

```js
// Before:
const watcherReady = new Promise((resolve) => watcher.on('ready', () => resolve()))

// After:
const watcherReady = new Promise((resolve) =>
  watcher.on('ready', () => setTimeout(resolve, 100))
)
```

This is a production code improvement — it makes watch mode more reliable for all consumers, not just tests.

---

## Fix 3: Test Infrastructure (Completed)

### File: `test/watcher.js`

The existing watcher tests had two infrastructure problems:

**A. Orphaned watchers on test failure**: When a test assertion failed, `ms.watch(false)` in the `else` branch never ran. The orphaned chokidar watcher kept running, and the `afterEach` file restore triggered spurious rebuilds that contaminated subsequent tests.

**Fix**: Added `activeMs` instance tracking so `afterEach` can always close the watcher, even on test failure.

**B. Directory recreation breaking FSEvents**: The `afterEach` hook used `clean(true)`, which deletes the entire `src` directory and recreates it. This causes FSEvents to lose track because the watched directory inode changes.

**Fix**: Changed `afterEach` to use `clean(false)` (restore files without deleting the directory), then explicitly remove extra test files (`added`, `renamed`). This preserves the FSEvents watch state across tests.

---

## Fix 4: `watch(false)` Return Value Bug (Completed)

### File: `lib/index.js`

When a build errors synchronously (before the watcher's `closeWatcher` function is assigned), `watch(false)` fell through without returning anything. Callers expecting a thenable (e.g., `ms.watch(false).then(resolve)`) would crash with `TypeError: ms.watch(...).then is not a function`.

**Fix**: Added a fallback `return Promise.resolve()` after the `closeWatcher` check in `Metalsmith.prototype.watch()`, so `watch(false)` always returns a Promise — whether or not there's a watcher to close.

```js
if (options === false && typeof this[symbol.closeWatcher] === 'function') {
  return this[symbol.closeWatcher]()
}
if (options === false) return Promise.resolve()
```

This was a pre-existing bug exposed by the 100ms `watcherReady` stabilization delay (Fix 2), which changed the timing enough that `closeWatcher` hadn't been assigned yet when the error callback ran.

---

## Current Status

All 162 tests pass, including all 4 new glob normalization tests, all watcher event tests (add, change, move, batch, sync errors, async errors), and all 148 original Metalsmith tests.

---

## Files Changed

- `lib/index.js` — Glob normalization logic + `watch(false)` return value fix
- `lib/watcher.js` — FSEvents stabilization delay
- `test/watcher.js` — New glob normalization tests + test infrastructure improvements

## Fix 5: `ENOTEMPTY` during watch-mode rebuilds (Completed)

### File: `lib/helpers.js`

When `clean(true)` is set (the default), every rebuild deletes the entire destination directory before writing. If an external process like BrowserSync is serving files from that directory, `rm` can fail with `ENOTEMPTY` because the server holds open file handles. This is a race condition that only surfaces during watch-mode rebuilds, not the initial build.

**Fix**: Added a single retry with a 150ms delay to the `rm` helper on `ENOTEMPTY`. This gives the external process time to release its file handles. If the retry also fails, the error propagates normally.

```js
function rm(p) {
  return fsPromises.rm(p, { recursive: true, force: true }).catch((err) => {
    if (err.code === 'ENOTEMPTY') {
      return new Promise((resolve) => setTimeout(resolve, 150)).then(() =>
        fsPromises.rm(p, { recursive: true, force: true })
      )
    }
    throw err
  })
}
```

Note: The JSDoc example for `watch()` shows `.clean(false)` for partial rebuilds, and the cli-init scaffold uses `.clean(!(isDev || watch))`, so existing patterns already sidestep this issue. But for users running `clean(true)` with watch mode and an external file server, this retry prevents the build from crashing.

---

## Files Changed

- `lib/index.js` — Glob normalization logic + `watch(false)` return value fix
- `lib/helpers.js` — `ENOTEMPTY` retry in `rm` helper
- `lib/watcher.js` — FSEvents stabilization delay
- `test/watcher.js` — New glob normalization tests + test infrastructure improvements
