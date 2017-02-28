require 'zendesk_api'

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

