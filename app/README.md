# JavaScript library: `algoliasearchZendeskHC`

[![npm](https://img.shields.io/npm/v/algoliasearch.zendesk-hc.png)](https://www.npmjs.com/package/algoliasearch.zendesk-hc)

[![Dependency Status](https://david-dm.org/algolia/algoliasearch-zendesk.png?path=app)](https://david-dm.org/algolia/algoliasearch-zendesk?path=app) [![devDependency Status](https://david-dm.org/algolia/algoliasearch-zendesk/dev-status.png?path=app)](https://david-dm.org/algolia/algoliasearch-zendesk?path=app#info=devDependencies) [![peerDependency Status](https://david-dm.org/algolia/algoliasearch-zendesk/peer-status.png?path=app)](https://david-dm.org/algolia/algoliasearch-zendesk?path=app#info=peerDependencies)

[![GitHub license](https://img.shields.io/github/license/algolia/algoliasearch-zendesk.png)](../LICENSE)

This JavaScript library allows you to replace the default search of your Zendesk Help Center by Algolia. [Algolia](https://www.algolia.com) is a hosted full-text, numerical, and faceted search engine capable of delivering realtime results from the first keystroke.

## Documentation

### Synchronize Algolia with your Help Center

<div align="center">
  <img src="https://community.algolia.com/zendesk/img/algolia-zendesk.svg" alt="Data connection visualization" />
</div>

1. Create an [Algolia account](https://www.algolia.com/users/sign_up).
1. Follow the <a href="https://www.algolia.com/zendesk" rel="nofollow">Get Started</a> guide to connect your Zendesk Help Center with your Algolia account.

### Indexing

When you install our Zendesk integration, it creates what we call a connector in your Algolia account. You can access it with the left sidebar in your dashboard.

This connector will every day take your public Help Center articles and put them inside an Algolia index. In most cases, this should be enough to have an up-to-date search.

However, if you'd rather have it updated right now, like when you add a lot of support articles, you can manually trigger a full reindex. On this page, just click the "Reindex" button in the bottom right corner. A few minutes later, your search index will be updated.

### Updating your Help Center theme

Once your data has been extracted to Algolia, you need to update your Help Center theme in order to replace the search feature by Algolia.

- Open the **Document Head** template in the **Theme Editor**:
  1. Head to your Zendesk Help Center
  1. Click **General > Customize the design** in the top bar
  1. In the **Theme** section, click on **Edit theme**
  1. In the top left corner dropdown, select the **Document Head** template

<div align="center">
  <img src="https://res.cloudinary.com/hilnmyskv/image/upload/v1522421354/Onboarding--First-Gif_wsuvrs.gif" alt="Document Head opening GIF" />
</div>

- Copy the **JavaScript** snippet & **Publish** changes:
  1. Paste the code we provide you while connecting your Zendesk Help Center with Algolia at the end of the template.
  1. Click **Save** and ensure everything is working using the preview on the right
  1. Click **Publish Changes**

<div align="center">
  <img src="https://res.cloudinary.com/hilnmyskv/image/upload/v1522421175/Onboarding--Second-Gif_y0i5pe.gif" alt="Document Head editing GIF" />
</div>

&nbsp;

### Available options

Here is a full breakdown of the available options for the JavaScript library:

```html
<link
  rel="stylesheet"
  type="text/css"
  href="//cdn.jsdelivr.net/algoliasearch.zendesk-hc/3/algoliasearch.zendesk-hc.min.css"
/>
<script
  type="text/javascript"
  src="//cdn.jsdelivr.net/algoliasearch.zendesk-hc/3/algoliasearch.zendesk-hc.min.js"
></script>
<script type="text/javascript">
  algoliasearchZendeskHC({
    applicationId: '<YOUR APPLICATION_ID>',
    apiKey: '<YOUR SEARCH ONLY API KEY>',
    subdomain: '<YOUR ZENDESK APPLICATION NAME>',

    //
    // Optional configuration:
    //
    indexPrefix: 'zendesk_', // or your custom <INDEX_PREFIX>
    analytics: true, // should queries be processed by Algolia analytics
    baseUrl: '/hc/', // the base URL of your Help Center
    poweredBy: true, // show the "Search by Algolia" link (required if you're on Algolia's FREE plan)
    clickAnalytics: true, // whether or not to enable the clickAnalytics feature (available on the Enterprise plan)
    debug: false, // debug mode prevents the autocomplete to close when trying to inspect it
    color: '#158EC2', // main color (used for links)
    highlightColor: '#158EC2', // highlight color to emphasize matching text
    autocomplete: {
      enabled: true, // is the autocomplete feature enabled?
      inputSelector: '#query', // the DOM selector to select the search box
      hitsPerPage: 5, // the number of suggestions to display
    },
    // TODO: restore this
    // instantsearch: {
    //   enabled: true, // is the instantsearch feature enabled?
    //   hitsPerPage: 20, // the number of suggestions to display
    //   paginationSelector: '.pagination', // the DOM selector for the current pagination (to hide it)
    //   reuseAutocomplete: false, // do not add a search input for the instant-search page
    //   hideAutocomplete: true, // whether or not to hide the autocomplete on the instantsearch page (ignored if reuseAutocomplete is used)
    //   selector: '.search-results', // the DOM selector for the results container
    //   tagsLimit: 15, // maximum number of tags to display
    // },
    templates: {
      // template objects (see the templates section)
      autocomplete: {},
      // TODO: restore this
      // instantsearch: {},
    },
    translations: {}, // translation strings
  });
</script>
```

### Supporting multiple languages

#### Description

This library supports out of the box Help Centers with multiple languages.

1. The results sent to the user are always limited to the ones in the currently selected locale.

2. Some constant strings like the ones used in the sentence "12 results found in 1ms" need to be translated. The library already supports these locales:

   - **ar**: العربية / Arabic
   - **ar-eg**: العربية (مصر) / Arabic (Egypt)
   - **bg**: Български / Bulgarian
   - **cs**: Čeština / Czech
   - **da**: Dansk / Danish
   - **de**: Deutsch / German
   - **de-at**: Deutsch (Österreich) / German (Austria)
   - **de-ch**: Deutsch (Schweiz) / German (Switzerland)
   - **el**: Ελληνικά / Greek
   - **en-au**: English (Australia)
   - **en-ca**: English (Canada)
   - **en-gb**: English (Great Britain)
   - **en-ie**: English (Ireland)
   - **en-us**: English (United States)
   - **en-150**: English (Europe)
   - **es**: Español / Spanish
   - **es-es**: Español (España) / Spanish (Spain)
   - **es-mx**: Español (Mexico) / Spanish (Mexico)
   - **es-419**: Español (Latinoamérica) / Spanish (Latin America)
   - **fi**: Suomi / Finnish
   - **fr**: Français / French
   - **fr-be**: Français (Belgique) / French (Belgium)
   - **fr-ca**: Français (Canada) / French (Canada)
   - **fr-ch**: Français (Suisse) / French (Switzerland)
   - **fr-fr**: Français (France) / French (France)
   - **hu**: Magyar / Hungarian
   - **id**: Bahasa Indonesia / Indonesian
   - **it**: Italiano / Italian
   - **ja**: 日本語 / Japanese
   - **ko**: 한국어 / Korean
   - **nl**: Nederlands / Dutch
   - **nl-be**: Nederlands (België) / Dutch (Belgium)
   - **no**: Norsk / Norwegian
   - **pl**: Polski / Polish
   - **pt**: Português / Portuguese
   - **pt-br**: Português do Brasil / Brazilian Portuguese
   - **ro**: Română / Romanian
   - **ru**: Русский / Russian
   - **sk**: Slovenčina / Slovak
   - **sv**: Svenska / Swedish
   - **th**: ไทย / Thai
   - **tr**: Türkçe / Turkish
   - **uk**: Українська / Ukrainian
   - **vi**: Tiếng Việt / Vietnamese
   - **zh-cn**: 简体中文 / Simplified Chinese
   - **zh-tw**: 繁體中文 / Traditional Chinese

   If you want to support another locale, please help us by [opening an issue on GitHub][locale_issue].

<!--
  In browser console edition of this link:

  var body = encodeURIComponent("\u003C!\u2212\u2212\n  To improve the extension, we need your help!\n  We only need to know how to write a few sentences in the language you want us to add.\n  Can you help us translate them? :)\n\u2212\u2212\u003E\n\nTranslations:\n\n```txt\nSearch in our articles: \nSearch by Algolia: \nNo result found for \"xxx\": \n\"change your query\" or \"clear your filters\": \n1 result found in XXXms: \n2,000 results found in XXXms: \nCategories: \nTags (in the \"Labels\" meaning): \nFilter results: \n```\n\nIs there more than 1 plural form? [Yes/No]\nHow do you write big numbers? [20,000]");
  var title = encodeURIComponent("Missing locale: [en-us]")
  "https://github.com/algolia/algoliasearch-zendesk/issues/new?title=" + title + "&body=" + body
-->

[locale_issue]: https://github.com/algolia/algoliasearch-zendesk/issues/new?title=Missing%20locale%3A%20%5Ben-us%5D&body=%3C!%E2%88%92%E2%88%92%0A%20%20To%20improve%20the%20extension%2C%20we%20need%20your%20help!%0A%20%20We%20only%20need%20to%20know%20how%20to%20write%20a%20few%20sentences%20in%20the%20language%20you%20want%20us%20to%20add.%0A%20%20Can%20you%20help%20us%20translate%20them%3F%20%3A)%0A%E2%88%92%E2%88%92%3E%0A%0ATranslations%3A%0A%0A%60%60%60txt%0ASearch%20in%20our%20articles%3A%20%0ASearch%20by%20Algolia%3A%20%0ANo%20result%20found%20for%20%22xxx%22%3A%20%0A%22change%20your%20query%22%20or%20%22clear%20your%20filters%22%3A%20%0A1%20result%20found%20in%20XXXms%3A%20%0A2%2C000%20results%20found%20in%20XXXms%3A%20%0ACategories%3A%20%0ATags%20(in%20the%20%22Labels%22%20meaning)%3A%20%0AFilter%20results%3A%20%0A%60%60%60%0A%0AIs%20there%20more%20than%201%20plural%20form%3F%20%5BYes%2FNo%5D%0AHow%20do%20you%20write%20big%20numbers%3F%20%5B20%2C000%5D

#### Modifying translations

If some translations don't fit what you want, you can change them using this syntax:

```coffee
translations: {
  placeholder: {
    de: 'In unseren Help Center suchen',
    'en-us': 'Search in our Help Center',
    fr: 'Recherchez dans notre Help Center'
  }
}
```

For reference, here is the list of all the translations for the `en-us` locale:

```coffee
translations: {
  nbResults: {
    en: function (nb) {
      return `${formatNumber(nb)} result${nb > 1 ? 's' : ''}`;
    }
  },
  noResultsFor: {
    en: function (query) {
      return 'No result found for ' + this.quoted(query);
    }
  },
  placeholder: {
    en: 'Search in our articles'
  },
  searchByAlgolia: {
    en: function (algolia) { return 'Search by ' + algolia; }
  },
}
```

### Localized tags

You can index localized tags based on locales prefix (e.g. `en-us` or `en`). If we detect a locale, we'll only index localized tags for this translation. For instance, an article with those tags:

```coffee
[
  'Wow',
  'en:Awesome',
  'en-gb:Good',
  'fr:Incroyable'
]
```

For `fr` and `fr-*` locales, we'll index `{ "label_names": ["Incroyable"] }`. For `en-au`, `en-ca` and `en-us` locales, we'll index `{ "label_names": ["Awesome"] }`. For the `en-gb` locale, we'll index `{ "label_names": ["Good"] }`. For all the other locales, we'll index `{ "label_names": ["Wow"] }`.

### Zendesk Community search

We do not index community forums for now. If you're using them, you'll probably want to disable `instantsearch` by setting `enabled: false` and just use the auto-complete feature.

### Indexing private articles

Since we're providing a front-end search, and we can't securely know which access a user has in Zendesk's templates, we have to limit our indexing to public articles only. A public article is not a draft and is visible to Everybody. If you're in such a scenario, we recommend you to disable `instantsearch` by setting `enabled: false` and just use the auto-complete feature.

### Removing specific articles from the search results

You can let our script know that you'd want for an article not to be indexed. For this, all you need to do is to add an `algolia-ignore` tag on your article. After the next reindex, the article should not be searchable anymore.

### Excluding portions of article from indexing

To prevent certain specific portion of your article to be indexed to Algolia, you can wrap the html source code of these portion between `<!-- algolia-ignore --> <!-- /algolia-ignore -->` tags. This way, these portions of text won't be searchable.

Example:

```html
<h1>This is a test article</h1>
<!-- algolia-ignore -->
<p>This paragraph won't be indexed to Algolia.</p>
<!-- /algolia-ignore -->
<p>This paragraph will be indexed to Algolia.</p>
```

### Whitelisting our IPs

In case you're using Zendesk's [IP restrictions feature](https://support.zendesk.com/hc/en-us/articles/203663706-Restricting-access-to-Zendesk-Support-and-your-Help-Center-using-IP-restrictions), you'll need to whitelist our IPs for our indexing to work. Here are those IPs:

- `3.221.200.5`
- `52.204.20.39`
- `52.22.248.248`

## Development

The `package.json` holds multiple scripts:

- `clean`: Removes `dist/` and `node_modules/`
- `build`: Compiles the JS & CSS files to `dist/algoliasearch.zendesk-hc.{css,js}`
- `dev`: Launches `parcel`, and watches the files to rebuild them if needed
- `lint`: Lints the JS files
- `format`: Runs prettier

## Contributing

We're considering any contribution and PR, please go ahead!

## License

This project is under the [MIT License](../LICENSE).
