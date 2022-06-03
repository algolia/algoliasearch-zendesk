

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
    search.addWidgets([
      instantsearch.widgets.searchBox({
        container: '#searchbox',
        placeholder: 'Search Articles',
        showLoadingIndicator: true
      }),
      instantsearch.widgets.hits({
        container: '#hits',
        templates: {
          item(hit) {
            return articleHit(hit);
          }
        },
      }),
      instantsearch.widgets
        .index({ indexName: settings.ticketIndex })
        .addWidgets([
        instantsearch.widgets.configure({
          hitsPerPage: 16,
        }),
        instantsearch.widgets.hits({
          container: '#ticket-hits',
          placeholder: 'Search Tickets',
          templates: {
            item(hit) {
              return ticketHit(hit)
            }
          },
        }),
      ]),
      instantsearch.widgets.pagination({
        container: '#pagination',
      }),
    ]);
    
    search.start();
}

setupSearch();


