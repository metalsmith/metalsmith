---
name: Bug report
about: Report a bug/issue
---

**Description**
A clear and concise description of what the bug is, what you would expect and what actually happens.  
If you have any significant (npm, metalsmith) debug logs, please add them in a code block:

```
<debug log here>
```

**Environment**

- OS (run `node -e "console.log(process.platform)"`): ?
- Node|npm version (run `node -v && npm -v`): ?
- Metalsmith version: (run `npm view metalsmith version`): ?

**Reproducing the bug**
Describe the steps to reproduce the bug (your `Metalsmith.build`)

```js
// your build here
Metalsmith(__dirname)
  .use(...)
```

If the bug is somewhat complex to reproduce, we appreciate a link to your repository/ gist,
or a minimally reproducible test case on [repl.it](https://replit.com)
