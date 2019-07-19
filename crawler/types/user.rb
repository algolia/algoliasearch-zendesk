module ZendeskIntegration::V2::Zendesk
  # Can't be used with only Help Center ACLs
  class User < Item
    def ignore
      @zendesk_obj.active != false
    end

    def simple
      {
        id: @zendesk_obj.id,
        name: @zendesk_obj.name
      }
    end
  end
end
