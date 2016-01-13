/* eslint algolia/no-module-exports: 0, no-var: 0 */

module.exports = function () {
  var done = this.async();

  var fs = require('fs');

  var readHeader = new Promise(function (resolve, reject) {
    fs.readFile('../docs/headers/documentation.yml', function (err, data) {
      if (err) return reject(err);
      resolve(data.toString());
    });
  });

  var readReadme = new Promise(function (resolve, reject) {
    fs.readFile('./README.md', function (err, data) {
      if (err) return reject(err);
      var arr = data.toString().split('\n');
      var keep = [];
      var keeping = false;
      for (var i = 0; i < arr.length; ++i) {
        var line = arr[i];
        if (keeping && line.match(/^##[^#]/)) break;
        if (keeping) keep.push(line);
        if (!keeping && line.match(/^## Documentation$/)) keeping = true;
      }
      resolve(keep.join('\n'));
    });
  });

  Promise.all([readHeader, readReadme]).then(function (data) {
    fs.writeFile('../docs/documentation.md', data.join('\n'), function (err) {
      if (err) throw err;
      done();
    });
  });
};
