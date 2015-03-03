#! /usr/bin/env ruby
# Add generated tickets to a zendesk account

require 'yaml'
require 'zendesk_api'

CONFIG = YAML.load_file 'config.yml'

zendesk = ZendeskAPI::Client.new do |config|
  config.url = CONFIG['zendesk']['url']
  config.username = CONFIG['zendesk']['email']
  config.token = CONFIG['zendesk']['api_key']
end
zendesk.tickets.include(:comments)

def generate(caracs)
  return if caracs.empty?
  res = [{}]
  caracs.each_pair do |carac_name, list|
    tmp = []
    list.each do |carac_val|
      res.each do |elt|
        a = elt.clone
        a[carac_name] = carac_val
        tmp << a
      end
    end
    res = tmp.clone
  end
  res
end

def process_generated(population)
  i = 0
  population.sort_by { |info| [info[:last_name], info[:first_name]] }.each do |info|
    ticket = ZendeskAPI::Ticket.new zendesk
    yield ticket, info, i
    puts i, ticket
    i += 1
    puts 'Something didn\'t go well, couldn\'t save the ticket' unless ticket.save
  end
end

population = generate first_name: %w(Jon Jane),
                      last_name: %w(Doe Doppelmeyer),
                      status: %w(new open pending solved),
                      priority: ([nil] + %w(low normal high urgent)),
                      comment: [nil, 'A first type of comment used as a test', 'A second type of comment']

last_user = zendesk.users.last
process_generated population do |ticket, info, i|
  user = ZendeskAPI::User.new(zendesk, name: "#{info[:first_name]} #{info[:last_name]}",
                                       email: "#{info[:first_name].downcase}.#{info[:last_name].downcase}@email.com")
  last_user = user if user.save
  ticket.submitter_id = zendesk.current_user.id
  ticket.assignee_id = zendesk.current_user.id
  ticket.requester_id = last_user.id
  ticket.subject = "Test #{i}"
  ticket.description = "This is the #{i}th imported test"
  ticket.comments = [{ author_id: last_user.id, value: "This is the #{i}th imported test" }]
  ticket.comments << { author_id: zendesk.current_user.id, value: info[:comment] } unless info[:comment].nil?
  ticket.status = info[:status]
  ticket.priority = info[:priority]
end
