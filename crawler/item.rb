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
        return DEFAULT_INDEX_SETTINGS.merge(self::INDEX_SETTINGS) if first_indexing?
        old_settings
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
        Algolia::Index.new("#{index_name}#{'.tmp' unless first_indexing?}")
      end

      def first_indexing?
        return @first_indexing unless @first_indexing.nil?
        @first_indexing = old_settings == false
      end

      def old_settings
        return @old_settings unless @old_settings.nil?
        @old_settings = Algolia::Index.new(index_name).get_settings
      rescue => e
        return @old_settings = false if e.code == 404 && e.message =~ /Index does not exist/
        raise
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

    def exists?
      !@data.nil?
    end

    protected

    def fetch obj
      return obj unless obj.is_a? Integer
      @zendesk_obj = ZendeskAPI::CLIENT.send(self.class.plural).find(id: obj)
    end
  end
end
