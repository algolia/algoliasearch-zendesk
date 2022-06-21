import Hogan from 'hogan.js';

export default function compile(str) {
  const compiled = Hogan.compile(str, { delimiters: '[[ ]]' });
  return compiled.render.bind(compiled);
}
