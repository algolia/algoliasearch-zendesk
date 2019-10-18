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
CONFIG='{ "app_name": "your-zendesk-subdomain", "email": "xxx@xxx.xx", "token": "xxx" }' \
bundle exec ./run
```

You can generate an API token to your Zendesk instance in the *Agent Section* > *Admin/Settings* > *API*.

Otherwise (and this is what we use when plugging the connector to Algolia), you can use an OAuth token whiche has the `hc:read` scope.  
If you have one, just replace the `CONFIG` line with

```sh
CONFIG='{ "app_name": "your-zendesk-subdomain", "oauth_token": "xxx" }' \
```

## Configuration

* `app_name` - **required** - Zendesk subdomain
* `oauth_token` or (`email` + `token`) - **required** - Credentials to identify on the Zendesk API
* `types` - *optional* - Default: ["articles"] - Defines which content should be crawled. Supported types: `articles` and `posts`.
* `user_types` - *optional* - Default: `["everybody"]` - Which default Zendesk user segments to index
* `private` - *optional* - Default: `false` - Set to true to index all articles, regardless of their user segment
* `max_content_size` - *optional* - Default: `5000` - Maximum byte size after which the text of an attribute will be truncated


## Contributing

We're considering any contribution and PR, please go ahead!

## License

This project is under the [MIT License](../LICENSE).

