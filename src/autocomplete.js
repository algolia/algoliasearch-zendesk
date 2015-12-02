'use strict';

/* global I18n */

var $ = require('jquery');
require('autocomplete.js/index_jquery.js');
var templates = require('./templates.js');

module.exports = function(articles, sections, options) {
  var $query = $(options.autocomplete.inputSelector || '#query');
  console.log('autocomplete init', $query);

  function adapter(index, params) {
    var localeFilter = '["locale.locale:' + I18n.locale + '"]';
    params = $.extend({facetFilters: localeFilter, removeStopWords: true}, params);
    return $.fn.autocomplete.sources.hits(index, params);
  }

  function articleLocale(nbArticles) {
    var res;
    if (nbArticles <= 1) {
      res = I18n.translations['txt.help_center.views.admin.manage_knowledge_base.table.article'];
    } else {
      res = I18n.translations['txt.help_center.javascripts.arrange_content.articles'];
    }
    return res.toLowerCase();
  }

  // typeahead.js initialization
  $query.autocomplete({
    hint: false,
    debug: true
  }, [
    {
      source: adapter(sections, {hitsPerPage: (options.autocomplete.sectionHits || 3)}),
      name: 'sections',
      templates: {
        header: '<div class="header">' + I18n.translations['txt.help_center.javascripts.arrange_content.sections'] + '</div>',
        suggestion: function(hit) {
          hit.nb_articles_text = hit.nb_articles + ' ' + articleLocale(hit.nb_articles);
          return templates.autocomplete.section.render(hit);
        }
      }
    },
    {
      source: adapter(articles, {hitsPerPage: (options.autocomplete.articleHits || 3)}),
      name: 'articles',
      templates: {
        header: '<div class="header">' + I18n.translations['txt.help_center.javascripts.arrange_content.articles'] + '</div>',
        suggestion: function(hit) {
          return templates.autocomplete.article.render(hit);
        }
      }
    }
  ]).on('autocomplete:selected', function(event, suggestion, dataset) {
    if (dataset === 'sections' || dataset === 'articles') {
      location.href = options.baseUrl + I18n.locale + '/' + dataset + '/' + suggestion.id;
    } else if (dataset === 'other') {
      location.href = options.baseUrl + I18n.locale + '/search?query=' + suggestion.query;
    }
  }).focus();
};
