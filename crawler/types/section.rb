require_relative '../translation_item.rb'

module ZendeskIntegration::V1::Zendesk
  class Section < TranslationItem
    INDEX_SETTINGS = {
      attributesToIndex: %w(title category.title unordered(body_safe)),
      attributesForFaceting: %w(locale.locale),
      customRanking: %w(asc(outdated) asc(position) desc(updated_at))
    }

    def category
      @crawler.get Category, @zendesk_obj.category_id
    end

    def ignore? t
      super(t) || !@zendesk_obj.user_segment_id.nil?
    end

    protected

    def translation t
      super(t).merge(
        category: category.simple(t),
        nb_articles: @zendesk_obj.articles.count
      )
    end
  end
end
