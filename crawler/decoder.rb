require 'htmlentities'

class ZendeskIntegration::V2::Decoder < HTMLEntities
  # work-around https://github.com/threedaymonk/htmlentities/issues/18
  # to skip the decoding of `&lt;` and `&gt;`
  def decode input
    super(input).gsub('<', '&lt;').gsub('>', '&gt;')
  end
end

ZendeskIntegration::V2::DECODER = ZendeskIntegration::V2::Decoder.new
