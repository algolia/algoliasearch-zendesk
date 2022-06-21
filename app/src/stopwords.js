/* Languages stopwords */

import ar from 'stopwords/dist/ar.json';
import bg from 'stopwords/dist/bg.json';
import cs from 'stopwords/dist/cs.json';
import da from 'stopwords/dist/da.json';
import de from 'stopwords/dist/de.json';
import el from 'stopwords/dist/el.json';
import en from 'stopwords/dist/en.json';
import es from 'stopwords/dist/es.json';
import fi from 'stopwords/dist/fi.json';
import fr from 'stopwords/dist/fr.json';
import hu from 'stopwords/dist/hu.json';
import id from 'stopwords/dist/id.json';
import it from 'stopwords/dist/it.json';
import ja from 'stopwords/dist/ja.json';
import ko from 'stopwords/dist/ko.json';
import nl from 'stopwords/dist/nl.json';
import no from 'stopwords/dist/no.json';
import pl from 'stopwords/dist/pl.json';
import pt from 'stopwords/dist/pt.json';
import ro from 'stopwords/dist/ro.json';
import ru from 'stopwords/dist/ru.json';
import sk from 'stopwords/dist/sk.json';
import sv from 'stopwords/dist/sv.json';
import th from 'stopwords/dist/th.json';
import tr from 'stopwords/dist/tr.json';
import zh from 'stopwords/dist/zh.json';
import unorm from 'unorm';

import regexpEscape from './regexpEscape';
import uk from './stopwords/uk';
import vi from './stopwords/vi';

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
  'zh-tw': zh,
};

let CURRENT_STOPWORDS = null;

export default function getStopWords(query, lang) {
  if (CURRENT_STOPWORDS === null) {
    CURRENT_STOPWORDS = (STOPWORDS[lang] || [])
      .map((word) => unorm.nfc(word))
      .map((word) => [
        word,
        new RegExp(`(^|\\s)${regexpEscape(word)}(\\s|$)`, 'i'),
      ]);
  }
  query = unorm.nfc(query);
  return CURRENT_STOPWORDS.filter(([, reg]) => reg.test(query)).map(
    ([word]) => word
  );
}
