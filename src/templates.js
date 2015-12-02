'use strict';

var Hogan = require('hogan.js');

module.exports = {
  autocomplete: {
    // Autocompletion template for a section
    section: Hogan.compile('' +
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
      '</div>'),

    // Autocompletion template for an article
    article: Hogan.compile('' +
      '<div class="hit-article">' +
      '  <div class="title overflow-block-container">' +
      '    <span class="overflow-block">' +
      '      {{{ _highlightResult.title.value }}} ' +
      '      {{# vote_sum }}<span class="search-result-votes">{{ vote_sum }}</span>{{/ vote_sum }}' +
      '    </span>' +
      '  </div>' +
      '  <div class="body">{{{ _snippetResult.body_safe.value }}} [...]</div>' +
      '</div>')
  },

  instantsearch: {
    // Instant search result template
    hit: Hogan.compile('' +
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
      '</li>')
  }
};
