## Development

The `package.json` holds multiple scripts:
- `build:css`: Compiles the CSS files to `dist/algoliasearch.zendesk-hc.css`
- `build:docs`: Extracts the documentation from this `README.md` to [`../docs/documentation.md`](../docs/documentation.md)
- `build:js`: Compiles the JS files to `dist/algoliasearch.zendesk-hc.js` and `dist-es5-module/*.js`
- `build`: Launches all 3 previous builds commands
- `clean`: Removes `dist/` and `dist-es5-module`
- `dev`: Launches `build` and `server`, and watches the files to rebuild them if needed
- `lint`: Lints the JS files
- `server`: Runs a simple HTTP server pointing to `dist/`
- `test:coverage`: Runs `test` with coverage enabled
- `test`: Runs the test suite

`build:js`, `build:css`, `build` and `dev` can be passed a `NODE_ENV` environment variable.
If set to production, it also creates minified files and map files.

`server` accepts a `PORT` environment variable to change on which port it will run.

### Example

```sh
$ PORT=3005 npm run dev

> algoliasearch.zendesk-hc@2.22.3 dev /Users/jerska/algolia/zendesk/app
> gulp dev

[13:59:53] Failed to load external module @babel/register
[13:59:53] Requiring external module babel-register
[13:59:56] Using gulpfile ~/algolia/zendesk/app/gulpfile.babel.js
[13:59:56] Starting 'build:js:watch'...
[13:59:56] Environment for 'build:js': NODE_ENV=development
[13:59:56] Starting 'build:css'...
[13:59:56] Environment for 'build:css': NODE_ENV=development
[13:59:56] Starting 'build:css:watcher'...
[13:59:56] Finished 'build:css:watcher' after 8.64 ms
[13:59:56] Starting 'build:docs'...
[13:59:56] Starting 'build:docs:watcher'...
[13:59:56] Finished 'build:docs:watcher' after 1.11 ms
[13:59:56] Starting 'server'...
[13:59:56] Finished 'server' after 42 ms
[13:59:56] Server started http://localhost:3005
[13:59:56] Finished 'build:docs' after 66 ms
[13:59:56] Starting 'build:docs:watch'...
[13:59:56] Finished 'build:docs:watch' after 40 μs
[13:59:56] Finished 'build:css' after 109 ms
[13:59:56] Starting 'build:css:watch'...
[13:59:56] Finished 'build:css:watch' after 3.4 μs
[14:00:00] Finished 'build:js:watch' after 4.05 s
[14:00:00] Starting 'dev'...
[14:00:00] Finished 'dev' after 2.68 μs
```

When running, you can then add this custom script to your Help Center, inside the Document Head template:

```html
<link rel="stylesheet" type="text/css" href="http://localhost:3005/dist/algoliasearch.zendesk-hc.css">
<script type="text/javascript" src="http://localhost:3005/dist/algoliasearch.zendesk-hc.js"></script>
<script type="text/javascript">
  algoliasearchZendeskHC({
    applicationId: 'FIXME',
    apiKey: 'FIXME',
    subdomain: 'FIXME',
    indexName: 'FIXME',
  })
</script>
```

This might however not load, due to trying to load HTTP content on an HTTPS site.
Some browsers will prevent the connection and print warnings in your browser console.  
In this case, you'll need to authorize insecure loading.
This will most often be hidden behind a shield icon or the green lock icon in your location bar.  
For instance, on Firefox: click the lock icon in the location bar > Right arrow with label "Show connection details" > Disable protection for now

### Bundling note: `algoliasearch/lite`

Both `app/src/autocomplete.js` and `app/src/instantsearch.js` import the search-only [lite client](https://www.npmjs.com/package/algoliasearch) from `algoliasearch/lite`.

[`algoliasearch`](https://github.com/algolia/algoliasearch-client-javascript) ships per-environment builds via the package.json `exports` field (a Node build that uses `node:zlib`, a browser UMD build that doesn't).
Our [Browserify](https://browserify.org/) version pre-dates `exports` support, so it falls back to the package's `lite.js` shim which always points at the Node build. That pulls in `browserify-zlib` and adds ~1.2 MB to the bundle for no runtime benefit.

To work around it, the `browser` field in `package.json` aliases `algoliasearch/lite` to the self-contained UMD browser build:
```json
"browser": {
  "algoliasearch/lite": "./node_modules/algoliasearch/dist/lite/builds/browser.umd.js"
}
```

To measure the bundle:
```sh
npm run build:js
du -h dist/algoliasearch.zendesk-hc.js
```
