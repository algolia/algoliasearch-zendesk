/* eslint object-shorthand: 0 */

const localeToLang = {
  'ar-eg': 'ar',
  'de-at': 'de',
  'de-ch': 'de',
  'en-au': 'en',
  'en-ca': 'en',
  'en-gb': 'en',
  'en-us': 'en',
  'en-ie': 'en',
  'es-es': 'es',
  'es-419': 'es',
  'fr-be': 'fr',
  'fr-ca': 'fr',
  'fr-ch': 'fr',
  'fr-fr': 'fr',
  'nl-be': 'nl',
  'pt-br': 'pt',
};

const formatNumber = (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

const defaultTranslations = {
  nbResults: {
    ar: function (nb) {
      return nb > 1 ? `${formatNumber(nb)} نتيجة` : 'نتيجة واحدة';
    },
    bg: function (nb) {
      return `${formatNumber(nb)} резултат${nb > 1 ? 'а' : ''}`;
    },
    cs: function (nb) {
      let suffix = 'ek';
      if (nb > 1) suffix = 'ky';
      if (nb > 4) suffix = 'ků';
      return `${formatNumber(nb)} výsled${suffix}`;
    },
    da: function (nb) {
      return `${formatNumber(nb)} resultat${nb > 1 ? 'er' : ''}`;
    },
    de: function (nb) {
      return `${formatNumber(nb)} Ergebnis${nb > 1 ? 'se' : ''}`;
    },
    el: function (nb) {
      return `${formatNumber(nb)} αποτέλεσμα${nb > 1 ? 'τα' : ''}`;
    },
    en: function (nb) {
      return `${formatNumber(nb)} result${nb > 1 ? 's' : ''}`;
    },
    es: function (nb) {
      return `${formatNumber(nb)} resultado${nb > 1 ? 's' : ''}`;
    },
    fi: function (nb) {
      return `${formatNumber(nb)} tulos${nb > 1 ? 'ta' : ''}`;
    },
    fr: function (nb) {
      return `${formatNumber(nb)} résultat${nb > 1 ? 's' : ''}`;
    },
    hu: function (nb) {
      return `${formatNumber(nb)} találat`;
    },
    id: function (nb) {
      return `${formatNumber(nb)} hasil`;
    },
    it: function (nb) {
      return `${formatNumber(nb)} risultat${nb > 1 ? 'i' : 'o'}`;
    },
    ja: function (nb) {
      return `${formatNumber(nb)}個の結果`;
    },
    ko: function (nb) {
      return `${formatNumber(nb)}건의`;
    },
    nl: function (nb) {
      return `${formatNumber(nb)} resulta${nb > 1 ? 'ten' : 'at'}`;
    },
    no: function (nb) {
      return `${formatNumber(nb)} resultat${nb > 1 ? 'er' : ''}`;
    },
    pl: function (nb) {
      return `${formatNumber(nb)} wynik${nb > 1 ? 'ów' : ''}`;
    },
    pt: function (nb) {
      return `${formatNumber(nb)} resultado${nb > 1 ? 's' : ''}`;
    },
    ro: function (nb) {
      return `${formatNumber(nb)} rezultat${nb > 1 ? 'e' : ''}`;
    },
    ru: function (nb) {
      let suffix = '';
      if (nb % 10 === 1 && nb % 100 !== 11) suffix = '';
      else if (
        nb % 10 >= 2 &&
        nb % 10 <= 4 &&
        (nb % 100 < 10 || nb % 100 >= 20)
      )
        suffix = 'а';
      else suffix = 'ов';
      return `${formatNumber(nb)} результат${suffix}`;
    },
    sk: function (nb) {
      let suffix = 'ok';
      if (nb > 1) suffix = 'ky';
      if (nb > 4) suffix = 'kov';
      return `${formatNumber(nb)} výsled${suffix}`;
    },
    sv: function (nb) {
      return `${formatNumber(nb)} träff${nb > 1 ? 'ar' : ''}`;
    },
    th: function (nb) {
      return `${formatNumber(nb)} ผลลัพธ์ใน`;
    },
    tr: function (nb) {
      return `${formatNumber(nb)} sonuç`;
    },
    uk: function (nb) {
      let suffix = '';
      if (nb % 10 === 1 && nb % 100 !== 11) suffix = '';
      else if (
        nb % 10 >= 2 &&
        nb % 10 <= 4 &&
        (nb % 100 < 10 || nb % 100 >= 20)
      )
        suffix = 'и';
      else suffix = '';
      return `${formatNumber(nb)} результат${suffix}`;
    },
    vi: function (nb) {
      return `${formatNumber(nb)} kết quả được tìm`;
    },
    'zh-cn': function (nb) {
      return `${formatNumber(nb)}个结果`;
    },
    'zh-tw': function (nb) {
      return `${formatNumber(nb)} 項結果`;
    },
  },
  noResultsFor: {
    ar: function (query) {
      return `لم يتم العثور على نتائج لصالح "${query}"`;
    },
    bg: function (query) {
      return `Няма намерен резултат за "${query}"`;
    },
    cs: function (query) {
      return `Pro dotaz „${query}“ nebyly nalezeny žádné výsledky`;
    },
    da: function (query) {
      return `Ingen resultater fundet for "${query}"`;
    },
    de: function (query) {
      return `Keine Ergebnisse für "${query}" gefunden`;
    },
    el: function (query) {
      return `Δεν βρέθηκε αποτέλεσμα για «${query}»`;
    },
    en: function (query) {
      return `No result found for "${query}"`;
    },
    es: function (query) {
      return `No se han encontrado resultados para "${query}"`;
    },
    fi: function (query) {
      return `Tuloksia hakusanalla ”${query}” ei löytynyt`;
    },
    fr: function (query) {
      return `Aucun résultat pour "${query}"`;
    },
    hu: function (query) {
      return `Nicns találat erre: "${query}"`;
    },
    id: function (query) {
      return `Tak ditemukan hasil untuk "${query}"`;
    },
    it: function (query) {
      return `Nessun risultato trovato per "${query}"`;
    },
    ja: function (query) {
      return `"${query}"の結果が見つかりませんでした。`;
    },
    ko: function (query) {
      return `"${query}"에 대한 검색 결과가 없습니다`;
    },
    nl: function (query) {
      return `Geen resultaten voor "${query}"`;
    },
    no: function (query) {
      return `Ingen resultater funnet for "${query}"`;
    },
    pl: function (query) {
      return `Nie znaleziono wyników dla "${query}"`;
    },
    pt: function (query) {
      return `Não foram encontrados resultados para "${query}"`;
    },
    'pt-br': function (query) {
      return `Nenhum resultado encontrado para "${query}"`;
    },
    ro: function (query) {
      return `Niciun rezultat pentru "${query}"`;
    },
    ru: function (query) {
      return `По запросу "${query}" ничего не найдено`;
    },
    sk: function (query) {
      return `Pre "${query}" nebol nájdený žiadny výsledok`;
    },
    sv: function (query) {
      return `Inget resultat hittades för "${query}"`;
    },
    th: function (query) {
      return `ไม่พบผลลัพธ์สำหรับ "${query}"`;
    },
    tr: function (query) {
      return `"${query}" için sonuç bulunamadı`;
    },
    uk: function (query) {
      return `Не знайдено результатів для "${query}"`;
    },
    vi: function (query) {
      return `Không có kết quả được tìm thấy cho "${query}"`;
    },
    'zh-cn': function (query) {
      return `未找到 “${query}” 的结果`;
    },
    'zh-tw': function (query) {
      return `查無 「${query}」 相關結果`;
    },
  },
  placeholder: {
    ar: 'البحث في مقالاتنا',
    bg: 'Търсене в нашите статии',
    cs: 'Hledat v našich článcích',
    da: 'Søg i vores artikler',
    de: 'In unseren Artikeln suchen',
    el: 'Κάντε αναζήτηση στα άρθρα μας',
    en: 'Search our articles',
    es: 'Buscar en nuestros artículos',
    fi: 'Etsi artikkeleista',
    fr: 'Recherchez dans nos articles',
    hu: 'Keresés a cikkeink között',
    id: 'Cari di artikel kami',
    it: 'Cerca nei nostri articoli',
    ja: '私たちの記事を検索します。',
    ko: '기사에서 검색',
    nl: 'Zoeken in onze artikelen',
    no: 'Søk i våre artikler',
    pl: 'Szukaj w naszych artykułach',
    pt: 'Pesquisar nos nossos artigos',
    'pt-br': 'Pesquise em nossos artigos',
    ro: 'Căutați în articolele noastre',
    ru: 'Найти в наших статьях',
    sk: 'Vyhľadávať v našich článkoch',
    sv: 'Sök bland våra artiklar',
    th: 'ค้นหาในบทความของเรา',
    tr: 'Yazılarımızda ara',
    uk: 'Пошук у наших статтях',
    vi: 'Tìm kiếm trong các bài viết của chúng tôi',
    'zh-cn': '在我们的文章中搜索',
    'zh-tw': '在文章中搜尋',
  },
  searchByAlgolia: {
    ar: (algolia) => `البحث بواسطة ${algolia}`,
    bg: (algolia) => `Търсене по ${algolia}`,
    cs: (algolia) => `Vyhledávat s využitím služby ${algolia}`,
    da: (algolia) => `Søg med ${algolia}`,
    de: (algolia) => `Suche über ${algolia}`,
    el: (algolia) => `Αναζήτηση κατά ${algolia}`,
    en: (algolia) => `Search by ${algolia}`,
    es: (algolia) => `Búsqueda por ${algolia}`,
    fi: (algolia) => `Haun tarjoaa ${algolia}`,
    fr: (algolia) => `Recherche par ${algolia}`,
    hu: (algolia) => `Keresés az ${algolia}-val`,
    id: (algolia) => `Cari menggunakan ${algolia}`,
    it: (algolia) => `Cerca per ${algolia}`,
    ja: (algolia) => `${algolia}で検索します。`,
    ko: (algolia) => `${algolia}로 검색`,
    nl: (algolia) => `Zoeken op ${algolia}`,
    no: (algolia) => `Søk av ${algolia}`,
    pl: (algolia) => `Szukaj przez ${algolia}`,
    pt: (algolia) => `Pesquisar por ${algolia}`,
    'pt-br': (algolia) => `Pesquise por ${algolia}`,
    ro: (algolia) => `Căutați după ${algolia}`,
    ru: (algolia) => `Найти в ${algolia}`,
    sk: (algolia) => `Vyhľadávať podľa ${algolia}`,
    sv: (algolia) => `Sök genom ${algolia}`,
    th: (algolia) => `ค้นหาโดย ${algolia}`,
    tr: (algolia) => `${algolia}'ya göre ara`,
    uk: (algolia) => `Пошук за допомогою ${algolia}`,
    vi: (algolia) => `Tìm kiếm theo ${algolia}`,
    'zh-cn': (algolia) => `根据 ${algolia} 搜索`,
    'zh-tw': (algolia) => `使用 ${algolia} 搜尋`,
  },
};

export default function translate(userTranslations, locale, key, ...args) {
  const lang = localeToLang[locale] || 'en';

  const t = userTranslations[key] || defaultTranslations[key];
  if (t === null) {
    throw new Error(`Unknown translation key '${key}'.`);
  }
  if (t[lang] === null) {
    throw new Error(
      `No '${lang}' (locale '${locale}') entry for translation key '${key}'.`
    );
  }
  if (typeof t[lang] === 'function') {
    return t[lang](...args);
  }
  return t[lang];
}
