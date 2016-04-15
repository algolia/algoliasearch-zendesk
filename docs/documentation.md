---
layout: page
title: Documentation
class: documentation
permalink: /documentation/
---


**Note:** You need to have an Algolia account. Please [login](https://www.algolia.com/users/sign_in) or [sign-up](https://www.algolia.com/users/sign_up) first.
{: .alert.alert-info}

## Synchronize Algolia with your Help Center

1. Visit the [Algolia for Zendesk](https://community.algolia.com/zendesk/) home page
1. Enter your zendesk subdomain (`your_subdomain` in `your_subdomain.zendesk.com`) and click `Join the Beta`
1. When Zendesk asks you to approve Algolia in your Zendesk instance, click `Allow`
1. Starting from that point, the content of your Help Center will be synchronized with Algolia's indices.

## Updating your Help Center theme

Once your data has been extracted to Algolia, you need to update your Help Center theme in order to replace the search feature by Algolia.

1. Copy the code displayed on the **Zendesk Connector** page in your Algolia account
2. Go to your Zendesk Help Center
3. Click **General > Customize the design** in the top bar
4. In the **Theme** section, click on "Edit theme"
5. In the top left corner dropdown, select the **Document Head** template
6. Copy/Paste the lines you copied before at the end of the template
7. Save and ensure everything is working
8. Click **Publish Theme**

## Available options

Here is a full breakdown of the available options for the JavaScript library:

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
    indexPrefix: 'zendesk_',    // or your custom <INDEX_PREFIX>
    baseUrl: '/hc/',            // the base URL of your Help Center
    poweredBy: true,            // show the "Search by Algolia" link (required if you're on Algolia's FREE plan)
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

## Customizing the CSS

If you want to customize the look & feel of the search, you can follow the following steps:

- Ensure you read the [SCSS source file](https://github.com/algolia/algoliasearch-zendesk/blob/master/app/css/index.scss) to see all the rules we're using
- Add a `<style>` tag after the `<link>` tag you've already added in your **Document Head** template
  We ask you to do this because the CSS code in the customization panel is included __before__ the **Document Head** template


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

## Supporting multiple languages

Out of the box, the library limits the results to the currently selected language.
However, some constant strings like the ones used in the sentence "12 results found in 1ms" need to be translated in your language. In order to do so, you need to use the `translations` parameter described in the documentation above.

If you're using only one language in your Help Center, just pass the strings of this specific language. For example, for French, you might want to pass:

```js
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

```js
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

## Zendesk Community search

We do not index community forums for now. If you're using them, you'll probably want to disable `instantsearch` by setting `enabled: false` and just provide the auto-complete feature on your home page.
