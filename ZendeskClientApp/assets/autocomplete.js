function setupAutocomplete(settings, searchClient, search, historyRouter) {
    
    function setInstantSearchUiState(indexUiState) {
        search.setUiState(uiState => ({
          ...uiState,
          [settings.articleIndex]: {
            ...uiState[settings.articleIndex],
            // We reset the page when the search state changes.
            page: 1,
            ...indexUiState,
          },
        }));
      }
      
      // Return the InstantSearch index UI state.
      function getInstantSearchUiState() {
        const uiState = historyRouter.read()
      
        return (uiState && uiState[settings.articleIndex]) || {}
      }
    
      // Build URLs that InstantSearch understands.
      function getInstantSearchUrl(indexUiState) {
        return search.createURL({ [settings.articleIndex]: indexUiState });
      }
    
      // Detect when an event is modified with a special key to let the browser
      // trigger its default behavior.
      function isModifierEvent(event) {
        const isMiddleClick = event.button === 1;
    
        return (
          isMiddleClick ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey
        );
      }
    
      function onSelect({ setIsOpen, setQuery, event, query }) {
        // You want to trigger the default browser behavior if the event is modified.
        if (isModifierEvent(event)) {
          return;
        }
    
        setQuery(query);
        setIsOpen(false);
        setInstantSearchUiState({ query });
      }
    
      function getItemUrl({ query }) {
        return getInstantSearchUrl({ query });
      }
    
      function createItemWrapperTemplate({ query, children, html}) {
        const uiState = { query };
        return html`<a
          class="aa-ItemLink"
          href="${getInstantSearchUrl(uiState)}"
          onClick="${(event) => {
            if (!isModifierEvent(event)) {
              // Bypass the original link behavior if there's no event modifier
              // to set the InstantSearch UI state without reloading the page.
              event.preventDefault();
            }
          }}"
        >
          ${children}
        </a>`;
      }
    
      const recentSearchesPlugin = createLocalStorageRecentSearchesPlugin({
        key: 'instantsearch',
        limit: 3,
        transformSource({ source }) {
          return {
            ...source,
            getItemUrl({ item }) {
              return getItemUrl({
                query: item.label,
              });
            },
            onSelect({ setIsOpen, setQuery, item, event }) {
              onSelect({
                setQuery,
                setIsOpen,
                event,
                query: item.label,
              });
            },
            // Update the default `item` template to wrap it with a link
            // and plug it to the InstantSearch router.
            templates: {
              ...source.templates,
              item(params) {
                const { children } = source.templates.item(params).props;
    
                return createItemWrapperTemplate({
                  query: params.item.label,
                  children,
                  html: params.html,
                });
              },
            },
          };
        },
      });    
    
      const querySuggestionsPlugin = createQuerySuggestionsPlugin({
        searchClient,
        indexName: 'zendesk_d3v-algolia-peter_articles_query_suggestions',
        getSearchParams() {
          // This creates a shared `hitsPerPage` value once the duplicates
          // between recent searches and Query Suggestions are removed.
          return recentSearchesPlugin.data.getAlgoliaSearchParams({
            hitsPerPage: 6,
          });
        },
        transformSource({ source }) {
          return {
            ...source,
            sourceId: 'querySuggestionsPlugin',
            getItemUrl({ item }) {
              return getItemUrl({
                query: item.name,
              });
            },
            onSelect({ setIsOpen, setQuery, event, item }) {
              onSelect({
                setQuery,
                setIsOpen,
                event,
                query: item.label,
              });
            },
            getItems(params) {
              // We don't display Query Suggestions when there's no query.
              if (!params.state.query) {
                return [];
              }
              return source.getItems(params);
            },
            templates: {
              ...source.templates,
              item(params) {
                const { children } = source.templates.item(params).props;
                return createItemWrapperTemplate({
                  query: params.item.name,
                  children,
                  html: params.html,
                });
              },
            },
          };
        },
      });    
      
      const searchPageState = getInstantSearchUiState();

      const debouncedSetInstantSearchUiState = debounce(setInstantSearchUiState, 500)
      
      autocomplete({
        container: '#autocomplete',
        placeholder: 'Search for Articles',
        detachedMediaQuery: 'none',
        openOnFocus: true,
        plugins: [recentSearchesPlugin,querySuggestionsPlugin],
        initialState: {
          query: searchPageState.query || '',
        },
        onSubmit({ state }) {
          setInstantSearchUiState({ query: state.query })
        },
        onReset() {
          setInstantSearchUiState({ query: '' })
        },
        onStateChange({ prevState, state }) {
          if (prevState.query !== state.query) {
            if ( settings.useDebounce ) {
              debouncedSetInstantSearchUiState({ query: state.query })
            } else {
              setInstantSearchUiState({ query: state.query })
            }
          }
        },
      });
}

