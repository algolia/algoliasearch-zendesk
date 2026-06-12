<h1 align="center">
  <img src="./img/algolia-for-zendesk.png?raw=true" alt="Algolia for Zendesk" />
</h1>

This repository holds the frontend code of the Algolia's Zendesk integration.

This integration makes it easy to replace the default search of your Zendesk Help Center by Algolia.
[Algolia](https://www.algolia.com) is a hosted full-text, numerical, and faceted search engine capable of delivering realtime results from the first keystroke.

We'll crawl your Zendesk API to extract your Help Center content and provide you a small code snippet to power your search with Algolia.

## Indexing
The ingestion is performed by [Algolia's connectors platform][https://dashboard.algolia.com/connectors).
Follow [the documentation](https://www.algolia.com/doc/integration/zendesk/get-started#set-up-the-algolia-connector) to setup your Zendesk connector.

## Front-end
Follow [the documentation](https://www.algolia.com/doc/integration/zendesk/get-started#update-your-theme) to update your Zendesk theme and replace the default search with Algolia.
If you want to contribute or browse the code, follow [this link to the app/](./app/) folder.

## Development

The `package.json` in this repository has the following scripts:
- `npm run release:app`: Release the JS library on `npm`
- `npm run release`: Runs the previous scripts and `git push`

## ChangeLog

See the [CHANGELOG.md](./CHANGELOG.md) file.

## License

This project is under the [MIT License](./LICENSE).
