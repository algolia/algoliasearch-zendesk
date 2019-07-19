require_relative './zendesk.rb'

module ZendeskIntegration::V1::Zendesk
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

    def self.index_settings
      JSON.parse(DEFAULT_INDEX_SETTINGS.merge(self::INDEX_SETTINGS).to_json)
    end

    def self.index crawler, items
      index_name = crawler.index_name(self)
      to_index = items.map(&:to_index).flatten
      idx = crawler.algolia_client.init_index("#{index_name}.tmp")
      idx.set_settings index_settings
      to_index.each_slice(1000).each { |sub| idx.save_objects! sub }
      crawler.algolia_client.move_index "#{index_name}.tmp", index_name
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
      @zendesk_obj = @crawler.zendesk_client.send(self.class.plural).find!(id: obj)
    end
  end
end
