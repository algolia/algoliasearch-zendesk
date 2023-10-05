import cookies from 'js-cookie';

export function initInsights({ applicationId, apiKey }) {
  const ALGOLIA_INSIGHTS_SRC = 'https://cdn.jsdelivr.net/npm/search-insights@1';

  /* eslint-disable */
  !function(e,a,t,n,s,i,c){e.AlgoliaAnalyticsObject=s,e.aa=e.aa||function(){
  (e.aa.queue = e.aa.queue||[]).push(arguments)},i=a.createElement(t),c=a.getElementsByTagName(t)[0],
  i.async=1,i.src=ALGOLIA_INSIGHTS_SRC,c.parentNode.insertBefore(i,c)
  }(window,document,"script",0,"aa");
  /* eslint-enable */

  window.aa('init', { appId: applicationId, apiKey });
}

export function createClickTracker(self, index) {
  return function trackClick(article, position, queryID) {
    if (!window.aa) return;
    if (self._saveLastClick) self._saveLastClick(queryID, article);
    window.aa('clickedObjectIDsAfterSearch', {
      eventName: 'article_clicked',
      index,
      queryID,
      objectIDs: [article.objectID],
      positions: [Number(position)],
    });
  };
}

// Extends instance with clickAnalytics specific attributes
export function extendWithConversionTracking(
  self,
  { clickAnalytics, indexName, indexPrefix, subdomain }
) {
  const finalIndexName = indexName || `${indexPrefix}${subdomain}_articles`;

  if (!clickAnalytics) {
    self._saveLastQueryID = () => {};
    self._saveLastClick = () => {};
    self.trackConversion = () => {};
    return;
  }

  self._saveLastClick = (queryID, article) => {
    const cookieBody = JSON.stringify({
      queryID,
      objectID: article.objectID,
      articleID: article.id,
    });
    cookies.set('algolia-last-click', cookieBody, { expires: 1 });
  };
  self.trackConversion = (articleID) => {
    const lastClickRaw = cookies.get('algolia-last-click');
    if (!lastClickRaw) return;
    const lastClick = JSON.parse(lastClickRaw);

    if (!lastClick.queryID || !lastClick.objectID || !lastClick.articleID)
      return;

    if (articleID !== lastClick.articleID) return;

    window.aa('convertedObjectIDsAfterSearch', {
      index: finalIndexName,
      eventName: 'article_conversion',
      queryID: lastClick.queryID,
      objectIDs: [lastClick.objectID],
    });

    self._saveLastClick(lastClick.queryID, {});
  };
}
