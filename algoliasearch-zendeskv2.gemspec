# -*- encoding: utf-8 -*-

require 'date'

Gem::Specification.new do |s|
  s.name        = "algoliasearch-zendeskv2"
  s.version     = File.read(File.join(File.dirname(__FILE__), 'crawler', 'VERSION'))
  s.authors     = ["Algolia"]
  s.email       = "contact@algolia.com"

  s.date        = Date.today
  s.licenses    = ["MIT"]
  s.summary     = "A simple integration script for Zendesk data into Algolia"
  s.description = "A simple integration script for Zendesk data into Algolia"
  s.homepage    = "https://github.com/algolia/algoliasearch-zendesk"

  s.require_path = "crawler"

  s.files = [
    "crawler/locales.json",
    "crawler/crawler.rb",
    "crawler/item.rb",
    "crawler/types/article.rb",
    "crawler/types/category.rb",
    "crawler/types/with_user_segment.rb",
    "crawler/types/topic.rb",
    "crawler/types/user_segment.rb",
    "crawler/types/section.rb",
    "crawler/types/post.rb",
    "crawler/types/user.rb",
    "crawler/locales.json",
    "crawler/algoliasearch-zendeskv2.rb",
    "crawler/README.md",
    "crawler/types.rb",
    "crawler/translation_item.rb",
    "crawler/zendesk.rb",
    "crawler/decoder.rb",
    "crawler/user_agent.rb",
  ]

  s.add_dependency               'algoliasearch'
  s.add_dependency               'zendesk_api'
  s.add_dependency               'jerska-htmlentities', '4.3.3'
end
