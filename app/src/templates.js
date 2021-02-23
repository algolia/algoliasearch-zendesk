import { h, Fragment } from 'preact';
import {
  highlightHit,
  snippetHit
} from '@algolia/autocomplete-js';

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

    // Algolia logo
    header: (translations, items) => <Fragment>
      <span className="aa-SourceHeaderTitle">Articles</span> { /* FIXME: translations */ }
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

    noResults: (translations, query) => <Fragment>
      <div className="aa-ItemContent">{translations.no_result_for(query)}</div>
    </Fragment>
  }
};

export default templates;