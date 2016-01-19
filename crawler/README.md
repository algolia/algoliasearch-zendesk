# Usage

First, make sure you've correctly run

```sh
bundle install
```

Then to run the crawler

```sh
APPLICATION_ID='xxx' \
API_KEY='xxx' \
INDEX_PREFIX='zendesk_' \
CONFIG='{ "app_name": "your-zendesk-subdomain", "oauth_token": "xxx" }' \
bundle exec ./run
```

The OAuth token required here uses `hc:read` permissions.

You can also use the indexer with an email/API key pair of credentials instead of an OAuth token.  
Just replace the `CONFIG` line with

```sh
CONFIG='{ "app_name": "your-zendesk-subdomain", "email": "xxx@xxx.xx", "api_token": "xxx" }'
```

