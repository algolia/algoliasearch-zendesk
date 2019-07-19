// Test this extension on an existing HC:

var css = document.createElement('link'); css.rel = 'stylesheet'; css.type = 'text/css'; css.href = 'https://cdn.jsdelivr.net/algoliasearch.zendesk-hc/2/algoliasearch.zendesk-hc.min.css';
var js = document.createElement('script'); js.type = 'text/javascript'; js.src = 'https://cdn.jsdelivr.net/algoliasearch.zendesk-hc/2/algoliasearch.zendesk-hc.min.js';
var lib = document.createElement('script'); lib.type = 'text/javascript'; lib.innerHTML = `
  setTimeout(() => {
    window.search = algoliasearchZendeskHC({
      applicationId: '',
      apiKey: '',
      subdomain: '',
      poweredBy: false,
      indexPrefix: 'zendesk_',
      autocomplete: {
        enabled: true, // is the autocomplete feature enabled?
        inputSelector: '#query', // the DOM selector to select the search box
        hitsPerPage: 5 // the number of suggestions to display
      }
    });
  }, 1000)
`;
document.head.appendChild(css); document.head.appendChild(js); document.head.appendChild(lib);
