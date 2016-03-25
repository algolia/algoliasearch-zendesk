import autocomplete from 'autocomplete.js';

import algoliasearch from 'algoliasearch';
import 'es6-collections';

import templates from './templates.js';
import addCSS from './addCSS.js';
import removeCSS from './removeCSS.js';

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
    this.index = this.client.initIndex(`${indexPrefix}${subdomain}_articles`);
  }

  render({
    autocomplete: {
      enabled,
      hitsPerPage,
      inputSelector
    },
    baseUrl,
    colors,
    poweredBy,
    translations
  }) {
    if (!enabled) return null;

    this.$inputs = document.querySelectorAll(inputSelector);
    console.log(this.$inputs);

    this.locale = require('./I18n.js').locale;

    addCSS(templates.autocomplete.css.render({colors}));
    this.autocompletes = [];

    for (let i = 0; i < this.$inputs.length; ++i) {
      // Add a mock autocomplete to check the width the
      // menu would have
      const $input = this.$inputs[i];
      const $wrapper = document.createElement('div');
      $wrapper.class = 'algolia-autocomplete';

      const $dropdown = document.createElement('div');
      $dropdown.class = 'aa-dropdown-menu';
      $wrapper.appendChild($dropdown);

      $input.parentNode.insertBefore($wrapper, $input);

      // Get the width of the dropdown
      const dropdownMenuWidth = $input.offsetWidth;
      console.log(dropdownMenuWidth);

      // Remove the wrapper
      $wrapper.parentNode.insertBefore($input, $wrapper.nextSibling);
      $wrapper.parentNode.removeChild($wrapper);

      const sizeModifier = this._sizeModifier(dropdownMenuWidth);
      const nbSnippetWords = this._nbSnippetWords(dropdownMenuWidth);
      const params = {
        hitsPerPage,
        facetFilters: `["locale.locale:${this.locale}"]`,
        highlightPreTag: '<span class="aa-article-hit--highlight">',
        highlightPostTag: '</span>',
        attributesToSnippet: [`body_safe:${nbSnippetWords}`],
        snippetEllipsisText: '...'
      };

      $input.setAttribute('placeholder', translations.placeholder_autocomplete);
      let aa = autocomplete($input, {
        hint: false,
        debug: process.env.NODE_ENV === 'development',
        templates: this._templates({colors, poweredBy, translations})
      }, [{
        source: this._source(params),
        name: 'articles',
        templates: {
          suggestion: this._renderSuggestion(sizeModifier)
        }
      }]);
      aa.on('autocomplete:selected', this._onSelected(baseUrl));
      this.autocompletes.push(aa);
    }

    this._temporaryHidingCancel();
  }

  // Protected

  _sizeModifier(inputWidth) {
    if (inputWidth < XS_WIDTH) return 'xs';
    if (inputWidth < SM_WIDTH) return 'sm';
    return null;
  }

  _nbSnippetWords(inputWidth) {
    if (inputWidth < XS_WIDTH) return 0;
    if (inputWidth < SM_WIDTH) return 10 + Math.floor(inputWidth / 40);
    return 10 + Math.floor(inputWidth / 30);
  }

  _source(params) {
    return (query, callback) => {
      this.index.search({...params, query})
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

  _templates({colors, poweredBy, translations}) {
    let res = {};
    if (poweredBy === true) {
      res.footer = templates.autocomplete.footer.render({colors, translations});
    }
    return res;
  }

  _renderSuggestion(sizeModifier) {
    return (hit) => {
      hit.sizeModifier = sizeModifier;
      return templates.autocomplete.article.render(hit);

    };
  }

  _onSelected(baseUrl) {
    return (event, suggestion, dataset) => {
      location.href = `${baseUrl}${this.locale}/${dataset}/${suggestion.id}`;
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
}
export default (...args) => new Autocomplete(...args);
