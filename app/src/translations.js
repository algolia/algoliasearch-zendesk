import isString from 'lodash/isString';
import isUndefined from 'lodash/isUndefined';
import isPlainObject from 'lodash/isPlainObject';

function addTranslation(I18n, translations, key, fallback, I18nKey) {
  if (isString(translations[key])) {
    return;
  }

  if (isPlainObject(translations[key]) && isString(translations[key][I18n.locale])) {
    translations[key] = translations[key][I18n.locale];
    return;
  }

  if (!isUndefined(I18nKey) && isString(I18n.translations[I18nKey])) {
    translations[key] = I18n.translations[I18nKey];
    return;
  }

  translations[key] = fallback;
}

export function loadTranslations(options) {
  let ts = options.translations;
  // Requiring it here because window.I18n isn't defined in the Document Head template
  let I18n = require('I18n');
  addTranslation(I18n, ts, 'article', 'Article', 'txt.help_center.views.admin.manage_knowledge_base.table.article');
  addTranslation(I18n, ts, 'articles', 'Articles', 'txt.help_center.javascripts.arrange_content.articles');
  addTranslation(I18n, ts, 'categories', 'Categories', 'txt.help_center.javascripts.arrange_content.categories');
  addTranslation(I18n, ts, 'sections', 'Sections', 'txt.help_center.javascripts.arrange_content.sections');
  addTranslation(I18n, ts, 'tags', 'Tags');
  addTranslation(I18n, ts, 'search_by', 'Search by');
  addTranslation(I18n, ts, 'no_result', 'No result');
  addTranslation(I18n, ts, 'result', 'Result');
  addTranslation(I18n, ts, 'results', 'Results');
  addTranslation(I18n, ts, 'found_in', 'Found in');
  addTranslation(I18n, ts, 'search_by', 'Search by');
  addTranslation(I18n, ts, 'placeholder_autocomplete', 'Search in sections and articles');
  addTranslation(I18n, ts, 'placeholder_instantsearch', 'Search in articles');
}

export default loadTranslations;
