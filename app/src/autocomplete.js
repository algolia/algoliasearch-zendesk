import algoliasearch from 'algoliasearch/lite';
import { autocomplete, getAlgoliaHits } from '@algolia/autocomplete-js';
import '@algolia/autocomplete-theme-classic';

import translate from './translations';
import { debounceGetAnswers } from './answers';
import { createClickTracker } from './clickAnalytics';

import { createLocalStorageRecentSearchesPlugin } from '@algolia/autocomplete-plugin-recent-searches';

class Autocomplete {
  constructor({
    applicationId,
    apiKey,
    autocomplete: { enabled },
    indexPrefix,
    subdomain,
  }) {
    if (!enabled) return;
    this.client = algoliasearch(applicationId, apiKey);
    this.client.addAlgoliaAgent('Zendesk Integration (__VERSION__)');
    this.indexName = `${indexPrefix}${subdomain}_articles`;
    this.trackClick = createClickTracker(this, this.indexName);
  }

  init({
    analytics,
    autocomplete: { enabled, hitsPerPage, inputSelector },
    baseUrl,
    // eslint-disable-next-line no-unused-vars
    color,
    clickAnalytics,
    debug,
    locale,
    // eslint-disable-next-line no-unused-vars
    highlightColor,
    // eslint-disable-next-line no-unused-vars
    poweredBy,
    templates,
    translations,
  }) {
    if (!enabled) return;

    const defaultParams = {
      analytics,
      hitsPerPage,
      facetFilters: `["locale.locale:${locale}"]`,
      attributesToSnippet: ['body_safe:20'],
      snippetEllipsisText: '…',
    };

    // eslint-disable-next-line consistent-this
    const self = this;
    const answersRef = {
      current: [],
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
        if (prevState.query === state.query) {
          return;
        }
        debounceGetAnswers(
          self.client.initIndex(self.indexName),
          state.query,
          lang,
          {
            facetFilters: `["locale.locale:${locale}"]`,
          },
          ({ hits }) => {
            answersRef.current = hits;
            search.refresh();
          }
        );
      },
      getSources() {
        return [
          {
            // ----------------
            // Source: Algolia Answers
            // ----------------
            sourceId: 'Answers',
            getItems() {
              return answersRef.current;
            },
            templates: {
              header({ items }) {
                if (items.length === 0) {
                  return null;
                }
                return templates.autocomplete.bestArticleHeader(
                  translations,
                  locale,
                  items
                );
              },
              item({ item }) {
                return templates.autocomplete.article(item);
              },
            },
          },
          {
            // ----------------
            // Source: Algolia Search
            // ----------------
            sourceId: 'Search',
            getItems({ query: q }) {
              return getAlgoliaHits({
                searchClient: self.client,
                queries: [
                  {
                    indexName: self.indexName,
                    query: q,
                    params: {
                      ...defaultParams,
                      clickAnalytics,
                      queryLanguages: [lang],
                      removeStopWords: true,
                    },
                  },
                ],
              }).then((results) => {
                // filter out the best answer from this list
                return [
                  results[0].filter(
                    (h) => h.objectID !== answersRef.current?.[0]?.objectID
                  ),
                ];
              });
            },
            templates: {
              header({ items }) {
                return templates.autocomplete.articlesHeader(
                  translations,
                  locale,
                  items
                );
              },
              item({ item }) {
                return templates.autocomplete.article(item);
              },
              empty({ state }) {
                return templates.autocomplete.noResults(
                  translations,
                  locale,
                  state.query
                );
              },
            },
            onSelect({ item }) {
              if (clickAnalytics) {
                self.trackClick(
                  item,
                  item.__autocomplete_id,
                  item.__autocomplete_queryID
                );
              }
              location.href = `${baseUrl}${locale}/articles/${item.id}`;
            },
          },
        ];
      },
    });
  }
}
export default (...args) => new Autocomplete(...args);
