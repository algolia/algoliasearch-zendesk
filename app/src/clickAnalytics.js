
export function initInsights(appId, apiKey) {
  const ALGOLIA_INSIGHTS_SRC = 'https://cdn.jsdelivr.net/npm/search-insights@1';

  /* eslint-disable */
  !function(e,a,t,n,s,i,c){e.AlgoliaAnalyticsObject=s,e.aa=e.aa||function(){
  (e.aa.queue = e.aa.queue||[]).push(arguments)},i=a.createElement(t),c=a.getElementsByTagName(t)[0],
  i.async=1,i.src=ALGOLIA_INSIGHTS_SRC,c.parentNode.insertBefore(i,c)
  }(window,document,"script",0,"aa");
  /* eslint-enable */

  window.aa('init', {
    appId,
    apiKey
  });
}


export function enableTrackClick(index) {
  return function trackClick(objectID, position, queryID) {
    window.aa('clickedObjectIDsAfterSearch', {
      eventName: 'article_clicked',
      index,
      queryID,
      objectIDs: [objectID],
      positions: [Number(position)]
    });
  };
}
