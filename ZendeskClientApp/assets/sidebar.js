

const setupSearch = async function() {

    const settings = await getSettings();
    const match = settings.matchingField;
    const ticketDetails = await getTicketDetails();
    let query = '';
    if ( match == 'tags') {
      query = ticketDetails.ticket.tags.join(' ');
    }
    if ( match == 'subject') {
      query = ticketDetails.ticket.subject;
    }
    const searchClient = algoliasearch(settings.algoliaAppName, settings.searchApiKey);
    
    const search = instantsearch({
      indexName: settings.articleIndex,
      searchClient,
      initialUiState: {
        [settings.articleIndex]: {
          query: `${query}`
        },
        [settings.ticketIndex]: {
          query: `${query}`
        }
      }
    });

    setupSearchWidgets(settings, search, true);

}

setupSearch();


