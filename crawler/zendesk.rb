require 'zendesk_api'

# Fix buggy content type of Zendesk articles
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
    has :access_policy, class: AccessPolicy
  end
  class Article < Resource
    namespace 'help_center'
    has_many Translation
    has :author, class: User
  end

  CLIENT = ZendeskAPI::Client.new do |config|
    config.url = "https://#{CONFIG['app_name']}.zendesk.com/api/v2"
    config.username = CONFIG['email']
    config.token = CONFIG['api_token']
    config.retry = true
  end
end

