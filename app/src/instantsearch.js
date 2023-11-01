import instantsearch from 'instantsearch.js';

import addCSS from './addCSS';
import { createClickTracker } from './clickAnalytics';
import removeCSS from './removeCSS';
import getOptionalWords from './stopwords';

import './closestPolyfill';

class InstantSearch {
  constructor({
    analytics,
    applicationId,
    apiKey,
    autocomplete: { inputSelector: autocompleteSelector },
    clickAnalytics,
    indexName,
    indexPrefix,
    instantsearch: { enabled, hideAutocomplete, paginationSelector, selector },
    subdomain,
  }) {
    if (!enabled) return;

    this.locale = null;
    this.indexName = indexName || `${indexPrefix}${subdomain}_articles`;
    this.trackClick = createClickTracker(this, this.indexName);

    this._temporaryHiding({
      hideAutocomplete,
      autocompleteSelector,
      instantsearchSelector: selector,
      paginationSelector,
    });

    this.instantsearch = instantsearch({
      appId: applicationId,
      apiKey,
      indexName: this.indexName,
      urlSync: {
        mapping: {
          q: 'query',
        },
      },
      searchParameters: {
        analytics,
        attributesToSnippet: ['body_safe:40'],
        highlightPreTag: '<span class="ais-highlight">',
        highlightPostTag: '</span>',
        snippetEllipsisText: '...',
        clickAnalytics,
      },
      searchFunction: ({ search }) => {
        const helper = this.instantsearch.helper;
        const query = helper.state.query;
        const optionalWords = getOptionalWords(query, this.locale);
        const page = helper.getPage();
        helper.setQueryParameter('optionalWords', optionalWords);
        helper.setPage(page);
        search();
      },
    });

    this.instantsearch.client.addAlgoliaAgent(
      'Zendesk Integration (__VERSION__)'
    );
  }

  render({
    autocomplete: { inputSelector: autocompleteSelector },
    baseUrl,
    clickAnalytics,
    color,
    highlightColor,
    instantsearch: {
      enabled,
      hitsPerPage,
      selector,
      paginationSelector,
      reuseAutocomplete,
      hideAutocomplete,
      tagsLimit,
      useEditedAt,
      showHitsFullPath,
    },
    locale,
    poweredBy,
    responsive,
    subdomain,
    templates,
    translations,
  }) {
    if (!enabled) return;

    this.locale = locale;

    let searchBoxSelector;

    addCSS(templates.instantsearch.css({ color, highlightColor }));

    if (reuseAutocomplete) {
      addCSS('#algolia-query { display: none }');
      searchBoxSelector = autocompleteSelector;
    } else {
      this.$autocompleteInputs =
        document.querySelectorAll(autocompleteSelector);
      if (hideAutocomplete) this._hideAutocomplete();
      searchBoxSelector = '#algolia-query';
    }

    this.$oldPagination = document.querySelector(paginationSelector);
    if (this.$oldPagination !== null) {
      this.$oldPagination.style.display = 'none';
    }

    this.$container = document.querySelector(selector);
    if (this.$container === null) {
      throw new Error(
        `[Algolia] Cannot find a container with the "${selector}" selector.`
      );
    }
    this.$container.innerHTML = templates.instantsearch.layout({
      translations,
    });

    this._handleResponsiveness({ responsive, templates });

    this.instantsearch.addWidget({
      getConfiguration: () => ({ facets: ['locale.locale'] }),
      init: ({ helper }) => {
        // Filter by language
        const page = helper.getPage();
        helper.addFacetRefinement('locale.locale', this.locale);
        helper.setPage(page);
      },
    });

    if (poweredBy === true) {
      poweredBy = {
        template: templates.instantsearch.poweredBy({
          subdomain,
          translations,
        }),
      };
    }

    this.instantsearch.addWidget(
      instantsearch.widgets.searchBox({
        container: searchBoxSelector,
        placeholder: translations.placeholder,
        autofocus: true,
        poweredBy,
        cssClasses: {
          root: reuseAutocomplete ? '' : 'ais-with-style',
        },
      })
    );

    this.instantsearch.addWidget(
      instantsearch.widgets.stats({
        container: '#algolia-stats',
        templates: {
          body: ({ nbHits, processingTimeMS }) =>
            translations.stats(nbHits, processingTimeMS),
        },
        transformData: (data) => ({
          ...data,
          translations,
        }),
      })
    );

    this.instantsearch.addWidget(
      instantsearch.widgets.pagination({
        container: '#algolia-pagination',
        cssClasses: {
          root: 'pagination',
        },
      })
    );

    this.instantsearch.addWidget(
      instantsearch.widgets.hierarchicalMenu({
        container: '#algolia-categories',
        attributes: ['category.title', 'section.full_path'],
        separator: ' > ',
        templates: {
          header: translations.categories,
          item: templates.instantsearch.hierarchicalItem,
        },
      })
    );

    this.instantsearch.addWidget(
      instantsearch.widgets.refinementList({
        container: '#algolia-labels',
        attributeName: 'label_names',
        operator: 'and',
        templates: {
          header: translations.tags,
        },
        limit: tagsLimit,
      })
    );

    this.instantsearch.addWidget(
      instantsearch.widgets.hits({
        container: '#algolia-hits',
        hitsPerPage,
        templates: {
          empty: templates.instantsearch.noResult,
          item: templates.instantsearch.hit,
        },
        transformData: {
          empty: (data) => ({
            ...data,
            translations,
          }),
          item: (hit) => ({
            ...hit,
            useEditedAt,
            showHitsFullPath,
            baseUrl,
            position: hit.__hitIndex + 1,
            queryID:
              this.instantsearch.helper.lastResults._rawResults[0].queryID,
          }),
        },
      })
    );

    this.instantsearch.addWidget({
      init: () => {
        this._addClickListener(clickAnalytics);
      },
    });

    let firstRender = true;
    this.instantsearch.on('render', () => {
      this._displayTimes();
      if (firstRender) {
        firstRender = false;
        this._bindNoResultActions();
      }
    });

    this.instantsearch.start();
    this._temporaryHidingCancel();
  }

  // Protected

  _displayTimes() {
    // eslint-disable-next-line import/no-extraneous-dependencies
    const moment = require('moment');
    const timezoneOffset = moment().zone();
    moment().lang(this.locale); // Doesn't work, as we're missing translations
    const times = document.querySelectorAll('time');
    for (let i = 0; i < times.length; ++i) {
      const $time = times[i];
      const datetime = $time.getAttribute('datetime');
      const formattedDatetime = moment(datetime).utc().zone(timezoneOffset);
      const isoTitle = formattedDatetime.format('YYYY-MM-DD HH:mm');

      $time.setAttribute('title', isoTitle);

      // Render time[data-datetime='relative'] as 'time ago'
      if ($time.getAttribute('data-datetime') === 'relative') {
        $time.textContent = formattedDatetime.fromNow();
      } else if ($time.getAttribute('data-datetime') === 'calendar') {
        $time.textContent = formattedDatetime.calendar();
      }
    }
  }

  _hideAutocomplete() {
    for (let i = 0, len = this.$autocompleteInputs.length; i < len; ++i) {
      const $input = this.$autocompleteInputs[i];
      let $elt = $input;
      let $parent = $elt.parentNode;
      // Find closest form
      while ($elt !== null && $elt.nodeName.toLowerCase() !== 'form') {
        $elt = $parent;
        $parent = $elt.parentNode;
      }
      // If no form found reset
      if ($elt === null) {
        $elt = $input;
        $parent = $elt.parentNode;
      }
      // Get the closest parent to have more than one child
      while ($elt !== null && $parent.children.length === 1) {
        $elt = $parent;
        $parent = $elt.parentNode;
      }
      $elt.style.display = 'none';
    }
  }

  _bindNoResultActions() {
    this.$container.addEventListener(
      'click',
      (e) => {
        for (
          let target = e.target;
          target && target !== this;
          target = target.parentNode
        ) {
          // eslint-disable-next-line no-continue
          if (target.classList === undefined) continue;
          if (target.classList.contains('ais-change-query')) {
            this.instantsearch.helper.setQuery('').search();
          }
        }
      },
      false
    );
    this.$container.addEventListener(
      'click',
      (e) => {
        for (
          let target = e.target;
          target && target !== this;
          target = target.parentNode
        ) {
          // eslint-disable-next-line no-continue
          if (target.classList === undefined) continue;
          if (target.classList.contains('ais-clear-filters')) {
            this.instantsearch.helper
              .clearRefinements()
              .addFacetRefinement('locale.locale', this.locale)
              .search();
          }
        }
      },
      false
    );
  }

  _handleResponsiveness({ templates, responsive }) {
    if (!responsive) return;
    const $mainStyle = addCSS(templates.instantsearch.responsiveCSS);

    // Responsive filters
    let $responsiveCSSFacets = null;
    document
      .getElementById('algolia-facets-open')
      .addEventListener('click', function () {
        if ($responsiveCSSFacets === null) {
          $responsiveCSSFacets = addCSS(
            templates.instantsearch.responsiveCSSFacets,
            $mainStyle
          );
        }
      });
    document
      .getElementById('algolia-facets-close')
      .addEventListener('click', function () {
        removeCSS($responsiveCSSFacets);
        $responsiveCSSFacets = null;
      });
  }

  _temporaryHiding({
    hideAutocomplete,
    autocompleteSelector,
    instantsearchSelector,
    paginationSelector,
  }) {
    let selector = `${instantsearchSelector}, ${paginationSelector}`;
    if (hideAutocomplete) selector += `, ${autocompleteSelector}`;
    this._temporaryHidingCSS = addCSS(`
      ${selector} {
        display: none !important;
        visibility: hidden !important;
      }
    `);
  }

  _temporaryHidingCancel() {
    removeCSS(this._temporaryHidingCSS);
    delete this._temporaryHidingCSS;
  }

  // attach the event listener only once on container and find article link at click time
  _addClickListener(clickAnalytics) {
    if (!clickAnalytics) return;
    this.$container.addEventListener('click', (e) => {
      const $target = e.target;
      const $link = $target.closest('a.search-result-link');
      if (!$link) return;
      const $article = $link.closest('.search-result');
      if (!$article) {
        console.error("Couldn't find associated article for link", $link);
        return;
      }
      const objectID = $article.getAttribute('data-algolia-objectid');
      const articleID = $article.getAttribute('data-algolia-articleid');
      const position = $article.getAttribute('data-algolia-position');
      const queryID = $article.getAttribute('data-algolia-queryid');
      this.trackClick({ objectID, id: articleID }, position, queryID);
    });
  }
}
export default (...args) => new InstantSearch(...args);
