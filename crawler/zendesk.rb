require 'zendesk_api'

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

  class Topic < Resource; end
  class Post < Resource; end
  class Comment < Resource; end

  class Topic < Resource
    namespace 'community'
    has_many Post
  end

  class Post < Resource
    namespace 'community'
    has_many Comment
    has Topic
    has :author, class: User
  end

  class Comment
    namespace 'community'
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
