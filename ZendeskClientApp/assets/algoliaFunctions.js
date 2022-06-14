const client = ZAFClient.init();

const getSettings = async function() {
    const metadata = await client.metadata();
    return metadata.settings;
}

const getTicketDetails = async function() {
   const ticketDetails = await client.get('ticket');
   return ticketDetails;
}

const setupSearchWidgets = function(settings, search, sidebar) {
  const virtualSearchBox = instantsearch.connectors.connectSearchBox(() => {})({});
  const realSearchBox = instantsearch.widgets.searchBox({
    container: '#searchbox',
  });
  const searchBox = (!sidebar && settings.useAutocomplete)? virtualSearchBox : realSearchBox;
  const searchWidgets = [];
  const ticketWidgets = [];

  searchWidgets.push(searchBox);
  if ( !sidebar ) {
    searchWidgets.push( instantsearch.widgets.clearRefinements({
      container: '#clear-refinements',
    }));
  }

  if ( !sidebar && settings.articleFacet && settings.articleFacet.length > 0 ) {
    searchWidgets.push(instantsearch.widgets.refinementList({
      container: '#article-refinement',
      attribute: settings.articleFacet,
    }));
  };
  if ( settings.ticketFacet && settings.ticketFacet.length > 0 ) {
    if (sidebar) {
      ticketWidgets.push(instantsearch.widgets.menuSelect({
        container: '#ticket-refinement',
        attribute: settings.ticketFacet,
      }));
    } else {
      ticketWidgets.push(instantsearch.widgets.refinementList({
        container: '#ticket-refinement',
        attribute: settings.ticketFacet,
      }));
    }
  };

  searchWidgets.push(instantsearch.widgets.hits({
    container: '#hits',
    templates: {
      item(hit) {
        return articleHit(hit);
      }
    }
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

  searchWidgets.push(instantsearch.widgets
    .index({ indexName: settings.ticketIndex })
    .addWidgets(ticketWidgets));

  searchWidgets.push(instantsearch.widgets.pagination({
    container: '#pagination',
  }));

  search.addWidgets(searchWidgets);

  search.start();
}

function debounce(fn, time) {
    let timerId = undefined
  
    return function(...args) {
      if (timerId) {
        clearTimeout(timerId)
      }
  
      timerId = setTimeout(() => fn(...args), time)
    }
  }

const truncate = (input) => input.length > 50 ? `${input.substring(0, 50)}...` : input;

const commentsSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" focusable="false" viewBox="0 0 12 12">
<path fill="none" stroke="currentColor" d="M1 .5h10c.3 0 .5.2.5.5v7c0 .3-.2.5-.5.5H6l-2.6 2.6c-.3.3-.9.1-.9-.4V8.5H1C.7 8.5.5 8.3.5 8V1C.5.7.7.5 1 .5z"></path>
</svg>`;

const articleHit = (hit) => {
  let createdAt = moment(hit.created_at_iso).fromNow();

  return `<div id="hit-component">
  <div>${hit.section.full_path} ${createdAt}</div>
  <div id="hit-component-subject">
    <a href="https://d3v-algolia-peter.zendesk.com/hc/en-us/articles/${hit.id}" target="_blank">
      <h3 class="ticket-title">${hit.title}</h3>
    </a>
  </div>
  <div id="hit-component-description">
    <p id="description" class="truncate"> ${hit.body_safe}</p>
  </div>
  <div class="btn-place-holder">
        <button id="toggle-expand-ticket" onclick="expandToggle(this)">${expandToggleIcon}</button>
      </div>
  </div>`;
}

// eslint-disable-next-line no-unused-vars
function expandToggle(element) {
  const descriptionElement = element.parentElement.parentElement.querySelector(
    '#description'
  );
  const expandBtn = element;
  expandBtn.classList.toggle('rotateicon180');
  descriptionElement.classList.toggle('expanded-truncate');
}


const expandToggleIcon = `
<svg id="Component_23_1" data-name="Component 23 – 1" xmlns="http://www.w3.org/2000/svg" width="10" height="13" viewBox="0 0 10 13">
<rect id="Rectangle_1" data-name="Rectangle 1" width="4.308" height="7.818" transform="translate(2.832)" fill="#3f51b5"/>
<path id="Polygon_1" data-name="Polygon 1" d="M5,0l5,7H0Z" transform="translate(10 13) rotate(180)" fill="#3f51b5"/>
</svg>
`;

const ticketHit = (hit) => {
  
  return `<div id="hit-component">
  <div id="hit-component-subject">
    <a href="${hit.ticketUrl}" target="_blank">
      <h3 class="ticket-title">${hit.subject}</h3>
    </a>
  </div>
  <div id="hit-component-description">
    <p id="description" class="truncate"> ${hit.plain_body}</p>
  </div>
  <div class="btn-place-holder">
        <button id="toggle-expand-ticket" onclick="expandToggle(this)">${expandToggleIcon}</button>
      </div>
  </div>`;

}




