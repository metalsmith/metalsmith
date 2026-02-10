---
title: "Plugins"
autotoc: true
view: layout.twig
collection: "Getting Started"
---

# Plugin

All of the logic in the Client is handled by plugins. You simply chain them together.

```js
Client()
  .use(ssh({
    port: '22'
  }))
  .connect('/var/socket')
```

...it's as easy as that!
