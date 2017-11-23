require 'json'
require_relative './config.rb'
require_relative './algolia.rb'
require_relative './zendesk.rb'
require_relative './types.rb'

LOCALES = JSON.parse File.open('./locales.json', 'r').read

class Crawler
  attr_accessor :data

  def initialize
    @data = {}
  end

  def locales
    @locales ||= ZendeskAPI::CLIENT.hc_locales.to_a!.map do |l|
      [l.id, LOCALES[l.id]]
    end.to_h
  end

  def get type, obj
    id = obj.is_a?(Integer) ? obj : obj.id
    @data[type.plural] ||= {}
    @data[type.plural][id] ||= type.new(self, obj)
  end
  alias_method :set, :get

  def crawl type
    count = ZendeskAPI::CLIENT.send(type.plural).count!
    i = 1
    ZendeskAPI::CLIENT.send(type.plural).all! do |obj|
      set(type, obj)
      puts "#{type.plural.capitalize}: #{i}/#{count}"
      STDOUT.flush
      i += 1
    end
  end

  def crawl_and_index type
    return unless CONFIG['types'].include? type.plural.to_s
    count = ZendeskAPI::CLIENT.send(type.plural).count!
    i = 1
    last = []
    ZendeskAPI::CLIENT.send(type.plural).all! do |obj|
      last << type.new(self, obj)
      if i % 100 == 0
        type.index(last)
        last = []
        GC.start
      end
      puts "#{type.plural.capitalize}: #{i}/#{count}"
      STDOUT.flush
      i += 1
    end
    type.index last
    type.move_temporary
  end
end
