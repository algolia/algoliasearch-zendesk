import { version } from '../package.json';
import algoliasearch from 'algoliasearch/lite';
import { highlight, snippet } from 'instantsearch.js/es/helpers';
import './ticketform.css';
// eslint-disable-next-line no-unused-vars
import { render, h, Fragment } from 'preact';
import { useState } from 'preact/hooks';
import translate from './translations';

import { debounceGetAnswers } from './answers';
import { initInsights, extendWithConversionTracking } from './clickAnalytics';

class TicketForm {
  constructor({
    applicationId,
    apiKey,
    ticketForms: { enabled },
    indexPrefix,
    subdomain,
    clickAnalytics,
  }) {
    if (!enabled) return;
    this.client = algoliasearch(applicationId, apiKey);
    this.client.addAlgoliaAgent(`Zendesk Integration (${version})`);
    this.indexName = `${indexPrefix}${subdomain}_articles`;

    if (clickAnalytics) {
      initInsights({ applicationId, apiKey });
      extendWithConversionTracking(this, {
        clickAnalytics,
        indexName: this.indexName,
      });
    }
  }

  init({
    baseUrl,
    clickAnalytics,
    locale,
    translations,
    ticketForms: {
      enabled,
      inputSelector,
      suggestionsListSelector,
      descriptionSelector,
      answersParameters,
      requireSubject,
      cssClasses: {
        descriptionGroup,
        disabledDescriptionGroup,
        descriptionWarning,
        suggestionsList,
      },
    },
  }) {
    if (!enabled) return;

    // eslint-disable-next-line consistent-this
    const self = this;

    if (requireSubject) {
      self.descriptionElement = document.querySelector(descriptionSelector);
      self.descriptionElement.classList.add(descriptionGroup);
      self.descriptionElement.classList.add(disabledDescriptionGroup);
      const warning = document.createElement('span');
      warning.classList.add(descriptionWarning);
      warning.textContent = translate(translations, locale, 'descriptionLock');
      self.descriptionElement.append(warning);
    }

    document
      .querySelector(suggestionsListSelector)
      .setAttribute('style', 'display: none!important');

    const lang = locale.split('-')[0];
    const buildUrl = (hit) => `${baseUrl}${locale}/articles/${hit.id}`;

    const Input = () => {
      const [subject, setSubject] = useState('');
      const [answers, setAnswers] = useState([]);

      const handleSubject = (e) => {
        setSubject(e.target.value);
        debounceGetAnswers({
          index: self.client.initIndex(self.indexName),
          query: e.target.value,
          lang,
          params: {
            facetFilters: `["locale.locale:${locale}"]`,
            clickAnalytics,
            ...answersParameters,
          },
          callback: ({ hits, queryID }) => {
            setAnswers(
              hits.map((hit, i) => {
                if (hit._answer.extractAttribute === 'body_safe') {
                  hit._snippetResult.body_safe.value = hit._answer.extract;
                }
                hit.__position = i + 1;
                hit.__queryID = queryID;
                hit.url = buildUrl(hit);
                return hit;
              })
            );
            if (requireSubject) {
              self.descriptionElement.classList.remove(
                disabledDescriptionGroup
              );
            }
          },
          autocomplete: false,
        });
      };

      const onClick = (e, item) => {
        e.preventDefault();
        self.trackClick(item, item.__position, item.__queryID);
        window.location = e.target.href;
      };

      return (
        <Fragment>
          <input
            type="text"
            name="request[subject]"
            id="request_subject"
            maxlength="150"
            size="150"
            aria-required="true"
            aria-labelledby="request_subject_label"
            value={subject}
            onInput={handleSubject}
          />
          {answers.length ? (
            <div className="suggestion-list">
              <div className="searchbox">
                <label>{translate(translations, locale, 'bestAnswer')}</label>
                <div className="searchbox-suggestions">
                  <ul className={suggestionsList}>
                    {answers.map((hit) => (
                      <li key={hit.id}>
                        <h4>
                          <a
                            href={hit.url}
                            onClick={(e) => {
                              onClick(e, hit);
                            }}
                            dangerouslySetInnerHTML={{
                              __html: highlight({
                                attribute: 'title',
                                hit,
                                highlightedTagName: 'strong',
                              }),
                            }}
                          />
                        </h4>
                        <p
                          dangerouslySetInnerHTML={{
                            __html: snippet({
                              attribute: 'body_safe',
                              hit,
                              highlightedTagName: 'strong',
                            }),
                          }}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : null}
        </Fragment>
      );
    };

    render(
      h(Input),
      document.querySelector(inputSelector).parentNode,
      document.querySelector(inputSelector)
    );
  }
}
export default (...args) => new TicketForm(...args);
