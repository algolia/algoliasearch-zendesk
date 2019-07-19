require 'json'
require 'algoliasearch'
require_relative './zendesk.rb'
require_relative './user_agent.rb'
require_relative './types.rb'

class ZendeskIntegration::V1::Crawler
  LOCALES_PATH = File.join(File.dirname(__FILE__), 'locales.json')
  LOCALES = JSON.parse File.open(LOCALES_PATH, 'r').read

  attr_accessor :data, :algolia_client, :zendesk_client, :config

  def initialize(
    application_id:,
    api_key:,
    index_prefix:,
    zendesk_app_name:,
    zendesk_email:,
    zendesk_token:,
    zendesk_oauth_token:,
    config:,
    logs:
  )
    # Algolia
    @algolia_client = Algolia::Client.new(
      application_id: application_id,
      api_key: api_key,
      user_agent: ZendeskIntegration::V1::UserAgent.to_s
    )
    @index_prefix = index_prefix

    # Zendesk
    @zendesk_app_name = zendesk_app_name
    @zendesk_client = ZendeskAPI::Client.new do |config|
      config.url = "https://#{zendesk_app_name}.zendesk.com/api/v2"
      if zendesk_oauth_token.nil? # To remove in the end
        config.username = zendesk_email
        config.token = zendesk_token
      else
        config.access_token = zendesk_oauth_token
      end
      config.retry = true
    end

    # Config
    @config = config

    # Internal cache
    @data = {}
    @logs = logs
  end

  def index_name(type)
    "#{@index_prefix}#{@zendesk_app_name}_#{type.plural}"
  end

  def locales
    @locales ||= @zendesk_client.hc_locales.to_a!.map do |l|
      [l.id, LOCALES[l.id]]
    end.to_h
  end

  def get type, obj
    id = obj.is_a?(Integer) ? obj : obj.id
    @data[type.plural] ||= {}
    @data[type.plural][id] ||= type.new(self, obj)
  end
  alias_method :set, :get

  def crawl type
    @zendesk_client.send(type.plural).all! do |obj|
      set type, obj
    end
  end

  def index type
    type.index(self, @data[type.plural].values)
  end
end
