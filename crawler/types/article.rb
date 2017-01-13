require_relative '../translation_item.rb'

module Zendesk
  class Article < TranslationItem
    INDEX_SETTINGS = {
      attributesToIndex: %w(title section.title category.title label_names unordered(body_safe)),
      attributesForFaceting: %w(label_names locale.name locale.locale category.title section.title section.full_path),
      removeWordsIfNoResults: 'allOptional',
      customRanking: %w(asc(outdated) desc(promoted) desc(vote_sum) asc(position) desc(updated_at)),
      attributesToHighlight: %w(title section.title category.title label_names),
      attributesToSnippet: %w(body_safe:30)
    }

    def category
      section.category
    end

    def section
      @crawler.get Section, @zendesk_obj.section_id
    end

    def ignore? t
      super(t) ||
        @zendesk_obj.draft ||
        t.draft ||
        !section.exists?(t.locale) ||
        section.ignore?(t)
    end

    protected

    def selected
      keys = %i(promoted position vote_sum comments_disabled)
      keys.map { |k| [k, @zendesk_obj[k]] }.to_h
    end

    def tags locale
      labels = @zendesk_obj.label_names || []
      res = labels.grep(/^#{locale}:/).map { |l| l.gsub(/^#{locale}:/, '') }
      return res unless res.empty?
      res = labels.grep(/^#{locale[0...2]}:/).map { |l| l.gsub(/^#{locale[0...2]}:/, '') }
      return res unless res.empty?
      return labels
    end

    def translation t
      simple_category = category.simple(t.locale)
      simple_section = section.simple(t.locale)
      super(t).merge(selected).merge(
        category: simple_category,
        section: simple_section.merge(
          full_path: "#{simple_category[:title]} > #{simple_section[:title]}"
        ),
        label_names: tags(t.locale),
        created_at_iso: @zendesk_obj.created_at.utc.iso8601,
        updated_at_iso: @zendesk_obj.updated_at.utc.iso8601
      )
    end
  end
end
