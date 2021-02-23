import algoliasearch from "algoliasearch/lite";
import { autocomplete, getAlgoliaHits } from "@algolia/autocomplete-js";
import "@algolia/autocomplete-theme-classic";

import {debounceGetAnswers} from './answers.js';
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
    const answersRef = {
      current: []
    };
    const lang = locale.split('-')[0];

    const search = autocomplete({
      container: inputSelector,
      placeholder: translations.placeholder,
      debug: process.env.NODE_ENV === 'development' || debug,
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
                return templates.autocomplete.bestAnswer(translations, items);
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
                return templates.autocomplete.header(translations, items);
              },
              item({ item }) {
                return templates.autocomplete.article(item);
              },
              empty({ query }) {
                // FIXME: not called
                console.log('empty', arguments);
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
