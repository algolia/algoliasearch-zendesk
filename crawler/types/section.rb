require_relative '../translation_item.rb'

module Zendesk
  class Section < TranslationItem
    INDEX_SETTINGS = {
      attributesToIndex: %w(title category.title unordered(body_safe)),
      attributesForFaceting: %w(locale.locale),
      customRanking: %w(asc(outdated) asc(position) desc(updated_at))
    }

    def category
      @crawler.get Category, @zendesk_obj.category_id
    end

    protected

    def ignore? t
      ap = @zendesk_obj.access_policy['access_policy']['viewable_by']
      super(t) || ap != 'everybody'
    end

    def translation t
      super(t).merge(
        category: category.simple(t),
        nb_articles: @zendesk_obj.articles.count
      )
    end
  end
end
