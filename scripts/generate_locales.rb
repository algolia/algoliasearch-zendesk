#! /usr/bin/env ruby

require 'yaml'
require 'zendesk_api'

CONFIG = YAML.load_file 'config.yml'

zendesk = ZendeskAPI::Client.new do |config|
  config.url = CONFIG['zendesk']['url']
  config.username = CONFIG['zendesk']['email']
  config.token = CONFIG['zendesk']['api_key']
end

File.open 'locales.rb', 'w' do |f|
  locales = zendesk.locales.map do |l|
    [l.locale, { locale: l.locale, name: l.presentation_name, rtl: l.rtl }]
  end.to_h.to_json
  f.write 'LOCALES = ' + locales
end
