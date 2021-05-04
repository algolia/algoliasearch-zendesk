import { throttle } from 'throttle-debounce';

const findAnswers = (index, query, lang, params, callback) =>
  index
    .findAnswers(query, [lang], {
      attributesForPrediction: ['body_safe'],
      threshold: 50,
      nbHits: 1,
      // eslint-disable-next-line camelcase
      EXPERIMENTAL_illuminate: 1,
      // eslint-disable-next-line camelcase
      EXPERIMENTAL_overwriteSnippetSize: 30,
      // eslint-disable-next-line camelcase
      EXPERIMENTAL_overwriteHitsPerPage: 20,
      params: {
        ...params,
        restrictSearchableAttributes: ['title', 'body_safe'],
        highlightPreTag: '__aa-highlight__',
        highlightPostTag: '__/aa-highlight__',
      },
    })
    .then(callback)
    // eslint-disable-next-line no-console
    .catch(console.error);

export const debounceGetAnswers = throttle(400, false, findAnswers);
