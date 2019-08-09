require_relative '../translation_item.rb'
require_relative './with_user_segment.rb'

module ZendeskIntegration::V2::Zendesk
  class Article < TranslationItem
    include WithUserSegment

    INDEX_SETTINGS = {
      attributesToIndex: %w(title section.title category.title label_names unordered(body_safe)),
      attributesForFaceting: %w(label_names locale.name locale.locale category.title section.title section.full_path),
      removeWordsIfNoResults: 'allOptional',
      customRanking: %w(asc(outdated) desc(promoted) desc(vote_sum) asc(position) desc(edited_at)),
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
        tags(t.locale).include?('algolia-ignore') ||
        !section.exists?(t.locale) ||
        section.ignore?(t) ||
        !user_segment_allowed?
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

    def build_path locale, section, path
      return path if section.nil?
      return "#{section.parent.simple(locale)[:title]} / #{path}" if section.parent
      "#{section.category.simple(locale)[:title]} / #{path}"
    end

    def translation t
      if section.parent
        path = build_path(t.locale, section.parent, section.parent.simple(t.locale)[:title])
        simple_category = section.parent.simple(t.locale).merge({ title: path, is_actually_section: true })
      else
        simple_category = category.simple(t.locale)
      end
      simple_section = section.simple(t.locale)
      path = "#{simple_category[:title]} > #{simple_section[:title]}"
      edited_at = @zendesk_obj.edited_at || @zendesk_obj.updated_at
      super(t).merge(selected).merge(
        category: simple_category,
        section: simple_section.merge(
          full_path: "#{simple_category[:title]} > #{simple_section[:title]}",
          user_segment: section.user_segment(complete: @crawler.config['private'])
        ),
        user_segment: user_segment(complete: @crawler.config['private']),
        label_names: tags(t.locale),
        created_at_iso: @zendesk_obj.created_at.utc.iso8601,
        updated_at_iso: @zendesk_obj.updated_at.utc.iso8601,
        edited_at: edited_at.to_i / TIME_FRAME,
        edited_at_iso: edited_at.utc.iso8601
      )
    end
  end
end
