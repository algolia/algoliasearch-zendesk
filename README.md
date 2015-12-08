# Algolia for Zendesk - Help Center Manual Way

#### Index data

Your data needs to be indexed on Algolia using our connector.

In this description, we'll present our integration in
[*Remember The Date* Help Center](https://rememberthedate.zendesk.com/hc/).
It should give enough details for you to change it for it to match your
implementation.
You can access the files directly in this folder.  
However, we recommend you to read this README instead.

### Accesing the customization panel

First, go to [http://{your-zendesk-subdomain}.zendesk.com/hc]
(http://subdomain.zendesk.com/hc) and log in.

Once logged in, you should have in the lower right corner an option named
`Customize design`. In the panel that just opened, click on `Edit theme`.

### HTML

Now you'll need to modify several **HTML** parts :

- **Footer** We'll include necessary **JS** files here
  ```HTML
  [...]
  </footer>

  <!-- Algolia -->
    <script src="//cdn.jsdelivr.net/typeahead.js/0.10/typeahead.jquery.min.js"></script>
    <script src="//cdn.jsdelivr.net/hogan.js/3/hogan.min.common.js"></script>
    <script src="//cdn.jsdelivr.net/algoliasearch/3/algoliasearch.min.js"></script>
    <script src="//cdn.jsdelivr.net/algoliasearch.helper/2/algoliasearch.helper.min.js"></script>
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

### JavaScript

We'll add a little bit of **JS** now.  
Open the **JS** tab, and add a `jQuery` wrapper waiting for the page to load.  
*If it already exists, create a new one, the code splitting will be easier*

```js
/* Algolia */
$(document).ready(function() {
  'use strict';

  // Append here the code described after
}
/* /Algolia */
```

Now let's split the remaining of the code :

- **Initialization** Replace `{{ application_id }}`, `{{ api_key }}` and `{{ zendesk_domain }}` according to your configuration  
  Be sure to use the public search API key, so that users won't be able to acces the remaining of your data
  ```js
  // Algolia public credentials
  var APPLICATION_ID = '{{ application_id }}';
  var API_KEY = '{{ api_key }}';

  // Your zendesk credentials
  var ZENDESK_SUBDOMAIN = '{{ zendesk_domain }}';
  ```
  You can also change these constants to control how many things are displayed:
  ```js
  // Used to control how many pages we want to display
  // in the pagination
  var PAGINATION_PADDING = 4;

  // How many results do we display in autocomplete?
  var AUTOCOMPLETE_SECTIONS_NB_HITS = 3;
  var AUTOCOMPLETE_ARTICLES_NB_HITS = 4;

  // How many results do we display in instant search?
  var INSTANT_SEARCH_NB_HITS = 10;
  ```
  Finally, we initialize Algolia
  ```js
  // Our main algolia object
  var algolia = algoliasearch(APPLICATION_ID, API_KEY);

  // The two indices we'll search in
  var articles = algolia.initIndex('zendesk_' + ZENDESK_SUBDOMAIN + '_public_articles');
  var sections = algolia.initIndex('zendesk_' + ZENDESK_SUBDOMAIN + '_public_sections');
  ```

- **Templates**
  For the templates, we'll use the [Hogan.js](http://twitter.github.io/hogan.js/) templating engine.
  Feel free to use another one if you wish.
  ```js
  // Autocompletion template for a section
  var templateSection = Hogan.compile('' +
    '<div class="hit-section">' +
    '  <div class="title overflow-block-container">' +
    '    <span class="overflow-block">' +
    '      {{{ _highlightResult.category.title.value }}} > {{{ _highlightResult.title.value }}}' +
    '    </span>' +
    '    <small class="overflow-block text-muted">({{ nb_articles_text }})</small>' +
    '  </div>' +
    '  <div class="body">' +
    '    {{{ _highlightResult.body.value }}}' +
    '  </div>' +
    '</div>');

  // Autocompletion template for an article
  var templateArticle = Hogan.compile('' +
    '<div class="hit-article">' +
    '  <div class="title overflow-block-container">' +
    '    <span class="overflow-block">' +
    '      {{{ _highlightResult.title.value }}} ' +
    '      {{# vote_sum }}<span class="search-result-votes">{{ vote_sum }}</span>{{/ vote_sum }}' +
    '    </span>' +
    '  </div>' +
    '  <div class="body">{{{ _snippetResult.body_safe.value }}} [...]</div>' +
    '</div>');

  // Instant search result template
  var templateHit = Hogan.compile('' +
    '<li class="search-result">' +
    '  <a class="search-result-link" href="/hc/{{ locale.locale }}/articles/{{ id }}">' +
    '    {{{ _highlightResult.title.value }}}' +
    '  </a> ' +
    '  <span class="search-result-votes">{{ vote_sum }}</span> ' +
    '  <div class="search-result-meta">' +
    '    {{# author.name }}{{ author.name }}{{/ author.name }}' +
    '    <time data-datetime="relative" datetime="{{ created_at_iso }}"></time>' +
    '    -' +
    '    <a href="/hc/{{ locale.locale }}/categories/{{ category.id }}">' +
    '      {{{ _highlightResult.category.title.value }}}' +
    '    </a>' +
    '    &gt;' +
    '    <a href="/hc/{{ locale.locale }}/sections/{{ section.id }}">' +
    '      {{{ _highlightResult.section.title.value }}}' +
    '    </a>' +
    '  </div>' +
    '  <div class="search-result-body">' +
    '    {{{ _highlightResult.body.value }}}' +
    '  </div>' +
    '</li>');

  // Pagination template for the instant search page
  var templatePagination = Hogan.compile('' +
    '{{# pages.length }}' +
    '  <div id="pagination">' +
    '    <ul class="pagination">' +
    '      <li class="{{# prev_page }}prev-page{{/ prev_page }} {{^ prev_page }}disabled{{/ prev_page }}">' +
    '        &laquo;' +
    '      </li>' +
    '      {{# pages }}' +
    '        <li class="page {{# current }}active{{/ current }}{{# disabled }}disabled{{/ disabled }}" data-page="{{ number }}">' +
    '          {{  number  }}' +
    '        </li>' +
    '      {{/ pages }}' +
    '      <li class="{{# next_page }}next-page{{/ next_page }} {{^ next_page }}disabled{{/ next_page }}">' +
    '        &raquo;' +
    '      </li>' +
    '    </ul>' +
    '  </div>' +
    '{{/ pages.length }}');
  ```

- **Initialization** of some variables and functions
  ```js
  // Often used jquery selectors
  var $query = $('#query');

  // The stop words are commonly used words that are too
  // common to be searched
  // We'll remove them from the query except if there are
  // only stop words
  // You can handle them by language (see the locale in the url)
  var stop_words = {
    'en-us': "a|about|above|after|again|against|all|am|an|and|any|are|aren't|as|at|be|because|been|before|being|below|between|both|but|by|can't|cannot|could|couldn't|did|didn't|do|does|doesn't|doing|don't|down|during|each|few|for|from|further|had|hadn't|has|hasn't|have|haven't|having|he|he'd|he'll|he's|her|here|here's|hers|herself|him|himself|his|how|how's|i|i'd|i'll|i'm|i've|if|in|into|is|isn't|it|it's|its|itself|let's|me|more|most|mustn't|my|myself|no|nor|not|of|off|on|once|only|or|other|ought|our|ours|ourselves|out|over|own|same|shan't|she|she'd|she'll|she's|should|shouldn't|so|some|such|than|that|that's|the|their|theirs|them|themselves|then|there|there's|these|they|they'd|they'll|they're|they've|this|those|through|to|too|under|until|up|very|was|wasn't|we|we'd|we'll|we're|we've|were|weren't|what|what's|when|when's|where|where's|which|while|who|who's|whom|why|why's|with|won't|would|wouldn't|you|you'd|you'll|you're|you've|your|yours|yourself|yourselves"
  };

  // We'll use this filter on each query to algolia
  // All articles of different languages are stored in
  // the same index
  // We have activated a facet on this attribute in the index
  // The filter allows us to select only the results matching
  // the current language
  var localeFilter = '["locale.locale:' + I18n.locale + '"]';

  // We setup the search input
  $query.attr('autocomplete', 'off').attr('spellcheck', 'false').attr('autocorrect', 'off').attr('placeholder', 'Search for Articles, Sections, ...');

  // This function gives us the localized version of 'Article(s)' depending on how many articles there is
  // For this, we use the translations defined by Zendesk
  var articleLocale = function articleLocale (nb_articles) {
    var res;
    if (nb_articles <= 1) {
      res = I18n.translations['txt.help_center.views.admin.manage_knowledge_base.table.article'];
    } else {
      res = I18n.translations['txt.help_center.javascripts.arrange_content.articles'];
    }
    return res.toLowerCase();
  };

  // This function removes the stop words described earlier
  var removeStopWords = function removeStopWords (query) {
    if (stop_words[I18n.locale.toLowerCase()]) {
      var regex = new RegExp('(^|\\s)(' + stop_words[I18n.locale.toLowerCase()] + ')(\\s|$)', 'ig');
      // We call replace twice because it wouldn't match two consecutive stop words if we called it only once
      var res = query.replace(regex, '$1$3').replace(regex, '$1$3');
      return (res.match(/^\s*$/)) ? query : res;
    } else {
      return query;
    }
  };
  ```
- **Full results**: Instant search
  ```js
  if (window.resultsPage) {
    // Often used jquery selectors
    var $title = $('.search-results-heading');
    var $hits = $('#hits');
    var $pagination = $('#pagination');

    // The helper allows us to facet and paginate easily
    var algolia_helper = algoliasearchHelper(algolia, 'zendesk_rememberthedate_public_articles', {
      hitsPerPage: INSTANT_SEARCH_NB_HITS,
      facets: ['locale.locale']
    });
    algolia_helper.addRefine('locale.locale', I18n.locale);

    // This function comes from Zendesk code to display times
    // This allows us to replace all <time> tags by an human
    // readable date.
    var displayTimes = function displayTimes () {
      // Extracted from formatDateTime.js, because we couldn't call it from backbone directly
      var timezoneOffset = moment().zone();
      moment().lang(I18n.locale, I18n.datetime_translations);
      $('time').each(function () {
        var $this = $(this),
            datetime = $this.attr('datetime'),
            formattedDatetime = moment(datetime).utc().zone(timezoneOffset),
            isoTitle = formattedDatetime.format('YYYY-MM-DD HH:mm');

        $this.attr('title', isoTitle);

        // Render time[data-datetime='relative'] as 'time ago'
        if ($this.data('datetime') === 'relative') {
          $this.text(formattedDatetime.fromNow());
        } else if ($this.data('datetime') === 'calendar') {
          $this.text(formattedDatetime.calendar());
        }
      });
    };

    // This function displays the title at the top of the page
    // If we have hits, display how many results and the query
    // Else display a 'No result' message
    // All of this uses the localized strings of Zendesk, so it
    // will be adapted for all the languages
    // If you want more info, you should pass content as a
    // parameter instead of nbHits
    // You can have the processing time for example with
    // content.processingTimeMS
    var displayTitle = function displayTitle (nbHits) {
      var title;
      if (nbHits !== 0) {
        title = '<b>' + nbHits + '</b> ' + I18n.translations['txt.help_center.views.admin.appearance.template_title.search_results'];
      } else {
        title = I18n.translations['txt.help_center.javascripts.tag_selector.no_results_matched'];
      }
      $title.html(title + ': "' + $query.val() + '"').show();
    };

    // Displays the list of hits, using templateHit defined earlier
    var displayHits = function displayHits (hits) {
      var html = '';
      for (var i = 0; i < hits.length; ++i) {
        html += templateHit.render(hits[i]);
      }
      $hits.html(html);
    };

    // This function sets the html of $pagination, using the
    // PAGINATION_PADDING constant to calculate how many pages
    // to display and using templatePagination.
    var displayPagination = function displayPagination (curr, total) {
      var pages = [];

      if (total === 1) {
        return '';
      }

      if (curr > PAGINATION_PADDING + 1) {
        pages.push({ current: false, number: 1 });
        if (curr !== PAGINATION_PADDING + 2) {
          pages.push({ current: false, number: '...', disabled: true });
        }
      }
      for (var p = Math.max(1, curr - PAGINATION_PADDING), max = Math.min(curr + PAGINATION_PADDING, total) + 1; p < max; ++p) {
        pages.push({ current: curr === p, number: p });
      }
      if (curr + PAGINATION_PADDING < total) {
        if (curr + PAGINATION_PADDING + 1 !== total) {
          pages.push({ current: false, number: '...', disabled: true });
        }
        pages.push({ current: false, number: total });
      }
      return templatePagination.render({
        pages: pages,
        prev_page: curr > 1,
        next_page: curr < total
      });
    };

    // The helper is event based.
    // If there is an error, we hide everything.
    algolia_helper.on('error', function (err) {
      $title.empty();
      $hits.empty();
      $pagination.empty();
      console.log('Algolia error', err);
    });

    // On result, call all the display functions
    algolia_helper.on('result', function (content) {
      displayTitle(content.nbHits);
      displayHits(content.hits);
      displayPagination(content.page + 1, content.nbPages);
      displayTimes();
    });

    // For the instant search, we only search in the articles
    var search = function search () {
      algolia_helper.setQuery(removeStopWords($query.val())).search();
      $query.focus();
    };

    // We search on each keystroke
    $query.on('keyup change', function () {
      search();
    });

    // On the load of the page, we retrieve the search made and
    // use algolia to perform it
    var originalQuery = $('.search-results-heading').text().match(/"([^"]+)"/);
    if (originalQuery) {
      originalQuery = originalQuery.slice(-1)[0];
      if (originalQuery !== '') {
        $query.val(originalQuery);
      }
    }

    // Paginate to a specific page
    $('#pagination .page').on('click', function () {
      var page = +$(this).attr('data-page');
      if (!page) {
        return;
      }
      algolia_helper.setCurrentPage(page - 1).search();
    });

    // Paginate to the previous page
    $('#pagination .prev-page').on('click', function () {
      algolia_helper.previousPage().search();
    });

    // Paginate to the next page
    $('#pagination .next-page').on('click', function () {
      algolia_helper.nextPage().search();
    });

    // Call search on the first load
    search();
  }
  ```

- **Autocomplete**
  ```js
  else {
    // This function will be used to link Algolia and typeahead.js
    // algoliasearch.js already provides an adapter for typeahead, but
    // since we want to handle stop words, we'll need to redefine it
    // We also apply the localeFilter here
    var adapter = function adapter (index, options) {
      return function (q, cb) {
        index.search(removeStopWords(q), $.extend({ facetFilters: localeFilter }, options), function (err, content) {
          if (err) {
            console.log('Algolia error', err);
            return;
          }
          cb(content.hits);
        });
      };
    };

    // typeahead.js initialization
    // typeahead is a library that allows to display an autocomplete menu
    // It can handle multiple datasets, that's why we'll give an array
    // of 3 datasets :
    // - Sections
    // - Articles
    // - Other results : This one is only used to display a link to the
    //   full search page if there are more results for the query than
    //   displayable in the autocomplete
    //
    // As before, we'll use the localeFilter to handle different languages
    //
    // Use the AUTOCOMPLETE_XXX_NB_HITS constants to change how much results you want to display
    $query.typeahead({ hint: false }, [
      {
        source: adapter(sections, { hitsPerPage: AUTOCOMPLETE_SECTIONS_NB_HITS }),
        name: 'sections',
        displayKey: 'title',
        templates: {
          // Here we get the translation for 'Sections'
          header: '<div class="header">' + I18n.translations['txt.help_center.javascripts.arrange_content.sections'] + '</div>',
          suggestion: function (hit) {
            hit.nb_articles_text = hit.nb_articles + ' ' + articleLocale(hit.nb_articles);
            return templateSection.render(hit);
          }
        }
      },
      {
        source: adapter(articles, { hitsPerPage: AUTOCOMPLETE_ARTICLES_NB_HITS }),
        name: 'articles',
        displayKey: 'title',
        templates: {
          // Here we get the translation for 'Articles'
          header: '<div class="header">' + I18n.translations['txt.help_center.javascripts.arrange_content.articles'] + '</div>',
          suggestion: function (hit) { return templateArticle.render(hit); }
        }
      },
      {
        source: function (q, cb) {
          // This is again a custom adapter
          // We query algolia to send us 0 elements, we'll just use
          // this to know how many results matched
          articles.search(removeStopWords(q), { hitsPerPage: 0, facetFilters: localeFilter }, function (err, content) {
            if (err) {
              console.log('Algolia error', err);
              return;
            }
            if (content.nbHits > AUTOCOMPLETE_ARTICLES_NB_HITS) {
              cb([ { query: q, nbHits: content.nbHits }]);
            } else {
              cb([]);
            }
          });
        },
        name: 'other',
        templates: {
          header: '',
          suggestion: function (hit) {
            var t = '<div class="hit-other">' +
                    '  <a class="others">' +
                    // Translation for "See more ({{nb_articles}} articles)"
                    '   ' + I18n.translations['txt.help_center.views.admin.shared.recent_activity.see_more'] +
                    '   (<b>' + hit.nbHits + '</b> ' + articleLocale(hit.nbHits) + ')' +
                    '  </a>' +
                    '</div>';
            return t;
          }
        }
      }
    ]).on('typeahead:selected', function (event, suggestion, dataset) {
      // Here we handle redirections when an option is selected (click or navigating with arrows => Enter)
      if (dataset === 'sections' || dataset === 'articles') {
        location.href = '/hc/' + I18n.locale + '/' +  dataset + '/' + suggestion.id;
      } else if (dataset === 'other') {
        location.href = '/hc/' + I18n.locale + '/search?query=' + suggestion.query;
      }
    }).focus();
  }
  ```

**You can also find the [full file](hc/zendesk.js) in the hc folder**.

### CSS

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
  padding: 5px;
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
