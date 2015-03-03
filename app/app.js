(function() {
  'use strict';

  var IFRAME_URL = '//zendesk.algolia.com/';

  // If you modify width here, update it in the code of the iframe page
  var WIDTH = 900;
  var DEFAULT_HEIGHT = 100;

  return {
    events: {
      'app.created': 'create',
      'app.registered': 'register',
      'pane.activated': 'activate',
      'pane.deactivated': 'close',
      'iframe.height': 'adjustHeight',
      'iframe.changePage': 'changePage',
      'iframe.close': 'close'
    },

    create: function () {
      this.switchTo('iframe', { my_url: IFRAME_URL + '?t=' + new Date().getTime() });
      this.algolia_created = true;
    },

    register: function () {
      this.algolia_registered = true;
      if (this.algolia_created) {
        this.postMessage('initted', {
          name: this.currentAccount().subdomain(),
          location: this.currentLocation(),
          app_id: this.setting('app_id'),
          api_key: this.setting('api_key'),
          index_prefix: this.setting('index_prefix')
        });
      }
    },

    activate: function () {
      if (this.currentLocation() === 'top_bar') {
        if (this.just_closed) {
          this.popover('hide');
        } else {
          this.popover({width: WIDTH, height: DEFAULT_HEIGHT});
          if (this.algolia_registered) {
            this.postMessage('opened', {});
          }
        }
      }
      if (this.currentLocation() === 'nav_bar') {
        this.$('.hidden').removeClass('hidden');
        // This next line should not be approved because we're modifying the style
        // of the parent element, but it is visually really nicer
        // TODO Remove if not approved or if we don't want to take risks when submitting
        this.$('.iframe-wrapper').parent().css('padding', '0').css('top', '39px');
        if (this.algolia_registered) {
          this.postMessage('opened', {});
        }
      }
    },

    adjustHeight: function (data) {
      if (this.currentLocation() === 'top_bar') {
        this.popover({width: WIDTH, height: ((data.value === 0) ? DEFAULT_HEIGHT : data.value + 8)});
      }
    },

    changePage: function (target) {
      this.close();
      this.$('#algolia-clicker').attr('href', target.url);
      this.$('#algolia-clicker')[0].click();
    },

    close: function () {
      if (this.currentLocation() === 'top_bar' && !this.just_closed) {
        this.just_closed = true;
        var self = this;
        setTimeout(function() { self.just_closed = false; }, 200);
        this.popover('hide');
      }
    }
  };

}());
