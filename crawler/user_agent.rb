require 'algoliasearch'

class ZendeskIntegration::V2::UserAgent
  class Version
    def self.crawler
      File.read('VERSION').strip
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
