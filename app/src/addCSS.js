// hide the regular search results
export default (css) => {
  const head = document.getElementsByTagName('head')[0];
  let styleTag = document.createElement('style');
  styleTag.setAttribute('type', 'text/css');
  if (styleTag.styleSheet) {
    styleTag.styleSheet.cssText = css;
  } else {
    styleTag.appendChild(document.createTextNode(css));
  }
  return head.appendChild(styleTag);
};
