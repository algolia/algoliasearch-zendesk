import compile from './compile';

const defaultTemplates = {
  autocomplete: {
    // Autocompletion template for an article.
    // Curried with `sizeModifier` so the inner function matches the
    // `@algolia/autocomplete-js` template signature `({ item, html }) => vdom`.
    article:
      (sizeModifier) =>
      ({ item, html, components }) => {
        const className = [
          'aa-article-hit',
          item.isCategoryHeader && 'aa-article-hit__category-first',
          item.isSectionHeader && 'aa-article-hit__section-first',
          sizeModifier && `aa-article-hit__${sizeModifier}`,
        ]
          .filter(Boolean)
          .join(' ');

        return html`
          <div class=${className}>
            <div class="aa-article-hit--category">
              <span class="aa-article-hit--category--content">
                ${item.category.title}
              </span>
            </div>
            <div class="aa-article-hit--line">
              <div class="aa-article-hit--section">
                ${item.section.title}
              </div>
              <div class="aa-article-hit--content">
                <div class="aa-article-hit--headline">
                  <span class="aa-article-hit--title">
                    ${components.Highlight({ hit: item, attribute: 'title' })}
                  </span>
                </div>
                ${item._snippetResult &&
                item._snippetResult.body_safe &&
                item._snippetResult.body_safe.value &&
                html`
                  <div class="aa-article-hit--body">
                    ${components.Snippet({ hit: item, attribute: 'body_safe' })}
                  </div>
                `}
              </div>
            </div>
          </div>
          <div class="clearfix"></div>
        `;
      },

    // Powered By header. Returns a v1-compatible template function.
    // The link is composed as vdom; the localized "Search by ..." wrapper
    // text is spliced in via a sentinel so translations stay as plain
    // text (no HTML injection from translation values).
    poweredBy:
      ({ subdomain, translations }) =>
      ({ html }) => {
        const SENTINEL = '\x00LINK\x00';
        const wrapped = translations.search_by_algolia(SENTINEL);
        const [before = '', after = ''] = wrapped.split(SENTINEL);
        const link = html`
          <a
            class="aa-powered-by-link"
            href=${`https://www.algolia.com/?utm_source=zendesk&utm_medium=link&utm_campaign=autocomplete-${subdomain}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Algolia
          </a>
        `;
        return html`
          <div class="aa-powered-by">${before}${link}${after}</div>
        `;
      },

    // CSS to add to handle the color
    css: ({ color, highlightColor }) => `
.aa-article-hit mark {
  color: ${color};
}

.aa-article-hit--section {
  color: ${color};
}

.aa-article-hit--title mark {
  color: ${highlightColor};
}

.aa-article-hit--title mark::before {
  background-color: ${highlightColor};
}
`,
  },

  instantsearch: {
    css: compile(
      `.search-result-link, .ais-HierarchicalMenu-link {
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

    responsiveCSS: `@media (max-width: 768px) {
  #algolia-facets-open {
    display: block;
    text-align: center;
    cursor: pointer;
    float: right;
    padding: 0 9px;
  }

  .ais-with-style.ais-SearchBox {
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
}`,

    responsiveCSSFacets: `@media (max-width: 768px) {
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
}`,

    layout: compile(
      `<div>
  <div id="algolia-query"></div>
  <div id="algolia-powered-by-container"></div>
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
      `<a class="[[cssClasses.link]]" href="[[url]]" title="[[label]]">
  [[label]]
  <span class="[[cssClasses.count]]">
    [[#helpers.formatNumber]]
      [[count]]
    [[/helpers.formatNumber]]
  </span>
</a>`
    ),

    // Instant search result template
    hit: compile(
      `<div
  class="search-result"
  data-algolia-position="[[ position ]]"
  data-algolia-queryid="[[ queryID ]]"
  data-algolia-articleid="[[ id ]]"
  data-algolia-objectid="[[ objectID ]]"
>
  <div class="search-result-meta">
    <time data-datetime="relative" datetime="[[# useEditedAt ]][[ edited_at_iso ]][[/ useEditedAt]][[^ useEditedAt ]][[ created_at_iso ]][[/ useEditedAt  ]]"></time>
  </div>
  [[# showHitsFullPath ]]<div class="search-result-path">[[ section.full_path ]]</div>[[/ showHitsFullPath ]]
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

    noResult: ({ query, translations }) =>
      `<div id="no-results-message">
  <p>${translations.no_result_for(query)}</p>
  <p>${translations.no_result_actions()}</p>
</div>`,
  },
};

export default function loadTemplates(options) {
  options.templates = {
    autocomplete: {
      ...defaultTemplates.autocomplete,
      ...options.templates.autocomplete,
    },
    instantsearch: {
      ...defaultTemplates.instantsearch,
      ...options.templates.instantsearch,
    },
  };
}
