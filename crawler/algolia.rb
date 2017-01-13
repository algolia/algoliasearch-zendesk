require 'algoliasearch'
require './config.rb'
require './user_agent.rb'

Algolia.init(
  application_id: CONFIG['algolia_app_id'],
  api_key: CONFIG['algolia_api_key']
)

Algolia.set_extra_header 'User-Agent', UserAgent.to_s
