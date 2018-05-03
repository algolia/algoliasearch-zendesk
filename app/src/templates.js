import compile from './compile.js';

const defaultTemplates = {
  autocomplete: {
    // Algolia logo
    algolia: subdomain => (
`<a
  href="https://www.algolia.com/?utm_source=zendesk&utm_medium=link&utm_campaign=autocomplete-${subdomain}"
  class="aa-powered-by-link"
>
  Algolia
</a>`
    ),

    // Autocompletion template for an article
    article: compile(
`<div
  class="
    aa-article-hit
    [[# isCategoryHeader ]]aa-article-hit__category-first[[/ isCategoryHeader ]]
    [[# isSectionHeader ]]aa-article-hit__section-first[[/ isSectionHeader ]]
    [[# sizeModifier ]]aa-article-hit__[[ sizeModifier ]][[/ sizeModifier]]
  "
>
  <div class="aa-article-hit--category">
    <span class="aa-article-hit--category--content">
      [[ category.title ]]
    </span>
  </div>
  <div class="aa-article-hit--line">
    <div class="aa-article-hit--section">
      [[ section.title ]]
    </div>
    <div class="aa-article-hit--content">
      <div class="aa-article-hit--headline">
        <span class="aa-article-hit--title">
          [[& _highlightResult.title.value ]]
        </span>
      </div>
      [[# _snippetResult.body_safe.value ]]
        <div class="aa-article-hit--body">[[& _snippetResult.body_safe.value ]]</div>
      [[/ _snippetResult.body_safe.value ]]
    </div>
  </div>
</div>
<div class="clearfix"></div>`
    ),

    // Powered By
    poweredBy: compile(
`<div class="aa-powered-by">
  [[& content ]]
</div>`
    ),

    // CSS to add to handle the color
    css: compile(
`.aa-article-hit--highlight {
  color: [[ color ]];
}

.aa-article-hit--section {
  color: [[ color ]];
}

.aa-article-hit--title .aa-article-hit--highlight {
  color: [[ highlightColor ]];
}

.aa-article-hit--title .aa-article-hit--highlight::before {
  background-color: [[ highlightColor ]];
}`
    )
  },

  instantsearch: {
    css: compile(
`.search-result-link, .ais-hierarchical-menu--link, .ais-link {
  color: [[ color ]];
}

.search-result-link .ais-highlight {
  color: [[ highlightColor ]];
}

.search-result-link .ais-highlight::before {
  background-color: [[ highlightColor ]];
}

#algolia-facets-open {
  color: [[ color ]];
}`
   ),

    responsiveCSS: (
`@media (max-width: 768px) {
  #algolia-facets-open {
    display: block;
    text-align: center;
    cursor: pointer;
    float: right;
    padding: 0 9px;
  }

  .ais-with-style.ais-search-box {
    margin-left: 0;
  }

  #algolia-facets {
    display: none;
  }

  #algolia-stats {
    margin-left: 0;
    width: 100%;
  }

  #algolia-hits {
    margin-left: 0;
    width: 100%;
  }
}`
    ),

    responsiveCSSFacets: (
`@media (max-width: 768px) {
  body {
    position: fixed;
    overflow: hidden;
  }

  #algolia-facets {
    padding: 20px 0;
    position: fixed;
    z-index: 10000;
    top: 0;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    background: white;
    overflow-y: scroll;
    overflow-x: hidden;
    display: block;
  }

  #algolia-facets-close {
    display: inline-block;
    position: absolute;
    top: 0;
    right: 0;
    font-size: 1.5em;
    padding: 20px 20px;
    cursor: pointer;
  }
}`
    ),

    layout: compile(
`<div>
  <input type="text" id="algolia-query"/>
  <div id="algolia-stats-line">
    <div id="algolia-facets-open">
      [[ translations.filter ]]
    </div>
    <div id="algolia-stats"></div>
  </div>
  <div id="algolia-facets">
    <div id="algolia-facets-close">
      <div id="algolia-facets-close-button">
        ✖
      </div>
    </div>
    <div id="algolia-categories"></div>
    <div id="algolia-labels"></div>
  </div>
  <div id="algolia-hits"></div>
  <div class="clearfix"></div>
  <div id="algolia-pagination"></div>
</div>`
    ),

    hierarchicalItem: compile(
`<a class="[[cssClasses.link]]" href="[[url]]" title="[[name]]">
  [[name]]
  <span class="[[cssClasses.count]]">
    [[#helpers.formatNumber]]
      [[count]]
    [[/helpers.formatNumber]]
  </span>
</a>`
    ),

    // Instant search result template
    hit: compile(
`<div class="search-result">
  <div class="search-result-meta">
    <time data-datetime="relative" datetime="[[ created_at_iso ]]"></time>
  </div>
  <div class="search-result-link-wrapper">
    <a class="search-result-link" href="[[ baseUrl ]][[ locale.locale ]]/articles/[[ id ]]">
      [[& _highlightResult.title.value ]]
    </a>
    [[# vote_sum ]]<span class="search-result-votes">[[ vote_sum ]]</span>[[/ vote_sum ]]
  </div>
  <div class="search-result-body">
    [[& _snippetResult.body_safe.value ]]
  </div>
</div>`
  ),

    noResult: ({query, translations}) => (
`<div id="no-results-message">
  <p>${translations.no_result_for(query)}</p>
  <p>${translations.no_result_actions()}</p>
</div>`
    ),

    poweredBy: ({subdomain, translations}) => (
      compile(
`<div class="[[ cssClasses.root ]]">
  ${translations.search_by_algolia(`<a class="[[ cssClasses.link ]]" href="https://www.algolia.com/?utm_source=zendesk&utm_medium=link&utm_campaign=instantsearch-${subdomain}" target="_blank">Algolia</a>`)}
</div>`
      )
    )
  }
};

export default function loadTemplates (options) {
  options.templates = {
    autocomplete: {
      ...defaultTemplates.autocomplete,
      ...options.templates.autocomplete
    },
    instantsearch: {
      ...defaultTemplates.instantsearch,
      ...options.templates.instantsearch
    }
  };
};
