var path = require('path');
var ghpages = require('gh-pages');

ghpages.publish(path.join(__dirname, 'docs', '_site'), {
  repo: 'git@github.com/algolia/zendesk'
});
