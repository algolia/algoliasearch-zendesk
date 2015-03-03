(function () {
  'use strict';

  var MAX_DOMAINS = 3;
  var DEFAULT_SECTION = 'tickets';

  var HITS_PER_PAGE_AUTOCOMPLETE = { tickets: 5, users: 7, organizations: 3 };
  var HITS_PER_PAGE_FULL = 20;

  var FACETS = {
    tickets: [
      { name: 'type', title: 'Type', disjunctive: true },
      { name: 'status', title: 'Status', disjunctive: true },
      { name: 'priority', title: 'Priority', disjunctive: true },
      { name: 'tags', title: 'Tags', disjunctive: true },
      { name: 'assignee.name', title: 'Assignee' },
      { name: 'requester.name', title: 'Requester' },
      { name: 'organization.name', title: 'Organization' },
      { name: 'group.name', title: 'Group' }
    ],
    users: [
      { name: 'organization.name', title: 'Organization' },
      { name: 'groups.name', title: 'Groups', disjunctive: true },
      { name: 'tags', title: 'Tags', disjunctive: true }
    ],
    organizations: [
      { name: 'group.name', title: 'Group' },
      { name: 'tags', title: 'Tags', disjunctive: true }
    ],
    articles: [
      { name: 'locale.name', title: 'Language' },
      { name: 'category.title', title: 'Category' },
      { name: 'section.title', title: 'Section' },
      { name: 'author.name', title: 'Author' },
      { name: 'label_names', title: 'Labels', disjunctive: true }
    ]
  };

  var current_sort_order = '';
  var current_section = null;
  var current_time_frame = 0;
  var time_frame_start = 0;
  var algolia_index_prefix = '';

  var lastHeight = 0;

  // Be careful, don't use the `type` key in the
  // object of `app.postMessage` or it will just silently fail
  var app = window.ZAFClient.init();

  var $input = $('#search-bar');
  var $results = $('#results');
  var $facets = $('#facets');
  var $pagination = $('#pagination');

  var $templates = {
    tickets: Hogan.compile($('#ticket-hit-template').text()),
    users: Hogan.compile($('#user-hit-template').text()),
    organizations: Hogan.compile($('#organization-hit-template').text()),
    articles: Hogan.compile($('#article-hit-template').text()),
    facets: Hogan.compile($('#facet-template').text()),
    pagination: Hogan.compile($('#pagination-template').text())
  };


  var templateRenderers = {
    tickets: function (hit) {
      var comments_text = ((hit.nb_comments === 0) ? 'No' : hit.nb_comments);
      comments_text += ' comment' + ((hit.nb_comments <= 1) ? '' : 's');
      hit.additional_info = [
        comments_text
      ].filter(Boolean).join(' - ');
      hit.requester_sep = ((hit._highlightResult.requester.name || {}).value && (hit._highlightResult.requester.email || {}).value) ? '|' : '';
      return $templates.tickets.render(hit);
    },
    users: function (hit) {
      hit.additional_info = [
        hit._highlightResult.phone.value,
        (hit._highlightResult.organization || { name: { value: '' } }).name.value,
        (hit._highlightResult.groups || []).map(function (e) { return e.name.value; }).join(' / ')
      ].filter(Boolean).join(' - ');
      return $templates.users.render(hit);
    },
    organizations: function (hit) {
      var domains_length = (hit._highlightResult.domain_names) ? hit._highlightResult.domain_names.length : 0;
      hit.domains_text = '';
      for (var i = 0; i < domains_length && i <= MAX_DOMAINS; ++i) {
        hit.domains_text += '<span class="domain">' + hit._highlightResult.domain_names[i].value + '</span>';
        if (i !== domains_length - 1) {
          hit.domains_text += (i === MAX_DOMAINS - 1) ? '...' : ' ';
        }
      }
      hit.additional_info = [
        (hit._highlightResult.group || { name: { value: '' } }).name.value,
        ((hit.nb_users) ? (hit.nb_users + ' member' + ((hit.nb_users === 1) ? '' : 's')) : null)
      ].filter(Boolean).join(' - ');

      return $templates.organizations.render(hit);
    },
    articles: function (hit) {
      hit.additional_info = [
        hit._highlightResult.category.title.value,
        hit._highlightResult.section.title.value
      ].filter(Boolean).join(' > ');
      hit.author_sep = (hit._highlightResult.author.name.value && hit._highlightResult.author.email.value) ? '|' : '';
      return $templates.articles.render(hit);
    }
  };

  var createHelper = function (algolia, index_prefix, zendesk_subdomain, type) {
    var facet = null;
    var facets = [];
    var disjunctiveFacets = [];
    var index = index_prefix + zendesk_subdomain + '_' + type;

    for (var i = 0, len = FACETS[type].length; i < len; ++i) {
      facet = FACETS[type][i];
      if (facet.disjunctive) {
        disjunctiveFacets.push(facet.name);
      } else {
        facets.push(facet.name);
      }
    }

    return new AlgoliaSearchHelper(algolia, index, { facets: facets, disjunctiveFacets: disjunctiveFacets });
  };

  var sortByCountDesc = function (a, b) { return b.count - a.count; };
  // Mustache templating by Hogan.js (http://mustache.github.io/)
  var sortFacet = function (facetConfig) {
    return function (a, b) {
      if (!facetConfig.disjunctive) {
        if (a.refined !== b.refined) {
          if (a.refined) {
            return -1;
          }
          if (b.refined) {
            return 1;
          }
        }
      }
      return sortByCountDesc(a, b);
    };
  };

  var displayFacets = function (type, indices, facets, disjunctiveFacets) {
    var html = '' +
      '<div class="facet">' +
        '<ul>' +
          '<li class="' + ((current_section === 'tickets') ? 'refined' : '') + '" onclick="changeSection(\'tickets\');"><span>Tickets</span></li>' +
          '<li class="' + ((current_section === 'users') ? 'refined' : '') + '" onclick="changeSection(\'users\');"><span>Users</span></li>' +
          '<li class="' + ((current_section === 'organizations') ? 'refined' : '') + '" onclick="changeSection(\'organizations\');"><span>Organizations</span></li>' +
          '<li class="' + ((current_section === 'articles') ? 'refined' : '') + '" onclick="changeSection(\'articles\');"><span>Articles</span></li>' +
        '</ul>' +
        '<ul>' +
          '<li class="title">Last activity</li>' +
          '<li class="' + ((current_time_frame === 0) ? 'refined' : '') + '" onclick="setUpdatedAt(0);"><span>Any time</span></li>' +
          '<li class="' + ((current_time_frame === 1) ? 'refined' : '') + '" onclick="setUpdatedAt(1);"><span>Past day</span></li>' +
          '<li class="' + ((current_time_frame === 7) ? 'refined' : '') + '" onclick="setUpdatedAt(7);"><span>Past week</span></li>' +
          '<li class="' + ((current_time_frame === 31) ? 'refined' : '') + '" onclick="setUpdatedAt(31);"><span>Past month</span></li>' +
          '<li class="' + ((current_time_frame === 366) ? 'refined' : '') + '" onclick="setUpdatedAt(366);"><span>Past year</span></li>' +
        '</ul>' +
      '</div>';
    var facetResult = null;
    var facetConfig = null;
    var isDisjunctive = null;

    facets = facets || {};
    disjunctiveFacets = disjunctiveFacets || {};

    for (var j = 0, len = FACETS[type].length; j < len; ++j) {
      facetConfig = FACETS[type][j];
      facetResult = facets[facetConfig.name] || disjunctiveFacets[facetConfig.name] || null;
      isDisjunctive = (disjunctiveFacets[facetConfig.name]) ? true : false;

      if (facetResult) {
        var values = [];
        for (var v in facetResult) {
          values.push({ label: v, value: v, count: facetResult[v], refined: indices[type].isRefined(facetConfig.name, v) });
        }
        values.sort(sortFacet(facetConfig));

        html += $templates.facets.render({
          type: type,
          facet: facetConfig.name,
          title: facetConfig.title,
          values: values,
          disjunctive: isDisjunctive
        });
      }
    }

    $facets.html(html);
  };

  var displayPagination = function (type, curr, total) {
    var pages = [];
    if (curr > 5) {
      pages.push({ current: false, number: 1 });
      pages.push({ current: false, number: '...', disabled: true });
    }
    for (var p = curr - 5; p < curr + 5; ++p) {
      if (p < 0 || p >= total) {
        continue;
      }
      pages.push({ current: curr === p, number: (p + 1) });
    }
    if (curr + 5 < total) {
      pages.push({ current: false, number: '...', disabled: true });
      pages.push({ current: false, number: total });
    }
    if (pages.length) {
      $pagination.html($templates.pagination.render({ type: type, pages: pages, prev_page: (curr > 0 ? curr : false), next_page: (curr + 1 < total ? curr + 2 : false) }));
    } else {
      $pagination.html('');
    }
  };

  var displayTimes = function () {
    var timezoneOffset = moment().utcOffset();
    $('time').each(function() {
      var $this = $(this),
      datetime = $this.attr('datetime'),
      formattedDatetime = moment(datetime).utc().utcOffset(timezoneOffset),
       isoTitle = formattedDatetime.format('YYYY-MM-DD HH:mm');

      $this.attr('title', isoTitle);

      // Render time[data-datetime='relative'] as 'time ago'
      if ($this.data('datetime') === 'relative') {
        $this.text( formattedDatetime.fromNow() );
      } else if ($this.data('datetime') === 'calendar') {
        $this.text( formattedDatetime.calendar() );
      }
    });
  };

  $(document).ready(function () {
    app.on('opened', function () {
      $input.focus().typeahead('val', '').focus();
    });
    app.on('initted', function (data) {
      algolia_index_prefix = (data.index_prefix === null || data.index_prefix === undefined) ? '' : data.index_prefix;
      var $autocomplete = data.location === 'top_bar';
      if (!data.app_id || !data.api_key) {
        $('#loading').html('<h1 class="error">You didn\'t fill your settings correctly</h1>');
        return;
      }
      var zendesk_subdomain = data.name;
      var algolia = new AlgoliaSearch(data.app_id, data.api_key);
      var indices = {
        tickets: createHelper(algolia, algolia_index_prefix, zendesk_subdomain, 'tickets'),
        users: createHelper(algolia, algolia_index_prefix, zendesk_subdomain, 'users'),
        organizations: createHelper(algolia, algolia_index_prefix, zendesk_subdomain, 'organizations'),
        articles: createHelper(algolia, algolia_index_prefix, zendesk_subdomain, 'articles')
      };

      var createAdapter = function (type) {
        return function (q, cb) {
          if (!$autocomplete && current_section !== type) {
            cb([]);
            return;
          }
          var options = { hitsPerPage: HITS_PER_PAGE_FULL };
          if ($autocomplete) {
            $.extend(options, { hitsPerPage: HITS_PER_PAGE_AUTOCOMPLETE[type], attributesToSnippet: [] });
          }
          if (current_time_frame !== 0) {
            if (options.numericFilters) {
            options.numericFilters += ',';
            } else {
              options.numericFilters = '';
            }
            options.numericFilters += 'updated_at>' + time_frame_start;
          }
          indices[type].search(q, function (success, content) {
            if (success) {
              if (!$autocomplete) {
                displayFacets(type, indices, content.facets, content.disjunctiveFacets);
                displayPagination(type, content.page, content.nbPages);
              }
              cb(content.hits);
              displayTimes();
            } else {
              cb([]);
            }
          }, options);
        };
      };


      var customAdapters = {
        tickets: createAdapter('tickets'),
        users: createAdapter('users'),
        organizations: createAdapter('organizations'),
        articles: createAdapter('articles')
      };

      window.redirectToZendesk = function (url, cb) {
        if (cb) {
          cb();
        }
        app.postMessage('changePage', { url: url });
      };

      /**
       * We rely on typeahead.js to handle the display of results in the autocomplete
       * part of our app (the `top_bar` location).
       * We use our simple implementation of results displaying if we're in the
       * actual results page (the `nav_bar` location)
       */
      if ($autocomplete) {
        // typeahead.js initialization
        var parameters = [
          { name: 'tickets', key: 'subject' },
          { name: 'users', key: 'name' },
          { name: 'organizations', key: 'name' }
        ].map(function (params) {
          return {
            name: params.name,
            source: customAdapters[params.name],
            displayKey: params.key,
            templates: {
              header: '<div class="header">' + params.name + '</div>',
              suggestion: templateRenderers[params.name]
            }
          };
        });
        var $typeahead = $input.typeahead({ hint: false, minLength: 1 }, parameters);

        // Redirect on select
        $typeahead.bind('typeahead:selected', function (obj, datum, name) {
          window.redirectToZendesk('#/' + name + '/' + datum.objectID, function () {
            $typeahead.typeahead('val', '');
          });
        });

        // This should be deprecated in v0.11.0 of typeahead.js
        // Still, it's the best solution I've found
        $typeahead.data('ttTypeahead').dropdown.onSync('datasetRendered', function () {
          var dropdown = $('.twitter-typeahead .tt-dropdown-menu');
          var height = dropdown.position().top + dropdown.outerHeight();

          if ($autocomplete) {
            if ($input.val() && !$('#logo').hasClass('hidden')) {
                $('#logo').addClass('hidden');
                $('#mini-logo').removeClass('hidden');
            }
            if (!$input.val() && $('#logo').hasClass('hidden')) {
                $('#logo').removeClass('hidden');
                $('#mini-logo').addClass('hidden');
            }
          }

          if (app && height !== lastHeight) {
            app.postMessage('height', { value: height });
            lastHeight = height;
          }
        });

        // On blur or on Escape key press, close the popover
        $input.on('blur', function () {
          app.postMessage('close', {});
        });
        $input.keyup(function(e) {
          if (e.keyCode === 27) {
            app.postMessage('close', {});
          }
        });
      } else {
        var fullResultsSearch = function () {
          customAdapters[current_section]($input.val(), function (hits) {
            if (hits.length) {
              var html = '<div id="sort-options">' +
                '<span class="' + ((current_sort_order === '') ? 'active' : '') + '" onclick="changeOrder(\'\');">' +
                  'Sort by relevance' +
                '</span>' +
                ' - ' +
                '<span class="' + ((current_sort_order === '_updated_at_desc') ? 'active' : '') + '" onclick="changeOrder(\'_updated_at_desc\');">' +
                  'Sort by latest activity' +
                '</span>' +
              '</div>';
              for (var i = 0, len = hits.length; i < len; ++i) {
                var hit = hits[i];
                // This allows us to modify the template depending on if we're in the
                // autocomplete mode or the full results one
                hit.full_results = true;
                var link = '';
                if (current_section === 'articles') {
                  link = '/hc/' + hit.locale.locale + '/articles/' + hit.id;
                } else {
                  link = '#/' + current_section + '/' + hit.objectID;
                }
                html += '<div class="tt-suggestion" data-url="' + link + '">';
                html += templateRenderers[current_section](hit);
                html += '</div>';
              }
            } else {
              html = '<div class="no-results">No results found for "<strong>' + $('<div />').html($input.val()).text() + '</strong>".</div>';
            }
            $results.html(html);
            $results.find('.tt-suggestion').bind('click', function () {
              redirectToZendesk($(this).attr('data-url'));
            });
            $input.focus();
          });
        };

        $input.keyup(function () { fullResultsSearch(); });

        window.changeOrder = function (suffix) {
          current_sort_order = suffix;
          for (var section in indices) {
            if (indices.hasOwnProperty(section)) {
              indices[section].index = algolia_index_prefix + zendesk_subdomain + '_' + section + suffix;
              indices[section].setPage(0);
            }
          }
          $('.sort-options').removeClass('active');
          fullResultsSearch();
        };

        window.setUpdatedAt = function (nb_days) {
          current_time_frame = nb_days;
          // Here the / 60 must be implemented in the backend too, be careful
          time_frame_start = Math.floor(((new Date()).getTime() / 1000 - nb_days * 86400) / 60);
          for (var section in indices) {
            if (indices.hasOwnProperty(section)) {
              indices[section].setPage(0);
            }
          }
          fullResultsSearch();
        };

        window.toggleRefine = function (type, facet, value) {
          indices[type].setPage(0);
          indices[type].toggleRefine(facet, value);
        };

        window.changeSection = function (section) {
          current_section = section;
          fullResultsSearch();
        };

        window.gotoPage = function (type, page) {
          indices[type].gotoPage(+page - 1);
        };

        window.changeSection(DEFAULT_SECTION);
      }

      /**
       * Display or hide content depending on the location of
       * the app in Zendesk
       */
      if ($autocomplete) {
        $('#input-container').addClass('autocomplete');
        $('#logo').removeClass('hidden');
        $('html').css('overflow', 'hidden');
      } else {
        $('#input-container').addClass('full');
        $('#mini-logo').removeClass('hidden');
        $results.removeClass('hidden');
        $pagination.removeClass('hidden');
        $facets.removeClass('hidden');
      }
      $('#loading').addClass('hidden');
      $('#loaded').removeClass('hidden');

      $input.focus();
    });
  });
}.call(this));
