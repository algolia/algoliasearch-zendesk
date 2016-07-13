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

    class << self
      def singular
        name.split('::').last.downcase
      end

      def plural
        "#{singular}s".to_sym
      end

      def index_name
        "#{CONFIG['algolia_index_prefix']}#{CONFIG['app_name']}_#{plural}"
      end

      def index_settings
        DEFAULT_INDEX_SETTINGS.merge(self::INDEX_SETTINGS)
      end

      def start_indexing
        target_index.set_settings index_settings
      end

      def index items
        return if items.empty?
        to_index = items.map(&:to_index).flatten
        to_index.each_slice(1000).each { |sub| target_index.save_objects! sub }
        puts "Indexed #{to_index.count} #{plural}"
      end

      def finish_indexing
        from, to = target_index.name, index_name
        return if from == to
        Algolia.move_index from, to
      end

      private

      def target_index
        return @target_index unless @target_index.nil?
        Algolia::Index.new(index_name).get_settings
      rescue => e
        return @target_index = Algolia::Index.new(index_name) if e.code == 404
        raise
      else
        @target_index = Algolia::Index.new("#{index_name}.tmp")
      end

      def first_indexing?
        return @first_indexing unless @first_indexing.nil?
        Algolia::Index.new(index_name).get_settings
      rescue => e
        return @first_indexing = true if e.code == 404 && e.message =~ 'Index does not exist'
        raise
      else
        return false
      end
    end

    def initialize crawler, obj # Or object id, see fetch
      @crawler = crawler
      @zendesk_obj = fetch(obj)
      @data = build
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
      @zendesk_obj = ZendeskAPI::CLIENT.send(self.class.plural).find(id: obj)
    end
  end
end
