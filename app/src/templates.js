import Hogan from 'hogan.js';

export default {
  autocomplete: {
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
        <span class="aa-article-hit--category--content">
          {{ category.title }}
        </span>
      </div>
      <div class="aa-article-hit--line">
        <div class="aa-article-hit--section">
          {{ section.title }}
        </div>
        <div class="aa-article-hit--content">
          <div class="aa-article-hit--headline">
            <span class="aa-article-hit--title">
              {{{ _highlightResult.title.value }}}
            </span>
          </div>
          {{# _snippetResult.body_safe.value }}
            <div class="aa-article-hit--body">{{{ _snippetResult.body_safe.value }}}</div>
          {{/ _snippetResult.body_safe.value }}
        </div>
      </div>`),

    // Powered By
    poweredBy: Hogan.compile(`<div class="aa-powered-by">
      {{ translations.search_by }}
      <a
        href="https://www.algolia.com/?utm_source=zendesk_hc&utm_medium=link&utm_campaign=autocomplete"
        class="aa-powered-by-link"
      >
        Algolia
      </a>
    </div>`),

    // CSS to add to handle the color
    css: Hogan.compile(`
      .aa-article-hit--highlight {
        color: {{ color }};
      }

      .aa-article-hit--highlight::before {
        background-color: {{ color }};
      }

      .aa-article-hit--category {
        color: {{ color }};
      }
    `)
  },

  instantsearch: {
    layout: (`
<div>
  <input type="text" id="algolia-query"/>
  <div id="algolia-stats"></div>
  <div id="algolia-facets">
    <div id="algolia-categories"></div>
    <div id="algolia-labels"></div>
  </div>
  <div id="algolia-hits"></div>
  <div class="clearfix"></div>
  <div id="algolia-pagination"></div>
</div>
    `),
    // Instant search result template
    hit: (`
<div class="search-result">
  <a class="search-result-link" href="{{ baseUrl }}{{ locale.locale }}/articles/{{ id }}">
    {{{ _highlightResult.title.value }}}
  </a>
  {{# vote_sum }}<span class="search-result-votes">{{ vote_sum }}</span>{{/ vote_sum }}
  <div class="search-result-meta">
    <time data-datetime="relative" datetime="{{ created_at_iso }}"></time>
  </div>
  <div class="search-result-body">
    {{{ _snippetResult.body_safe.value }}}
  </div>
</div>
    `),
    noResults: (`
<div id="no-results-message">
  <p>We didn't find any results for the search <em>"{{ query }}"</em>.</p>
</div>
    `),
    stats: (`
{{# hasNoResults }}{{ translations.no_result }}{{/ hasNoResults }}
{{# hasOneResult }}1 {{ translations.result }}{{/ hasOneResult }}
{{# hasManyResults }}
  {{# helpers.formatNumber }}{{ nbHits }}{{/ helpers.formatNumber }}
  {{ translations.results }}
{{/ hasManyResults }}
<span class="{{ cssClasses.time }}">{{ translations.found_in }} {{ processingTimeMS }}ms</span>
    `)
  }
};
