# Algolia for Zendesk Guide

This repository holds the code of Algolia's Zendesk Guide integration.

This integration makes it trivial to replace the default search of your Zendesk Guide Help Center by Algolia.

[Algolia](https://www.algolia.com) is a hosted full-text, numerical, and faceted search engine capable of delivering realtime results from the first keystroke.

## Introduction

We'll crawl your Zendesk Guide API to extract your Help Center content and provide you a small code snippet to power the Help Center search with Algolia.

## Indexing

In order to crawl your content, Algolia is using the ruby-based crawler located in the [crawler/](./crawler/) folder.

## Search

To replace your default Zendesk Guide search by Algolia, you'll need to use the `algoliasearch.zendesk-hc` library which source code is located in the [app/](./app/) folder.

## ChangeLog

See the [CHANGELOG.md](./CHANGELOG.md) file.

## License

This project is under the [MIT License](./LICENSE).
