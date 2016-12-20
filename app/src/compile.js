import Hogan from 'hogan.js';

export default function compile (str) {
  var compiled = Hogan.compile(str, {delimiters: '[[ ]]'});
  return compiled.render.bind(compiled);
};
