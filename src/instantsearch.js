'use strict';

/* global I18n, moment */

var $ = require('jquery');
var instantsearch = require('instantsearch.js/dist/instantsearch.js');
var templates = require('./templates.js');

module.exports = function(options) {
  var $searchResults = $('.search-results');
  if ($searchResults.length === 0) {
    return;
  }
  var container = $searchResults.find('.search-results-column');
  var $query = $('<input type="text" id="algolia-query" autofocus="autofocus" />');
  container.before($query);
  var $stats = $('<div id="algolia-stats" />');
  container.before($stats);
  var $facets = $('<div id="algolia-facets"><div id="algolia-categories" /><div id="algolia-labels" /></div>');
  container.before($facets);
  var $hits = $('<div id="algolia-hits" />');
  container.before($hits);
  var $pagination = $('<div id="algolia-pagination" />');
  container.before($pagination);

  function displayTimes() {
    // Extracted from formatDateTime.js
    // Maybe we could call it directly, but I don't know
    // backbone.js at all
    var timezoneOffset = moment().zone();
    moment().lang(I18n.locale, I18n.datetime_translations);
    $('time').each(function() {
      var $this = $(this);
      var datetime = $this.attr('datetime');
      var formattedDatetime = moment(datetime).utc().zone(timezoneOffset);
      var isoTitle = formattedDatetime.format('YYYY-MM-DD HH:mm');

      $this.attr('title', isoTitle);

      // Render time[data-datetime='relative'] as 'time ago'
      if ($this.data('datetime') === 'relative') {
        $this.text(formattedDatetime.fromNow());
      } else if ($this.data('datetime') === 'calendar') {
        $this.text(formattedDatetime.calendar());
      }
    });
  }

  var q = $(options.autocomplete.inputSelector || '#query');
  var query = q.val();
  if (q.autocomplete) {
    q.autocomplete('val', '');
  } else {
    q.val('');
  }
  q.attr('autofocus', null);

  var search = instantsearch({
    appId: options.applicationId,
    apiKey: options.apiKey,
    indexName: options.indexPrefix + options.subdomain + '_articles',
    urlSync: {},
    searchParameters: {
      query: query,
      attributesToSnippet: ['body_safe:60']
      //,optionalFacetFilters: '["locale.locale:' + I18n.locale + '"]'
    }
  });

  search.addWidget(
    instantsearch.widgets.searchBox({
      container: '#algolia-query',
      placeholder: 'Search for articles',
      autofocus: true,
      poweredBy: true
    })
  );

  search.addWidget(
    instantsearch.widgets.stats({
      container: '#algolia-stats'
    })
  );

  search.addWidget(
    instantsearch.widgets.pagination({
      container: '#algolia-pagination',
      cssClasses: {
        root: 'pagination'
      }
    })
  );

  search.addWidget(
    instantsearch.widgets.menu({
      container: '#algolia-categories',
      attributeName: 'category.title',
      templates: {
        header: I18n.translations['txt.help_center.javascripts.arrange_content.categories']
      }
    })
  );

  search.addWidget(
    instantsearch.widgets.refinementList({
      container: '#algolia-labels',
      attributeName: 'label_names',
      operator: 'and',
      templates: {
        header: 'Tags'
      }
    })
  );

  search.addWidget(
    instantsearch.widgets.hits({
      container: '#algolia-hits',
      templates: {
        item: function(hit) {
          return templates.instantsearch.hit.render(hit);
        }
      },
      transformData: function(hit) {
        hit.colors = options.colors;
        hit.baseUrl = options.baseUrl;
        return hit;
      }
    })
  );

  search.on('render', function() {
    displayTimes();
  });

  search.start();
};
