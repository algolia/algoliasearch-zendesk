// Use the browser's built-in functionality to quickly and safely escape the string
// Ref: http://shebang.brandonmintern.com/foolproof-html-escaping-in-javascript/

export default function escapeHTML(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}
