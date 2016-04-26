// hide the regular search results
export default (css, $mainStyle = null) => {
  $mainStyle = $mainStyle
    || document.querySelector('link[rel=stylesheet][href*="algoliasearch.zendesk-hc"]')
    || document.getElementsByTagName('head')[0].lastChild;
  let $styleTag = document.createElement('style');
  $styleTag.setAttribute('type', 'text/css');
  if ($styleTag.styleSheet) {
    $styleTag.styleSheet.cssText = css;
  } else {
    $styleTag.appendChild(document.createTextNode(css));
  }
  return $mainStyle.parentNode.insertBefore($styleTag, $mainStyle.nextSibling);
};
