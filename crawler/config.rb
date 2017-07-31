require 'json'

CONFIG = {
  'algolia_app_id' => ENV['APPLICATION_ID'],
  'algolia_api_key' => ENV['API_KEY'],
  'algolia_index_prefix' => ENV['INDEX_PREFIX']
}.merge(JSON.parse(ENV['CONFIG']))

CONFIG['access_policies'] ||= ['everybody']
