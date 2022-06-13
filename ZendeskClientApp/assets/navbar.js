

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

    setupSearchWidgets(settings, search, false);

    if ( settings.useAutocomplete ) {
        setupAutocomplete(settings, searchClient, search, historyRouter);
    }
}

setupSearch();


