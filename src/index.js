'use strict';

var $ = require('jquery');
if (!$) {
  throw new Error('Cannot find required dependency to jQuery.');
}

// hide the regular search results
function addcss(css) {
  var head = document.getElementsByTagName('head')[0];
  var s = document.createElement('style');
  s.setAttribute('type', 'text/css');
  if (s.styleSheet) {
    s.styleSheet.cssText = css;
  } else {
    s.appendChild(document.createTextNode(css));
  }
  head.appendChild(s);
}
addcss('.search-results h1:first-child {display: none !important;} .search-results-column {display: none !important;}');

var instantsearch = require('./instantsearch.js');
var autocomplete = require('./autocomplete.js');

function algoliasearchZendeskHC(options) {
  // check mandatory options
  if (!options.applicationId || !options.apiKey || typeof options.subdomain === 'undefined' || typeof options.indexPrefix === 'undefined') {
    throw new Error('usage: algoliasearchZendeskHC({applicationId, apiKey, subdomain, indexPrefix, [autcomplete, instantsearch]})');
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
  $(document).ready(function() {
    // autocompletion menu
    if (options.autocomplete.enabled) {
      autocomplete(options);
    }

    // instant search result page
    if (options.instantsearch.enabled) {
      instantsearch(options);
    }
  });
}

module.exports = algoliasearchZendeskHC;
