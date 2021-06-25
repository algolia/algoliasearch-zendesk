# Algolia for Zendesk Guide

[![npm](https://img.shields.io/npm/v/algoliasearch.zendesk-hc.png)](https://www.npmjs.com/package/algoliasearch.zendesk-hc) [![GitHub license](https://img.shields.io/badge/license-mit-green)](../LICENSE)

This JavaScript library replaces the default search of your Zendesk Guide help center by Algolia.

[Algolia](https://www.algolia.com) is a hosted full-text, numerical, and faceted search engine capable of delivering realtime results from the first keystroke.

## Documentation

Read our documentation on [algolia.com](https://www.algolia.com/doc/integration/zendesk/getting-started/quick-start/).

## Development

The `package.json` holds multiple scripts:

- `clean`: Removes `dist/` and `node_modules/`
- `build`: Compiles the JS & CSS files to `dist/algoliasearch.zendesk-hc.{css,js}`
- `dev`: Launches `parcel`, and watches the files to rebuild them if needed
- `lint`: Lints the JS files
- `format`: Runs prettier

## Contributing

We're considering any contribution and PR, please go ahead!

## Release

Bump the version in `package.json`. We follow semantic versioning.

```bash
npm install
npm run clean
NODE_ENV=production npm run build
npm publish
```

## License

This project is under the [MIT License](../LICENSE).
