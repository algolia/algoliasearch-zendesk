require_relative '../translation_item.rb'

module Zendesk
  class Article < TranslationItem
    INDEX_SETTINGS = {
      attributesToIndex: %w(title section.title category.title label_names unordered(body_safe)),
      attributesForFaceting: %w(label_names locale.name locale.locale category.title section.title section.full_path),
      removeWordsIfNoResults: 'allOptional',
      customRanking: %w(asc(outdated) desc(promoted) desc(vote_sum) asc(position) desc(updated_at)),
      attributesToHighlight: %w(title section.title category.title label_names body),
      attributesToSnippet: %w(body_safe:30)
    }

    def category
      section.category
    end

    def section
      @crawler.get Section, @zendesk_obj.section_id
    end

    protected

    def ignore? t
      ap = @zendesk_obj.section.access_policy['access_policy']['viewable_by']
      super(t) || @zendesk_obj.draft || t.draft || ap != 'everybody'
    end

    def selected
      keys = %i(promoted position vote_sum comments_disabled label_names)
      keys.map { |k| [k, @zendesk_obj[k]] }.to_h
    end

    def translation t
      simple_category = category.simple(t.locale)
      simple_section = section.simple(t.locale)
      super(t).merge(selected).merge(
        category: simple_category,
        section: simple_section.merge(
          full_path: "#{simple_category[:title]} > #{simple_section[:title]}"
        ),
        created_at_iso: @zendesk_obj.created_at.utc.iso8601,
        updated_at_iso: @zendesk_obj.updated_at.utc.iso8601
      )
    end
  end
end
