import { throttle } from 'throttle-debounce';

function findAnswers(index, query, lang, params, callback) {
  index
    .findAnswers(query, [lang], {
      attributesForPrediction: ['title', 'category', 'section', 'body_safe'],
      threshold: 50,
      nbHits: 1,
      params: {
        ...params,
        highlightPreTag: '__aa-highlight__',
        highlightPostTag: '__/aa-highlight__',
      },
    })
    .then(callback)
    // eslint-disable-next-line no-console
    .catch(console.error);
}

export const debounceGetAnswers = throttle(400, false, findAnswers);
