#! /usr/bin/env ruby

require 'yaml'
require 'logger'
require 'zendesk_api'
require 'pry'

CONFIG = YAML.load_file 'config.yml'

module ZendeskAPI
  class Article < Resource; end
  class Section < Resource; end
  class Translation < Resource; end
  class AccessPolicy < SingularResource; end
  class HcLocale < Resource
    namespace 'help_center'

    def self.singular_resource_name
      "locale"
    end
  end
  class Ticket < Resource
    def self.incremental(client, start_time)
      ZendeskAPI::Collection.new(client, self, :path => "incremental/tickets.json?start_time=#{start_time.to_i}")
    end
  end
  class User < Resource
    def self.incremental(client, start_time)
      ZendeskAPI::Collection.new(client, self, :path => "incremental/users.json?start_time=#{start_time.to_i}")
    end
  end
  class Organization < Resource
    def self.incremental(client, start_time)
      ZendeskAPI::Collection.new(client, self, :path => "incremental/organizations.json?start_time=#{start_time.to_i}")
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

      association = ZendeskAPI::Association.new(class: AccessPolicy, parent: self, path: 'access_policy')
      collection = ZendeskAPI::Collection.new(@client, AccessPolicy, opts.merge(association: association))
      collection.fetch
      @access_policy = collection.response.body
    end
  end
  class Article < Resource
    namespace 'help_center'
    has_many Translation
    has Section
    has :author, class: User

    def self.incremental(client, start_time)
      ZendeskAPI::Collection.new(client, self, :path => "help_center/incremental/articles.json?start_time=#{start_time.to_i}")
    end
  end
end

zendesk = ZendeskAPI::Client.new do |config|
  config.url = CONFIG['zendesk']['url']
  if CONFIG['zendesk']['oauth_token'].nil?
    config.username = CONFIG['zendesk']['email']
    config.token = CONFIG['zendesk']['api_key']
  else
    config.access_token = CONFIG['zendesk']['oauth_token']
  end
  config.logger = Logger.new STDOUT
end
zendesk.tickets.include(:comments)

binding.pry
