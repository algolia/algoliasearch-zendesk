/* eslint object-shorthand: 0 */

import escapeHTML from './escapeHTML.js';

const LOCALES_ASSOCIATIONS = {
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
  'pt-br': 'pt'
};

const TRANSLATIONS = {
  categories: {
    ar: 'الفئات',
    bg: 'Категории',
    cs: 'Kategorie',
    da: 'Kategorier',
    de: 'Kategorien',
    en: 'Categories',
    el: 'Ελληνικά',
    es: 'Categorías',
    fi: 'Kategoriat',
    fr: 'Catégories',
    hu: 'Kategóriák',
    id: 'Kategori',
    it: 'Categorie',
    ja: 'カテゴリー',
    ko: '카테고리',
    nl: 'Categorieën',
    no: 'Kategorier',
    pl: 'Kategorie',
    pt: 'Categorias',
    ro: 'Categorii',
    ru: 'Категории',
    sk: 'Kategorier',
    sv: 'Kategorier',
    th: 'หมวดหมู่',
    tr: 'Kategoriler',
    uk: 'Категорії',
    vi: 'Loại',
    'zh-cn': '类别',
    'zh-tw': '類別'
  },
  change_query: {
    ar: 'قم بتغيير الاستفسار',
    bg: 'променете вашата заявка',
    cs: 'Změňte svůj dotaz',
    da: 'Ændr din forespørgsel',
    de: 'Ihre Abfrage ändern',
    el: 'Αλλάξτε το ερώτημά σας',
    en: 'Change your query',
    es: 'Cambiar su consulta',
    fi: 'Vaihda hakusanaasi',
    fr: 'Changer votre requête',
    hu: 'Módosítsa keresését',
    id: 'Ubah pencarian Anda',
    it: 'Modifica la tua query',
    ja: '検索内容を変更',
    ko: '검색어를 변경하',
    nl: 'Wijzig je zoekopdracht',
    no: 'Endre søket ditt',
    pl: 'Zmień zapytanie',
    pt: 'Modifique a sua pesquisa',
    'pt-br': 'Altere sua consulta',
    ro: 'Modificați-vă întrebările',
    ru: 'Изменить запрос',
    sk: 'Zmeňte dotaz',
    sv: 'Ändra din fråga',
    th: 'เปลี่ยนการสืบค้นของคุณ',
    tr: 'Sorgunuzu değiştirin',
    uk: 'змініть свій запит',
    vi: 'Thay đổi truy vấn của bạn',
    'zh-cn': '更改您的查询',
    'zh-tw': '變更問題'
  },
  clear_filters: {
    ar: 'قم بمسح المرشحات',
    bg: 'почистете вашите филтри',
    cs: 'zrušte své filtry',
    da: 'ryd dine filtre',
    de: 'Ihre Filter leeren',
    el: 'καθαρίστε τα φίλτρα σας',
    en: 'clear your filters',
    es: 'borrar sus filtros',
    fi: 'nollaa hakuehdot',
    fr: 'enlever vos filtres',
    hu: 'törölje a szűrőket',
    id: 'hapus filter Anda',
    it: 'elimina i filtri',
    ja: 'フィルターをリセットしてください。',
    ko: '필터를 제거하세요',
    nl: 'wis je filters',
    no: 'tøm filtrene dine',
    pl: 'zresetuj filtry',
    pt: 'limpe os seus filtros',
    'pt-br': 'retirar filtros',
    ro: 'ștergeți-vă filtrele',
    ru: 'сбросить фильтры',
    sk: 'vymažte filtre',
    sv: 'rensa filter',
    th: 'ล้างตัวกรอง',
    tr: 'filtrelerinizi temizleyin',
    uk: 'очистіть свої фільтри',
    vi: 'xóa bộ lọc của bạn',
    'zh-cn': '清除过滤条件',
    'zh-tw': '清理篩選'
  },
  format_number: {
    ar: (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ''),
    bg: (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '),
    cs: (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '), // Non-breaking space
    da: (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
    de: (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
    el: (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
    en: (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','),
    es: (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
    fr: (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '),
    hu: (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '),
    id: (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
    it: (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
    nl: (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
    no: (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '), // Non-breaking space
    pl: (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '),
    pt: (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
    ro: (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
    ru: (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '),
    sk: (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '), // Non-breaking space
    sv: (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '),
    tr: (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
    uk: (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  },
  filter: {
    ar: 'نتائج الترشيح',
    bg: 'Филтриране на резултати',
    cs: 'Filtrovat výsledky',
    da: 'Filterresultater',
    de: 'Ergebnisse filtern',
    el: 'Αποτελέσματα φίλτρου',
    en: 'Filter results',
    es: 'Filtrar los resultados',
    fi: 'Muokkaa hakuehtoja',
    fr: 'Filtrer les résultats',
    hu: 'Eredmények szűrése',
    id: 'Filter hasil',
    it: 'Filtrare risultati',
    ja: 'フィルターされた結果',
    ko: '필터 결과',
    nl: 'Filter resultaten',
    no: 'Filtrer resultater',
    pl: 'Filtruj wyniki',
    pt: 'Filtrar resultados',
    ro: 'Filtrează rezultate',
    ru: 'фильтр',
    sk: 'Výsledky filtrovania',
    sv: 'Filtrera resultat',
    th: 'ผลลัพธ์จากตัวกรอง',
    tr: 'Sonuçları filtrele',
    uk: 'Фільтрувати результати',
    vi: 'Lọc kết quả',
    'zh-cn': '筛选结果',
    'zh-tw': '篩選結果'
  },
  nb_results: {
    ar: function (nb) {
      return nb > 1 ? `${this.format_number(nb)} نتيجة` : 'نتيجة واحدة';
    },
    bg: function (nb) {
      return `${this.format_number(nb)} резултат${nb > 1 ? 'а' : ''}`;
    },
    cs: function (nb) {
      let suffix = 'ek';
      if (nb > 1) suffix = 'ky';
      if (nb > 4) suffix = 'ků';
      return `${this.format_number(nb)} výsled${suffix}`;
    },
    da: function (nb) {
      return `${this.format_number(nb)} resultat${nb > 1 ? 'er' : ''}`;
    },
    de: function (nb) {
      return `${this.format_number(nb)} Ergebnis${nb > 1 ? 'se' : ''}`;
    },
    el: function (nb) {
      return `${this.format_number(nb)} αποτέλεσμα${nb > 1 ? 'τα' : ''}`;
    },
    en: function (nb) {
      return `${this.format_number(nb)} result${nb > 1 ? 's' : ''}`;
    },
    es: function (nb) {
      return `${this.format_number(nb)} resultado${nb > 1 ? 's' : ''}`;
    },
    fi: function (nb) {
      return `${this.format_number(nb)} tulos${nb > 1 ? 'ta' : ''}`;
    },
    fr: function (nb) {
      return `${this.format_number(nb)} résultat${nb > 1 ? 's' : ''}`;
    },
    hu: function (nb) {
      return `${this.format_number(nb)} találat`;
    },
    id: function (nb) {
      return `${this.format_number(nb)} hasil`;
    },
    it: function (nb) {
      return `${this.format_number(nb)} risultat${nb > 1 ? 'i' : 'o'}`;
    },
    ja: function (nb) {
      return `${this.format_number(nb)}個の結果`;
    },
    ko: function (nb) {
      return `${this.format_number(nb)}건의`;
    },
    nl: function (nb) {
      return `${this.format_number(nb)} resulta${nb > 1 ? 'ten' : 'at'}`;
    },
    no: function (nb) {
      return `${this.format_number(nb)} resultat${nb > 1 ? 'er' : ''}`;
    },
    pl: function (nb) {
      return `${this.format_number(nb)} wynik${nb > 1 ? 'ów' : ''}`;
    },
    pt: function (nb) {
      return `${this.format_number(nb)} resultado${nb > 1 ? 's' : ''}`;
    },
    ro: function (nb) {
      return `${this.format_number(nb)} rezultat${nb > 1 ? 'e' : ''}`;
    },
    ru: function (nb) {
      let suffix = '';
      if (nb % 10 === 1 && nb % 100 !== 11) suffix = '';
      else if (nb % 10 >= 2 && nb % 10 <= 4 && (nb % 100 < 10 || nb % 100 >= 20)) suffix = 'а';
      else suffix = 'ов';
      return `${this.format_number(nb)} результат${suffix}`;
    },
    sk: function (nb) {
      let suffix = 'ok';
      if (nb > 1) suffix = 'ky';
      if (nb > 4) suffix = 'kov';
      return `${this.format_number(nb)} výsled${suffix}`;
    },
    sv: function (nb) {
      return `${this.format_number(nb)} träff${nb > 1 ? 'ar' : ''}`;
    },
    th: function (nb) {
      return `${this.format_number(nb)} ผลลัพธ์ใน`;
    },
    tr: function (nb) {
      return `${this.format_number(nb)} sonuç`;
    },
    uk: function (nb) {
      let suffix = '';
      if (nb % 10 === 1 && nb % 100 !== 11) suffix = '';
      else if (nb % 10 >= 2 && nb % 10 <= 4 && (nb % 100 < 10 || nb % 100 >= 20)) suffix = 'и';
      else suffix = '';
      return `${this.format_number(nb)} результат${suffix}`;
    },
    vi: function (nb) {
      return `${this.format_number(nb)} kết quả được tìm`;
    },
    'zh-cn': function (nb) {
      return `${this.format_number(nb)}个结果`;
    },
    'zh-tw': function (nb) {
      return `${this.format_number(nb)} 項結果`;
    }
  },
  no_result_for: {
    ar: function (query) {
      return `لم يتم العثور على نتائج لصالح ${this.quoted(query)}`;
    },
    bg: function (query) {
      return `Няма намерен резултат за ${this.quoted(query)}`;
    },
    cs: function (query) {
      return `Pro dotaz ${this.quoted(query)} nebyly nalezeny žádné výsledky`;
    },
    da: function (query) {
      return `Ingen resultater fundet for ${this.quoted(query)}`;
    },
    de: function (query) {
      return `Keine Ergebnisse für ${this.quoted(query)} gefunden`;
    },
    el: function (query) {
      return `Δεν βρέθηκε αποτέλεσμα για ${this.quoted(query)}`;
    },
    en: function (query) {
      return `No result found for ${this.quoted(query)}`;
    },
    es: function (query) {
      return `No se han encontrado resultados para ${this.quoted(query)}`;
    },
    fi: function (query) {
      return `Tuloksia hakusanalla ${this.quoted(query)} ei löytynyt`;
    },
    fr: function (query) {
      return `Aucun résultat pour ${this.quoted(query)}`;
    },
    hu: function (query) {
      return `Nicns találat erre: ${this.quoted(query)}`;
    },
    id: function (query) {
      return `Tak ditemukan hasil untuk ${this.quoted(query)}`;
    },
    it: function (query) {
      return `Nessun risultato trovato per ${this.quoted(query)}`;
    },
    ja: function (query) {
      return `${this.quoted(query)}の結果が見つかりませんでした。`;
    },
    ko: function (query) {
      return `${this.quoted(query)}에 대한 검색 결과가 없습니다`;
    },
    nl: function (query) {
      return `Geen resultaten voor ${this.quoted(query)}`;
    },
    no: function (query) {
      return `Ingen resultater funnet for ${this.quoted(query)}`;
    },
    pl: function (query) {
      return `Nie znaleziono wyników dla ${this.quoted(query)}`;
    },
    pt: function (query) {
      return `Não foram encontrados resultados para ${this.quoted(query)}`;
    },
    'pt-br': function (query) {
      return `Nenhum resultado encontrado para ${this.quoted(query)}`;
    },
    ro: function (query) {
      return `Niciun rezultat pentru ${this.quoted(query)}`;
    },
    ru: function (query) {
      return `По запросу ${this.quoted(query)} ничего не найдено`;
    },
    sk: function (query) {
      return `Pre ${this.quoted(query)} nebol nájdený žiadny výsledok`;
    },
    sv: function (query) {
      return `Inget resultat hittades för ${this.quoted(query)}`;
    },
    th: function (query) {
      return `ไม่พบผลลัพธ์สำหรับ ${this.quoted(query)}`;
    },
    tr: function (query) {
      return `${this.quoted(query)} için sonuç bulunamadı`;
    },
    uk: function (query) {
      return `Не знайдено результатів для ${this.quoted(query)}`;
    },
    vi: function (query) {
      return `Không có kết quả được tìm thấy cho ${this.quoted(query)}`;
    },
    'zh-cn': function (query) {
      return `未找到 ${this.quoted(query)} 的结果`;
    },
    'zh-tw': function (query) {
      return `查無 ${this.quoted(query)} 相關結果`;
    }
  },
  no_result_actions: {
    ar: function () {
      return `${this.change_query} أو ${this.clear_filters}`;
    },
    bg: function () {
      return `${this.change_query} или ${this.clear_filters}`;
    },
    cs: function () {
      return `${this.change_query} nebo ${this.clear_filters}`;
    },
    da: function () {
      return `${this.change_query} eller ${this.clear_filters}`;
    },
    de: function () {
      return `${this.change_query} oder ${this.clear_filters}`;
    },
    el: function () {
      return `${this.change_query} ή ${this.clear_filters}`;
    },
    en: function () {
      return `${this.change_query} or ${this.clear_filters}`;
    },
    es: function () {
      return `${this.change_query} o ${this.clear_filters}`;
    },
    fi: function () {
      return `${this.change_query} tai ${this.clear_filters}`;
    },
    fr: function () {
      return `${this.change_query} ou ${this.clear_filters}`;
    },
    hu: function () {
      return `${this.change_query} vagy ${this.clear_filters}`;
    },
    id: function () {
      return `${this.change_query} atau ${this.clear_filters}`;
    },
    it: function () {
      return `${this.change_query} o ${this.clear_filters}`;
    },
    ja: function () {
      return `${this.change_query}するか、${this.clear_filters}`;
    },
    ko: function () {
      return `${this.change_query} 거나 ${this.clear_filters}`;
    },
    nl: function () {
      return `${this.change_query} of ${this.clear_filters}`;
    },
    no: function () {
      return `${this.change_query} eller ${this.clear_filters}`;
    },
    pl: function () {
      return `${this.change_query} lub ${this.clear_filters}`;
    },
    pt: function () {
      return `${this.change_query} ou ${this.clear_filters}`;
    },
    ro: function () {
      return `${this.change_query} sau ${this.clear_filters}`;
    },
    ru: function () {
      return `${this.change_query} или ${this.clear_filters}`;
    },
    sk: function () {
      return `${this.change_query} alebo ${this.clear_filters}`;
    },
    sv: function () {
      return `${this.change_query} eller ${this.clear_filters}`;
    },
    th: function () {
      return `${this.change_query} หรือ ${this.clear_filters}`;
    },
    tr: function () {
      return `${this.change_query} ya da ${this.clear_filters}`;
    },
    uk: function () {
      return `${this.change_query} або ${this.clear_filters}`;
    },
    vi: function () {
      return `${this.change_query} hoặc ${this.clear_filters}`;
    },
    'zh-cn': function () {
      return `${this.change_query}或${this.clear_filters}`;
    },
    'zh-tw': function () {
      return `${this.change_query}或${this.clear_filters}`;
    }
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
    'zh-tw': '在文章中搜尋'
  },
  quoted: {
    cs: text => `„${escapeHTML(text)}“`,
    el: text => `«${escapeHTML(text)}»`,
    en: text => `"${escapeHTML(text)}"`,
    fi: text => `”${escapeHTML(text)}”`,
    'zh-cn': text => `“${escapeHTML(text)}”`,
    'zh-tw': text => `「${escapeHTML(text)}」`
  },
  stats: {
    ar: function (nbHits, processing) {
      return `تم العثور على ${this.nb_results(nbHits)} في ${processing} مللي ثانية`;
    },
    bg: function (nbHits, processing) {
      return `${this.nb_results(nbHits)} намерен${nbHits > 1 ? 'и' : ''} за ${processing} мс`;
    },
    cs: function (nbHits, processing) {
      let suffix = '';
      if (nbHits > 1) suffix = 'y';
      if (nbHits > 4) suffix = 'o';
      return `${this.nb_results(nbHits)} nalezen${suffix} za ${processing} ms`;
    },
    da: function (nbHits, processing) {
      return `${this.nb_results(nbHits)} fundet på ${processing} ms`;
    },
    de: function (nbHits, processing) {
      return `${this.nb_results(nbHits)} gefunden in ${processing} ms`;
    },
    el: function (nbHits, processing) {
      return `Βρέθηκ${nbHits > 1 ? 'αν' : 'ε'} ${this.nb_results(nbHits)} σε ${processing} ms`;
    },
    en: function (nbHits, processing) {
      return `${this.nb_results(nbHits)} found in ${processing} ms`;
    },
    es: function (nbHits, processing) {
      return `${this.nb_results(nbHits)} encontrado${nbHits > 1 ? 's' : ''} en ${processing} ms`;
    },
    fi: function (nbHits, processing) {
      return `${this.nb_results(nbHits)} löydetty ajassa ${processing} ms`;
    },
    fr: function (nbHits, processing) {
      return `${this.nb_results(nbHits)} trouvé${nbHits > 1 ? 's' : ''} en ${processing} ms`;
    },
    hu: function (nbHits, processing) {
      return `${this.nb_results(nbHits)} ${processing} ms alatt`;
    },
    id: function (nbHits, processing) {
      return `${this.nb_results(nbHits)} hasil ditemukan dalam ${processing} md`;
    },
    it: function (nbHits, processing) {
      return `${this.nb_results(nbHits)} trovat${nbHits > 1 ? 'i' : 'o'} in ${processing} ms`;
    },
    ja: function (nbHits, processing) {
      return `${this.nb_results(nbHits)}が${processing}ミリ秒で見つかりました。`;
    },
    ko: function (nbHits, processing) {
      return `${processing} 밀리초에 ${this.nb_results(nbHits)} 결과가 검색됨`;
    },
    nl: function (nbHits, processing) {
      return `${this.nb_results(nbHits)} in ${processing} ms`;
    },
    no: function (nbHits, processing) {
      return `${this.nb_results(nbHits)} funnet etter ${processing} ms`;
    },
    pt: function (nbHits, processing) {
      return `${this.nb_results(nbHits)} encontrado${nbHits > 1 ? 's' : ''} em ${processing} ms`;
    },
    pl: function (nbHits, processing) {
      return `Znaleziono ${this.nb_results(nbHits)} w czasie ${processing} ms`;
    },
    ro: function (nbHits, processing) {
      return `${this.nb_results(nbHits)} găsit${nbHits > 1 ? 'e' : ''} în ${processing} ms`;
    },
    ru: function (nbHits, processing) {
      return `${this.nb_results(nbHits)} знайдено за ${processing} мс`;
    },
    sk: function (nbHits, processing) {
      let suffix = 'ý';
      if (nbHits > 1) suffix = 'é';
      if (nbHits > 4) suffix = 'ých';
      return `${this.nb_results(nbHits)} nájdený${suffix} za ${processing} ms`;
    },
    sv: function (nbHits, processing) {
      return `${this.nb_results(nbHits)} ${nbHits > 1 ? 'hittades' : ''} på ${processing} ms`;
    },
    th: function (nbHits, processing) {
      return `พบ ${this.nb_results(nbHits)} ${processing} มิลลิวินาที`;
    },
    tr: function (nbHits, processing) {
      return `${processing} ms içerisinde ${this.nb_results(nbHits)} sonuç bulundu`;
    },
    uk: function (nbHits, processing) {
      return `${this.nb_results(nbHits)} знайдено за ${processing} мс`;
    },
    vi: function (nbHits, processing) {
      return `${this.nb_results(nbHits)} thấy trong ${processing} mili giây`;
    },
    'zh-cn': function (nbHits, processing) {
      return `在 ${processing} ms 内找到 ${this.nb_results(nbHits)}`;
    },
    'zh-tw': function (nbHits, processing) {
      return `${processing} 毫秒內搜尋到 ${this.nb_results(nbHits)}`;
    }
  },
  search_by_algolia: {
    ar: algolia => `البحث بواسطة ${algolia}`,
    bg: algolia => `Търсене по ${algolia}`,
    cs: algolia => `Vyhledávat s využitím služby ${algolia}`,
    da: algolia => `Søg med ${algolia}`,
    de: algolia => `Suche über ${algolia}`,
    el: algolia => `Αναζήτηση κατά ${algolia}`,
    en: algolia => `Search by ${algolia}`,
    es: algolia => `Búsqueda por ${algolia}`,
    fi: algolia => `Haun tarjoaa ${algolia}`,
    fr: algolia => `Recherche par ${algolia}`,
    hu: algolia => `Keresés az ${algolia}-val`,
    id: algolia => `Cari menggunakan ${algolia}`,
    it: algolia => `Cerca per ${algolia}`,
    ja: algolia => `${algolia}で検索します。`,
    ko: algolia => `${algolia}로 검색`,
    nl: algolia => `Zoeken op ${algolia}`,
    no: algolia => `Søk av ${algolia}`,
    pl: algolia => `Szukaj przez ${algolia}`,
    pt: algolia => `Pesquisar por ${algolia}`,
    'pt-br': algolia => `Pesquise por ${algolia}`,
    ro: algolia => `Căutați după ${algolia}`,
    ru: algolia => `Найти в ${algolia}`,
    sk: algolia => `Vyhľadávať podľa ${algolia}`,
    sv: algolia => `Sök genom ${algolia}`,
    th: algolia => `ค้นหาโดย ${algolia}`,
    tr: algolia => `${algolia}'ya göre ara`,
    uk: algolia => `Пошук за допомогою ${algolia}`,
    vi: algolia => `Tìm kiếm theo ${algolia}`,
    'zh-cn': algolia => `根据 ${algolia} 搜索`,
    'zh-tw': algolia => `使用 ${algolia} 搜尋`
  },
  tags: {
    ar: 'العلامات',
    bg: 'Етикети',
    cs: 'Značky',
    da: 'Mærke',
    el: 'Ετικέτες',
    en: 'Tags',
    es: 'Etiquetas',
    fi: 'Merkit',
    hu: 'Tagek',
    id: 'Tag',
    it: 'Tag',
    ja: 'タグ',
    ko: '태그',
    nl: 'Labels',
    no: 'Stikkord',
    pl: 'Tagi',
    pt: 'Etiquetas',
    ro: 'Etichete',
    ru: 'Теги',
    sk: 'Tagy',
    sv: 'Taggar',
    th: 'ป้ายชื่อ',
    tr: 'Etiketler',
    uk: 'Ярлики',
    vi: 'Thẻ',
    'zh-cn': '标签',
    'zh-tw': '標籤'
  }
};

function setLang(userTranslations, langKey) {
  const associatedLangKey = LOCALES_ASSOCIATIONS[langKey];
  for (let key in TRANSLATIONS) {
    if (!TRANSLATIONS.hasOwnProperty(key)) continue;
    const itemTranslation = TRANSLATIONS[key];
    const itemUserTranslation = userTranslations[key] || {};

    let trad = itemUserTranslation[langKey] ||
      itemTranslation[langKey] ||
      itemUserTranslation[associatedLangKey] ||
      itemTranslation[associatedLangKey] ||
      itemUserTranslation.en || // Fallback on english
      itemTranslation.en;

    if (['change_query', 'clear_filters'].indexOf(key) !== -1) {
      trad = `<span class="ais-link ais-${key.replace(/_/g, '-')}">${trad}</span>`;
    }
    if (['nb_results', 'quoted'].indexOf(key) !== -1) {
      trad = (function (_trad) {
        return function (...args) {
          return `<span class="ais-${key.replace(/_/g, '-')}">${_trad.call(this, ...args)}</span>`;
        };
      }(trad));
    }

    if (typeof trad === 'function') {
      trad = trad.bind(userTranslations);
    }

    userTranslations[key] = trad;
  }
}

export function loadTranslations(options) {
  let I18n = require('./I18n.js');
  setLang(options.translations, I18n.locale);
}

export default loadTranslations;
