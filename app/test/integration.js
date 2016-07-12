import webdriverio from 'webdriverio';
const options = {
  desiredCapabilities: {
    browserName: 'firefox'
  }
};

if (process.env.CI) {
  options.desiredCapabilities = [{
    browserName: 'firefox'
  }]
}

webdriverio
  .remote(options)
  .init()
  .url('https://algolia-test.zendesk.com/hc/en-us/')
  .getTitle().then(function(title) {
    console.log('Title was: ' + title);
  })
  .end();
