require_relative '../translation_item.rb'

module ZendeskIntegration::V2::Zendesk
  class UserSegment < Item
    DEFAULT_DATA = {
      'id' => nil,
      'user_type' => 'everybody',
      'name' => 'Everybody',
      'group_ids' => [],
      'organization_ids' => [],
      'tags' => [],
      'created_at' => nil,
      'updated_at' => nil,
      'built_in' => true
    }.freeze

    def self.plural
      :user_segments
    end

    def build
      @zendesk_obj.to_h
    end
  end
end
