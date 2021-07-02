import fargs from 'fargs';

import autocomplete, { Autocomplete } from './autocomplete';
import ticketForm, { TicketForm } from './ticketForm';
import defaultTemplates from './templates';
import { FindAnswersOptions } from '@algolia/client-search';
import { Translations } from './translations';

function hitsPerPageValidator(val: number): boolean | string {
  return (val >= 1 && val <= 20) || 'should be between 1 and 20';
}

function getCurrentLocale(): string {
  const splittedPathname = window.location.pathname.split('/');
  const res = splittedPathname[2];
  if (!res) {
    console.error('[Algolia] Could not retrieve current locale from URL'); // eslint-disable-line no-console
    return 'en-us';
  }
  return res;
}

export interface Options {
  analytics?: boolean;
  applicationId: string;
  apiKey: string;
  autocomplete?: {
    enabled?: boolean;
    keyboardShortcut?: boolean;
    bestArticle?: boolean;
    inputSelector?: string;
    hitsPerPage?: number;
  };
  baseUrl?: string;
  color?: string;
  clickAnalytics?: boolean;
  debug?: boolean;
  locale?: string;
  highlightColor?: string;
  indexPrefix?: string;
  poweredBy?: boolean;
  subdomain: string;
  templates?: {
    autocomplete?: typeof defaultTemplates['autocomplete'];
  };
  translations?: Translations;
  ticketForms?: {
    enabled?: boolean;
    inputSelector?: string;
    suggestionsListSelector?: string;
    requireSubject?: boolean;
    descriptionSelector?: string;
    fallbackDescriptionSelector?: string;
    cssClasses?: {
      descriptionGroup?: string;
      disabledDescriptionGroup?: string;
      descriptionWarning?: string;
      suggestionsList?: string;
    };
    answersParameters?: FindAnswersOptions;
  };
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
        fallbackDescriptionSelector: {
          type: 'string',
          value: '#request_description',
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
  search: Autocomplete;
  form: TicketForm;

  constructor(params: Options) {
    const options: Options = fargs()
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

  init(options: Options) {
    this.search.init(options);

    // Need to wait for full load because TinyMCE is used for the description field on the request page and needs to be loaded to lock the descriprion field
    window.addEventListener('load', () => {
      this.form.init(options);
    });
  }
}

export default AlgoliasearchZendeskHC;
