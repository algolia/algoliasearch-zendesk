'use strict';

/* global I18n */

var $ = require('jquery');
var algoliasearch = require('algoliasearch');
require('autocomplete.js/index_jquery.js');
var templates = require('./templates.js');

module.exports = function(options) {
  var $query = $(options.autocomplete.inputSelector || '#query');

  options.autocomplete.sections = options.autocomplete.sections || {};
  if (typeof options.autocomplete.sections.enabled === 'undefined') {
    options.autocomplete.sections.enabled = true;
  }
  options.autocomplete.articles = options.autocomplete.articles || {};
  if (typeof options.autocomplete.articles.enabled === 'undefined') {
    options.autocomplete.articles.enabled = true;
  }

  function adapter(index, params) {
    var localeFilter = '["locale.locale:' + I18n.locale + '"]';
    params = $.extend({optionalFacetFilters: localeFilter}, params);
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

  function header(text) {
    return '<div class="aa-header" style="background-color: ' + options.colors.primary + '">' +
        text +
      '</div>';
  }

  // initialize API client
  var client = algoliasearch(options.applicationId, options.apiKey);

  // initialize indices
  var articles = client.initIndex(options.indexPrefix + options.subdomain + '_articles');
  var sections = client.initIndex(options.indexPrefix + options.subdomain + '_sections');

  var sources = [];
  if (options.autocomplete.sections.enabled) {
    sources.push({
      source: adapter(sections, {hitsPerPage: (options.autocomplete.sectionHits || 3)}),
      name: 'sections',
      templates: {
        header: header(I18n.translations['txt.help_center.javascripts.arrange_content.sections']),
        suggestion: function(hit) {
          hit.nb_articles_text = hit.nb_articles + ' ' + articleLocale(hit.nb_articles);
          hit.colors = options.colors;
          return templates.autocomplete.section.render(hit);
        }
      }
    });
  }
  if (options.autocomplete.articles.enabled) {
    sources.push({
      source: adapter(articles, {hitsPerPage: (options.autocomplete.articleHits || 3)}),
      name: 'articles',
      templates: {
        header: header(I18n.translations['txt.help_center.javascripts.arrange_content.articles']),
        suggestion: function(hit) {
          hit.colors = options.colors;
          return templates.autocomplete.article.render(hit);
        }
      }
    });
  }

  // typeahead.js initialization
  $query.autocomplete({
    hint: false,
    debug: true,
    templates: {
      footer: '<div class="ais-search-box--powered-by">by <a href="https://www.algolia.com/?utm_source=zendesk_hc&utm_medium=link&utm_campaign=autocomplete" class="ais-search-box--powered-by-link">Algolia</a></div>'
    }
  }, sources).on('autocomplete:selected', function(event, suggestion, dataset) {
    if (dataset === 'sections' || dataset === 'articles') {
      location.href = options.baseUrl + I18n.locale + '/' + dataset + '/' + suggestion.id;
    } else if (dataset === 'other') {
      location.href = options.baseUrl + I18n.locale + '/search?query=' + suggestion.query;
    }
  });
};
