This JavaScript library allows you to replace the default search of your Zendesk Help Center by Algolia. [Algolia](https://www.algolia.com) is a hosted full-text, numerical, and faceted search engine capable of delivering realtime results from the first keystroke.

We'll crawl your Zendesk API to extract your Help Center content and provide you a small code snippet to power your search with Algolia.

## Documentation

To be able to setup your new search on your Zendesk Help Center you'll need to have an Algolia account with a configured Zendesk Help Center crawler.

### Synchronize Algolia with your Help Center data

1. [Login](https://www.algolia.com/users/sign_in) or [sign-up](https://www.algolia.com/users/sign_up) on Algolia
2. Visit our [Zendesk community page](https://www.community.algolia.com/zendesk/) and click `Join the beta`
3. Enter your zendesk subdomain (`your_subdomain` in `your_subdomain.zendesk.com`)
4. When Zendesk asks you to approve Algolia in your Zendesk instance, click `Allow`
5. That's it! Algolia now automatically handles the indexing of your Help Center

### Updating your Help Center theme

Once your data has been extracted to Algolia, you need to update your Help Center theme in order to replace the search feature by Algolia.

 * Click "Customize the design"
 * Select the "Document Head" template and add the following lines:

```html
<link rel="stylesheet" type="text/css" href="//cdn.jsdelivr.net/algoliasearch.zendesk-hc/1/algoliasearch.zendesk-hc.min.css">
<script type="text/javascript" src="//cdn.jsdelivr.net/algoliasearch.zendesk-hc/1/algoliasearch.zendesk-hc.min.js"></script>
<script type="text/javascript">
  algoliasearchZendeskHC({
    applicationId: '<YOUR APPLICATION_ID>',
    apiKey: '<YOUR SEARCH ONLY API KEY>',
    subdomain: '<YOUR ZENDESK APPLICATION NAME>',

    //
    // Optional configuration:
    //
    indexPrefix: 'zendesk_',    // or you custom <INDEX_PREFIX>
    baseUrl: '/hc/',            // the base URL of your Help Center
    poweredBy: true,            // show the poweredBy link (requirement of Algolia's free plan)
    colors: {
      primary: '#D4D4D4',       // the primary color
      secondary: '#D4D4D4'      // the secondary color
    },
    autocomplete: {
      enabled: true,            // is the autocomplete feature enabled?
      inputSelector: '#query',  // the DOM selector to select the search box
      hits: 5                   // the number of suggestions to display
    },
    instantsearch: {
      enabled: true,
      tagsLimit: 15             // Maximum number of tags to display
    },
    translations: {             // These accept strings or objects associating locale with value
                                // e.g. {
                                //   found_in: {
                                //     'en-us': 'Found in',
                                //     'fr': 'En'
                                //   }
                                // }
      article: 'Article',
      articles: 'Articles',
      categories: 'Categories',
      sections: 'Sections',
      tags: 'Tags',
      search_by: 'Search by',
      no_result: 'No result',
      result: 'Result',
      results: 'Results',
      found_in: 'Found in',
      search_by: 'Search by',
      placeholder_autocomplete: 'Search in sections and articles',
      placeholder_instantsearch: 'Search in articles'
    }
  });
</script>
```

## License

This library is [MIT licensed](https://github.com/algolia/algoliasearch-zendesk/blob/master/LICENSE).

## Contributing

We're considering any contribution and PR, please go ahead!
