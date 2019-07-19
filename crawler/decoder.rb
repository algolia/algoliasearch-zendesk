require 'htmlentities'

class ZendeskIntegration::V2::Decoder < HTMLEntities
  def decode input
    super input, exclude: ['<', '>']
  end
end
ZendeskIntegration::V2::DECODER = ZendeskIntegration::V2::Decoder.new
