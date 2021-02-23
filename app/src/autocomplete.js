import algoliasearch from "algoliasearch/lite";
import { autocomplete, getAlgoliaHits } from "@algolia/autocomplete-js";
import "@algolia/autocomplete-theme-classic";

import translate from './translations.js';
import {debounceGetAnswers} from './answers.js';
import {createClickTracker} from './clickAnalytics.js';

import { createLocalStorageRecentSearchesPlugin } from '@algolia/autocomplete-plugin-recent-searches';

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
    const answersRef = {
      current: []
    };
    const lang = locale.split('-')[0];

    const recentSearchesPlugin = createLocalStorageRecentSearchesPlugin({
      key: 'navbar',
    });    

    const search = autocomplete({
      container: inputSelector,
      placeholder: translate(translations, locale, 'placeholder'),
      debug: process.env.NODE_ENV === 'development' || debug,
      plugins: [recentSearchesPlugin],
      openOnFocus: true,
      onStateChange({ prevState, state }) {
        if (prevState.query !== state.query) {
          debounceGetAnswers(self.client.initIndex(self.indexName), state.query, lang, ({ hits }) => {
            answersRef.current = hits;
            search.refresh();
          });
        }
      },
      getSources({ query }) {
        if (!query) {
          return [];
        }

        return [
          {
            // ----------------
            // Source: Algolia Answers
            // ----------------
            sourceId: "Answers",
            getItems() {
              return answersRef.current;
            },
            templates: {
              header({ items }) {
                if (items.length === 0) {
                  return null;
                }
                return templates.autocomplete.bestArticleHeader(translations, locale, items);
              },
              item({ item }) {
                return templates.autocomplete.article(item);
              }
            }
          },
          {
            // ----------------
            // Source: Algolia Search
            // ----------------
            sourceId: "Search",
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
                      queryLanguages: [lang],
                      removeStopWords: true
                    }
                  }
                ]
              });
            },
            templates: {
              header({ items }) {
                return templates.autocomplete.articlesHeader(translations, locale, items);
              },
              item({ item }) {
                return templates.autocomplete.article(item);
              },
              empty({ state }) {
                return templates.autocomplete.noResults(translations, locale, state.query);
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
