import $ from './jQuery.js';

import fargs from 'fargs';

import defaultsDeep from 'lodash/defaultsDeep';
import every from 'lodash/every';
import isString from 'lodash/isString';

import loadTranslations from './translations.js';
import autocomplete from './autocomplete.js';
import instantsearch from './instantsearch.js';

function hitsPerPageValidator(val) {
  return (val >= 1 && val <= 20) || 'should be between 1 and 20';
};
const optionsStructure = {required: true, type: 'Object', children: {
  applicationId: {type: 'string', required: true},
  apiKey: {type: 'string', required: true},
  autocomplete: {type: 'Object', value: {}, children: {
    enabled: {type: 'boolean', value: true},
    inputSelector: {type: 'string', value: '#query'},
    hitsPerPage: {type: 'number', value: 5, validators: [hitsPerPageValidator]}
  }},
  baseUrl: {type: 'string', value: '/hc/'},
  colors: {type: 'Object', value: {}, children: {
    primary: {type: 'string', value: '#D4D4D4'},
    secondary: {type: 'string', value: '#D4D4D4'}
  }},
  indexPrefix: {type: 'string', value: 'zendesk_'},
  instantsearch: {type: 'Object', value: {}, children: {
    enabled: {type: 'boolean', value: true},
    tagsLimit: {type: 'number', value: 15}
  }},
  poweredBy: {type: 'boolean', value: true},
  subdomain: {type: 'string', required: true},
  translations: {type: 'Object', value: {}}
}};

class AlgoliasearchZendeskHC {
  constructor() {
    let options = fargs().check('algoliasearchZendeskHC')
      .arg('options', optionsStructure)
      .values(arguments)[0];

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
}

export default AlgoliasearchZendeskHC;
