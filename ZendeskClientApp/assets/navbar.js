
const setupSearch = async function() {

    const settings = await getSettings();

    // Initialize a Router
    // See https://www.algolia.com/doc/api-reference/widgets/history-router/js/
    const historyRouter = instantsearch.routers.history();

    
    const searchClient = algoliasearch(settings.algoliaAppName, settings.searchApiKey);

    const search = instantsearch({
      indexName: settings.articleIndex,
      searchClient,
      routing: historyRouter,
    });

    const virtualSearchBox = instantsearch.connectors.connectSearchBox(() => {})({});
    const realSearchBox = instantsearch.widgets.searchBox({
      container: '#searchbox',
    });
    const searchBox = (settings.useAutocomplete)? virtualSearchBox : realSearchBox;
    
    search.addWidgets([
      searchBox,
      instantsearch.widgets.clearRefinements({
        container: '#clear-refinements',
      }),
      instantsearch.widgets.refinementList({
        container: '#category-list',
        attribute: 'category',
      }),
      instantsearch.widgets.refinementList({
        container: '#section-list',
        attribute: 'section',
      }),
      instantsearch.widgets.hits({
        container: '#hits',
        templates: {
          item(hit) {
            return itemHit(hit);
          }
        }
      }),
      instantsearch.widgets.pagination({
        container: '#pagination',
      }),
    ]);

    search.start();

    if ( settings.useAutocomplete ) {
        setupAutocomplete(settings, searchClient, search, historyRouter);
    }
}

setupSearch();


