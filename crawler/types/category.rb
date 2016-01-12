require_relative '../translation_item.rb'

module Zendesk
  class Category < TranslationItem
    def self.plural
      :categories
    end
  end
end
