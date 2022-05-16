

const searchClient = algoliasearch('TEJIG1OP44', 'ceccf5707ee9c36062d2af126551aa8c');

const search = instantsearch({
  indexName: 'zendesk_d3v-algolia-peter_tickets',
  searchClient,
});

search.addWidgets([
  instantsearch.widgets.searchBox({
    container: '#searchbox',
  }),
  instantsearch.widgets.clearRefinements({
    container: '#clear-refinements',
  }),
  instantsearch.widgets.refinementList({
    container: '#brand-list',
    attribute: 'channel',
  }),
  instantsearch.widgets.hits({
    container: '#hits',
    templates: {
      item: `
        <div>
          <div class="hit-description">
            From: {{#helpers.highlight}}{ "attribute": "requester" }{{/helpers.highlight}} {{#helpers.highlight}}{ "attribute": "created_at" }{{/helpers.highlight}}
          </div>
          <div class="hit-name">
            {{#helpers.highlight}}{ "attribute": "subject" }{{/helpers.highlight}}
          </div>
          <div class="hit-description">
            {{#helpers.highlight}}{ "attribute": "description" }{{/helpers.highlight}}
          </div>
        </div>
      `,
    },
  }),
  instantsearch.widgets.pagination({
    container: '#pagination',
  }),
]);

search.start();
