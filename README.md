<h1 align="center">
  <img src="./img/algolia-for-zendesk.png?raw=true" alt="Algolia for Zendesk" />
</h1>

This repository holds the code of Algolia's Zendesk integration.  
This integration makes it trivial to replace the default search of your Zendesk Help Center by Algolia.
[Algolia](https://www.algolia.com) is a hosted full-text, numerical, and faceted search engine capable of delivering realtime results from the first keystroke.

We'll crawl your Zendesk API to extract your Help Center content and provide you a small code snippet to power your search with Algolia.

## Indexing
Find the code of the crawler and its documentation in the [crawler/](./crawler/) folder.

## Front-end
Follow the documentation [on the website](https://community.algolia.com/zendesk/documentation/).  
If you want to contribute or browse the code, follow [this link to the app/](./app/) folder.

# Development

The `package.json` in this repository holds 3 scripts:
- `npm run release:docs`: Release the documentation site on https://community.algolia.com/zendesk/
- `npm run release:app`: Release the JS library on `npm`
- `npm run release`: Runs the previous scripts and `git push`

# ChangeLog

See the [./CHANGELOG.md](CHANGELOG.md) file.
