/* global I18n */

import $ from './jQuery.js';
import 'autocomplete.js/index_jquery.js';

import algoliasearch from 'algoliasearch';
import 'es6-collections';

import templates from './templates.js';
import addCSS from './addCSS.js';

export default ({
  applicationId,
  apiKey,
  autocomplete: {
    enabled,
    inputSelector,
    hitsPerPage
  },
  baseUrl,
  colors,
  indexPrefix,
  poweredBy,
  subdomain,
  translations
}) => {
  if (!enabled) return null;

  // initialize API client
  let client = algoliasearch(applicationId, apiKey);
  let articles = client.initIndex(`${indexPrefix}${subdomain}_articles`);

  addCSS(templates.autocomplete.css.render({colors}));

  let sources = [];
  if (enabled) {
    sources.push({
      source: (query, callback) => {
        articles.search({
          query,
          hitsPerPage,
          facetFilters: `["locale.locale:${I18n.locale}"]`,
          highlightPreTag: '<span class="aa-article-hit--highlight">',
          highlightPostTag: '</span>',
          snippetEllipsisText: '...'
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
        suggestion: (hit) => templates.autocomplete.article.render(hit)
      }
    });
  }

  let autocompleteTemplates = {};
  if (poweredBy === true) {
    autocompleteTemplates.footer = templates.autocomplete.footer.render({colors, translations});
  }

  // autocomplete.js initialization
  return $(inputSelector)
    .attr('placeholder', translations.placeholder_autocomplete)
    .autocomplete({
      hint: false,
      debug: process.env.NODE_ENV === 'development',
      templates: autocompleteTemplates
    }, sources)
    .on('autocomplete:selected', (event, suggestion, dataset) => {
      location.href = `${baseUrl}${I18n.locale}/${dataset}/${suggestion.id}`;
    });
};
