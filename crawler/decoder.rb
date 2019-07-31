require 'htmlentities'

class ZendeskIntegration::V1::Decoder < HTMLEntities
  # work-around https://github.com/threedaymonk/htmlentities/issues/18
  # to skip the decoding of `&lt;` and `&gt;`
  def decode input
    super(input).gsub('<', '&lt;').gsub('>', '&gt;')
  end
end
ZendeskIntegration::V1::DECODER = ZendeskIntegration::V1::Decoder.new
