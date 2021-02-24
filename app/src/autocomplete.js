import algoliasearch from 'algoliasearch/lite';
import { autocomplete, getAlgoliaHits } from '@algolia/autocomplete-js';
import '@algolia/autocomplete-theme-classic';
// eslint-disable-next-line no-unused-vars
import { render, h, Fragment } from 'preact';
import { groupBy } from 'lodash';

import translate from './translations';
import { debounceGetAnswers } from './answers';
import { createClickTracker } from './clickAnalytics';

import { createLocalStorageRecentSearchesPlugin } from '@algolia/autocomplete-plugin-recent-searches';
import { search as defaultLocalStorageSearch } from '@algolia/autocomplete-plugin-recent-searches/dist/esm/usecases/localStorage';

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

    autocomplete({
      container: inputSelector,
      placeholder: translate(translations, locale, 'placeholder'),
      detachedMediaQuery: '',
      debug: process.env.NODE_ENV === 'development' || debug,
      plugins: [
        createLocalStorageRecentSearchesPlugin({
          key: 'algolia-recent-searches',
          // in case the query is exactly the recent item, skip it to not have a useless entry
          search({ query, items, limit }) {
            const results = defaultLocalStorageSearch({ query, items, limit });
            if (results.length === 1 && results[0].query === query) {
              return [];
            }
            return results;
          },
          transformSource({ source }) {
            return {
              ...source,
              // keep this open and do another search
              onSelect({ setIsOpen }) {
                setIsOpen(true);
              },
            };
          },
        }),
      ],
      openOnFocus: true,
      onStateChange({ prevState, state, refresh }) {
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
            refresh();
          }
        );
      },
      getSources({ query: q }) {
        const answersSection = {
          // ----------------
          // Source: Algolia Answers
          // ----------------
          sourceId: 'Answers',
          getItems() {
            return answersRef.current;
          },
          getItemUrl({ item }) {
            return `${baseUrl}${locale}/articles/${item.id}`;
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
        };

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
        })
          .then((results) => {
            return Object.entries(groupBy(results[0], 'section.title')).map(
              ([section, hits]) => {
                return {
                  sourceId: section,
                  getItems() {
                    return hits;
                  },
                  getItemUrl({ item }) {
                    return `${baseUrl}${locale}/articles/${item.id}`;
                  },
                  templates: {
                    header({ items }) {
                      return templates.autocomplete.articlesHeader(
                        section,
                        items
                      );
                    },
                    item({ item }) {
                      return templates.autocomplete.article(item);
                    },
                    noResults({ state }) {
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
                  },
                };
              }
            );
          })
          .then((sources) => {
            sources.unshift(answersSection);
            return sources;
          });
      },
      render({ sections }, root) {
        render(
          <Fragment>
            <div className="aa-PanelLayout">{sections}</div>
            {poweredBy && (
              <div className="aa-PanelFooter">
                {templates.autocomplete.poweredBy()}
              </div>
            )}
          </Fragment>,
          root
        );
      },
    });
  }
}
export default (...args) => new Autocomplete(...args);
