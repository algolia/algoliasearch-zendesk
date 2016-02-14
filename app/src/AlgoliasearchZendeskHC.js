import $ from './jQuery.js';

import fargs from 'fargs';

import addCSS from './addCSS.js';
import autocomplete from './autocomplete.js';
import loadTranslations from './translations.js';
import instantsearch from './instantsearch.js';
import removeCSS from './removeCSS.js';

function hitsPerPageValidator(val) {
  return (val >= 1 && val <= 20) || 'should be between 1 and 20';
}
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
    selector: {type: 'string', value: '.search-results'},
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

    const genericHiding = addCSS(`
      ${options.autocomplete.inputSelector} { display: none; }
      ${options.instantsearch.selector} { display: none; }
    `);

    // once the DOM is initialized
    $(document).ready(() => {
      loadTranslations(options);

      const instantsearchPage = $(options.instantsearch.selector).length !== 0;

      if (instantsearchPage) {
        // instant search result page
        this.instantsearch = instantsearch(options);
      } else {
        // autocompletion menu
        this.autocomplete = autocomplete(options);
      }

      removeCSS(genericHiding);
    });
  }
}

export default AlgoliasearchZendeskHC;
