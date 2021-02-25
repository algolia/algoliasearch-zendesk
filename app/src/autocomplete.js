import { version } from '../package.json';
import algoliasearch from 'algoliasearch/lite';
import { autocomplete, getAlgoliaHits } from '@algolia/autocomplete-js';
import '@algolia/autocomplete-theme-classic';
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
    templates,
    translations,
  }) {
    if (!enabled) return;

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

    // eslint-disable-next-line consistent-this
    const self = this;
    self.state = { isOpen: false };

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

    function onKeyDown(event) {
      console.log(event, self.state);
      const open = document.querySelector('.aa-DetachedSearchButton');
      const close = document.querySelector('.aa-DetachedCancelButton');

      if (
        (event.keyCode === 27 && self.state.isOpen) ||
        // The `Cmd+K` shortcut both opens and closes the modal.
        (event.key === 'k' && (event.metaKey || event.ctrlKey))
      ) {
        event.preventDefault();

        if (self.state.isOpen) {
          close.click();
        } else {
          open.click();
        }
      }
    }

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
        if (!bestArticle || prevState.query === state.query) {
          return;
        }
        self.state = state;
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
            const hitsByCategorySection = groupBy(results[0], sectionTitle);
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
                    noResults({ state }) {
                      return templates.autocomplete.noResults(
                        translations,
                        locale,
                        state.query
                      );
                    },
                  },
                  onSelect({ item }) {
                    self.trackClick(
                      item,
                      item.__autocomplete_id,
                      item.__autocomplete_queryID
                    );
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
