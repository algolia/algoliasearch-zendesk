# Algolia for Zendesk

This repository holds the zendesk app code and some various scripts.

## Zendesk app

### Dev mode

To develop, you'll need to use the
[Zendesk App Tools (zat)](https://developer.zendesk.com/apps/docs/agent/tools).
To download it, just follow the instructions on
[this link](https://support.zendesk.com/hc/en-us/articles/203691236-Installing-and-using-the-Zendesk-apps-tools).

More information are present on the presentation link,
but here are some info to get you started.

#### Index data

First you'll need to have your data indexed. To do this, follow the
instructions of the Zendesk connector in `AlgoliaConnectors`.


#### Run everything locally

To run the server locally, you'll need to do

    cd app && zat server

Now, open your browser, and go to [http://{your-zendesk-subdomain}.zendesk.com/agent]
(http://subdomain.zendesk.com/agent). Once the page is loaded, add `?zat=true` to
the end of the url and load the page.  
You should now see a shield icon somewhere in your location bar. Click on it
and choose something like `Allow scripts`. The page will reload automatically.

Modifications made to any file are directly taken into account, no need
to reload the server but you'll need to reload your app in the zendesk page.
For this, no need to do a full refresh, just click on the icon in the top right
corner next to the algolia icon.

If you also want to run the iframe content locally, pull
the `demos` repository, navigate to the `zendesk-agent` folder
and run a basic server to serve static files, like `http-server`.
Then modify in `app/app.js` the `IFRAME_URL` to point to your
local webserver.

#### Packaging the app

To package the app into a zip uploadable to any zendesk account,
you'll just need to do

    cd app && zat package

If everything runs fine, your app will now be in `./app/tmp/*.zip`.

## Integrate Algolia in the help center

In this description, we'll present our integration in
[*Remember The Date* Help Center](https://rememberthedate.zendesk.com/hc/).
It should give enough details for you to change it for it to match your
implementation.

First, go to [http://{your-zendesk-subdomain}.zendesk.com/hc]
(http://subdomain.zendesk.com/hc) and log in.

Once logged in, you should have in the lower right corner an option named
`Customize design`. In the panel that just opened, click on `Edit theme`.

Now you'll need to modify several **HTML** parts :

- **Footer** We'll include necessary **JS** files here
    
    ```HTML
    [...]
    </footer>
    
    <!-- Algolia -->
    <script src="//cdnjs.cloudflare.com/ajax/libs/typeahead.js/0.10.5/typeahead.bundle.min.js"></script>
    <script src="//cdn.jsdelivr.net/hogan.js/3.0.0/hogan.common.js"></script>
    <script src="//cdn.jsdelivr.net/algoliasearch/latest/algoliasearch.min.js"></script>
    <!-- /Algolia -->
    ```
- **Search results** Replace the current **HTML** code used to display the results which looks like :
    
    ```HTML
    <div class="search-results">
      <h1>{{result_heading}}</h1>
      {{results}}
    </div>
    ```
    by
    
    ```HTML
    <!-- Algolia -->
    <div class="search-results clearfix">
      <h1 class="search-results-heading" style="display: none">{{result_heading}}</h1>
      <script type="text/javascript">
        // This allow us to detect if we're using algolia for autocompletion
        // or instant search
        window.resultsPage = true;
      </script>
      <ul class="search-results-list" id="hits">
      </ul>
    </div>
    <div id="pagination"></div>
    <!-- /Algolia -->
    ```

We'll add a little bit of **JS** now. Open the **JS** tab, you should find a `jQuery` wrapper
waiting for the page to load. It should look like this (if not, create it) :

```js
$(document).ready(function() {
  // [...]

  // Append the code at the end
}
```

Now let's split the remaining of the code :

- **Initialization** Replace `APPLICATION_ID`, `API_KEY` and `zendesk_domain` accordingly to your configuration
  Be sure to use the public search API key, so that users won't be able to acces the remaining of your data.
    
    ```js
    // Our main algolia object
    var algolia = new AlgoliaSearch('** APPLICATION_ID **', '********* API_KEY ********');
    // The two indices we'll search in
    var articles = algolia.initIndex('zendesk_{{ zendesk_domain }}_articles');
    var sections = algolia.initIndex('zendesk_{{ zendesk_domain }}_sections');
    ```
- **Templates**
  For the templates, we'll use the [Hogan.js](http://twitter.github.io/hogan.js/) templating engine.
  Feel free to use another one if you wish.
    
    ```js
    // Autocompletion template for a section
    var templateArticle = Hogan.compile('' +
      '<a class="hit-article" href="/hc/{{ locale.locale }}/articles/{{ id }}">' +
        '<div class="title">' +
          '{{{ _highlightResult.title.value }}} ' +
          '{{#vote_sum}}<span class="search-result-votes">{{ vote_sum }}</span>{{/vote_sum}}' +
        '</div>' +
        '<div class="body">{{{ _snippetResult.body_safe.value }}} [...]</div>' +
      '</a>');
    
    // Autocompletion template for an article
    var templateSection = Hogan.compile('' +
      '<a class="hit-section" href="/hc/{{ locale.locale }}/sections/{{ id }}">' +
        '<div class="title">' +
          '{{{ _highlightResult.category.title.value }}} > {{{ _highlightResult.title.value }}} ' +
          '<small class="text-muted">({{ nb_articles_text }})</small>' +
        '</div>' +
        '<div class="body">{{{ _highlightResult.body.value }}}</div>' +
      '</a>');
    
    // Instant search result template
    var templateHit = Hogan.compile('' +
      '<li class="search-result">' +
        '<a class="search-result-link" href="/hc/{{ locale.locale }}/articles/{{ id }}">{{{ _highlightResult.title.value }}}</a> ' +
        '<span class="search-result-votes">{{ vote_sum }}</span> ' +
        '<div class="search-result-meta">' +
          '{{#author.name}}{{ author.name }} {{/author.name}}' +
          '<time data-datetime="relative" datetime="{{ created_at_iso }}"></time>' +
          ' - <a href="/hc/{{ locale.locale }}/categories/{{ category.id }}">{{{ _highlightResult.category.title.value }}}</a> &gt;' +
          '<a href="/hc/{{ locale.locale }}/sections/{{ section.id }}">{{{ _highlightResult.section.title.value }}}</a>' +
        '</div>' +
        '<div class="search-result-body">{{{ _highlightResult.body.value }}}</div>' +
      '</li>');
    
    // Pagination template for the instant search page
    var templatePagination = Hogan.compile('' +
      '<div id="pagination">' +
        '<ul class="pagination">' +
          '<li {{^prev_page}}class="disabled"{{/prev_page}}><span onclick="{{#prev_page}}gotoPage({{ prev_page }});{{/prev_page}} return false;">&laquo;</span></li>' +
          '{{#pages}}' +
            '<li class="{{#current}}active{{/current}}{{#disabled}}disabled{{/disabled}}"><span onclick="{{^disabled}}gotoPage({{ number }});{{/disabled}} return false;">{{ number }}</span></li>' +
          '{{/pages}}' +
          '<li {{^next_page}}class="disabled"{{/next_page}}><span onclick="{{#next_page}}gotoPage({{ next_page }});{{/next_page}} return false;">&raquo;</span></li>' +
        '</ul>' +
      '</div>');
    ```
- **Initialization** of some variables and functions
    
    ```js
    // Often used jquery selectors
    var $title = $('.search-results-heading');
    var $query = $('#query');
    
    // The stop words are commonly used words that are too common to be searched.
    // We'll remove them from the query except if there are only stop words
    // You can handle them by language (see the locale in the url).
    var stop_words = {
      'en-us': "a|about|above|after|again|against|all|am|an|and|any|are|aren't|as|at|be|because|been|before|being|below|between|both|but|by|can't|cannot|could|couldn't|did|didn't|do|does|doesn't|doing|don't|down|during|each|few|for|from|further|had|hadn't|has|hasn't|have|haven't|having|he|he'd|he'll|he's|her|here|here's|hers|herself|him|himself|his|how|how's|i|i'd|i'll|i'm|i've|if|in|into|is|isn't|it|it's|its|itself|let's|me|more|most|mustn't|my|myself|no|nor|not|of|off|on|once|only|or|other|ought|our|ours|ourselves|out|over|own|same|shan't|she|she'd|she'll|she's|should|shouldn't|so|some|such|than|that|that's|the|their|theirs|them|themselves|then|there|there's|these|they|they'd|they'll|they're|they've|this|those|through|to|too|under|until|up|very|was|wasn't|we|we'd|we'll|we're|we've|were|weren't|what|what's|when|when's|where|where's|which|while|who|who's|whom|why|why's|with|won't|would|wouldn't|you|you'd|you'll|you're|you've|your|yours|yourself|yourselves"
    };
    
    // We'll use this filter on each query to algolia
    // All articles of different languages are stored in the same index.
    // We have activated a facet on this attribute in the index.
    // The filter allows us to select only the results matching the current language
    var localeFilter = '["locale.locale:' + I18n.locale + '"]';
    
    // We setup the search input
    $query.attr('autocomplete', 'off').attr('spellcheck', 'false').attr('autocorrect', 'off').attr('placeholder', 'Search for Articles, Sections, ...');
    
    // This function gives us the localized version of 'Article(s)' depending on how many articles there is
    // For this, we use the translations defined by Zendesk
    function articleLocale(nb_articles) {
      var res;
      if (nb_articles <= 1)
        res = I18n.translations['txt.help_center.views.admin.manage_knowledge_base.table.article'];
      else
        res = I18n.translations['txt.help_center.javascripts.arrange_content.articles'];
      return res.toLowerCase();
    }
    
    // This function removes the stop words described earlier
    function removeStopWords(query) {
      if (stop_words[I18n.locale.toLowerCase()]) {
        var regex = new RegExp('(^|\\s)(' + stop_words[I18n.locale.toLowerCase()] + ')(\\s|$)', 'ig');
        console.log('regex', regex);
        // We call replace twice because it wouldn't match two consecutive stop words if we called it only once
        var res = query.replace(regex, '$1$3').replace(regex, '$1$3');
        return (res.match(/^\s*$/)) ? query : res;
      } else {
        return query;
      }
    }
    ```
- **Full results**: Instant search
    
    ```js
    if (window.resultsPage) {
      // Used for pagination
      var page = 0;
    
      // Often used jquery selectors
      var $hits = $('#hits');
      var $pagination = $('#pagination');
    
      // This function comes from Zendesk code to display times
      // This allows us to replace all <time> tags by an human readable date.
      var displayTimes = function () {
        // Extracted from formatDateTime.js
        var timezoneOffset = moment().zone();
        moment().lang(I18n.locale, I18n.datetime_translations);
        $('time').each(function() {
          var $this = $(this),
              datetime = $this.attr('datetime'),
              formattedDatetime = moment(datetime).utc().zone(timezoneOffset),
              isoTitle = formattedDatetime.format('YYYY-MM-DD HH:mm');
    
          $this.attr('title', isoTitle);
    
          // Render time[data-datetime='relative'] as 'time ago'
          if ($this.data('datetime') === 'relative') {
            $this.text( formattedDatetime.fromNow() );
          } else if ($this.data('datetime') === 'calendar') {
            $this.text( formattedDatetime.calendar() );
          }
        });
      }
    
      // This function sets the html of $pagination
      var displayPagination = function (curr, total) {
        var pages = [];
        if (curr > 5) {
          pages.push({ current: false, number: 1 });
          pages.push({ current: false, number: '...', disabled: true });
        }
        for (var p = curr - 5; p < curr + 5; ++p) {
          if (p < 0 || p >= total) {
            continue;
          }
          pages.push({ current: curr === p, number: (p + 1) });
        }
        if (curr + 5 < total) {
          pages.push({ current: false, number: '...', disabled: true });
          pages.push({ current: false, number: total });
        }
        if (pages.length) {
          $pagination.html(templatePagination.render({ pages: pages, prev_page: (curr > 0 ? curr : false), next_page: (curr + 1 < total ? curr + 2 : false) }));
        } else {
          $pagination.html('');
        }
      };
    
      // After we receive a response from Algolia
      function searchCallback(success, content) {
        // If there is some error, we hide everything
        if (!success) {
          $title.hide();
          $hits.empty();
          $pagination.empty();
          return;
        }
    
        // If we have hits, display how many results and repeat the query
        // Else display a 'No result' message
        // All of this uses the localized strings of Zendesk, so it will be adapted
        // for all the languages
        $title.html((content.nbHits ?
                    '<b>' + content.nbHits + '</b> ' + I18n.translations['txt.help_center.views.admin.appearance.template_title.search_results'] :
                    I18n.translations['txt.help_center.javascripts.tag_selector.no_results_matched']) + ': ' + '"' + content.query + '"').show();
    
        // Generate html and display everything
        var html = '';
        for (var i = 0; i < content.hits.length; ++i) {
          html += templateHit.render(content.hits[i]);
        }
        $hits.html(html);
        displayPagination(content.page, content.nbPages);
        displayTimes();
      }
    
      // For the instant search, we only search in the articles
      // hitsPerPage: how many results we want to display per page
      // facetFilters: localeFilter allows us to only search articles written in the current language
      function search() {
        articles.search($query.val(), searchCallback, { hitsPerPage: 10, page: page, facetFilters: localeFilter });
        $query.focus();
      }
    
      // We search on each keystroke
      $query.on('keyup change', function() {
        search();
      });
    
      // On the load of the page, we retrieve the search made and use algolia on it
      var originalQuery = $('.search-results-heading').text().match(/"([^"]+)"/);
      if (originalQuery) {
        originalQuery = originalQuery.slice(-1)[0];
        if (originalQuery != '') {
          $query.val(originalQuery).trigger('change');
        }
      }
    
      // This function is used by the pagination component to display a page of results
      window.gotoPage = function (number) {
        page = number - 1;
        $(window).scrollTop($query.offset().top - 5);
        search();
      }
    
      search();
    }
    ```
- **Autocomplete**
    
    ```js
    else {
      // This function will be used to link Algolia and typeahead.js
      // algoliasearch.js already provides an adapter for typeahead, but since
      // we want to handle stop words, we'll need to redefine it
      function adapter(index, options) {
        return function (q, cb) {
          index.search(removeStopWords(q), function(success, content) {
            if (success) {
                cb(content.hits);
            }
          }, $.extend({ facetFilters: localeFilter }, options));
        };
      }
      
      // typeahead.js initialization
      // typeahead is a library that allows to display an autocomplete menu
      // It can handle multiple datasets, that's why we'll give an array of 3
      // datasets :
      // - Sections
      // - Articles
      // - Other results : This one is only used to display a link to the full search
      //   page if there are more results for the query than displayable in the autocomplete
      //
      // As before, we'll use the localeFilter to handle different languages
      //
      // We'll limit the results to 3 in the autocomplete but this is completely overridable
      // Just remember to update the constant in the `other` dataset
      $query.typeahead({ hint: false }, [
        {
          source: sections.ttAdapter({ hitsPerPage: 3, facetFilters: localeFilter }),
          name: 'sections',
          displayKey: 'title',
          templates: {
            // Here we get the translation for 'Sections'
            header: '<div class="header">' + I18n.translations['txt.help_center.javascripts.arrange_content.sections'] + '</div>',
            suggestion: function(hit) {
              hit.nb_articles_text = hit.nb_articles + ' ' + articleLocale(hit.nb_articles);
              return templateSection.render(hit);
            }
          }
        },
        {
          source: articles.ttAdapter({ hitsPerPage: 3, facetFilters: localeFilter }),
          name: 'articles',
          displayKey: 'title',
          templates: {
            // Here we get the translation for 'Articles'
            header: '<div class="header">' + I18n.translations['txt.help_center.javascripts.arrange_content.articles'] + '</div>',
            suggestion: function(hit) { return templateArticle.render(hit); }
          }
        },
        {
          // This is again a custom adapter
          // We query algolia to send us 0 elements, we'll just use this to know how many
          // results matched
          source: function(q, cb) {
            articles.search(removeStopWords(q), function(success, content) {
              if (success) {
                if (content.nbHits > 3) {
                  cb([ { query: q, nbHits: content.nbHits }]);
                } else {
                  cb([]);
                }
              }
            }, { hitsPerPage: 0, facetFilters: localeFilter });
          },
          name: 'other',
          templates: {
            header: '',
            suggestion: function(hit) {
              // Translation for "See more ({{nb_articles}} articles)"
              var t = '<div class="hit-other"><a class="others">' +
                      I18n.translations['txt.help_center.views.admin.shared.recent_activity.see_more'] + ' (<b>' + hit.nbHits + '</b> ' + articleLocale(hit.nbHits) + ')</a></div>';
              return t;
            }
          }
        }
      ]).on('typeahead:selected', function(event, suggestion, dataset) {
        // Here we handle redirections when an option is selected (click or navigating with arrows => Enter)
        if (dataset === 'sections' || dataset === 'articles') {
          location.href = '/hc/' + I18n.locale + '/' +  dataset + '/' + suggestion.id;
        } else if (dataset === 'other') {
          location.href = '/hc/' + I18n.locale + '/search?query=' + suggestion.query;
        }
      }).focus();
    }
    ```

Now let's talk about the most customizable part : the **CSS**.  
Open the **CSS** tab, and copy paste this code at the beginning :

```css
/* We want our autocomplete to be as long as our input */
.twitter-typeahead {
  width: 100%; 
}

/* This is the global container for the autocomplete results container */
.tt-dropdown-menu {
  padding: 0;
  margin: 0;
  background-color: white;
  font-weight: lighter;
  border-right: 1px solid #DDD;
  border-bottom: 1px solid #DDD;
  border-left: 1px solid #DDD;
}

.tt-dropdown-menu a {
  padding: 2px 0;
  padding: 7px 0;
}

.tt-dropdown-menu a:hover {
  text-decoration: none; 
}

/* You can configure this with Algolia, but by default, text that matches the query (highlighted) will be surrounded by em tags */
.tt-dropdown-menu em, #hits em {
  font-weight: bold;
  font-style: normal;
}

.tt-dropdown-menu .header {
  font-size: 14px;
  text-transform: uppercase;
  padding: 10px 20px 5px 20px;
}

.tt-dropdown-menu .title {
  font-size: 14px;
  padding: 0 20px;
}

.tt-dropdown-menu .body {
  color: #555;
  font-size: 12px;
  padding: 0 20px 0 40px;
}

.tt-dropdown-menu .hit-article,
.tt-dropdown-menu .hit-section {
  padding: 3px 0;
  display: block;
}

.tt-dropdown-menu .hit-other {
  font-size: 12px;
  padding: 5px 0px 5px 20px;
  cursor: pointer;
  background: #f9f9f9;
  margin: 5px 0 0 0;
}

.tt-dropdown-menu a.others {
  color: $color_4
}

.tt-dropdown-menu a.others:hover {
  text-decoration: underline;
}

/*
 * When hovering or navigating with arrows in the autocomplete, the .tt-cursor class is appended
 * Use this to style how selecting a result should look like
 */
.tt-suggestion.tt-cursor {
  background-color: #F0ECEB;
}

/* The input where the query is typed */
#query {
  outline: none; 
}

/* Styling of the pagination */
#pagination li {
  float: none !important;
  cursor: pointer;
}

#pagination li:hover {
  background-color: #F0ECEB;
}

#pagination li.active {
  color: #E63307;
}

#pagination li.disabled {
  color: #AAA;
  cursor: default;
}

#pagination li.disabled:hover {
  background-color: transparent;
}

/* Here we reduce the huge space between the header and the top of the page */
h1.search-results-header {
  margin-top: 0px; 
}

nav.sub-nav {
  padding-bottom: 0px;
}
```

It will probably not match your theme, since it has been written for
[rememberthedate](https://rememberthedate.zendesk.com/hc), but it will
give you a starting point to customize it to your needs.
