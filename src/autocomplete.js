'use strict';

/* global I18n */

var $ = require('jquery');
require('autocomplete.js/index_jquery.js');
var templates = require('./templates.js');

module.exports = function(articles, sections, options) {
  var $query = $('#query');

  function adapter(index, params) {
    return function (q, cb) {
      var localeFilter = '["locale.locale:' + I18n.locale + '"]';
      index.search(q, $.extend({ facetFilters: localeFilter, removeStopWords: true }, params), function(success, content) {
        if (success) {
          cb(content.hits);
        } else {
          cb([]);
        }
      });
    };
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
  $query.autocomplete({ hint: false }, [
    {
      source: adapter(sections, { hitsPerPage: 3 }),
      name: 'sections',
      displayKey: 'title',
      templates: {
        header: '<div class="header">' + I18n.translations['txt.help_center.javascripts.arrange_content.sections'] + '</div>',
        suggestion: function(hit) {
          hit.nb_articles_text = hit.nb_articles + ' ' + articleLocale(hit.nb_articles);
          return templates.section.render(hit);
        }
      }
    },
    {
      source: adapter(articles, { hitsPerPage: 3 }),
      name: 'articles',
      displayKey: 'title',
      templates: {
        header: '<div class="header">' + I18n.translations['txt.help_center.javascripts.arrange_content.articles'] + '</div>',
        suggestion: function(hit) { return templates.rticle.render(hit); }
      }
    }
  ]).on('autocomplete:selected', function(event, suggestion, dataset) {
    if (dataset === 'sections' || dataset === 'articles') {
      location.href = '/hc/' + I18n.locale + '/' + dataset + '/' + suggestion.id;
    } else if (dataset === 'other') {
      location.href = '/hc/' + I18n.locale + '/search?query=' + suggestion.query;
    }
  }).focus();
};
