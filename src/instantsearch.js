'use strict';

/* global I18n, moment */

var $ = require('jquery');
var templates = require('./templates.js');

module.exports = function(articles, sections, options) {
  console.log('instantsearch init');
  var page = 0;
  var $title = $('.search-results-heading');
  var $query = $('#query');
  var $hits = $('#hits');
  var $pagination = $('#pagination');

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

  function displayPagination(curr, total) {
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
      $pagination.html(templates.instantsearch.pagination.render({ pages: pages, prev_page: (curr > 0 ? curr : false), next_page: (curr + 1 < total ? curr + 2 : false) }));
    } else {
      $pagination.html('');
    }
  }

  function searchCallback(error, content) {
    if (error) {
      $title.hide();
      $hits.empty();
      $pagination.empty();
      return;
    }

    $title.html((content.nbHits ?
                '<b>' + content.nbHits + '</b> ' + I18n.translations['txt.help_center.views.admin.appearance.template_title.search_results'] :
                I18n.translations['txt.help_center.javascripts.tag_selector.no_results_matched']) + ': ' + '"' + $query.val() + '"').show();

    var html = '';
    for (var i = 0; i < content.hits.length; ++i) {
      html += templates.instantsearch.hit.render(content.hits[i]);
    }
    $hits.html(html);
    displayPagination(content.page, content.nbPages);
    displayTimes();
  }

  var lastQuery = null;
  var localeFilter = '["locale.locale:' + I18n.locale + '"]';
  function search() {
    var q = $query.val();
    if (q !== lastQuery) {
      articles.search(q, { hitsPerPage: 10, page: page, facetFilters: localeFilter, removeStopWords: true }, searchCallback);
      lastQuery = q;
    }
  }

  $query.on('keyup change', search);

  var originalQuery = $('.search-results-heading').text().match(/"([^"]+)"/);
  if (originalQuery) {
    originalQuery = originalQuery.slice(-1)[0];
    if (originalQuery !== '') {
      $query.val(originalQuery).trigger('change');
    }
  }

  window.gotoPage = function(number) {
    page = number - 1;
    $(window).scrollTop($query.offset().top - 5);
    search();
  };

  search();
};
