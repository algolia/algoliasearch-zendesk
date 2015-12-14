import $ from 'jquery';
import loadTranslations from './translations.js';
import autocomplete from './autocomplete.js';
import instantsearch from './instantsearch.js';

import isUndefined from 'lodash/lang/isUndefined';
import isPlainObject from 'lodash/lang/isPlainObject';

if (!$) {
  throw new Error('Cannot find required dependency to jQuery.');
}

// hide the regular search results
function addCss(css) {
  const head = document.getElementsByTagName('head')[0];
  let styleTag = document.createElement('style');
  styleTag.setAttribute('type', 'text/css');
  if (styleTag.styleSheet) {
    styleTag.styleSheet.cssText = css;
  } else {
    styleTag.appendChild(document.createTextNode(css));
  }
  head.appendChild(styleTag);
}

const hidingCss = `
.search-results h1:first-child {
    display: none !important;
}
.search-results-column {
  display: none;
  visibility: hidden;
}`;
addCss(hidingCss);

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
export default (options) => {
  // check mandatory options
  if (
    !options.applicationId ||
    !options.apiKey ||
    options.subdomain === undefined ||
    options.indexPrefix === undefined
  ) {
    throw new Error(usage);
  }

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

  // once the DOM is initialized
  $(document).ready(() => {
    loadTranslations(options);

    // autocompletion menu
    if (options.autocomplete.enabled) {
      autocomplete(options);
    }

    // instant search result page
    if (options.instantsearch.enabled) {
      instantsearch(options);
    }
  });
};
