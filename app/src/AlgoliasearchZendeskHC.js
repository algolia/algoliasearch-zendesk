import fargs from 'fargs';

import autocomplete from './autocomplete';
import defaultTemplates from './templates';

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
        keyboardShortcut: { type: 'boolean', value: true },
        bestArticle: { type: 'boolean', value: true },
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
    clickAnalytics: { type: 'boolean', value: true },
    debug: { type: 'boolean', value: false },
    locale: { type: 'string' },
    highlightColor: { type: 'string' },
    indexPrefix: { type: 'string', value: 'zendesk_' },
    poweredBy: { type: 'boolean', value: true },
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
    options.locale = options.locale || getCurrentLocale();
    options.templates = {
      autocomplete: {
        ...defaultTemplates.autocomplete,
        ...options.templates.autocomplete,
      },
    };

    this.search = autocomplete(options);

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
    this.search.init(options);
  }
}

export default AlgoliasearchZendeskHC;
