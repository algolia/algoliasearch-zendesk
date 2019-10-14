# Indexing crawler

[![GitHub license](https://img.shields.io/github/license/algolia/algoliasearch-zendesk.svg)](../LICENSE)

This folder is meant to be built into a gem.

## Usage

To run it directly, first, make sure you've correctly run

```sh
bundle install
```

Then, to run the crawler:

```sh
APPLICATION_ID='xxx' \
API_KEY='xxx' \
INDEX_PREFIX='zendesk_' \
CONFIG='{ "app_name": "your-zendesk-subdomain", "email": "xxx@xxx.xx", "api_token": "xxx" }' \
bundle exec ./run
```

You can generate an API token to your Zendesk instance in the *Agent Section* > *Admin/Settings* > *API*.

Otherwise (and this is what we use when plugging the connector to Algolia), you can use an OAuth token whiche has the `hc:read` scope.  
If you have one, just replace the `CONFIG` line with

```sh
CONFIG='{ "app_name": "your-zendesk-subdomain", "oauth_token": "xxx" }' \
```

## Contributing

We're considering any contribution and PR, please go ahead!

## License

This project is under the [MIT License](../LICENSE).

