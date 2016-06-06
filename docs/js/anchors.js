var titles = document.querySelectorAll('.page-documentation h2[id]');

for (var i = 0; i < titles.length; ++i) {
  var elt = titles[i];
  var anchor = document.createElement('a');
  anchor.href = '#' + elt.id;
  anchor.className = 'anchor';
  anchor.innerText = ' # ';
  elt.appendChild(anchor);
}
