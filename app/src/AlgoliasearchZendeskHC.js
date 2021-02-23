import fargs from 'fargs';

import autocomplete from './autocomplete';
import defaultTemplates from './templates';
import { initInsights, extendWithConversionTracking } from './clickAnalytics';

function hitsPerPageValidator(val) {
  return (val >= 1 && val <= 20) || 'should be between 1 and 20';
}

function getCurrentLocale() {
  const splittedPathname = window.location.pathname.split('/');
  const res = splittedPathname[2];
  if (!res) {
    console.error('[Algolia] Could not retrieve current locale from URL'); // eslint-disable-line no-console
    return 'en-us';
  }
  return res;
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
      },
    },
    poweredBy: { type: 'boolean', value: true },
    responsive: { type: 'boolean', value: true },
    subdomain: { type: 'string', required: true },
    templates: {
      type: 'Object',
      value: {},
      children: {
        autocomplete: { type: 'Object', value: {} },
      },
    },
    translations: { type: 'Object', value: {} },
  },
};

class AlgoliasearchZendeskHC {
  constructor(params) {
    const options = fargs()
      .check('algoliasearchZendeskHC')
      .arg('options', optionsStructure)
      .values([params])[0];

    options.highlightColor = options.highlightColor || options.color;

    options.templates = {
      autocomplete: {
        ...defaultTemplates.autocomplete,
        ...options.templates.autocomplete,
      },
    };

    this.search = autocomplete(options);

    if (options.clickAnalytics) {
      initInsights(options);
      extendWithConversionTracking(this.search, options);
    }

    // once the DOM is initialized
    if (
      document.readyState === 'complete' ||
      document.readyState === 'interactive'
    ) {
      this.init(options);
    } else {
      document.addEventListener(
        'DOMContentLoaded',
        this.init.bind(this, options)
      );
    }
  }

  init(options) {
    options.locale = options.locale || getCurrentLocale();
    this.search.init(options);
  }
}

AlgoliasearchZendeskHC.trackConversion = (articleID) => {
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

  this.search.trackConversion(articleID);
};

export default AlgoliasearchZendeskHC;
