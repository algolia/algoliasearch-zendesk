import instantsearch from 'instantsearch.js';

import addCSS from './addCSS.js';
import removeCSS from './removeCSS.js';

import getOptionalWords from './stopwords.js';

class InstantSearch {
  constructor({
    applicationId,
    apiKey,
    autocomplete: {
      inputSelector: autocompleteSelector
    },
    indexPrefix,
    instantsearch: {
      enabled,
      paginationSelector,
      selector
    },
    subdomain
  }) {
    if (!enabled) return;

    this.locale = null;

    this._temporaryHiding({
      autocompleteSelector,
      instantsearchSelector: selector,
      paginationSelector
    });

    this.instantsearch = instantsearch({
      appId: applicationId,
      apiKey,
      indexName: `${indexPrefix}${subdomain}_articles`,
      urlSync: {
        mapping: {
          q: 'query'
        }
      },
      searchParameters: {
        attributesToSnippet: ['body_safe:40'],
        highlightPreTag: '<span class="ais-highlight">',
        highlightPostTag: '</span>',
        snippetEllipsisText: '...'
      },
      searchFunction: ({search}) => {
        let helper = this.instantsearch.helper;
        const query = helper.state.query;
        const optionalWords = getOptionalWords(query, this.locale);
        const page = helper.getPage();
        helper.setQueryParameter('optionalWords', optionalWords);
        helper.setPage(page);
        search();
      }
    });

    this.instantsearch.client.addAlgoliaAgent('Zendesk Integration (__VERSION__)');
  }

  render({
    autocomplete: {
      inputSelector: autocompleteSelector
    },
    baseUrl,
    color,
    highlightColor,
    instantsearch: {
      enabled,
      selector,
      paginationSelector,
      reuseAutocomplete,
      tagsLimit
    },
    locale,
    poweredBy,
    responsive,
    subdomain,
    templates,
    translations
  }) {
    if (!enabled) return;

    this.locale = locale;

    let searchBoxSelector;

    addCSS(templates.instantsearch.css({color, highlightColor}));

    if (reuseAutocomplete) {
      addCSS('#algolia-query { display: none }');
      searchBoxSelector = autocompleteSelector;
    } else {
      this.$autocompleteInputs = document.querySelectorAll(autocompleteSelector);
      this._hideAutocomplete();
      searchBoxSelector = '#algolia-query';
    }

    this.$oldPagination = document.querySelector(paginationSelector);
    if (this.$oldPagination !== null) {
      this.$oldPagination.style.display = 'none';
    }

    this.$container = document.querySelector(selector);
    if (this.$container === null) {
      throw new Error(`[Algolia] Cannot find a container with the "${selector}" selector.`);
    }
    this.$container.innerHTML = templates.instantsearch.layout({translations});

    this._handleResponsiveness({responsive, templates});

    this.instantsearch.addWidget({
      getConfiguration: () => ({facets: ['locale.locale']}),
      init: ({helper}) => {
        // Filter by language
        const page = helper.getPage();
        helper.addFacetRefinement('locale.locale', this.locale);
        helper.setPage(page);
      }
    });

    if (poweredBy === true) {
      poweredBy = {
        template: templates.instantsearch.poweredBy({subdomain, translations})
      };
    }

    this.instantsearch.addWidget(
      instantsearch.widgets.searchBox({
        container: searchBoxSelector,
        placeholder: translations.placeholder,
        autofocus: true,
        poweredBy,
        cssClasses: {
          root: reuseAutocomplete ? '' : 'ais-with-style'
        }
      })
    );

    this.instantsearch.addWidget(
      instantsearch.widgets.stats({
        container: '#algolia-stats',
        templates: {
          body: ({nbHits, processingTimeMS}) => translations.stats(nbHits, processingTimeMS)
        },
        transformData: (data) => ({
          ...data,
          translations
        })
      })
    );

    this.instantsearch.addWidget(
      instantsearch.widgets.pagination({
        container: '#algolia-pagination',
        cssClasses: {
          root: 'pagination'
        }
      })
    );

    this.instantsearch.addWidget(
      instantsearch.widgets.hierarchicalMenu({
        container: '#algolia-categories',
        attributes: ['category.title', 'section.full_path'],
        separator: ' > ',
        templates: {
          header: translations.categories,
          item: templates.instantsearch.hierarchicalItem
        }
      })
    );

    this.instantsearch.addWidget(
      instantsearch.widgets.refinementList({
        container: '#algolia-labels',
        attributeName: 'label_names',
        operator: 'and',
        templates: {
          header: translations.tags
        },
        limit: tagsLimit
      })
    );

    this.instantsearch.addWidget(
      instantsearch.widgets.hits({
        container: '#algolia-hits',
        templates: {
          empty: templates.instantsearch.noResult,
          item: templates.instantsearch.hit
        },
        transformData: {
          empty: data => ({
            ...data,
            translations
          }),
          item: hit => ({
            ...hit,
            baseUrl
          })
        }
      })
    );

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
    let I18n = require('./I18n.js');
    let moment = require('moment');
    const timezoneOffset = moment().zone();
    moment().lang(this.locale, I18n.datetime_translations);
    let times = document.querySelectorAll('time');
    for (let i = 0; i < times.length; ++i) {
      let $time = times[i];
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
    this.$container.addEventListener('click', (e) => {
      for (let target = e.target; target && target !== this; target = target.parentNode) {
        if (target.classList === undefined) continue;
        if (target.classList.contains('ais-change-query')) {
          this.instantsearch.helper.setQuery('').search();
        }
      }
    }, false);
    this.$container.addEventListener('click', (e) => {
      for (let target = e.target; target && target !== this; target = target.parentNode) {
        if (target.classList === undefined) continue;
        if (target.classList.contains('ais-clear-filters')) {
          this.instantsearch.helper.clearRefinements().search();
        }
      }
    }, false);
  }

  _handleResponsiveness({templates, responsive}) {
    if (!responsive) return;
    const $mainStyle = addCSS(templates.instantsearch.responsiveCSS);

    // Responsive filters
    let $responsiveCSSFacets = null;
    document.getElementById('algolia-facets-open').addEventListener('click', function () {
      if ($responsiveCSSFacets === null) {
        $responsiveCSSFacets = addCSS(templates.instantsearch.responsiveCSSFacets, $mainStyle);
      }
    });
    document.getElementById('algolia-facets-close').addEventListener('click', function () {
      removeCSS($responsiveCSSFacets);
      $responsiveCSSFacets = null;
    });
  }

  _temporaryHiding({
    autocompleteSelector,
    instantsearchSelector,
    paginationSelector
  }) {
    this._temporaryHidingCSS = addCSS(`
      ${autocompleteSelector}, ${instantsearchSelector}, ${paginationSelector} {
        display: none !important;
        visibility: hidden !important;
      }
    `);
  }

  _temporaryHidingCancel() {
    removeCSS(this._temporaryHidingCSS);
    delete this._temporaryHidingCSS;
  }
}
export default (...args) => new InstantSearch(...args);
