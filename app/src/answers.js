function findAnswers(index, query, lang, callback) {
  index.findAnswers(query, [lang], {
    attributesForPrediction: ["section", "category", "title", "body_safe"],
    threshold: 0,
    nbHits: 1,
    params: {
      typoTolerance: "min",
      highlightPreTag: "__aa-highlight__",
      highlightPostTag: "__/aa-highlight__"
    }
  }).then(result => callback(result))
  .catch(console.error);
}

function debounce(fn, time) {
  var timerId = undefined;
  return function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i];
    }
    if (timerId) {
      clearTimeout(timerId);
    }
    timerId = setTimeout(function () {
      return fn.apply(void 0, args);
    }, time);
  };
}

export const debounceGetAnswers = debounce(findAnswers, 400);
