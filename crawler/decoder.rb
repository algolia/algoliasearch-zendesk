require 'htmlentities'

class ZendeskIntegration::V1::Decoder < HTMLEntities
  # work-around https://github.com/threedaymonk/htmlentities/issues/18
  # to skip the decoding of `&lt;` and `&gt;`
  def decode input
    super(input.gsub('&lt;', '___LT___').gsub('&gt;', '___GT___')).gsub('___LT___', '&lt;').gsub('___GT___', '&gt;')
  end
end
ZendeskIntegration::V1::DECODER = ZendeskIntegration::V1::Decoder.new
