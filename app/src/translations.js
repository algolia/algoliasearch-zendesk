/* global I18n */

import isString from 'lodash/isString';
import isUndefined from 'lodash/isUndefined';
import isPlainObject from 'lodash/isPlainObject';

function addTranslation(translations, key, fallback, I18nKey) {
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
  addTranslation(ts, 'article', 'Article', 'txt.help_center.views.admin.manage_knowledge_base.table.article');
  addTranslation(ts, 'articles', 'Articles', 'txt.help_center.javascripts.arrange_content.articles');
  addTranslation(ts, 'categories', 'Categories', 'txt.help_center.javascripts.arrange_content.categories');
  addTranslation(ts, 'sections', 'Sections', 'txt.help_center.javascripts.arrange_content.sections');
  addTranslation(ts, 'tags', 'Tags');
  addTranslation(ts, 'search_by', 'Search by');
  addTranslation(ts, 'no_result', 'No result');
  addTranslation(ts, 'result', 'Result');
  addTranslation(ts, 'results', 'Results');
  addTranslation(ts, 'found_in', 'Found in');
  addTranslation(ts, 'search_by', 'Search by');
  addTranslation(ts, 'placeholder_autocomplete', 'Search in sections and articles');
  addTranslation(ts, 'placeholder_instantsearch', 'Search in articles');
}

export default loadTranslations;
