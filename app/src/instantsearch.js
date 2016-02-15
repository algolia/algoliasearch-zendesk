/* global I18n, moment */

import $ from 'jquery';
import instantsearch from 'instantsearch.js';
import templates from './templates.js';

export default (options) => {
  if (!options.instantsearch.enabled) return;

  let $container = $(options.instantsearch.selector);
  $container.html(`
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
    </div>`);

  function displayTimes() {
    // Extracted from formatDateTime.js
    // Maybe we could call it directly, but I don't know
    // backbone.js at all
    const timezoneOffset = moment().zone();
    moment().lang(I18n.locale, I18n.datetime_translations);
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

  let $autocompleteInput = $(options.autocomplete.inputSelector);
  const query = $autocompleteInput.val();

  // Hide autocomplete block
  let $elt = $autocompleteInput.closest('form');
  let $tmp = $elt.parent();
  while ($tmp.children.length === 1) {
    $elt = $tmp;
    $tmp = $elt.parent();
  }
  $elt.hide();

  let $paginationContainer = $(options.instantsearch.paginationSelector);
  $paginationContainer.hide();

  let search = instantsearch({
    appId: options.applicationId,
    apiKey: options.apiKey,
    indexName: options.indexPrefix + options.subdomain + '_articles',
    urlSync: {},
    searchParameters: {
      attributesToSnippet: ['body_safe:60'],
      query,
      snippetEllipsisText: '...'
    }
  });

  search.addWidget({
    getConfiguration: () => ({facets: ['locale.locale']}),
    init: ({helper}) => {
      // Filter by language
      helper.toggleRefine('locale.locale', I18n.locale);
    }
  });

  search.addWidget(
    instantsearch.widgets.searchBox({
      container: '#algolia-query',
      placeholder: options.translations.placeholder_instantsearch,
      autofocus: true,
      poweredBy: options.poweredBy
    })
  );

  search.addWidget(
    instantsearch.widgets.stats({
      container: '#algolia-stats',
      templates: {
        body: `
          {{#hasNoResults}}${options.translations.no_result}{{/hasNoResults}}
          {{#hasOneResult}}1 ${options.translations.result.toLowerCase()}{{/hasOneResult}}
          {{#hasManyResults}}
            {{#helpers.formatNumber}}{{nbHits}}{{/helpers.formatNumber}}
            ${options.translations.results.toLowerCase()}
          {{/hasManyResults}}
          <span class="{{cssClasses.time}}">${options.translations.found_in.toLowerCase()} {{processingTimeMS}}ms</span>`
      }
    })
  );

  search.addWidget(
    instantsearch.widgets.pagination({
      container: '#algolia-pagination',
      cssClasses: {
        root: 'pagination'
      }
    })
  );

  search.addWidget(
    instantsearch.widgets.hierarchicalMenu({
      container: '#algolia-categories',
      attributes: ['category.title', 'section.full_path'],
      separator: ' > ',
      templates: {
        header: options.translations.categories
      }
    })
  );

  search.addWidget(
    instantsearch.widgets.refinementList({
      container: '#algolia-labels',
      attributeName: 'label_names',
      operator: 'and',
      templates: {
        header: options.translations.tags
      },
      limit: options.instantsearch.tagsLimit
    })
  );

  search.addWidget(
    instantsearch.widgets.hits({
      container: '#algolia-hits',
      templates: {
        empty: templates.instantsearch.noResults,
        item: (hit) => {
          return templates.instantsearch.hit.render(hit);
        }
      },
      transformData: (hit) => {
        hit.colors = options.colors;
        hit.baseUrl = options.baseUrl;
        return hit;
      }
    })
  );

  search.on('render', () => {
    displayTimes();
  });

  search.start();
  $('.search-results-column').css('display', 'block').css('visibility', 'visible');
};
