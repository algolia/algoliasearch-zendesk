function findAnswers(index, query, lang, callback) {
  index
    .findAnswers(query, [lang], {
      attributesForPrediction: ['section', 'category', 'title', 'body_safe'],
      threshold: 0,
      nbHits: 1,
      params: {
        typoTolerance: 'min',
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
