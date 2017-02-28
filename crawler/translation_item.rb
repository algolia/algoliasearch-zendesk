require_relative './item.rb'
require_relative './decoder.rb'

module Zendesk
  class TranslationItem < Item
    def build
      @translations = {}
      return nil if @zendesk_obj.nil?
      @zendesk_obj.send(:translations).to_a!.map do |t|
        @translations[t.locale] = t
        next nil if @crawler.locales[t.locale].nil? || ignore?(t)
        [t.locale, translation(t)]
      end.compact.to_h
    end

    def simple locale
      type = self.class.name.split('::').last
      not_found = !exists?(locale) || ignore?(@translations[locale])
      return { title: "#{type} deleted" } if not_found
      @data[locale].select { |k, _v| %i(id title).include? k }
    end

    def to_index
      @data.values.compact
    end

    protected

    def exists? locale
      super() && !@data[locale].nil?
    end

    def ignore? _t
      false
    end

    def translation t
      {
        locale: @crawler.locales[t.locale],
        objectID: t.id,
        id: @zendesk_obj.id.to_s,
        updated_at: t.updated_at.to_i / TIME_FRAME,
        position: @zendesk_obj.position,
        title: t.title,
        body: DECODER.decode(t.body.to_s),
        body_safe: DECODER.decode(t.body.to_s.gsub(/<\/?[^>]*>/, ' ')),
        outdated: @zendesk_obj.outdated || t.outdated
      }
    end
  end
end
