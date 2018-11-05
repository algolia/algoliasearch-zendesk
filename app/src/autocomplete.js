// Small hack to remove verticalAlign on the input
// Makes IE11 fail though
import _ from 'autocomplete.js/src/common/utils.js';
if (!_.isMsie()) {
  const css = require('autocomplete.js/src/autocomplete/css.js');
  delete css.input.verticalAlign;
  delete css.inputWithNoHint.verticalAlign;
}

import autocomplete from 'autocomplete.js';
import zepto from 'autocomplete.js/zepto.js';

import algoliasearch from 'algoliasearch';
import 'es6-collections';

import addCSS from './addCSS.js';
import removeCSS from './removeCSS.js';

import getOptionalWords from './stopwords.js';

const XS_WIDTH = 400;
const SM_WIDTH = 600;

class Autocomplete {
  constructor({
    applicationId,
    apiKey,
    autocomplete: {
      enabled,
      inputSelector
    },
    indexPrefix,
    subdomain
  }) {
    if (!enabled) return;

    this._temporaryHiding(inputSelector);

    this.client = algoliasearch(applicationId, apiKey);
    this.client.addAlgoliaAgent('Zendesk Integration (__VERSION__)');
    this.index = this.client.initIndex(`${indexPrefix}${subdomain}_articles`);
  }

  render({
    analytics,
    autocomplete: {
      enabled,
      hitsPerPage,
      inputSelector
    },
    baseUrl,
    color,
    debug,
    locale,
    highlightColor,
    poweredBy,
    subdomain,
    templates,
    translations
  }) {
    if (!enabled) return null;

    this.$inputs = document.querySelectorAll(inputSelector);
    this.$inputs = Array.prototype.slice.call(this.$inputs, 0); // Transform to array
    this._disableZendeskAutocomplete();

    addCSS(templates.autocomplete.css({color, highlightColor}));
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
        snippetEllipsisText: '...'
      };

      $input.setAttribute('placeholder', translations.placeholder);
      let aa = autocomplete($input, {
        hint: false,
        debug: process.env.NODE_ENV === 'development' || debug,
        templates: this._templates({poweredBy, subdomain, templates, translations}),
        appendTo: 'body'
      }, [{
        source: this._source(params, locale),
        name: 'articles',
        templates: {
          suggestion: this._renderSuggestion(templates, sizeModifier)
        }
      }]);
      aa.on('autocomplete:selected', this._onSelected(baseUrl, locale));
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

  _source(params, locale) {
    return (query, callback) => {
      this.index.search({...params, query, optionalWords: getOptionalWords(query, locale)})
        .then((content) => { callback(this._reorderedHits(content.hits)); });
    };
  }

  _reorderedHits(hits) {
    let groupedHits = new Map();
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

    let flattenedHits = [];
    groupedHits.forEach((sectionsValues) => {
      sectionsValues.forEach((sectionHits) => {
        sectionHits.forEach((sectionHit) => {
          flattenedHits.push(sectionHit);
        });
      });
    });

    return flattenedHits;
  }

  _templates({poweredBy, subdomain, templates, translations}) {
    let res = {};
    if (poweredBy === true) {
      res.header = templates.autocomplete.poweredBy({
        content: translations.search_by_algolia(templates.autocomplete.algolia(subdomain))
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

  _onSelected(baseUrl, locale) {
    return (event, suggestion, dataset) => {
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
      console.log('[Algolia][Warning] ' +
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
}
export default (...args) => new Autocomplete(...args);
