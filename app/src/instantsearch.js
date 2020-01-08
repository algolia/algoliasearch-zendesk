import $ from 'jquery';
import instantsearch from 'instantsearch.js';

import getCurrentLocale from './getCurrentLocale.js';
import templates from './templates.js';

import addCSS from './addCSS.js';
import removeCSS from './removeCSS.js';

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
      selector,
    },
    subdomain
  }){
    if (!enabled) return;

    this._temporaryHiding({
      autocompleteSelector,
      instantsearchSelector: selector,
      paginationSelector
    });

    this.instantsearch = instantsearch({
      appId: applicationId,
      apiKey: apiKey,
      indexName: `${indexPrefix}${subdomain}_articles`,
      urlSync: {
        mapping: {
          q: 'query'
        }
      },
      searchParameters: {
        attributesToSnippet: ['body_safe:60'],
        snippetEllipsisText: '...'
      }
    });
  }

  render({
    autocomplete: {
      inputSelector: autocompleteSelector
    },
    baseUrl,
    colors,
    instantsearch: {
      enabled,
      selector,
      paginationSelector,
      tagsLimit
    },
    poweredBy,
    translations
  }) {
    if (!enabled) return;
    this.$autocompleteInput = $(autocompleteSelector);
    this._hideAutocomplete();

    this.$oldPagination = $(paginationSelector);
    this.$oldPagination.hide();

    this.$container = $(selector);
    this.$container.html(templates.instantsearch.layout);

    this.instantsearch.addWidget({
      getConfiguration: () => ({facets: ['locale.locale']}),
      init: ({helper}) => {
        // Filter by language
        helper.toggleRefine('locale.locale', getCurrentLocale());
      }
    });

    this.instantsearch.addWidget(
      instantsearch.widgets.searchBox({
        container: '#algolia-query',
        placeholder: translations.placeholder_instantsearch,
        autofocus: true,
        poweredBy: poweredBy
      })
    );

    this.instantsearch.addWidget(
      instantsearch.widgets.stats({
        container: '#algolia-stats',
        templates: {
          body: templates.instantsearch.stats
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
          header: translations.categories
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
          empty: templates.instantsearch.noResults,
          item: templates.instantsearch.hit
        },
        transformData: (hit) => ({
          ...hit,
          baseUrl,
          colors
        })
      })
    );

    this.instantsearch.on('render', () => {
      this._displayTimes();
    });

    this.instantsearch.start();
    this._temporaryHidingCancel();
  }

  // Protected

  _displayTimes() {
    const timezoneOffset = moment().zone();
    require('moment')().lang(getCurrentLocale());
    $('time').each(() => {
      let $this = $(this);
      const datetime = $this.attr('datetime');
      const formattedDatetime = moment(datetime).utc().zone(timezoneOffset);
      const isoTitle = formattedDatetime.format('YYYY-MM-DD HH:mm');

      $this.attr('title', isoTitle);

      // Render time[data-datetime='relative'] as 'time ago'
      if ($this.data('datetime') === 'relative') {
        $this.text(formattedDatetime.fromNow());
      } else if ($this.data('datetime') === 'calendar') {
        $this.text(formattedDatetime.calendar());
      }
    });
  }

  _hideAutocomplete() {
    let $elt = this.$autocompleteInput.closest('form');
    let $tmp = $elt.parent();
    while ($tmp.children.length === 1) {
      $elt = $tmp;
      $tmp = $elt.parent();
    }
    $elt.hide();
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
