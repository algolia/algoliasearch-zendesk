

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
    const searchBox = instantsearch.widgets.searchBox({
      container: '#searchbox',
      placeholder: 'Search Articles',
      showLoadingIndicator: true
    });
    const hits = instantsearch.widgets.hits({
      container: '#hits',
      templates: {
        item(hit) {
          return articleHit(hit);
        }
      },
    });
    const ticketWidgets = [];
    ticketWidgets.push(instantsearch.widgets.configure({
      hitsPerPage: 16,
    }));
    ticketWidgets.push(instantsearch.widgets.hits({
      container: '#ticket-hits',
      placeholder: 'Search Tickets',
      templates: {
        item(hit) {
          return ticketHit(hit)
        }
      },
    }));
    if ( settings.menuSelect && settings.menuSelect.length > 0 ) {
      ticketWidgets.push(instantsearch.widgets.menuSelect({
        container: '#menu-select',
        attribute: settings.menuSelect,
      }));
    };
    const ticketIndexSearch = instantsearch.widgets
    .index({ indexName: settings.ticketIndex })
    .addWidgets(ticketWidgets);
    const pagination = instantsearch.widgets.pagination({
      container: '#pagination',
    });

    search.addWidgets([searchBox, hits, ticketIndexSearch, pagination]);
    
    search.start();
}

setupSearch();


