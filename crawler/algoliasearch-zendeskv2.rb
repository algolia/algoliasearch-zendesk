#! /usr/bin/env ruby

module ZendeskIntegration
  module V2; end
end

require_relative './crawler.rb'

module ZendeskIntegration::V2
  def self.run(
    application_id:,
    api_key:,
    index_prefix:,
    zendesk_app_name:,
    zendesk_email:,
    zendesk_token:,
    zendesk_oauth_token:,
    live_logs: false,
    config:
  )
    logs = []

    @crawler = ZendeskIntegration::V2::Crawler.new(
      application_id: application_id,
      api_key: api_key,
      index_prefix: index_prefix,
      zendesk_app_name: zendesk_app_name,
      zendesk_email: zendesk_email,
      zendesk_token: zendesk_token,
      zendesk_oauth_token: zendesk_oauth_token,
      live_logs: live_logs,
      config: config,
      logs: logs
    )

    @crawler.crawl_and_index ZendeskIntegration::V2::Zendesk::Article
    @crawler.crawl_and_index ZendeskIntegration::V2::Zendesk::Post

    logs
  end
end
