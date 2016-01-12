require 'algoliasearch'
require './config.rb'

Algolia.init(
  application_id: CONFIG['algolia_app_id'],
  api_key: CONFIG['algolia_api_key']
)
