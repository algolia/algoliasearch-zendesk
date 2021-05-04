import { version } from '../package.json';
import algoliasearch from 'algoliasearch/lite';
import { autocomplete } from '@algolia/autocomplete-js';
import '@algolia/autocomplete-theme-classic';
import './autocomplete.css';
// eslint-disable-next-line no-unused-vars
import { render, h, Fragment } from 'preact';
import { groupBy } from 'lodash';

import translate from './translations';
import { debounceGetAnswers } from './answers';
import { initInsights, extendWithConversionTracking } from './clickAnalytics';
import { getContainerAndButton, recentSearchesPlugin, getRGB } from './utils';

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
    autocomplete: {
      enabled,
      bestArticle,
      hitsPerPage,
      inputSelector,
      keyboardShortcut,
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
    translations,
  }) {
    if (!enabled) return;

    // eslint-disable-next-line consistent-this
    const self = this;
    this.state = { isOpen: false };

    const doc = document.documentElement;
    doc.style.setProperty('--aa-primary-color-rgb', getRGB(color));
    doc.style.setProperty('--aa-highlight-color-rgb', getRGB(highlightColor));

    const lang = locale.split('-')[0];
    const buildUrl = (hit) => `${baseUrl}${locale}/articles/${hit.id}`;
    const onSelect = ({ item }) => {
      this.trackClick(item, item.__position, item.__queryID);
    };

    const answersRef = {
      current: [],
    };
    const [container, submitButton] = getContainerAndButton(inputSelector);

    const ac = autocomplete({
      container,
      panelContainer: container,
      placeholder: translate(translations, locale, 'placeholder'),
      debug: process.env.NODE_ENV === 'development' || debug,
      plugins: [recentSearchesPlugin],
      openOnFocus: true,
      onStateChange({ prevState, state, refresh }) {
        // backup state
        self.state = state;

        // hack to localize the cancel button
        if (
          state.isOpen &&
          !prevState.isOpen &&
          doc.querySelector('.aa-DetachedCancelButton') // only if displayed
        ) {
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
              if (hit._answer.extractAttribute === 'body_safe') {
                hit._snippetResult.body_safe.value = hit._answer.extract;
              }
              hit.__position = i + 1;
              hit.__queryID = queryID;
              hit.url = buildUrl(hit);
              return hit;
            });
            refresh();
          }
        );
      },
      onSubmit({ state }) {
        window.location.href = `${baseUrl}${locale}/search?utf8=✓&query=${encodeURIComponent(
          state.query
        )}`;
      },
      getSources({ query: q }) {
        const sectionTitle = (hit) =>
          `${hit.category.title} - ${hit.section.title}`;

        const sources = [];

        // ----------------
        // Source: Algolia Answers
        // ----------------
        sources.push({
          sourceId: 'Answers',
          getItems() {
            return answersRef.current;
          },
          getItemUrl({ item }) {
            return item.url;
          },
          templates: {
            header({ items }) {
              if (items.length === 0) {
                return null;
              }
              return templates.autocomplete.articlesHeader(
                translate(translations, locale, 'bestAnswer'),
                items
              );
            },
            item({ item, components }) {
              return templates.autocomplete.answers(
                translations,
                locale,
                item,
                components
              );
            },
          },
          onSelect,
        });

        // ----------------
        // Source: Algolia Search
        // ----------------
        return self.client
          .initIndex(self.indexName)
          .search(q, {
            hitsPerPage,
            facetFilters: `["locale.locale:${locale}"]`,
            attributesToSnippet: ['body_safe:30'],
            snippetEllipsisText: '…',
            analytics,
            clickAnalytics,
            queryLanguages: [lang],
            removeStopWords: true,
            ignorePlurals: true,
            highlightPreTag: '__aa-highlight__',
            highlightPostTag: '__/aa-highlight__',
          })
          .then((results) => {
            const hitsButBestAnswer = results.hits.filter(
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
            let position = 1;
            Object.entries(hitsByCategorySection).forEach(([section, hits]) => {
              sources.push({
                sourceId: section,
                getItems() {
                  return hits.map((hit) => {
                    hit.url = buildUrl(hit);
                    hit.__position = position++;
                    hit.__queryID = results.queryID;
                    return hit;
                  });
                },
                getItemUrl({ item }) {
                  return item.url;
                },
                templates: {
                  header({ items }) {
                    return templates.autocomplete.articlesHeader(
                      section,
                      items
                    );
                  },
                  item({ item, components }) {
                    return templates.autocomplete.article(item, components);
                  },
                },
                onSelect,
              });
            });
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

    if (submitButton) {
      submitButton.style = 'display: flex; order: 5; margin-left: 16px;';
      // on mobile, we might not have the form at all; therefore do not append the button
      container.querySelector('form')?.appendChild(submitButton);
    }

    if (keyboardShortcut) {
      const onKeyDown = (event) => {
        if (
          (event.keyCode === 27 && this.state.isOpen) ||
          // The `Cmd+K` shortcut both opens and closes the modal.
          (event.key === 'k' && (event.metaKey || event.ctrlKey))
        ) {
          event.preventDefault();
          ac.setIsOpen(!this.state.isOpen);
          ac.refresh();
        }
      };

      render(
        <div class="aa-DetachedSearchButtonSuffix">
          <span class="aa-Key">⌘</span>
          <span class="aa-Key">K</span>
        </div>,
        doc.querySelector('.aa-InputWrapperSuffix')
      );

      window.addEventListener('keydown', onKeyDown);
    }
  }
}
export default (...args) => new Autocomplete(...args);
