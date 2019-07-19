#! /usr/bin/env ruby

module ZendeskIntegration
  module V1; end
end

require_relative './crawler.rb'

module ZendeskIntegration::V1
  def self.run(
    application_id:,
    api_key:,
    index_prefix:,
    zendesk_app_name:,
    zendesk_email:,
    zendesk_token:,
    zendesk_oauth_token:,
    config:
  )
    logs = []

    crawler = ZendeskIntegration::V1::Crawler.new(
      application_id: application_id,
      api_key: api_key,
      index_prefix: index_prefix,
      zendesk_app_name: zendesk_app_name,
      zendesk_email: zendesk_email,
      zendesk_token: zendesk_token,
      zendesk_oauth_token: zendesk_oauth_token,
      config: config,
      logs: logs
    )

    crawler.crawl ZendeskIntegration::V1::Zendesk::Section
    crawler.crawl ZendeskIntegration::V1::Zendesk::Article

    crawler.index ZendeskIntegration::V1::Zendesk::Article

    logs
  end
end
