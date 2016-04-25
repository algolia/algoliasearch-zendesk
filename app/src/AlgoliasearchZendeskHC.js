import fargs from 'fargs';

import autocomplete from './autocomplete.js';
import loadTranslations from './translations.js';
import instantsearch from './instantsearch.js';

function hitsPerPageValidator(val) {
  return (val >= 1 && val <= 20) || 'should be between 1 and 20';
}
function instantsearchPage() {
  return window.location.pathname.match(/\/search$/) !== null;
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
  color: {type: 'string', value: '#158EC2'},
  highlightColor: {type: 'string'},
  indexPrefix: {type: 'string', value: 'zendesk_'},
  instantsearch: {type: 'Object', value: {}, children: {
    enabled: {type: 'boolean', value: true},
    paginationSelector: {type: 'string', value: '.pagination'},
    reuseAutocomplete: {type: 'boolean', value: false},
    selector: {type: 'string', value: '.search-results'},
    tagsLimit: {type: 'number', value: 15}
  }},
  instantsearchPage: {type: 'function', value: instantsearchPage},
  poweredBy: {type: 'boolean', value: true},
  subdomain: {type: 'string', required: true},
  translations: {type: 'Object', value: {}}
}};

class AlgoliasearchZendeskHC {
  constructor() {
    let options = fargs().check('algoliasearchZendeskHC')
      .arg('options', optionsStructure)
      .values(arguments)[0];

    options.highlightColor = options.highlightColor || options.color;

    this.search = (options.instantsearchPage()
      ? instantsearch
      : autocomplete
    )(options);

    // once the DOM is initialized
    document.addEventListener('DOMContentLoaded', () => {
      loadTranslations(options);
      this.search.render(options);
    });
  }
}

export default AlgoliasearchZendeskHC;
