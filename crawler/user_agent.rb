require 'algoliasearch'

class ZendeskIntegration::V1::UserAgent
  class Version
    def self.crawler
      '1.0.0'
    end

    def self.client
      Algolia::VERSION
    end

    def self.ruby
      RUBY_VERSION
    end
  end

  def self.to_s
    [
      "Zendesk Integration (#{Version.crawler})",
      "Algolia for Ruby (#{Version.client})",
      "Ruby (#{Version.ruby})"
    ].join('; ')
  end
end
