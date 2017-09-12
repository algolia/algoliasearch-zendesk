require_relative '../config'
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

    def ignore? t
      super(t) ||
        !category.exists?(t.locale) ||
        category.ignore?(t) ||
        (
          !CONFIG['private'] &&
          !CONFIG['access_policies'].include?(access_policy)
        )
    end

    def access_policy complete: false
      res = @zendesk_obj.access_policy['access_policy']
      return res['viewable_by'] unless complete
      res['restricted_to_group_ids_empty'] = res['restricted_to_group_ids'].empty?
      res['restricted_to_organization_ids_empty'] = res['restricted_to_organization_ids'].empty?
      res['required_tags_empty'] = res['required_tags'].empty?
      res['required_tags_concatenated'] = res['required_tags'].join('-')
      complete ? res : res['viewable_by']
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
