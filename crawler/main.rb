#! /usr/bin/env ruby

require_relative './crawler.rb'

begin
  @crawler = Crawler.new
  @crawler.crawl_and_index Zendesk::Article
  @crawler.crawl_and_index Zendesk::Post
rescue => e
  puts 'An error happened while crawling'
  puts 'Message'
  puts e.message
  puts 'Additional information'
  curl_or_wget = `if hash curl 2>/dev/null; then echo "curl -s"; elif hash wget 2>/dev/null; then echo "wget -qO-"; fi`.strip
  puts "IP (should be whitelisted): #{`#{curl_or_wget} ipinfo.io/ip`}".strip
  puts 'Stacktrace'
  puts e.backtrace
end
