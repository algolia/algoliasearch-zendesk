import $ from 'jquery';
import autocomplete from './autocomplete.js';
import instantsearch from './instantsearch.js';

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
  display: none !important;
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
  if (typeof options.autocomplete.enabled === 'undefined') {
    options.autocomplete.enabled = true;
  }
  options.instantsearch = options.instantsearch || {};
  if (typeof options.instantsearch.enabled === 'undefined') {
    options.instantsearch.enabled = true;
  }

  if (typeof options.baseUrl === 'undefined') {
    options.baseUrl = '/hc/';
  }

  options.colors = options.colors || {};
  options.colors.primary = options.colors.primary || '#D4D4D4';
  options.colors.secondary = options.colors.secondary || '#D4D4D4';

  // once the DOM is initialized
  $(document).ready(() => {
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
