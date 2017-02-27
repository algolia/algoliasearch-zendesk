require 'zendesk_api'

# Fix buggy content type of Zendesk
# https://twitter.com/Jerskouille/status/836268529578086401
module ZendeskAPI
  # @private
  module Middleware
    # @private
    module Response
      class ParseJson < Faraday::Response::Middleware
        def on_complete(env)
          type = env[:response_headers][CONTENT_TYPE].to_s
          type = type.split(';', 2).first if type.index(';')

          unless env[:body].strip.empty?
            env[:body] = JSON.parse(env[:body])
          end
        end
      end
    end
  end
end

# Help Center support (https://github.com/zendesk/zendesk_api_client_rb/issues/175)
module ZendeskAPI
  class Article < Resource; end
  class Section < Resource; end
  class Translation < Resource; end
  class AccessPolicy < Resource; end
  class HcLocale < Resource
    namespace 'help_center'

    def self.singular_resource_name
      'locale'
    end
  end
  class Category < Resource
    namespace 'help_center'
    has_many Section
    has_many Article
    has_many Translation
  end
  class Section < Resource
    namespace 'help_center'
    has_many Article
    has_many Translation
    has Category

    def access_policy(opts = {})
      return @access_policy if @access_policy && !opts[:reload]

      association = ZendeskAPI::Association.new(:'class' => AccessPolicy, parent: self, path: 'access_policy')
      collection = ZendeskAPI::Collection.new(@client, AccessPolicy, opts.merge(association: association))
      collection.fetch
      @access_policy = collection.response.body
    rescue
      @access_policy = { 'access_policy' => { 'viewable_by' => 'everybody' } }
    end
  end
  class Article < Resource
    namespace 'help_center'
    has_many Translation
    has Section
    has :author, class: User
  end

  CLIENT = ZendeskAPI::Client.new do |config|
    config.url = "https://#{CONFIG['app_name']}.zendesk.com/api/v2"
    if CONFIG['oauth_token'].nil? # To remove in the end
      config.username = CONFIG['email']
      config.token = CONFIG['api_token']
    else
      config.access_token = CONFIG['oauth_token']
    end
    config.retry = true
  end
end
