require_relative './zendesk.rb'
require_relative './decoder.rb'

module ZendeskIntegration::V2::Zendesk
  class Item
    TIME_FRAME = 60 * 60 * 24

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

      def index_settings
        JSON.parse(DEFAULT_INDEX_SETTINGS.merge(self::INDEX_SETTINGS).to_json)
      end

      def index crawler, items
        return if items.empty?
        to_index = items.map(&:to_index).flatten
        to_index.each_slice(1000).each { |sub| target_index(crawler).save_objects! sub }
        puts "Indexed #{to_index.count} #{plural}"
      end

      def move_temporary(crawler)
        main = main_index(crawler)
        target = target_index(crawler)
        old_settings = get_old_settings(crawler)

        # First indexing?
        if old_settings == false
          target.set_settings! index_settings
        else
          crawler.algolia_client.copy_index! main.name, target.name, %w(settings synonyms rules)
        end

        crawler.algolia_client.move_index! target.name, main.name
      end

      private

      def target_index(crawler)
        crawler.algolia_client.init_index("#{crawler.index_name(self)}.tmp")
      end

      def main_index(crawler)
        crawler.algolia_client.init_index(crawler.index_name(self))
      end

      def get_old_settings(crawler)
        crawler.algolia_client.init_index(crawler.index_name(self)).get_settings
      rescue => e
        return false if e.code == 404
        raise
      end
    end

    def initialize crawler, obj # Or object id, see fetch
      @crawler = crawler
      @zendesk_obj = fetch(obj)
      @data = build
    end

    def build
      {
        objectID: @zendesk_obj.id,
        updated_at: @zendesk_obj.updated_at.to_i / TIME_FRAME
      }
    end

    def to_index
      ignore? ? [] : [@data]
    end

    def exists?
      !@data.nil?
    end

    def ignore?
      @zendesk_obj.nil?
    end

    protected

    def fetch obj
      return obj unless obj.is_a? Integer
      @zendesk_obj = @crawler.zendesk_client.send(self.class.plural).find!(id: obj)
    end

    def decode body
      ZendeskIntegration::V2::DECODER.decode(body.to_s.gsub(/<\/?[^>]*>/, ' '))
    end

    def truncate str, max
      truncated = str.length > max
      res = str[0...max]
      # Algolia doesn't count the actual string length, but the byte size
      # Remove 10 chars until we get lower than the max
      loop do
        break if res.bytesize <= max
        res = res[0...-10]
      end
      "#{res}#{'...' if truncated}"
    end
  end
end
