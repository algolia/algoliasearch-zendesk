// eslint-disable-next-line no-unused-vars
import { h, Fragment } from 'preact';
import { highlightHit, snippetHit } from '@algolia/autocomplete-js';

import translate from './translations';

const templates = {
  autocomplete: {
    // Algolia logo
    poweredBy: (subdomain) => (
      <Fragment>
        <a
          className="aa-powered-by-link"
          href={`https://www.algolia.com/?utm_source=zendesk&utm_medium=link&utm_campaign=autocomplete-${subdomain}`}
        >
          Algolia
        </a>
      </Fragment>
    ),

    // eslint-disable-next-line no-unused-vars
    articlesHeader: (_translations, _locale, _items) => {
      return (
        <Fragment>
          <span className="aa-SourceHeaderTitle">
            {window?.I18N?.translations?.[
              'txt.help_center.javascripts.arrange_content.articles'
            ] || 'Articles'}
          </span>
          <div className="aa-SourceHeaderLine" />
        </Fragment>
      );
    },

    // eslint-disable-next-line no-unused-vars
    bestArticleHeader: (_translations, _locale, _items) => (
      <Fragment>        
        <span className="aa-SourceHeaderTitle">
          {window?.I18N?.translations?.[
            'txt.help_center.helpers.application.articles.promoted'
          ] || 'Best Article'}
        </span>
        <div className="aa-SourceHeaderLine" />
      </Fragment>
    ),

    // Autocompletion template for an article
    article: (hit) => (
      <Fragment>
        <div className="aa-ItemIcon aa-ItemIcon--align-top">
          <svg viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M17.586 7h-2.586v-2.586zM20.707 7.293l-6-6c-0.092-0.092-0.202-0.166-0.324-0.217s-0.253-0.076-0.383-0.076h-8c-0.828 0-1.58 0.337-2.121 0.879s-0.879 1.293-0.879 2.121v16c0 0.828 0.337 1.58 0.879 2.121s1.293 0.879 2.121 0.879h12c0.828 0 1.58-0.337 2.121-0.879s0.879-1.293 0.879-2.121v-12c0-0.276-0.112-0.526-0.293-0.707zM13 3v5c0 0.552 0.448 1 1 1h5v11c0 0.276-0.111 0.525-0.293 0.707s-0.431 0.293-0.707 0.293h-12c-0.276 0-0.525-0.111-0.707-0.293s-0.293-0.431-0.293-0.707v-16c0-0.276 0.111-0.525 0.293-0.707s0.431-0.293 0.707-0.293zM16 12h-8c-0.552 0-1 0.448-1 1s0.448 1 1 1h8c0.552 0 1-0.448 1-1s-0.448-1-1-1zM16 16h-8c-0.552 0-1 0.448-1 1s0.448 1 1 1h8c0.552 0 1-0.448 1-1s-0.448-1-1-1zM10 8h-2c-0.552 0-1 0.448-1 1s0.448 1 1 1h2c0.552 0 1-0.448 1-1s-0.448-1-1-1z"
            ></path>
          </svg>
        </div>
        <div className="aa-ItemContent aa-ItemContent--dual">
          <div className="aa-ItemContentTitle">
            {highlightHit({ hit, attribute: 'title' })}
          </div>
          <div className="aa-ItemContentSubtitle">
            {hit.category.title} &gt; {hit.section.title}
          </div>
          <div className="aa-ItemContentDescription">
            {snippetHit({ hit, attribute: 'body_safe' })}
          </div>
        </div>
      </Fragment>
    ),

    noResults: (translations, locale, query) => (
      <Fragment>
          {translate(translations, locale, 'noResultsFor', query)}
      </Fragment>
    ),
  },
};

export default templates;
