import instantsearch from 'instantsearch.js';
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
    let I18n = require('I18n');

    this.$autocompleteInputs = document.querySelectorAll(autocompleteSelector);
    this._hideAutocomplete();

    this.$oldPagination = document.querySelector(paginationSelector);
    this.$oldPagination.style.display = 'none';

    this.$container = document.querySelector(selector);
    this.$container.innerHTML = templates.instantsearch.layout;

    this.instantsearch.addWidget({
      getConfiguration: () => ({facets: ['locale.locale']}),
      init: ({helper}) => {
        // Filter by language
        helper.toggleRefine('locale.locale', I18n.locale);
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
    let I18n = require('./I18n.js');
    let moment = require('moment');
    const timezoneOffset = moment().zone();
    moment().lang(I18n.locale, I18n.datetime_translations);
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
    this.$autocompleteInputs.forEach(($input) => {
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
      console.log('Form ', $elt);
      // Get the closest parent to have more than one child
      while ($elt !== null && $parent.children.length === 1) {
        $elt = $parent;
        $parent = $elt.parentNode;
      }
      $elt.style.display = 'none';
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
