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
      return `No results found for "${query}"`;
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

  in: {
    ar: function (section) {
      return `في ${section}`;
    },
    bg: function (section) {
      return `в ${section}`;
    },
    cs: function (section) {
      return `v ${section}`;
    },
    da: function (section) {
      return `i ${section}`;
    },
    de: function (section) {
      return `im ${section}`;
    },
    el: function (section) {
      return `σε ${section}`;
    },
    en: function (section) {
      return `in ${section}`;
    },
    es: function (section) {
      return `en ${section}`;
    },
    fi: function (section) {
      return `sisään ${section}`;
    },
    fr: function (section) {
      return `dans ${section}`;
    },
    hu: function (section) {
      return `ban ben ${section}`;
    },
    id: function (section) {
      return `di ${section}`;
    },
    it: function (section) {
      return `nel ${section}`;
    },
    ja: function (section) {
      return `に ${section}`;
    },
    ko: function (section) {
      return `에 ${section}`;
    },
    nl: function (section) {
      return `in ${section}`;
    },
    no: function (section) {
      return `i ${section}`;
    },
    pl: function (section) {
      return `w ${section}`;
    },
    pt: function (section) {
      return `no ${section}`;
    },
    'pt-br': function (section) {
      return `no ${section}`;
    },
    ro: function (section) {
      return `în ${section}`;
    },
    ru: function (section) {
      return `в ${section}`;
    },
    sk: function (section) {
      return `v ${section}`;
    },
    sv: function (section) {
      return `i ${section}`;
    },
    th: function (section) {
      return `ใน ${section}`;
    },
    tr: function (section) {
      return `içinde ${section}`;
    },
    uk: function (section) {
      return `в ${section}`;
    },
    vi: function (section) {
      return `trong ${section}`;
    },
    'zh-cn': function (section) {
      return `在 ${section}`;
    },
    'zh-tw': function (section) {
      return `在 ${section}`;
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

  bestAnswer: {
    ar: 'افضل جواب',
    bg: 'Най-добър отговор',
    cs: 'Nejlepší odpověď',
    da: 'Bedste svar',
    de: 'Beste Antwort',
    el: 'Καλύτερη απάντηση',
    en: 'Best Answer',
    es: 'La mejor respuesta',
    fi: 'Paras vastaus',
    fr: 'Meilleure réponse',
    hu: 'Legjobb válasz',
    id: 'Jawaban Terbaik',
    it: 'Migliore risposta',
    ja: 'ベスト回答',
    ko: '우수 답변',
    nl: 'Beste antwoord',
    no: 'Beste svar',
    pl: 'Najlepsza odpowiedź',
    pt: 'Melhor resposta',
    'pt-br': 'Melhor resposta',
    ro: 'Cel mai bun raspuns',
    ru: 'Лучший ответ',
    sk: 'najlepšiu odpoveď',
    sv: 'Bästa svaret',
    th: 'ตอบที่ดีที่สุด',
    tr: 'En iyi cevap',
    uk: 'Найкращою відповіддю',
    vi: 'Câu trả lời tốt nhất',
    'zh-cn': '最佳答案',
    'zh-tw': '最佳答案',
  },

  cancel: {
    ar: 'إلغاء',
    bg: 'анулира',
    cs: 'zrušení',
    da: 'afbestille',
    de: 'stornieren',
    el: 'Ματαίωση',
    en: 'cancel',
    es: 'cancelar',
    fi: 'peruuttaa',
    fr: 'Annuler',
    hu: 'megszünteti',
    id: 'membatalkan',
    it: 'Annulla',
    ja: 'キャンセル',
    ko: '취소',
    nl: 'annuleren',
    no: 'Avbryt',
    pl: 'Anuluj',
    pt: 'cancelar',
    'pt-br': 'cancelar',
    ro: 'Anulare',
    ru: 'Отмена',
    sk: 'Zrušiť',
    sv: 'Avbryt',
    th: 'ยกเลิก',
    tr: 'iptal etmek',
    uk: 'скасувати',
    vi: 'hủy bỏ',
    'zh-cn': '取消',
    'zh-tw': '取消',
  },

  toSelect: {
    ar: 'تحديد',
    bg: 'изберете',
    cs: 'vybrat',
    da: 'Vælg',
    de: 'wählen',
    el: 'επιλέγω',
    en: 'select',
    es: 'Seleccione',
    fi: 'valita',
    fr: 'sélectionner',
    hu: 'választ',
    id: 'Pilih',
    it: 'Selezionare',
    ja: '選択する',
    ko: '고르다',
    nl: 'kiezen',
    no: 'å velge',
    pl: 'Wybierz',
    pt: 'selecionar',
    'pt-br': 'selecionar',
    ro: 'Selectați',
    ru: 'Выбрать',
    sk: 'vybrať',
    sv: 'Välj',
    th: 'เลือก',
    tr: 'seçmek',
    uk: 'вибрати',
    vi: 'lựa chọn',
    'zh-cn': '选择',
    'zh-tw': '選擇',
  },

  toNavigate: {
    ar: 'التنقل',
    bg: 'навигация',
    cs: 'navigovat',
    da: 'navigere',
    de: 'navigieren',
    el: 'κυβερνώ',
    en: 'navigate',
    es: 'navegar',
    fi: 'navigoida',
    fr: 'naviguer',
    hu: 'hajózik',
    id: 'menavigasi',
    it: 'navigare',
    ja: 'ナビゲート',
    ko: '탐색',
    nl: 'navigeren',
    no: 'navigere',
    pl: 'nawigować',
    pt: 'navegar',
    'pt-br': 'navegar',
    ro: 'Naviga',
    ru: 'навигации',
    sk: 'navigáciu',
    sv: 'navigera',
    th: 'นำทาง',
    tr: 'gezinme',
    uk: 'навігації',
    vi: 'điều hướng',
    'zh-cn': '导航',
    'zh-tw': '導航',
  },

  toClose: {
    ar: 'أغلق',
    bg: 'близо',
    cs: 'zavřít',
    da: 'tæt',
    de: 'schließen',
    el: 'Κλείσε',
    en: 'close',
    es: 'cerrar',
    fi: 'kiinni',
    fr: 'Fermer',
    hu: 'Bezárás',
    id: 'Menutup',
    it: 'vicino',
    ja: '閉じる',
    ko: '닫기',
    nl: 'dichtbij',
    no: 'Lukk',
    pl: 'blisko',
    pt: 'fechar',
    'pt-br': 'fechar',
    ro: 'închide',
    ru: 'Закрыть',
    sk: 'Zavrieť',
    sv: 'stänga',
    th: 'ปิด',
    tr: 'kapat',
    uk: 'близько',
    vi: 'đóng',
    'zh-cn': '关闭',
    'zh-tw': '關閉',
  },

  descriptionLock: {
    ar: 'يرجى ملء الموضوع أولا.',
    bg: 'Моля, първо попълнете темата.',
    cs: 'Nejprve vyplňte předmět.',
    da: 'Udfyld venligst emnet først.',
    de: 'Bitte tragen Sie zuerst den Betreff ein.',
    el: 'Συμπληρώστε πρώτα το θέμα.',
    en: 'Please fill in the subject first.',
    es: 'Primero complete el asunto.',
    fi: 'Täytä ensin aihe.',
    fr: "Veuillez d'abord remplir le sujet.",
    hu: 'Kérjük, először töltse ki a tárgyat.',
    id: 'Silakan isi subjek terlebih dahulu.',
    it: "Si prega di compilare prima l'oggetto.",
    ja: '最初に件名を入力してください。',
    ko: '먼저 제목을 입력하십시오.',
    nl: 'Vul eerst het onderwerp in.',
    no: 'Vennligst fyll ut emnet først.',
    pl: 'Proszę najpierw wypełnić temat.',
    pt: 'Por favor, preencha o assunto primeiro.',
    'pt-br': 'Por favor, preencha o assunto primeiro.',
    ro: 'Vă rugăm să completați mai întâi subiectul.',
    ru: 'Пожалуйста, сначала заполните тему.',
    sk: 'Najskôr vyplňte predmet.',
    sv: 'Najprej izpolnite predmet.',
    th: 'กรุณากรอกหัวข้อก่อน',
    tr: 'Lütfen önce konuyu doldurunuz.',
    uk: 'Спочатку заповніть тему.',
    vi: 'Vui lòng điền chủ đề trước.',
    'zh-cn': '请先填写主题。',
    'zh-tw': '請先填寫主題。',
  },
};

export default function translate(userTranslations, locale, key, ...args) {
  const t = userTranslations[key] || defaultTranslations[key];
  if (t === null) {
    throw new Error(`Unknown translation key '${key}'.`);
  }

  const lang = localeToLang[locale] || locale;
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
