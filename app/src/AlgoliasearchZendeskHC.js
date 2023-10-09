import fargs from 'fargs';

import autocomplete from './autocomplete';
import { initInsights, extendWithConversionTracking } from './clickAnalytics';
import compile from './compile';
import getCurrentLocale from './getCurrentLocale';
import instantsearch from './instantsearch';
import loadTemplates from './templates';
import loadTranslations from './translations';

function hitsPerPageValidator(val) {
  return (val >= 1 && val <= 20) || 'should be between 1 and 20';
}
function instantsearchPage() {
  return window.location.pathname.match(/\/search$/) !== null;
}
const optionsStructure = {
  required: true,
  type: 'Object',
  children: {
    analytics: { type: 'boolean', value: true },
    applicationId: { type: 'string', required: true },
    apiKey: { type: 'string', required: true },
    autocomplete: {
      type: 'Object',
      value: {},
      children: {
        enabled: { type: 'boolean', value: true },
        inputSelector: { type: 'string', value: '#query' },
        hitsPerPage: {
          type: 'number',
          value: 5,
          validators: [hitsPerPageValidator],
        },
      },
    },
    baseUrl: { type: 'string', value: '/hc/' },
    color: { type: 'string', value: '#158EC2' },
    clickAnalytics: { type: 'boolean', value: false },
    debug: { type: 'boolean', value: false },
    locale: { type: 'string' },
    highlightColor: { type: 'string' },
    indexPrefix: { type: 'string', value: 'zendesk_' },
    instantsearch: {
      type: 'Object',
      value: {},
      children: {
        enabled: { type: 'boolean', value: true },
        hitsPerPage: { type: 'number', value: 20 },
        paginationSelector: { type: 'string', value: '.pagination' },
        reuseAutocomplete: { type: 'boolean', value: false },
        hideAutocomplete: { type: 'boolean', value: true },
        selector: { type: 'string', value: '.search-results' },
        tagsLimit: { type: 'number', value: 15 },
        useEditedAt: { type: 'boolean', value: false },
      },
    },
    instantsearchPage: { type: 'function', value: instantsearchPage },
    poweredBy: { type: 'boolean', value: true },
    responsive: { type: 'boolean', value: true },
    subdomain: { type: 'string', required: true },
    indexName: { type: 'string', value: '' },
    templates: {
      type: 'Object',
      value: {},
      children: {
        autocomplete: { type: 'Object', value: {} },
        instantsearch: { type: 'Object', value: {} },
      },
    },
    translations: { type: 'Object', value: {} },
  },
};

class AlgoliasearchZendeskHC {
  constructor() {
    const options = fargs()
      .check('algoliasearchZendeskHC')
      .arg('options', optionsStructure)
      // eslint-disable-next-line prefer-rest-params
      .values(arguments)[0];

    options.highlightColor = options.highlightColor || options.color;

    this.search = (
      options.instantsearch.enabled && options.instantsearchPage()
        ? instantsearch
        : autocomplete
    )(options);

    AlgoliasearchZendeskHC.instances.push(this.search);

    if (options.clickAnalytics) {
      initInsights(options);
      extendWithConversionTracking(this.search, options);
    }

    // once the DOM is initialized
    if (
      document.readyState === 'complete' ||
      document.readyState === 'interactive'
    ) {
      this.render(options);
    } else {
      document.addEventListener(
        'DOMContentLoaded',
        this.render.bind(this, options)
      );
    }
  }

  enableDebugMode() {
    if (!this.search.enableDebugMode) return;
    this.search.enableDebugMode();
  }

  render(options) {
    options.locale = options.locale || getCurrentLocale();
    loadTranslations(options);
    loadTemplates(options);
    this.search.render(options);
  }
}

AlgoliasearchZendeskHC.instances = [];
AlgoliasearchZendeskHC.compile = compile;
AlgoliasearchZendeskHC.trackConversion = (articleID) => {
  const instances = AlgoliasearchZendeskHC.instances;
  if (instances.length === 0) {
    throw new Error(
      'AlgoliasearchZendeskHCError: Trying to track conversion without an instance loaded'
    );
  }
  if (instances.length > 1) {
    throw new Error(
      'AlgoliasearchZendeskHCError: Trying to track conversion with multiple instances loaded - Use the instance method directly'
    );
  }

  if (articleID === undefined) {
    if (window.location.pathname.indexOf('/articles/') === -1) {
      throw new Error(
        'AlgoliasearchZendeskHCError: Calling trackConversion without an articleID on a non-article page'
      );
    }
    try {
      articleID = window.location.pathname.split('/')[4].split('-')[0];
    } catch (err) {
      throw new Error(
        'AlgoliasearchZendeskHCError: Failed to extract the article articleID from the URL'
      );
    }
  }

  instances[0].trackConversion(articleID);
};

export default AlgoliasearchZendeskHC;
