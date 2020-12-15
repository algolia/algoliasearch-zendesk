module ZendeskIntegration::V2::Zendesk
  class Post < Item
    INDEX_SETTINGS = {
      searchableAttributes: %w(title topic.name details),
      attributesForFaceting: %w(topic.name comments.answered comments.has_official),
      removeWordsIfNoResults: 'allOptional',
      customRanking: %w(asc(closed) desc(featured) desc(vote_avg)),
      attributesToSnippet: %w(details:30)
    }

    def ignore?
      super ||
        topic.ignore?
    end

    def topic
      @crawler.get Topic, @zendesk_obj.topic_id
    end

    def build
      answered = false
      comments_count = 0
      has_official_comment = false
      @zendesk_obj.comments.all! do |comment|
        answered ||= true
        has_official_comment ||= comment.official
        comments_count += 1
      end
      super.merge(
        title: @zendesk_obj.title,
        topic: topic.simple,
        details: truncate(decode(@zendesk_obj.details), @crawler.config['max_content_size']),
        featured: @zendesk_obj.featured,
        closed: @zendesk_obj.closed,
        comments: {
          count: comments_count,
          answered: answered,
          has_official: has_official_comment
        },
        votes: {
          sum: @zendesk_obj.vote_sum,
          count: @zendesk_obj.vote_count,
          avg: @zendesk_obj.vote_count.zero? ? 0 : (@zendesk_obj.vote_sum / @zendesk_obj.vote_count).to_i
        },
        created_at: @zendesk_obj.created_at.to_i / TIME_FRAME,
        created_at_iso: @zendesk_obj.created_at.utc.iso8601,
        updated_at_iso: @zendesk_obj.updated_at.utc.iso8601
      )
    end
  end
end
