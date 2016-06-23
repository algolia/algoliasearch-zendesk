import unorm from 'unorm';

import regexpEscape from './regexpEscape.js';

/* Languages stopwords */

import ar from 'stopwords/dist/ar';
import bg from 'stopwords/dist/bg';
import cs from 'stopwords/dist/cs';
import da from 'stopwords/dist/da';
import de from 'stopwords/dist/de';
import el from 'stopwords/dist/el';
import en from 'stopwords/dist/en';
import es from 'stopwords/dist/es';
import fi from 'stopwords/dist/fi';
import fr from 'stopwords/dist/fr';
import hu from 'stopwords/dist/hu';
import id from 'stopwords/dist/id';
import it from 'stopwords/dist/it';
import ja from 'stopwords/dist/ja';
import ko from 'stopwords/dist/ko';
import nl from 'stopwords/dist/nl';
import no from 'stopwords/dist/no';
import pl from 'stopwords/dist/pl';
import pt from 'stopwords/dist/pt';
import ro from 'stopwords/dist/ro';
import ru from 'stopwords/dist/ru';
import sk from 'stopwords/dist/sk';
import sv from 'stopwords/dist/sv';
import th from 'stopwords/dist/th';
import tr from 'stopwords/dist/tr';
import zh from 'stopwords/dist/zh';

import uk from './stopwords/uk.js';
import vi from './stopwords/vi.js';

export const STOPWORDS = {
  ar,
  'ar-eg': ar,
  bg,
  cs,
  da,
  de,
  'de-at': de,
  'de-ch': de,
  el,
  'en-au': en,
  'en-ca': en,
  'en-gb': en,
  'en-ie': en,
  'en-us': en,
  es,
  'es-es': es,
  'es-419': es,
  fi,
  fr,
  'fr-be': fr,
  'fr-ca': fr,
  'fr-ch': fr,
  'fr-fr': fr,
  hu,
  id,
  it,
  ja,
  ko,
  nl,
  'nl-be': nl,
  no,
  pl,
  pt,
  'pt-br': pt,
  ro,
  ru,
  sk,
  sv,
  th,
  tr,
  uk,
  vi,
  'zh-cn': zh,
  'zh-tw': zh
};

let CURRENT_STOPWORDS = null;

export default function getStopWords(query, lang) {
  if (CURRENT_STOPWORDS === null) {
    CURRENT_STOPWORDS = (STOPWORDS[lang] || [])
      .map(word => unorm.nfc(word))
      .map(word => [
        word,
        new RegExp(`(^|\\s)${regexpEscape(word)}(\\s|$)`, 'i')
      ]);
  }
  query = unorm.nfc(query);
  return CURRENT_STOPWORDS
    .filter(([, reg]) => reg.test(query))
    .map(([word]) => word);
}
