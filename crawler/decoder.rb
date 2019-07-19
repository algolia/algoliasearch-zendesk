require 'htmlentities'

class ZendeskIntegration::V1::Decoder < HTMLEntities
  def decode input
    super input, exclude: ['<', '>']
  end
end
ZendeskIntegration::V1::DECODER = ZendeskIntegration::V1::Decoder.new
