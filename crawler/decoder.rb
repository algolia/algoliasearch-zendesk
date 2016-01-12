require 'htmlentities'

class Decoder < HTMLEntities
  def decode input
    super input, exclude: ['<', '>']
  end
end
DECODER = Decoder.new
