require_relative './user_segment.rb'

module ZendeskIntegration::V2::Zendesk
  # Assumes the presence of @crawler and @zendesk_obj
  # (Can only be used for a class extending Item)
  module WithUserSegment
    def user_segment_allowed?
      return true if @crawler.config['private']
      segment = user_segment
      @crawler.config['user_types'].any? do |user_type|
        if user_type.is_a? String
          # Built in types
          segment['built_in'] && segment['user_type'] == user_type
        else
          # User segment id
          segment['id'] == user_type
        end
      end
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
  end
end
