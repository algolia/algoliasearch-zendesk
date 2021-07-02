import { throttle } from 'throttle-debounce';
import { AlgoliaSearchOptions, SearchIndex } from 'algoliasearch/lite';
import { FindAnswersOptions } from '@algolia/client-search';
interface FindAnswersParams {
  index: SearchIndex;
  query: string;
  lang: string;
  searchParams: AlgoliaSearchOptions;
  callback: () => void;
  autocomplete: Boolean;
  answerParams: FindAnswersOptions & {
    EXPERIMENTAL_illuminate?: number; // eslint-disable-line camelcase
    EXPERIMENTAL_overwriteSnippetSize?: number; // eslint-disable-line camelcase
    EXPERIMENTAL_overwriteHitsPerPage?: number; // eslint-disable-line camelcase
  };
}

const findAnswers = ({
  index,
  query,
  lang,
  searchParams,
  callback,
  autocomplete,
  answerParams,
}: FindAnswersParams): Promise<void> =>
  index
    .findAnswers(query, [lang], {
      attributesForPrediction: ['body_safe'],
      threshold: 50,
      nbHits: 1,
      // eslint-disable-next-line camelcase
      EXPERIMENTAL_illuminate: 1,
      // eslint-disable-next-line camelcase
      EXPERIMENTAL_overwriteSnippetSize: autocomplete ? 30 : null,
      // eslint-disable-next-line camelcase
      EXPERIMENTAL_overwriteHitsPerPage: autocomplete ? 20 : null,
      params: {
        ...searchParams,
        optionalWords: query,
        restrictSearchableAttributes: ['title', 'body_safe'],
        highlightPreTag: autocomplete ? '__aa-highlight__' : '<mark>',
        highlightPostTag: autocomplete ? '__/aa-highlight__' : '</mark>',
      },
      ...answerParams,
    })
    .then(callback)
    // eslint-disable-next-line no-console
    .catch(console.error);

export const debounceGetAnswers = throttle(400, false, findAnswers);
