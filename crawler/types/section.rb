require_relative '../translation_item.rb'
require_relative './with_user_segment.rb'

module ZendeskIntegration::V2::Zendesk
  class Section < TranslationItem
    include WithUserSegment

    INDEX_SETTINGS = {
      attributesToIndex: %w(title category.title unordered(body_safe)),
      attributesForFaceting: %w(locale.locale),
      customRanking: %w(asc(outdated) asc(position) desc(updated_at))
    }

    def category
      @crawler.get Category, @zendesk_obj.category_id
    end

    def parent
      parent_id = @zendesk_obj.parent_section_id
      return nil if parent_id.nil?
      @crawler.get Section, parent_id
    end

    def ignore? t
      super(t) ||
        !category.exists?(t.locale) ||
        category.ignore?(t)
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
