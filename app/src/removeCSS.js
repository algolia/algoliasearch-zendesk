export default (childNode) => {
  const head = document.getElementsByTagName('head')[0];
  head.removeChild(childNode);
};
