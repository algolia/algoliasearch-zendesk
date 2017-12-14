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
      require 'pry'
      super(t) ||
        !category.exists?(t.locale) ||
        category.ignore?(t) ||
        !user_segment_allowed?
    end

    def user_segment_allowed?
      return true if CONFIG['private']
      segment = user_segment
      return false unless segment['built_in']
      CONFIG['user_types'].include?(segment['user_type'])
    end

    def user_segment complete: true
      id = @zendesk_obj.user_segment_id
      res = id.nil? ? UserSegment::DEFAULT_DATA : @crawler.get(UserSegment, id).data
      res = JSON.parse(res.to_json)
      return res['user_type'] unless complete
      res['group_ids_empty'] = res['group_ids'].empty?
      res['organization_ids_empty'] = res['organization_ids'].empty?
      res['tags_empty'] = res['tags'].empty?
      res['tags_concatenated'] = res['tags'].join('-')
      res
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
