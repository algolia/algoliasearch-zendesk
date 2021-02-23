import cookies from 'js-cookie';
import aa from 'search-insights';

export function initInsights({ applicationId, apiKey }) {
  aa('init', { appId: applicationId, apiKey });
}

export function createClickTracker(self, index) {
  return function trackClick(article, position, queryID) {
    if (self._saveLastClick) self._saveLastClick(queryID, article);
    aa('clickedObjectIDsAfterSearch', {
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
  { clickAnalytics, indexPrefix, subdomain }
) {
  const indexName = `${indexPrefix}${subdomain}_articles`;

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

    aa('convertedObjectIDsAfterSearch', {
      index: indexName,
      eventName: 'article_conversion',
      queryID: lastClick.queryID,
      objectIDs: [lastClick.objectID],
    });

    self._saveLastClick(lastClick.queryID, {});
  };
}
