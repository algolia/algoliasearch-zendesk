import $ from './jQuery.js';

import defaultsDeep from 'lodash/defaultsDeep';
import every from 'lodash/every';
import isString from 'lodash/isString';

import loadTranslations from './translations.js';
import autocomplete from './autocomplete.js';
import instantsearch from './instantsearch.js';

const usage = `Usage:
algoliasearchZendeskHC({
  applicationId,
  apiKey,
  subdomain,
  [ indexPrefix ],
  [ autocomplete ],
  [ instantsearch ]
})
`;

const defaultOptions = {
  autocomplete: {
    enabled: true,
    inputSelector: '#query',
    hitsPerPage: 5
  },
  baseUrl: '/hc/',
  colors: {
    primary: '#D4D4D4',
    secondary: '#D4D4D4'
  },
  indexPrefix: 'zendesk_',
  instantsearch: {
    enabled: true,
    tagsLimit: 15
  },
  poweredBy: true,
  translations: {}
};
class AlgoliasearchZendeskHC {
  constructor(options = {}) {
    this._checkOptions(options);
    options = defaultsDeep({}, options, defaultOptions);

    // once the DOM is initialized
    $(document).ready(() => {
      loadTranslations(options);

      // autocompletion menu
      this.autocomplete = autocomplete(options);

      // instant search result page
      if (options.instantsearch.enabled) {
        this.autocomplete = instantsearch(options);
      }
    });
  }

  _checkOptions({applicationId, apiKey, subdomain}) {
    const valuesToCheck = [applicationId, apiKey, subdomain];
    const valid = every(valuesToCheck, (v) => isString(v));
    if (!valid) throw new Error(usage);
  }
}

export default AlgoliasearchZendeskHC;
