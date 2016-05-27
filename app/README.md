# JavaScript library: `algoliasearchZendeskHC`

[![npm](https://img.shields.io/npm/v/algoliasearch.zendesk-hc.svg)](https://www.npmjs.com/package/algoliasearch.zendesk-hc)

[![Dependency Status](https://david-dm.org/algolia/algoliasearch-zendesk.svg?path=app)](https://david-dm.org/algolia/algoliasearch-zendesk?path=app)
[![devDependency Status](https://david-dm.org/algolia/algoliasearch-zendesk/dev-status.svg?path=app)](https://david-dm.org/algolia/algoliasearch-zendesk?path=app#info=devDependencies)
[![peerDependency Status](https://david-dm.org/algolia/algoliasearch-zendesk/peer-status.svg?path=app)](https://david-dm.org/algolia/algoliasearch-zendesk?path=app#info=peerDependencies)

[![GitHub license](https://img.shields.io/github/license/algolia/algoliasearch-zendesk.svg)](../LICENSE)

This JavaScript library allows you to replace the default search of your Zendesk Help Center by Algolia. [Algolia](https://www.algolia.com) is a hosted full-text, numerical, and faceted search engine capable of delivering realtime results from the first keystroke.

To browse through the crawler, visit the [crawler/](../crawler/) folder.

## Documentation

### Synchronize Algolia with your Help Center

<div align="center">
  <img src="https://community.algolia.com/zendesk/img/connection.png" alt="Data connection visualization" />
</div>

1. Create an [Algolia account](https://www.algolia.com/users/sign_up).
1. Follow the <a href="https://www.algolia.com/zendesk" rel="nofollow">Get Started</a> guide to connect your Zendesk Help Center with your Agolia account.

### Updating your Help Center theme

Once your data has been extracted to Algolia, you need to update your Help Center theme in order to replace the search feature by Algolia.

* Open the **Document Head** template in the **Theme Editor**:
  1. Head to your Zendesk Help Center
  1. Click **General > Customize the design** in the top bar
  1. In the **Theme** section, click on **Edit theme**
  1. In the top left corner dropdown, select the **Document Head** template

<div align="center">
  <img src="https://res.cloudinary.com/hilnmyskv/image/upload/w_800/v1462530610/zendesk-tutorial-v2_lww7ls.gif" alt="Document Head opening GIF" />
</div>

* Copy the **JavaScript** snippet & **Publish** changes:
  1. Paste the code we provide you while connecting your Zendesk Help Center with Algolia at the end of the template.
  1. Click **Save** and ensure everything is working using the preview on the right (if you have some small CSS issues, [read this part](#customizing-the-css))
  1. Click **Publish Changes**

<div align="center">
  <img src="https://res.cloudinary.com/hilnmyskv/image/upload/w_800/v1462207923/zendesk-preview_idcs7k.gif" alt="Document Head editing GIF" />
</div>

### Available options

Here is a full breakdown of the available options for the JavaScript library:

```html
<link rel="stylesheet" type="text/css" href="//cdn.jsdelivr.net/algoliasearch.zendesk-hc/2/algoliasearch.zendesk-hc.min.css">
<script type="text/javascript" src="//cdn.jsdelivr.net/algoliasearch.zendesk-hc/2/algoliasearch.zendesk-hc.min.js"></script>
<script type="text/javascript">
  algoliasearchZendeskHC({
    applicationId: '<YOUR APPLICATION_ID>',
    apiKey: '<YOUR SEARCH ONLY API KEY>',
    subdomain: '<YOUR ZENDESK APPLICATION NAME>',

    //
    // Optional configuration:
    //
    indexPrefix: 'zendesk_',    // or your custom <INDEX_PREFIX>
    baseUrl: '/hc/',            // the base URL of your Help Center
    poweredBy: true,            // show the "Search by Algolia" link (required if you're on Algolia's FREE plan)
    debug: false,               // debug mode prevents the autocomplete to close when trying to inspect it
    color: '#D4D4D4',           // main color (used for links)
    highlightColor: '#D4D4D4',  // highlight color to emphasize matching text
    responsive: true,           // responsive instantsearch page
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
      filter: 'Filter results',
      found_in: 'Found in',
      no_result: 'No result',
      placeholder_autocomplete: 'Search in sections and articles',
      placeholder_instantsearch: 'Search in articles',
      result: 'Result',
      results: 'Results',
      search_by: 'Search by',
      sections: 'Sections',
      tags: 'Tags'
    }
  });
</script>
```

### Customizing the CSS

It is definitely possible that, when you install the application, it doesn't exactly display as you expect.  
No worries, these are usually just a few conflicting rules between your design and our integration.

You might also just want to change the look & feel of the search.

Either way, just follow the following steps:

- Ensure you read the [SCSS source file](https://github.com/algolia/algoliasearch-zendesk/blob/master/app/css/index.scss) to see all the rules we're using
- Add a `<style>` tag after the `<link>` tag you've already added in your **Document Head** template and add your custom CSS here

**Example:**

```html
<link rel="stylesheet" type="text/css" href="//cdn.jsdelivr.net/algoliasearch.zendesk-hc/CURRENT_VERSION/algoliasearch.zendesk-hc.min.css">
<style>
  .aa-dropdown-menu {
    background-color: #ccc;
  }
</style>
<script type="text/javascript" src="//cdn.jsdelivr.net/algoliasearch.zendesk-hc/CURRENT_VERSION/algoliasearch.zendesk-hc.min.js"></script>
<script type="text/javascript">
  algoliasearchZendeskHC(/* ... */);
</script>
```

**Note:** You might have some trouble trying to customize the autocomplete menu because it automatically closes when you try to Inspect it.
Just set `debug: true` to avoid this behaviour.

### Supporting multiple languages

Out of the box, the library limits the results to the currently selected language.
However, some constant strings like the ones used in the sentence "12 results found in 1ms" need to be translated in your language. In order to do so, you need to use the `translations` parameter described in the documentation above.

If you're using only one language in your Help Center, just pass the strings of this specific language. For example, for French, you might want to pass:

```coffee
translations: {
  article: 'Article',
  articles: 'Articles',
  categories: 'Catégories',
  found_in: 'Trouvés en',
  no_result: 'Aucun résultat',
  placeholder_autocomplete: 'Rechercher dans les articles et sections',
  placeholder_instantsearch: 'Rechercher dans les articles',
  result: 'Résultat',
  results: 'Résultats',
  search_by: 'Recherche par',
  sections: 'Sections',
  tags: 'Tags'
}
```

If you want to support multiple languages though, you'll need to pass for each key an object using *locales* as key. The locale is `en-us` in `yoursupport.zendesk.com/hc/en-us`. For example, for English and French, you might want to pass:

```coffee
translations: {
  article: {
    'en-us': 'Article',
    'fr': 'Article'
  },
  articles: {
    'en-us': 'Articles',
    'fr': 'Articles'
  },
  categories: {
    'en-us': 'Categories',
    'fr': 'Catégories'
  },
  filter: {
    'en-us': 'Filter results',
    'fr': 'Filtrer les résultats'
  },
  found_in: {
    'en-us': 'Found in',
    'fr': 'Trouvés en'
  },
  no_result: {
    'en-us': 'No result',
    'fr': 'Aucun résultat'
  },
  placeholder_autocomplete: {
    'en-us': 'Search in articles and sections',
    'fr': 'Rechercher dans les articles et sections'
  },
  placeholder_instantsearch: {
    'en-us': 'Search in articles',
    'fr': 'Rechercher dans les articles'
  },
  result: {
    'en-us': 'Result',
    'fr': 'Résultat'
  },
  results: {
    'en-us': 'Results',
    'fr': 'Résultats'
  },
  search_by: {
    'en-us': 'Search by',
    'fr': 'Recherche par'
  },
  sections: {
    'en-us': 'Sections',
    'fr': 'Sections'
  },
  tags: {
    'en-us': 'Tags',
    'fr': 'Tags'
  }
}
```

### Zendesk Community search

We do not index community forums for now. If you're using them, you'll probably want to disable `instantsearch` by setting `enabled: false` and just provide the auto-complete feature on your home page.

## Development

The `package.json` holds multiple scripts:
- `build:css`: Compiles the CSS files to `dist/algoliasearch.zendesk-hc.css`
- `build:docs`: Extracts the documentation from this `README.md` to [`../docs/documentation.md`](../docs/documentation.md)
- `build:js`: Compiles the JS files to `dist/algoliasearch.zendesk-hc.js` and `dist-es5-module/*.js`
- `build`: Launches all 3 previous builds
- `clean`: Removes `dist/` and `dist-es5-module`
- `dev`: Launches `build` and `server`, and watches the files to rebuild them if needed
- `lint`: Lints the JS files
- `server`: Runs a simple HTTP server pointing to `dist/`
- `test:coverage`: Runs `test` with coverage enabled
- `test`: Runs the test suite

`build:js`, `build:css`, `build` and `dev` can be passed a `NODE_ENV` environment variable.  
If set to production, it also creates minified files and map files.

`server` accepts a `PORT` environment variable to change on which port it will run.

## Contributing

We're considering any contribution and PR, please go ahead!

## License

This project is under the [MIT License](../LICENSE).
