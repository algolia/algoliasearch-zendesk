import { autocomplete, getAlgoliaResults } from '@algolia/autocomplete-js';
import { liteClient as algoliasearch } from 'algoliasearch/lite';

import addCSS from './addCSS';
import { createClickTracker } from './clickAnalytics';
import removeCSS from './removeCSS';
import getOptionalWords from './stopwords';

const XS_WIDTH = 400;
const SM_WIDTH = 600;

class Autocomplete {
  constructor({
    applicationId,
    apiKey,
    autocomplete: { enabled, inputSelector },
    indexName,
    indexPrefix,
    subdomain,
  }) {
    if (!enabled) return;

    this._temporaryHiding(inputSelector);

    this.client = algoliasearch(applicationId, apiKey);
    this.client.addAlgoliaAgent('Zendesk Integration (__VERSION__)');
    this.indexName = indexName || `${indexPrefix}${subdomain}_articles`;
    this.trackClick = createClickTracker(this, this.indexName);
  }

  render({
    analytics,
    autocomplete: { enabled, hitsPerPage, inputSelector },
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
    if (!enabled) return null;

    this.$inputs = document.querySelectorAll(inputSelector);
    this.$inputs = Array.prototype.slice.call(this.$inputs, 0); // Transform to array
    this._disableZendeskAutocomplete();

    addCSS(templates.autocomplete.css({ color, highlightColor }));
    this.autocompletes = [];

    for (let i = 0; i < this.$inputs.length; ++i) {
      const $input = this.$inputs[i];

      // v1's `autocomplete()` requires a div container; it renders its own
      // input + form inside. We hide the Zendesk theme's input rather than
      // removing it, so any host-theme JS that references `#query` (form
      // submit handlers, custom listeners) keeps working. v1 mounts in a
      // sibling container of the same dimensions.
      const inputRect = $input.getBoundingClientRect();
      const containerWidth = inputRect.width;
      const $container = document.createElement('div');
      $container.style.width = `${containerWidth}px`;
      $input.parentNode.insertBefore($container, $input.nextSibling);
      $input.style.display = 'none';

      const sizeModifier = this._sizeModifier(containerWidth);
      const nbSnippetWords = this._nbSnippetWords(containerWidth);
      const params = {
        analytics,
        hitsPerPage,
        facetFilters: [`locale.locale:${locale}`],
        attributesToSnippet: [`body_safe:${nbSnippetWords}`],
        snippetEllipsisText: '...',
      };

      const aa = autocomplete({
        container: $container,
        placeholder: translations.placeholder,
        detachedMediaQuery: 'none',
        debug: process.env.NODE_ENV === 'development' || debug,
        onSubmit: ({ state }) => {
          window.location.href = `${baseUrl}${locale}/search?query=${encodeURIComponent(
            state.query
          )}`;
        },
        getSources: ({ query }) => [
          {
            sourceId: 'articles',
            getItems: () =>
              getAlgoliaResults({
                searchClient: this.client,
                queries: [
                  {
                    indexName: this.indexName,
                    query,
                    params: {
                      ...params,
                      clickAnalytics,
                      optionalWords: getOptionalWords(query, locale),
                    },
                  },
                ],
                transformResponse: ({ hits, results }) => [
                  this._reorderedHits(
                    this._addPositionToHits(
                      hits[0],
                      results[0].queryID,
                      clickAnalytics
                    )
                  ),
                ],
              }),
            getItemUrl: ({ item }) => `${baseUrl}${locale}/articles/${item.id}`,
            onSelect: ({ item }) => {
              if (clickAnalytics) {
                this.trackClick(item, item._position, item._queryID);
              }
              window.location.href = `${baseUrl}${locale}/articles/${item.id}`;
            },
            templates: {
              header: this._renderHeader({
                poweredBy,
                subdomain,
                templates,
                translations,
              }),
              item: this._renderItem(templates, sizeModifier),
            },
          },
        ],
      });

      this.autocompletes.push(aa);
    }

    this._temporaryHidingCancel();
  }

  enableDebugMode() {
    this.autocompletes.forEach((aa) => {
      aa.setIsOpen(true);
    });
  }

  // Protected

  _sizeModifier(inputWidth) {
    if (inputWidth < XS_WIDTH) return 'xs';
    if (inputWidth < SM_WIDTH) return 'sm';
    return null;
  }

  _nbSnippetWords(inputWidth) {
    if (inputWidth < XS_WIDTH) return 0;
    if (inputWidth < SM_WIDTH) return 3 + Math.floor(inputWidth / 45);
    return Math.floor(inputWidth / 35);
  }

  _reorderedHits(hits) {
    const groupedHits = new Map();
    hits.forEach((hit) => {
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

    const flattenedHits = [];
    groupedHits.forEach((sectionsValues) => {
      sectionsValues.forEach((sectionHits) => {
        sectionHits.forEach((sectionHit) => {
          flattenedHits.push(sectionHit);
        });
      });
    });

    return flattenedHits;
  }

  _renderHeader({ poweredBy, subdomain, templates, translations }) {
    if (poweredBy !== true) {
      return undefined;
    }
    return templates.autocomplete.poweredBy({ subdomain, translations });
  }

  _renderItem(templates, sizeModifier) {
    return templates.autocomplete.article(sizeModifier);
  }

  _temporaryHiding(selector) {
    this._temporaryHidingCSS = addCSS(`
      ${selector} {
        visibility: hidden !important;
        height: 1px !important;
      }
    `);
  }

  _temporaryHidingCancel() {
    removeCSS(this._temporaryHidingCSS);
    delete this._temporaryHidingCSS;
  }

  _disableZendeskAutocomplete() {
    if (document.querySelector('[data-search][data-instant=true]')) {
      console.log(
        '[Algolia][Warning] ' +
          'You should remove `instant=true` from your templates to save resources'
      );
      for (let i = 0; i < this.$inputs.length; ++i) {
        const $input = this.$inputs[i];
        const $new = $input.cloneNode();
        $input.parentNode.replaceChild($new, $input);
        this.$inputs[i] = $new;
      }
    }
  }

  _addPositionToHits(hits, queryID, clickAnalytics) {
    if (!clickAnalytics) return hits;
    return hits.map((hit, index) => {
      hit._position = index + 1;
      hit._queryID = queryID;
      return hit;
    });
  }
}
export default (...args) => new Autocomplete(...args);
