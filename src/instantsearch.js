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
  var $query = $('<input type="text" id="algolia-query" />');
  container.before($query);
  var $stats = $('<div id="algolia-stats" />');
  container.before($stats);
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
  q.val('');

  var search = instantsearch({
    appId: options.applicationId,
    apiKey: options.apiKey,
    indexName: options.indexPrefix + options.subdomain + '_sections',
    searchParameters: {
      query: query
    }
  });

  search.addWidget(
    instantsearch.widgets.searchBox({
      container: '#algolia-query',
      placeholder: 'Search for articles',
      poweredBy: true
    })
  );

  search.addWidget(
    instantsearch.widgets.stats({
      container: '#algolia-stats'
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
    instantsearch.widgets.hits({
      container: '#algolia-hits',
      templates: {
        item: function(data) {
          return templates.instantsearch.hit.render(data);
        }
      }
    })
  );

  search.on('render', function() {
    displayTimes();
  })

  search.start();
};
