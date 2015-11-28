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
  if (!options.application_id || !options.api_key || !options.subdomain) {
    throw new Error('usage: algoliasearchZendeskHC({application_id, api_key, subdomain, indexPrefix})');
  }

  // initialize API client
  var client = algoliasearch(options.application_id, options.api_key);

  // initialize indices
  var indexPrefix = options.indexPrefix || '';
  var articles = client.initIndex(indexPrefix + options.subdomain + '_articles');
  var sections = client.initIndex(indexPrefix + options.subdomain + '_public');

  // once the DOM is initialized
  $(document).ready(function() {
    // autocompletion menu
    autocomplete(articles, sections, options);

    // instant search result page
    instantsearch(articles, sections, options);
  });
}

module.exports = algoliasearchZendeskHC;
