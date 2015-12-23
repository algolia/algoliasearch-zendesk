import $ from './jQuery.js';

import all from 'lodash/collection/all';
import map from 'lodash/collection/map';

import isString from 'lodash/lang/isString';
import isUndefined from 'lodash/lang/isUndefined';
import isPlainObject from 'lodash/lang/isPlainObject';

import loadTranslations from './translations.js';
import autocomplete from './autocomplete.js';
import instantsearch from './instantsearch.js';

const usage = `Usage:
algoliasearchZendeskHC({
  applicationId,
  apiKey,
  subdomain,
  indexPrefix,
  [ autocomplete ],
  [ instantsearch ]
})
`;
class AlgoliasearchZendeskHC {
  constructor(options) {
    this._checkOptions(options);

    options.autocomplete = options.autocomplete || {};
    if (isUndefined(options.autocomplete.enabled)) {
      options.autocomplete.enabled = true;
    }
    options.instantsearch = options.instantsearch || {};
    if (isUndefined(options.instantsearch.enabled)) {
      options.instantsearch.enabled = true;
    }

    if (isUndefined(options.instantsearch.tagsLimit)) {
      options.instantsearch.tagsLimit = 15;
    }

    if (isUndefined(options.baseUrl)) {
      options.baseUrl = '/hc/';
    }

    if (!isPlainObject(options.translations)) {
      options.translations = {};
    }

    options.colors = options.colors || {};
    options.colors.primary = options.colors.primary || '#D4D4D4';
    options.colors.secondary = options.colors.secondary || '#D4D4D4';

    if (isUndefined(options.poweredBy)) {
      options.poweredBy = true;
    }

    // once the DOM is initialized
    $(document).ready(() => {
      loadTranslations(options);

      // autocompletion menu
      if (options.autocomplete.enabled) {
        this.autocomplete = autocomplete(options);
      }

      // instant search result page
      if (options.instantsearch.enabled) {
        this.autocomplete = instantsearch(options);
      }
    });
  }

  _checkOptions(options) {
    const stringOptions = ['applicationId', 'apiKey', 'subdomain', 'indexPrefix'];
    const valid = all(stringOptions, (k) => isString(options[k]));

    if (!valid) throw new Error(usage);
  }
}

export default AlgoliasearchZendeskHC;
