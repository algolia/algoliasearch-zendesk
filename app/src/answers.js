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

function debounce(fn, time) {
  let timerId = undefined;
  return function (...args) {
    if (timerId) {
      clearTimeout(timerId);
    }
    timerId = setTimeout(function () {
      // eslint-disable-next-line prefer-spread
      return fn.apply(null, args);
    }, time);
  };
}

export const debounceGetAnswers = debounce(findAnswers, 400);
