require_relative '../translation_item.rb'

module ZendeskIntegration::V1::Zendesk
  class Category < TranslationItem
    def self.plural
      :categories
    end
  end
end
