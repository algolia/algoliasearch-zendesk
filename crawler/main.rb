#! /usr/bin/env ruby

require_relative './crawler.rb'

crawler = Crawler.new
crawler.crawl Zendesk::Section
crawler.crawl Zendesk::Article

crawler.index Zendesk::Article
