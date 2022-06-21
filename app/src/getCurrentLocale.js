export function getCurrentLocale() {
  const splittedPathname = window.location.pathname.split('/');
  const res = splittedPathname[2];
  if (!res) {
    console.error('[Algolia] Could not retrieve current locale from URL');
    return 'en-us';
  }
  return res;
}

export default getCurrentLocale;
