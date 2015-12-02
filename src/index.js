'use strict';

var $ = require('jquery');
if (!$) {
  throw new Error('Cannot find required dependency to jQuery.');
}

var algoliasearch = require('algoliasearch');
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

  // initialize API client
  var client = algoliasearch(options.applicationId, options.apiKey);

  // initialize indices
  var indexPrefix = options.indexPrefix || '';
  var articles = client.initIndex(indexPrefix + options.subdomain + '_articles');
  var sections = client.initIndex(indexPrefix + options.subdomain + '_sections');

  // once the DOM is initialized
  $(document).ready(function() {
    console.log('init');

    // autocompletion menu
    if (options.autocomplete.enabled) {
      autocomplete(articles, sections, options);
    }

    // instant search result page
    if (options.instantsearch.enabled) {
      instantsearch(articles, sections, options);
    }
  });
}

module.exports = algoliasearchZendeskHC;
