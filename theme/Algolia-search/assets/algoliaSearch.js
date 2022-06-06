
const setupSearch = function(appName, algoliaApiKey, index, useAutocomplete, querySuggestionIndex, useDebounce) {

    const searchClient = algoliasearch(appName, algoliaApiKey);
    
    // Initialize a Router
    // See https://www.algolia.com/doc/api-reference/widgets/history-router/js/
    const historyRouter = instantsearch.routers.history();

    const search = instantsearch({
      indexName: index,
      searchClient,
      routing: historyRouter,
    });

    const virtualSearchBox = instantsearch.connectors.connectSearchBox(() => {})({});
    const realSearchBox = instantsearch.widgets.searchBox({
      container: '#searchbox',
    });
    const searchBox = (useAutocomplete)? virtualSearchBox : realSearchBox;

    const truncate = (input) => input.length > 50 ? `${input.substring(0, 50)}...` : input;

    
    search.addWidgets([
      searchBox,
      instantsearch.widgets.hierarchicalMenu({
        container: '#category-list',
        attributes: ['category.title', 'section.full_path'],
      }),
      instantsearch.widgets.refinementList({
        container: '#section-list',
        attribute: 'section.title',
      }),
      instantsearch.widgets.hits({
        container: '#hits',
        templates: {
          item(hit) {
            let createdAt = moment(hit.created_at_iso).fromNow();
            let lastComment = '';
            const body = truncate(hit.body_safe);
            const urlLabel = hit.title.replace(/[\s,\?, \!]/g,'-');
            const url = '/hc/en-us/articles/' + hit.id + '-' + urlLabel;
            console.log(url);
            return `<div>
            <div class="hit-description">${createdAt} <span style="float:right;">${lastComment} votes ${hit.vote_sum}<span></div>
            <div class="hit-name"><a href="${url}" target="_blank">${hit.title}</a></div>
            <div class="hit-description">${body}</div>
            <div class="hit-description">${hit.label_names}</div>
          </div>`;
          }
        }
      }),
      instantsearch.widgets.pagination({
        container: '#pagination',
      }),
    ]);
    
    search.start();

    if ( useAutocomplete ) {
      const settings = {
        articleIndex: index,
        querySuggestionIndex: querySuggestionIndex,
        useDebounce: useDebounce
      }
      setupAutocomplete(settings, searchClient, search, historyRouter);
  }

}