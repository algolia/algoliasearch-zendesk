import fargs from 'fargs';

import autocomplete from './autocomplete';
import ticketForm from './ticketForm';
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
        keyboardShortcut: { type: 'boolean', value: false },
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
    ticketForms: {
      type: 'Object',
      value: {},
      children: {
        enabled: { type: 'boolean', value: false },
        inputSelector: { type: 'string', value: 'input#request_subject' },
        suggestionsListSelector: {
          type: 'string',
          value: '[data-hc-class="searchbox"]',
        },
        requireSubject: { type: 'boolean', value: true },
        descriptionSelector: {
          type: 'string',
          value: '#hc-wysiwyg [role="group"]',
        },
        cssClasses: {
          type: 'Object',
          value: {},
          children: {
            descriptionGroup: { type: 'string', value: 'tf-description-group' },
            disabledDescriptionGroup: {
              type: 'string',
              value: 'tf-description-group--disabled',
            },
            descriptionWarning: {
              type: 'string',
              value: 'tf-description-warning',
            },
            suggestionsList: {
              type: 'string',
              value: 'tf-suggestions-list',
            },
          },
        },
        answersParameters: { type: 'Object', value: {} }, // optional, params passed to Answers
      },
    },
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
    this.form = ticketForm(options);

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

    // Need to wait for full load because TinyMCE is used for the description field on the request page and needs to be loaded to lock the descriprion field
    window.addEventListener('load', () => {
      this.form.init(options);
    });
  }
}

export default AlgoliasearchZendeskHC;
