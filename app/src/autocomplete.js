// Small hack to remove verticalAlign on the input
// Makes IE11 fail though
import algoliasearch from 'algoliasearch';
import autocomplete from 'autocomplete.js';
import _ from 'autocomplete.js/src/common/utils';
import zepto from 'autocomplete.js/zepto';

import addCSS from './addCSS';
import { createClickTracker } from './clickAnalytics';
import removeCSS from './removeCSS';
import getOptionalWords from './stopwords';

if (!_.isMsie()) {
  const css = require('autocomplete.js/src/autocomplete/css');
  delete css.input.verticalAlign;
  delete css.inputWithNoHint.verticalAlign;
}

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
    this.index = this.client.initIndex(this.indexName);
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

      // Get the width of the dropdown
      const dropdownMenuWidth = $input.getBoundingClientRect().width;

      const sizeModifier = this._sizeModifier(dropdownMenuWidth);
      const nbSnippetWords = this._nbSnippetWords(dropdownMenuWidth);
      const params = {
        analytics,
        hitsPerPage,
        facetFilters: `["locale.locale:${locale}"]`,
        highlightPreTag: '<span class="aa-article-hit--highlight">',
        highlightPostTag: '</span>',
        attributesToSnippet: [`body_safe:${nbSnippetWords}`],
        snippetEllipsisText: '...',
      };

      $input.setAttribute('placeholder', translations.placeholder);
      const aa = autocomplete(
        $input,
        {
          hint: false,
          debug: process.env.NODE_ENV === 'development' || debug,
          templates: this._templates({
            poweredBy,
            subdomain,
            templates,
            translations,
          }),
          appendTo: 'body',
        },
        [
          {
            source: this._source(params, locale, clickAnalytics),
            name: 'articles',
            templates: {
              suggestion: this._renderSuggestion(templates, sizeModifier),
            },
          },
        ]
      );
      aa.on(
        'autocomplete:selected',
        this._onSelected(baseUrl, locale, clickAnalytics)
      );
      aa.on('autocomplete:redrawn', function () {
        aa.autocomplete.getWrapper().style.zIndex = 10000;
      });
      aa.typeahead = zepto($input).data('aaAutocomplete');
      this.autocompletes.push(aa);
    }

    this._temporaryHidingCancel();
  }

  enableDebugMode() {
    this.autocompletes.forEach(function (aa) {
      aa.typeahead.debug = true;
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

  _source(params, locale, clickAnalytics) {
    return (query, callback) => {
      this.index
        .search({
          ...params,
          clickAnalytics,
          query,
          optionalWords: getOptionalWords(query, locale),
        })
        .then((content) => {
          const hitsWithPosition = this._addPositionToHits(
            content.hits,
            content.queryID,
            clickAnalytics
          );
          const reorderedHits = this._reorderedHits(hitsWithPosition);
          callback(reorderedHits);
        });
    };
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

  _templates({ poweredBy, subdomain, templates, translations }) {
    const res = {};
    if (poweredBy === true) {
      res.header = templates.autocomplete.poweredBy({
        content: translations.search_by_algolia(
          templates.autocomplete.algolia(subdomain)
        ),
      });
    }
    return res;
  }

  _renderSuggestion(templates, sizeModifier) {
    return (hit) => {
      hit.sizeModifier = sizeModifier;
      return templates.autocomplete.article(hit);
    };
  }

  _onSelected(baseUrl, locale, clickAnalytics) {
    return (event, suggestion, dataset) => {
      if (clickAnalytics) {
        const { _position, _queryID } = suggestion;
        this.trackClick(suggestion, _position, _queryID);
      }
      location.href = `${baseUrl}${locale}/${dataset}/${suggestion.id}`;
    };
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
    return hits.map(function (hit, index) {
      hit._position = index + 1;
      hit._queryID = queryID;
      return hit;
    });
  }
}
export default (...args) => new Autocomplete(...args);
