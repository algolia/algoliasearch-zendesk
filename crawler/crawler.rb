require 'set'
require './config.rb'
require './algolia.rb'
require './zendesk.rb'
require './types.rb'

class Crawler
  NB_THREADS = 40

  attr_accessor :data
  attr_accessor :links

  def initialize
    @zendesk = ZendeskAPI::CLIENT
    @data = {}
    @deleted = {}
    @locales = nil
    @mutex = Mutex.new
  end

  def locales
    @mutex.synchronize do
      unless @locales
        @locales = {}
        @zendesk.locales.all! do |l|
          locale = l.locale.downcase
          @locales[locale] = { locale: locale, name: l.presentation_name }
        end
      end
      @locales
    end
  end

  ###
  #
  # Crawling
  #
  ###

  def crawl name
    now = Time.now.to_i
    objs = []
    @data[name] ||= {}
    @deleted[name] ||= []
    index_name = "#{CONFIG['algolia_index_prefix']}#{CONFIG['app_name']}_#{name}"
    @zendesk.send(name).all! do |obj|
      puts "Crawling #{name}: #{objs.size}"
      objs << obj
    end
    store_objects objs, name
  end

  private

  def fetch_with_retry name, collection
    retries = 0
    tmp = nil
    begin
      tmp = collection.fetch!
    rescue
      # If HTTP 429 Too Many Requesets, retry until it works.
      # The block should be of 1 minute
      # See this issue for it to be implemented in the ruby client of Zendesk
      # https://github.com/zendesk/zendesk_api_client_rb/issues/217
      if collection.response.status == 429
        retries += 1
        sleep 10
        retry if retries < 7
      end
      raise
    end
    tmp
  end

  def store_objects objs, name
    klass = get_class(name)
    new_objs = objs.map do |obj|
      { id: obj.id, obj: klass.new(self, obj) }
    end
    new_objs.each do |o|
      @data[name][o[:id]] = o[:obj] unless o[:obj].data.nil?
    end
  end

  ###
  #
  # Indexing
  #
  ###

  public

  def index name, with_slave: false, localized: false, publicly: false
    klass = get_class(name)
    params = klass.params
    index_name = "#{CONFIG['algolia_index_prefix']}#{CONFIG['app_name']}_#{'public_' if publicly}#{name}"
    objects = @data[name].values.map { |elt| elt.send(publicly ? :public : :data) }
    objects.map!(&:values).flatten! if localized
    objects.compact!

    index = Algolia::Index.new(index_name)
    tmp = Algolia::Index.new "#{index_name}.tmp"
    tmp.set_settings params
    tmp.add_objects! objects
    Algolia.move_index "#{index_name}.tmp", index_name
    if with_slave
      slave_name = "#{index_name}_updated_at_desc"
      index.set_settings slaves: [slave_name]
      Algolia::Index.new(slave_name).set_settings params.merge(ranking: %w(desc(updated_at) typo geo words proximity attribute exact custom))
    end
  end

  def delete id, name
    @mutex.synchronize do
      @deleted[name] ||= []
      @deleted[name] << id
    end
  end

  private

  # Gets the class defined in types.rb based on the name
  # of the category we want to index
  # e.g. 'organizations' => Zendesk::Organization
  def get_class_name name
    return 'Category' if name.to_s == 'categories'
    name.to_s[0...-1].capitalize
  end

  def get_class name
    Zendesk.module_eval get_class_name(name)
  end

  ###
  #
  # Next methods allow items from one type to get info about items
  # of another time without having to query the Zendesk API if it's
  # already in memory
  #
  ###

  public
  def get_category id, locale
    get_something id, :categories, :title do |c|
      begin
        { title: c[locale][:title] }
      rescue
        { title: 'Category translation deleted' }
      end
    end
  end

  def get_section id, locale
    get_something id, :sections, :title do |s|
      begin
        { title: s[locale][:title] }
      rescue
        { title: 'Section translation deleted' }
      end
    end
  end

  def get_category_from_section section_id, locale
    get_something section_id, :sections, :title
    category_id = nil
    @mutex.synchronize do
      category_id = @data[:sections][section_id].data[locale][:category][:id]
    end
    get_category category_id, locale
  rescue
    { section_id: section_id, title: 'Category from section deleted' }
  end

  private

  def get_something id, name, main_key, &_block
    return {} if id.nil?

    id = id.to_i
    res = { id: id.to_s }
    cond = nil
    @mutex.synchronize do
      @data[name] ||= {}
      cond = @data[name][id]
    end

    unless cond
      begin
        obj = get_class(name).new(self, @zendesk.send(name).find!(id: id))
        fail if obj.data.nil?
        @mutex.synchronize do
          @data[name][id] = obj
        end
      rescue
        res[main_key] = "#{get_class_name(name)} deleted"
        return res
      end
    end
    @mutex.synchronize do
      res.merge(yield @data[name][id].data) if block_given?
    end
  end
end
