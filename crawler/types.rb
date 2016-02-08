###
# If you want to index a public version of an item
# make sure you do this last, since it directly modifies
# the data of the object.
###

require './decoder.rb'

module Zendesk
  TIME_FRAME = 60
  DEFAULT_INDEX_OPTIONS = { maxValuesPerFacet: 5 }

  class Item
    OPTIONS = {}

    attr_accessor :data

    def initialize crawler, obj
      @crawler = crawler
      @data = {}
      @data[:objectID] = obj.id
      @data[:updated_at] = obj.updated_at.to_i / TIME_FRAME
    end

    def delete id
      @data = nil
      @crawler.delete id, get_name
    end

    def self.params
      DEFAULT_INDEX_OPTIONS.merge(self::OPTIONS)
    end

    protected

    def get_name
      name = self.class.name.split('::').last
      return :categories if name == 'Category'
      "#{name.downcase}s".to_sym
    end
  end

  class TranslationItem < Item
    def initialize crawler, obj, &_block
      fail ArgumentError, 'Missing block' unless block_given?
      @crawler = crawler
      @data = {}
      obj.send(:translations).each do |t|
        locale = t.locale
        next delete t.id, locale if @crawler.locales[locale].nil? || (!t.draft && t.hidden)
        @data[locale] = {
          locale: @crawler.locales[locale],
          objectID: t.id,
          id: obj.id.to_s,
          updated_at: t.updated_at.to_i / TIME_FRAME,
          position: obj.position,
          title: t.title,
          body: DECODER.decode(t.body),
          body_safe: DECODER.decode(t.body.gsub(/<\/?[^>]*>/, ' ')),
          outdated: obj.outdated || t.outdated
        }
        yield @data[locale], t
      end
    end

    def public &_block
      @crawler.locales.keys.each do |locale|
        translation = @data[locale]
        next unless translation
        next @data.delete locale if translation[:draft]
        yield translation if block_given?
      end
      @data
    end

    def delete id, locale
      @data[locale] = nil
      @crawler.delete id, get_name
    end
  end

  class Category < TranslationItem
    def initialize _crawler, _c
      super do |_translation, _t|
      end
    end
  end

  class Section < TranslationItem
    OPTIONS = {
      attributesToIndex: %w(title category.title unordered(body_safe)),
      attributesForFaceting: %w(locale.locale),
      customRanking: %w(asc(outdated) asc(position) desc(updated_at))
    }

    def initialize crawler, s
      super crawler, s do |translation, _t|
        translation[:category] = @crawler.get_category s.category_id, translation[:locale][:locale]
        translation[:nb_articles] = s.articles.count
      end
    end
  end

  class Article < TranslationItem
    OPTIONS = {
      attributesToIndex: %w(title section.title category.title label_names unordered(body_safe)),
      attributesForFaceting: %w(label_names locale.name locale.locale category.title section.title draft),
      removeWordsIfNoResults: 'allOptional',
      customRanking: %w(asc(outdated) desc(promoted) desc(vote_sum) asc(position) desc(updated_at)),
      attributesToHighlight: %w(title section.title category.title label_names body),
      attributesToSnippet: %w(body_safe:30)
    }
    def initialize crawler, a
      super crawler, a do |translation, _t|
        %w(promoted position vote_sum comments_disabled label_names).each do |k|
          translation[k] = a[k]
        end
        translation[:draft] = a.draft
        translation[:category] = @crawler.get_category_from_section a.section_id, translation[:locale][:locale]
        translation[:section] = @crawler.get_section a.section_id, translation[:locale][:locale]
        translation[:created_at_iso] = a.created_at.utc.iso8601
        translation[:updated_at_iso] = a.updated_at.utc.iso8601
      end
    end
  end
end
