import fargs from 'fargs';

import autocomplete from './autocomplete.js';
import compile from './compile.js';
import loadTranslations from './translations.js';
import loadTemplates from './templates.js';
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
  debug: {type: 'boolean', value: false},
  locale: {type: 'string'},
  highlightColor: {type: 'string'},
  indexPrefix: {type: 'string', value: 'zendesk_'},
  instantsearch: {type: 'Object', value: {}, children: {
    enabled: {type: 'boolean', value: true},
    paginationSelector: {type: 'string', value: '.pagination'},
    reuseAutocomplete: {type: 'boolean', value: false},
    hideAutocomplete: {type: 'boolean', value: true},
    selector: {type: 'string', value: '.search-results'},
    tagsLimit: {type: 'number', value: 15}
  }},
  instantsearchPage: {type: 'function', value: instantsearchPage},
  poweredBy: {type: 'boolean', value: true},
  responsive: {type: 'boolean', value: true},
  subdomain: {type: 'string', required: true},
  templates: {type: 'Object', value: {}, children: {
    autocomplete: {type: 'Object', value: {}},
    instantsearch: {type: 'Object', value: {}}
  }},
  translations: {type: 'Object', value: {}}
}};

class AlgoliasearchZendeskHC {
  constructor() {
    let options = fargs().check('algoliasearchZendeskHC')
      .arg('options', optionsStructure)
      .values(arguments)[0];

    options.highlightColor = options.highlightColor || options.color;

    this.search = (options.instantsearch.enabled && options.instantsearchPage()
      ? instantsearch
      : autocomplete
    )(options);

    AlgoliasearchZendeskHC.instances.push(this.search);

    // once the DOM is initialized
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      this.render(options);
    } else {
      document.addEventListener('DOMContentLoaded', this.render.bind(this, options));
    }
  }

  enableDebugMode() {
    if (!this.search.enableDebugMode) return;
    this.search.enableDebugMode();
  }

  render(options) {
    options.locale = options.locale || require('./I18n.js').locale;
    loadTranslations(options);
    loadTemplates(options);
    this.search.render(options);
  }
}

AlgoliasearchZendeskHC.instances = [];
AlgoliasearchZendeskHC.compile = compile;

export default AlgoliasearchZendeskHC;
