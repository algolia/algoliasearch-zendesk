require_relative '../translation_item.rb'

module ZendeskIntegration::V2::Zendesk
  class Category < TranslationItem
    def self.plural
      :categories
    end
  end
end
