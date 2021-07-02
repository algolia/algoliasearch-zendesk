import cookies from 'js-cookie';
import aa from 'search-insights';
import { Autocomplete } from './autocomplete';
import { TicketForm } from './ticketForm';

export function initInsights({
  applicationId,
  apiKey,
}: {
  applicationId: string;
  apiKey: string;
}): void {
  aa('init', { appId: applicationId, apiKey });
}

type trackClick = (article, position: number, queryID: number) => void;
type trackConversion = (articleID: number) => void;

// Extends instance with clickAnalytics specific attributes
export function extendWithConversionTracking(
  self: (Autocomplete | TicketForm) & {
    trackClick: trackClick;
    trackConversion: trackConversion;
  },
  { clickAnalytics, indexName }: { clickAnalytics: Boolean; indexName: string }
): void {
  if (!clickAnalytics) {
    self.trackClick = () => {};
    self.trackConversion = () => {};
    return;
  }

  const saveLastClick = (queryID: number, article) => {
    const cookieBody = JSON.stringify({
      queryID,
      objectID: article.objectID,
      articleID: article.id,
    });
    cookies.set('algolia-last-click', cookieBody, { expires: 1 });
  };

  self.trackClick = (article, position, queryID) => {
    saveLastClick(queryID, article);
    aa('clickedObjectIDsAfterSearch', {
      eventName: 'article_clicked',
      index: indexName,
      queryID,
      objectIDs: [article.objectID],
      positions: [Number(position)],
    });
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

    saveLastClick(lastClick.queryID, {});
  };
}
