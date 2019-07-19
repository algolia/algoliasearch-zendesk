require 'zendesk_api'

# Help Center support (https://github.com/zendesk/zendesk_api_client_rb/issues/175)
module ZendeskAPI
  class Article < Resource; end
  class Section < Resource; end
  class Translation < Resource; end
  class UserSegment < Resource; end
  class UserSegment < Resource
    namespace 'help_center'
  end
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
    has UserSegment
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
end
