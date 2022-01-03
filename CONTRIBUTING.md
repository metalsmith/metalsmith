# How to contribute

Hi and welcome to the Metalsmith contribution guidelines.

### Dear users

If you would like to get in touch for a question, an announcement or advice, please drop us a message in the [gitter community chat](https://gitter.im/metalsmith/community). We'd love to see how Metalsmith has helped you or how we can help you with Metalsmith.

If you found a bug, have an enhancement idea or feature request for metalsmith or one of its core plugins, please provide sufficient context (steps to reproduce, added value of a feature, environment Node version/ OS etc) and use the appropriate issue template if applicable.

If you have written a blog post, a boilerplate, or have a nice project to showcase that uses Metalsmith, please share the knowledge and create a pull request to [awesome-metalsmith](https://github.com/metalsmith/awesome-metalsmith).

### Dear plugin authors

If you have written a plugin that you think is beneficial for wider usage, please share it and apply for an entry in the [official metalsmith plugin listing](https://metalsmith.io/plugins): create a pull request to [metalsmith.io](https://github.com/metalsmith/metalsmith.io) and add it to the `plugins.json` file (in the correct alphabetical order). In order for the PR to be accepted, the plugin must be available from the NPM repository.

### Dear maintainers

If you would like to help maintaining metalsmith and its core plugins, please open an issue on the main Metalsmith repository titled _Maintainer application_ with a short motivation and the scope of your desired involvement (single plugin, docs & website updates, ...). We appreciate having interacted with you before taking this step (through 1 or more Github issues or PR's).

Regarding maintenance of plugin repositories:

All core plugins use the same dev setup: mocha for testing, release-it and auto-changelog for managing Git & Github releases, Travis CI and coveralls for continuous integration, and eslint and prettier for code style.

The README files of core plugins all have the same structure: Short description matching package.json & Github description, badges, longer description, _Usage_ section (with examples, _Debug_ and _CLI Usage_ sub-sections at the end), and _License_.

To add a commit which should be skipped in the changelog, start it with `dev:`, `chore:`, or `ci:`.

To update the changelog with unreleased changes, run:

```bash
npm run changelog
```

To run prettier formatting, run :

```bash
npm run format
```

To run ESlint checks, run:

```bash
npm run lint
```

To release a new package version, run:

```bash
npm run release
```

When prompted, reply yes to all.
Publishing to NPM should always be done only _after_ the build succeeds in the CI, simply by doing:

```bash
npm publish
```
