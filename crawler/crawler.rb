require 'json'
require 'algoliasearch'
require_relative './zendesk.rb'
require_relative './user_agent.rb'
require_relative './types.rb'

class ZendeskIntegration::V2::Crawler
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
    live_logs:,
    config:,
    logs:
  )
    # Algolia
    search_config = Algolia::Search::Config.new(
      application_id: application_id,
      api_key: api_key,
      user_agent: ZendeskIntegration::V2::UserAgent.to_s
    )
    @algolia_client = Algolia::Search::Client.create_with_config(search_config)
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
    @config['user_types'] ||= ['everybody']
    @config['private'] ||= false
    @config['types'] ||= ['articles']
    @config['max_content_size'] ||= 5000

    # Internal cache
    @data = {}
    @logs = logs

    # Dev environment
    @live_logs = live_logs
  end

  def log msg
    @logs << msg.to_s
    return unless @live_logs
    puts msg.to_s
    STDOUT.flush
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
    count = @zendesk_client.send(type.plural).count!
    i = 1
    @zendesk_client.send(type.plural).all! do |obj|
      set(type, obj)
      log "#{Time.now.utc.to_s}: #{type.plural.capitalize}: #{i}/#{count}"
      i += 1
    end
  end

  def crawl_and_index type
    return unless @config['types'].include? type.plural.to_s

    count = @zendesk_client.send(type.plural).count!

    i = 1
    last = []
    @zendesk_client.send(type.plural).all! do |obj|
      last << type.new(self, obj)
      if i % 100 == 0
        type.index(self, last)
        last = []
        GC.start
      end
      log "#{Time.now.utc.to_s}: #{type.plural.capitalize}: #{i}/#{count}"
      i += 1
    end
    type.index(self, last)
    type.move_temporary(self)
  end
end
