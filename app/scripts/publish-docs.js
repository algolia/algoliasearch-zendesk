var path = require('path');
var ghpages = require('gh-pages');

ghpages.publish(path.join(__dirname, '..', '..', 'docs', '_site'), {
  repo: 'git@github.com:algolia/zendesk.git'
}, function (err) {
  if (err) {
    console.log("Error while pushing docs", err);
  }
  console.log("Pushed the gh-pages");
});
