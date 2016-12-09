require 'htmlentities'

class Decoder < HTMLEntities
  def decode input
    res = super input, exclude: ['<', '>']
    truncate res, 5_000
  end

  protected

  def truncate str, max
    str.length > max ? "#{str[0...max]}..." : str
  end
end
DECODER = Decoder.new
