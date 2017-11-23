module Zendesk
  class Topic < Item
    def ignore?
      super ||
        !@zendesk_obj.user_segment_id.nil?
    end

    def build
      super.merge(
        name: @zendesk_obj.name
      )
    end

    def simple
      {
        id: @zendesk_obj.id,
        name: @zendesk_obj.name
      }
    end
  end
end
