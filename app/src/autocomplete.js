import algoliasearch from "algoliasearch/lite";
import { autocomplete, getAlgoliaHits } from "@algolia/autocomplete-js";
import "@algolia/autocomplete-theme-classic";


import {createClickTracker} from './clickAnalytics.js';

import {addCSS, removeCSS} from './CSS.js';

const XS_WIDTH = 400;
const SM_WIDTH = 600;

class Autocomplete {
  constructor({
    applicationId,
    apiKey,
    autocomplete: {
      enabled
    },
    indexPrefix,
    subdomain
  }) {
    if (!enabled) return;
    this.client = algoliasearch(applicationId, apiKey);
    this.client.addAlgoliaAgent('Zendesk Integration (__VERSION__)');
    this.indexName = `${indexPrefix}${subdomain}_articles`;
    this.trackClick = createClickTracker(this, this.indexName);
  }

  init({
    analytics,
    autocomplete: {
      enabled,
      hitsPerPage,
      inputSelector
    },
    baseUrl,
    color,
    clickAnalytics,
    debug,
    locale,
    highlightColor,
    poweredBy,
    subdomain,
    templates,
    translations
  }) {
    if (!enabled) return;

    const defaultParams = {
      analytics,
      hitsPerPage,
      facetFilters: `["locale.locale:${locale}"]`,
      attributesToSnippet: ['body_safe:20'],
      snippetEllipsisText: '…'
    };

    const self = this;

    autocomplete({
      container: inputSelector,
      placeholder: translations.placeholder,
      debug: process.env.NODE_ENV === 'development' || debug,
      openOnFocus: true,
      getSources({ query, state }) {
        return [
          {
            sourceId: "articles",
            getItemInputValue: ({ state }) => state.query,
            getItems({ query }) {
              return getAlgoliaHits({
                searchClient: self.client,
                queries: [
                  {
                    indexName: self.indexName,
                    query,
                    params: {
                      ...defaultParams,
                      clickAnalytics,
                      queryLanguages: [locale.split('-')[0]],
                      removeStopWords: true
                    }
                  }
                ]
              });
            },
            templates: {
              header({ items }) {
                return templates.autocomplete.header(translations, items);
              },
              item({ item }) {
                return templates.autocomplete.article(item);
              },
              noResults({ query }) {
                // FIXME: not called
                console.log('no results', arguments);
                return templates.autocomplete.noResults(translations, query);
              },
            },
            onSelect({ item }) {
              if (clickAnalytics) {
                self.trackClick(item, item.__autocomplete_id, item.__autocomplete_queryID);
              }
              location.href = `${baseUrl}${locale}/articles/${item.id}`;
            }
          }
        ];
      }
    });
  }
}
export default (...args) => new Autocomplete(...args);
