import addCSS from './addCSS.js';
import toFactory from 'to-factory';
import AlgoliasearchZendeskHC from './AlgoliasearchZendeskHC.js';

addCSS(`
.search-results h1:first-child {
    display: none !important;
}
.search-results-column {
  display: none;
  visibility: hidden;
}`);

export default toFactory(AlgoliasearchZendeskHC);
