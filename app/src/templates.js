import Hogan from 'hogan.js';

export default {
  autocomplete: {
    // Autocompletion template for a section
    section: Hogan.compile(
      `<div class="hit-section" style="border-bottom-color: {{colors.secondary}}">
        <div class="title overflow-block-container">
          <span class="overflow-block">
            {{{ _highlightResult.category.title.value }}} > {{{ _highlightResult.title.value }}}
          </span>
          <small class="overflow-block text-muted">({{ nb_articles_text }})</small>
        </div>
        <div class="body">{{{ _highlightResult.body.value }}}</div>
      </div>`),

    // Autocompletion template for an article
    article: Hogan.compile(
      `<div
        class="
          aa-article-hit
          {{# isCategoryHeader }}aa-article-hit__category-first{{/ isCategoryHeader }}
          {{# isSectionHeader }}aa-article-hit__section-first{{/ isSectionHeader }}
          {{# sizeModifier }}aa-article-hit__{{ sizeModifier }}{{/ sizeModifier}}
        "
      >
      <div class="aa-article-hit--category">
        {{ category.title }}
      </div>
      <div class="aa-article-hit--line">
        <div class="aa-article-hit--section">
          <div class="aa-article-hit--section--inside">{{ section.title }}</div>
        </div>
        <div class="aa-article-hit--content">
          <div class="aa-article-hit--title">
            {{{ _highlightResult.title.value }}}
          </div>
          {{# _snippetResult.body_safe.value }}
            <div class="aa-article-hit--body">{{{ _snippetResult.body_safe.value }}}</div>
          {{/ _snippetResult.body_safe.value }}
        </div>
      </div>`),

    // Powered By
    footer: Hogan.compile(`<div class="aa-powered-by" style="border-top-color: {{colors.secondary}}">
      {{ translations.search_by }}
      <a
        href="https://www.algolia.com/?utm_source=zendesk_hc&utm_medium=link&utm_campaign=autocomplete"
        class="aa-powered-by-link"
      >
        Algolia
      </a>
    </div>`),

    // CSS to add to handle the colors
    css: Hogan.compile(`
      .aa-article-hit--highlight {
        color: {{ colors.primary }};
      }

      .aa-article-hit--category {
        background-color: {{ colors.primary }};
      }

      .aa-article-hit--section, .aa-article-hit--content {
        border-color: {{ colors.secondary }};
      }
    `)
  },

  instantsearch: {
    // Instant search result template
    hit: Hogan.compile(
      `<div class="search-result">
        <a class="search-result-link" href="{{baseUrl}}{{ locale.locale }}/articles/{{ id }}">
          {{{ _highlightResult.title.value }}}
        </a>
        {{#vote_sum}}<span class="search-result-votes">{{ vote_sum }}</span>{{/vote_sum}}
        <div class="search-result-meta">
          <time data-datetime="relative" datetime="{{ created_at_iso }}"></time>
        </div>
        <div class="search-result-body">
          {{{ _snippetResult.body_safe.value }}}
        </div>
      </div>`),
    noResults: (
      `<div id="no-results-message">
        <p>We didn't find any results for the search <em>"{{ query }}"</em>.</p>
      </div>`
    )
  }
};
