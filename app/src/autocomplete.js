import { version } from '../package.json';
import algoliasearch from 'algoliasearch/lite';
import { autocomplete, getAlgoliaHits } from '@algolia/autocomplete-js';
import '@algolia/autocomplete-theme-classic';
import './autocomplete.css';
// eslint-disable-next-line no-unused-vars
import { render, h, Fragment } from 'preact';
import { groupBy } from 'lodash';

import translate from './translations';
import { debounceGetAnswers } from './answers';
import { initInsights, extendWithConversionTracking } from './clickAnalytics';

import { createLocalStorageRecentSearchesPlugin } from '@algolia/autocomplete-plugin-recent-searches';
import { search as defaultLocalStorageSearch } from '@algolia/autocomplete-plugin-recent-searches/dist/esm/usecases/localStorage';

class Autocomplete {
  constructor({
    applicationId,
    apiKey,
    autocomplete: { enabled },
    indexPrefix,
    subdomain,
    clickAnalytics,
  }) {
    if (!enabled) return;
    this.client = algoliasearch(applicationId, apiKey);
    this.client.addAlgoliaAgent(`Zendesk Integration (${version})`);
    this.indexName = `${indexPrefix}${subdomain}_articles`;

    if (clickAnalytics) {
      initInsights({ applicationId, apiKey });
      extendWithConversionTracking(this, {
        clickAnalytics,
        indexName: this.indexName,
      });
    }
  }

  init({
    analytics,
    autocomplete: { enabled, bestArticle, hitsPerPage, inputSelector },
    baseUrl,
    color,
    clickAnalytics,
    debug,
    locale,
    highlightColor,
    poweredBy,
    subdomain,
    templates,
    translations,
  }) {
    if (!enabled) return;

    this.state = { isOpen: false };

    const doc = document.documentElement;
    doc.style.setProperty('--aa-primary-color', color);
    doc.style.setProperty('--aa-highlight-color', highlightColor);
    doc.style.setProperty('--aa-detached-modal-max-width', '680px');
    doc.style.setProperty('--aa-detached-modal-max-height', '80%');

    const defaultParams = {
      analytics,
      hitsPerPage,
      facetFilters: `["locale.locale:${locale}"]`,
      attributesToSnippet: ['body_safe:30'],
      snippetEllipsisText: '…',
    };

    const answersRef = {
      current: [],
    };
    const lang = locale.split('-')[0];

    // figure out parent container of the input
    const allInputs = document.querySelectorAll(inputSelector);
    if (allInputs.length === 0) {
      throw new Error(
        `Couldn't find any input matching inputSelector '${inputSelector}'.`
      );
    }
    if (allInputs.length > 1) {
      throw new Error(
        `Too many inputs (${allInputs.length}) matching inputSelector '${inputSelector}'.`
      );
    }
    let container = allInputs[0];
    while (container && ['INPUT', 'FORM'].includes(container.tagName)) {
      container = container.parentElement;
    }
    if (!container) {
      throw new Error(
        `Couldn't find the parent container of inputSelector '${inputSelector}'`
      );
    }
    container.innerHTML = '';

    const onKeyDown = (event) => {
      const open = document.querySelector('.aa-DetachedSearchButton');
      const close = document.querySelector('.aa-DetachedCancelButton');

      if (
        (event.keyCode === 27 && this.state.isOpen) ||
        // The `Cmd+K` shortcut both opens and closes the modal.
        (event.key === 'k' && (event.metaKey || event.ctrlKey))
      ) {
        event.preventDefault();

        if (this.state.isOpen) {
          close.click();
        } else {
          open.click();
        }
      }
    };

    const onSelect = ({ item }) => {
      this.trackClick(
        item,
        item.__autocomplete_id,
        item.__autocomplete_queryID
      );
    };

    // eslint-disable-next-line consistent-this
    const self = this;
    autocomplete({
      container,
      placeholder: translate(translations, locale, 'placeholder'),
      detachedMediaQuery: '',
      debug: process.env.NODE_ENV === 'development' || debug,
      onSubmit({ state }) {
        window.location.href = `${baseUrl}${locale}/search?utf8=✓&query=${encodeURIComponent(
          state.query
        )}`;
      },
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
        // backup state
        self.state = state;

        // hack to localize the cancel button
        if (state.isOpen && !prevState.isOpen) {
          render(
            translate(translations, locale, 'cancel'),
            doc.querySelector('.aa-DetachedCancelButton')
          );
        }

        // if answers is disabled, stop right away
        if (!bestArticle || prevState.query === state.query) {
          return;
        }

        // debounce store the best answer
        debounceGetAnswers(
          self.client.initIndex(self.indexName),
          state.query,
          lang,
          {
            facetFilters: `["locale.locale:${locale}"]`,
            clickAnalytics,
          },
          ({ hits, queryID }) => {
            answersRef.current = hits.map((hit, i) => {
              hit._snippetResult.body_safe.value = hit._answer.extract;
              // eslint-disable-next-line camelcase
              hit.__autocomplete_id = i;
              // eslint-disable-next-line camelcase
              hit.__autocomplete_queryID = queryID;
              return hit;
            });
            refresh();
          }
        );
      },
      getSources({ query: q }) {
        const sectionTitle = (hit) =>
          `${hit.category.title} > ${hit.section.title}`;
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
              return templates.autocomplete.articlesHeader(
                `⚡️ ${sectionTitle(items[0])}`,
                items
              );
            },
            item({ item }) {
              return templates.autocomplete.article(item);
            },
          },
          onSelect,
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
            const hitsButBestAnswer = results[0].filter(
              (hit) => hit.objectID !== answersRef.current?.[0]?.objectID
            );
            if (!answersRef.current?.[0] && hitsButBestAnswer.length === 0) {
              return [
                {
                  sourceId: 'NoResults',
                  getItems() {
                    return [];
                  },
                  templates: {
                    noResults({ state }) {
                      return templates.autocomplete.noResults(
                        translations,
                        locale,
                        state.query
                      );
                    },
                  },
                },
              ];
            }
            const hitsByCategorySection = groupBy(
              hitsButBestAnswer,
              sectionTitle
            );
            return Object.entries(hitsByCategorySection).map(
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
                  },
                  onSelect,
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
            {templates.autocomplete.footer(
              translations,
              locale,
              subdomain,
              poweredBy
            )}
          </Fragment>,
          root
        );
      },
    });
    render(
      <div class="aa-DetachedSearchButtonSuffix">
        <span class="aa-Key">⌘</span>
        <span class="aa-Key">K</span>
      </div>,
      doc.querySelector('.aa-DetachedSearchButtonIcon')
    );
    window.addEventListener('keydown', onKeyDown);
  }
}
export default (...args) => new Autocomplete(...args);
