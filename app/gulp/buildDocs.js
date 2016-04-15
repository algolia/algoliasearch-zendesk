import fs from 'fs';

export default function () {
  let readHeader = new Promise((resolve, reject) => {
    fs.readFile('../docs/headers/documentation.yml', (err, data) => {
      if (err) return reject(err);
      resolve(data.toString());
    });
  });

  let readReadme = new Promise((resolve, reject) => {
    fs.readFile('./README.md', (err, data) => {
      if (err) return reject(err);
      const arr = data.toString().split('\n');
      let keep = [];
      let keeping = false;
      for (let i = 0; i < arr.length; ++i) {
        const line = arr[i];
        if (keeping && line.match(/^##[^#]/)) break;
        if (keeping) keep.push(line.replace(/^##/, '#'));
        if (!keeping && line.match(/^## Documentation$/)) keeping = true;
      }
      resolve(keep.join('\n'));
    });
  });

  return new Promise((resolve, reject) => {
    Promise.all([readHeader, readReadme]).then((data) => {
      fs.writeFile('../docs/documentation.md', data.join('\n'), (err) => {
        if (err) return reject(err);
        resolve();
      });
    }).catch((err) => reject(err));
  });
}
