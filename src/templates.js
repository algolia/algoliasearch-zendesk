import Hogan from 'hogan.js';

export default {
  autocomplete: {
    // Autocompletion template for a section
    section: Hogan.compile(`
      <div class="hit-section" style="border-bottom-color: {{colors.secondary}}">
        <div class="title overflow-block-container">
          <span class="overflow-block">
            {{{ _highlightResult.category.title.value }}} > {{{ _highlightResult.title.value }}}
          </span>
          <small class="overflow-block text-muted">({{ nb_articles_text }})</small>
        </div>
        <div class="body">{{{ _highlightResult.body.value }}}</div>
      </div>`),

    // Autocompletion template for an article
    article: Hogan.compile(`
      <div class="hit-article" style="border-bottom-color: {{colors.secondary}}">
        <div class="title overflow-block-container">
          <span class="overflow-block">
            {{{ _highlightResult.title.value }}}
          </span>
        </div>
        <div class="body">{{{ _snippetResult.body_safe.value }}} [...]</div>
      </div>`)
  },

  instantsearch: {
    // Instant search result template
    hit: Hogan.compile(`
      <div class="search-result" style="border-color: {{colors.tertiary}}">
        <a class="search-result-link" href="{{baseUrl}}{{ locale.locale }}/articles/{{ id }}">
          {{{ _highlightResult.title.value }}}
        </a>
        {{#vote_sum}}<span class="search-result-votes">{{ vote_sum }}</span>{{/vote_sum}}
        <div class="search-result-meta">
          <time data-datetime="relative" datetime="{{ created_at_iso }}"></time>
        </div>
        <div class="search-result-body">
          {{{ _snippetResult.body_safe.value }}} [...]
        </div>
      </div>`)
  }
};
