# Algolia for Zendesk - Agent search

Integrate Algolia's intant-search capabilities to Zendesk today.
2 minutes of configuration and your agents will gain hours of
productivity.

### Some key-features:

* A __quick-search__ on top of your screen
* A full-results page with multiple criteria sorting
* Search as-you-type : results display at each letter you type
* Instant results : ~20ms to get your results
* Typo-tolerance
* Search in the comments of the tickets

Visit [Algolia](https://www.algolia.com/) for more information.

### Dev mode

To develop, you'll need to use the
[Zendesk App Tools (zat)](https://developer.zendesk.com/apps/docs/agent/tools).
To download it, just follow the instructions on
[this link](https://support.zendesk.com/hc/en-us/articles/203691236-Installing-and-using-the-Zendesk-apps-tools).

More information are present on the presentation link,
but here are some info to get you started.

#### Index data

First you'll need to have your data indexed. To do this, follow the
instructions of the Zendesk connector in `AlgoliaConnectors`.


#### Run everything locally

To run the server locally, you'll need to do

    zat server

Now, open your browser, and go to [http://{your-zendesk-subdomain}.zendesk.com/agent]
(http://subdomain.zendesk.com/agent). Once the page is loaded, add `?zat=true` to
the end of the url and load the page.  
You should now see a shield icon somewhere in your location bar. Click on it
and choose something like `Allow scripts`. The page will reload automatically.

Modifications made to any file are directly taken into account, no need
to reload the server but you'll need to reload your app in the zendesk page.
For this, no need to do a full refresh, just click on the icon in the top right
corner next to the algolia icon.

If you also want to run the iframe content locally, pull
the `demos` repository, navigate to the `zendesk-agent` folder
and run a basic server to serve static files, like `http-server`.
Then modify in `app.js` the `IFRAME_URL` to point to your
local webserver.

#### Packaging the app

To package the app into a zip uploadable to any zendesk account,
you'll just need to do

    zat package

If everything runs fine, your app will now be in `./tmp/*.zip`.
