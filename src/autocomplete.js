/* global I18n */

import $ from './jQuery.js';
import 'autocomplete.js/index_jquery.js';

import algoliasearch from 'algoliasearch';
import 'es6-collections';

import templates from './templates.js';
import addCSS from './addCSS.js';

export default (options) => {
  const {
    enabled = true,
    inputSelector = '#query',
    hitsPerPage = 5
  } = options.autocomplete;

  // initialize API client
  let client = algoliasearch(options.applicationId, options.apiKey);
  let articles = client.initIndex(`${options.indexPrefix}${options.subdomain}_articles`);

  addCSS(templates.autocomplete.css.render({colors: options.colors}));

  let sources = [];
  if (enabled) {
    sources.push({
      source: (query, callback) => {
        articles.search({
          query: query,
          hitsPerPage: hitsPerPage,
          facetFilters: `["locale.locale:${I18n.locale}"]`,
          highlightPreTag: '<span class="aa-article-hit--highlight">',
          highlightPostTag: '</span>'
        }).then((content) => {
          let hits = content.hits;

          let groupedHits = new Map();
          hits.map((hit) => {
            const category = hit.category.title;
            const section = hit.section.title;

            if (!groupedHits.has(category)) {
              hit.isCategoryHeader = true;
              groupedHits.set(category, new Map());
            }
            if (!groupedHits.get(category).has(section)) {
              hit.isSectionHeader = true;
              groupedHits.get(category).set(section, []);
            }
            groupedHits.get(category).get(section).push(hit);
          });

          let flattenedHits = [];
          groupedHits.forEach((sectionsValues) => {
            sectionsValues.forEach((sectionHits) => {
              sectionHits.forEach((sectionHit) => {
                flattenedHits.push(sectionHit);
              });
            });
          });

          callback(flattenedHits);
        });
      },
      name: 'articles',
      templates: {
        suggestion: (hit) => {
          hit.colors = options.colors;
          return templates.autocomplete.article.render(hit);
        }
      }
    });
  }

  let autocompleteTemplates = {};
  if (options.poweredBy === true) {
    autocompleteTemplates.footer = templates.autocomplete.footer.render(options);
  }

  // autocomplete.js initialization
  $(inputSelector)
    .attr('placeholder', options.translations.placeholder_autocomplete)
    .autocomplete({
      hint: false,
      debug: process.env.NODE_ENV === 'development',
      templates: autocompleteTemplates
    }, sources)
    .on('autocomplete:selected', (event, suggestion, dataset) => {
      if (dataset === 'articles') {
        location.href = `${options.baseUrl}${I18n.locale}/${dataset}/${suggestion.id}`;
      } else if (dataset === 'other') {
        location.href = `${options.baseUrl}${I18n.locale}/search?query=${suggestion.query}`;
      }
    });
};
