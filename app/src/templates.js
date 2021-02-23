import { h, Fragment } from 'preact';
import {
  highlightHit,
  snippetHit
} from '@algolia/autocomplete-js';

import translate from './translations.js';

const templates = {
  autocomplete: {
    // Algolia logo
    poweredBy: subdomain => <Fragment>
      <a className="aa-powered-by-link"
        href={`https://www.algolia.com/?utm_source=zendesk&utm_medium=link&utm_campaign=autocomplete-${subdomain}`}
      >
        Algolia
      </a>
    </Fragment>,

    articlesHeader: (translations, locale, items) => <Fragment>
      <span className="aa-SourceHeaderTitle">{window?.I18N?.translations?.['txt.help_center.javascripts.arrange_content.articles'] || 'Articles'}</span>
      <div className="aa-SourceHeaderLine" />
    </Fragment>,

    bestArticleHeader: (translations, locale, items) => <Fragment>
      <span className="aa-SourceHeaderTitle">{window?.I18N?.translations?.['txt.help_center.helpers.application.articles.promoted'] || 'Best Article'}</span>
      <div className="aa-SourceHeaderLine" />
    </Fragment>,

    // Autocompletion template for an article
    article: hit => (<Fragment>
      <div className="aa-ItemContent">
        <div className="aa-ItemContentTitle">
          {highlightHit({hit, attribute: 'title'})}          
        </div>
        <br />
        <div className="aa-ItemContentSubtitle">
          { hit.category.title } &gt; { hit.section.title }
        </div>
        <div className="aa-ItemContentDescription">
          {snippetHit({hit, attribute: 'body_safe'})}
        </div>
      </div>
    </Fragment>),

    noResults: (translations, locale, query) => <Fragment>
      <div className="aa-ItemContent">{translate(translations, locale, 'noResultsFor', query)}</div>
    </Fragment>
  }
};

export default templates;