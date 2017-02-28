require_relative './config.rb'
require_relative './algolia.rb'
require_relative './zendesk.rb'

module Zendesk
  class Item
    TIME_FRAME = 60

    DEFAULT_INDEX_SETTINGS = { maxValuesPerFacet: 5 }
    INDEX_SETTINGS = {}

    attr_accessor :data
    attr_accessor :zendesk_obj

    def self.singular
      name.split('::').last.downcase
    end

    def self.plural
      "#{singular}s".to_sym
    end

    def self.index_name
      "#{CONFIG['algolia_index_prefix']}#{CONFIG['app_name']}_#{plural}"
    end

    def self.index_settings
      DEFAULT_INDEX_SETTINGS.merge(self::INDEX_SETTINGS)
    end

    def self.index items
      to_index = items.map(&:to_index).flatten
      idx = Algolia::Index.new("#{index_name}.tmp")
      idx.set_settings index_settings
      to_index.each_slice(1000).each { |sub| idx.save_objects! sub }
      Algolia.move_index "#{index_name}.tmp", index_name
      puts "Indexed #{to_index.count} #{plural}"
    end

    def initialize crawler, obj # Or object id, see fetch
      @crawler = crawler
      @zendesk_obj = fetch(obj)
      @data = build
      if @zendesk_obj.nil?
        puts "Not-existing object #{self.class.plural}:#{obj}"
      else
        puts "New #{self.class.plural}:#{@zendesk_obj.id}"
      end
    end

    def build
      return nil if @zendesk_obj.nil?
      {
        objectID: @zendesk_obj.id,
        updated_at: @zendesk_obj.updated_at.to_i / TIME_FRAME
      }
    end

    def to_index
      @data.nil ? [] : [@data]
    end

    protected

    def exists?
      !@data.nil?
    end

    def fetch obj
      return obj unless obj.is_a? Integer
      @zendesk_obj = ZendeskAPI::CLIENT.send(self.class.plural).find!(id: obj)
    end
  end
end
