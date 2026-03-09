#! /usr/bin/env ruby

require 'algoliasearch'

USAGE = 'Usage: APP_ID= API_KEY= ZENDESK_APP_NAME= bundle exec ../scripts/reset-settings.rb'
raise "Should be run from the crawler/ folder\n#{USAGE}" unless `pwd`.strip.end_with? '/crawler'

module ZendeskIntegration
  module V2; end
end

require_relative '../crawler/types/article.rb'
require_relative '../crawler/user_agent.rb'

app_id = ENV['APP_ID']
api_key = ENV['API_KEY']
zendesk_app_name = ENV['ZENDESK_APP_NAME']
index_prefix = ENV['INDEX_PREFIX'] || 'zendesk_'

# First check if variables are correctly defined
raise "Missing APP_ID\n#{USAGE}" if app_id.nil? || app_id == ''
raise "Missing API_KEY\n#{USAGE}" if api_key.nil? || api_key == ''
raise "Missing ZENDESK_APP_NAME\n#{USAGE}" if zendesk_app_name.nil? || zendesk_app_name == ''
raise "Missing INDEX_PREFIX\n#{USAGE}" if index_prefix.nil? || index_prefix == ''

# Initialize Algolia
search_config = Algolia::Search::Config.new(
  application_id: app_id,
  api_key: api_key,
  user_agent: ZendeskIntegration::V2::UserAgent.to_s
)
client = Algolia::Search::Client.create_with_config(search_config)
idx = client.init_index("#{index_prefix}#{zendesk_app_name}_articles")

# Check if index exists

def index_exists?(idx)
  idx.get_settings
  true
rescue => e
  return false if e.code == 404
  raise
end

raise "Index doesn't exist, check your parameters" if !index_exists?(idx)

# Actually set the settings
settings = ZendeskIntegration::V2::Zendesk::Article::INDEX_SETTINGS
idx.set_settings settings
puts "Settings reset done!"
