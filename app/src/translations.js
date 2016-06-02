import escapeHTML from './escapeHTML.js';

var TRANSLATIONS = {
  categories: {
    default: 'Categories',
    fr: 'Catégories',
    de: 'Kategorien',
    es: 'Categorías',
    it: 'Categorie',
    cs: 'Kategorie',
    ru: 'Категории'
  },
  clear_filters: {
    default: 'clear your filters',
    fr: 'enlever vos filtres',
    de: 'Ihre Filter leeren',
    es: 'borrar sus filtros',
    it: 'elimina i filtri',
    cs: 'zrušte své filtry',
    ru: 'сбросить фильтры'
  },
  change_query: {
    default: 'Change your query',
    fr: 'Changer votre requête',
    de: 'Ihre Abfrage ändern',
    es: 'Cambiar su consulta',
    it: 'Modifica la tua query',
    cs: 'změňte svůj dotaz',
    ru: 'Изменить запрос'
  },
  format_number: {
    default: (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','),
    fr: (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '),
    de: (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
    es: (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
    it: (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
    cs: (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '), // Non-breaking space
    ru: (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  },
  filter: {
    default: 'Filter results',
    fr: 'Filtrer les résultats',
    de: 'Ergebnisse filtern',
    es: 'Filtrar los resultados',
    it: 'Filtrare risultati',
    cs: 'Filtrovat výsledky',
    ru: 'фильтр'
  },
  nb_results: {
    default: function (nb) {
      return`${this.format_number(nb)} result${nb > 1 ? 's' : ''}`
    },
    fr: function (nb) {
      return `${this.format_number(nb)} résultat${nb > 1 ? 's' : ''}`;
    },
    de: function (nb) {
      return `${this.format_number(nb)} Ergebnis${nb > 1 ? 'se' : ''}`;
    },
    es: function (nb) {
      return `${this.format_number(nb)} resultado${nb > 1 ? 's' : ''}`;
    },
    it: function (nb) {
      return `${this.format_number(nb)} risultat${nb > 1 ? 'i' : 'o'}`;
    },
    cs: function (nb) {
      return `${this.format_number(nb)} výsled${nb > 1 ? (nb > 4 ? 'ky' : 'ků') : 'ek'}`;
    },
    ru: function (nb) {
      return nb > 1 ? `Найдено результатов: ${this.format_number(nb)}`: 'Найден 1 результат';
    }
  },
  no_result: {
    default: function (query) {
      return `No result found for ${this.quoted(query)}`;
    },
    fr: function (query) {
      return `Aucun résultat pour ${this.quoted(query)}`;
    },
    de: function (query) {
      return `Keine Ergebnisse für ${this.quoted(query)} gefunden`;
    },
    es: function (query) {
      return `No se han encontrado resultados para ${this.quoted(query)}`;
    },
    it: function (query) {
      return `Nessun risultato trovato per ${this.quoted(query)}`;
    },
    cs: function (query) {
      return `Pro dotaz ${this.quoted(query)} nebyly nalezeny žádné výsledky`;
    },
    ru: function (query) {
      return `По запросу ${this.quoted(query)} ничего не найдено`;
    }
  },
  no_result_actions: {
    default: function () {
      return `${this.change_query} or ${this.clear_filters}`;
    },
    fr: function () {
      return `${this.change_query} ou ${this.clear_filters}`;
    },
    de: function () {
      return `${this.change_query} oder ${this.clear_filters}`;
    },
    es: function () {
      return `${this.change_query} o ${this.clear_filters}`;
    },
    it: function () {
      return `${this.change_query} o ${this.clear_filters}`;
    },
    cs: function () {
      return `${this.change_query} nebo ${this.clear_filters}`;
    },
    ru: function () {
      return `${this.change_query} или ${this.clear_filters}`;
    }
  },
  placeholder: {
    default: 'Search in our articles',
    fr: 'Recherchez dans nos articles',
    de: 'In unseren Artikeln suchen',
    es: 'Buscar en nuestros artículos',
    it: 'Cerca nei nostri articoli',
    cs: 'Hledat v našich článcích',
    ru: 'Найти в наших статьях'
  },
  quoted: {
    default: text => `"${escapeHTML(text)}"`,
    cs: text => `„${escapeHTML(text)}“`
  },
  stats: {
    default: function (nbHits, processing) {
      return `${this.nb_results(nbHits)} found in ${processing} ms`;
    },
    fr: function (nbHits, processing) {
      return `${this.nb_results(nbHits)} trouvé${nbHits > 1 ? 's' : ''} en ${processing} ms`;
    },
    de: function (nbHits, processing) {
      return `${this.nb_results(nbHits)} gefunden in ${processing} ms`;
    },
    es: function (nbHits, processing) {
      return `${this.nb_results(nbHits)} encontrado${nbHits > 1 ? 's' : ''} en ${processing} ms`;
    },
    it: function (nbHits, processing) {
      return `${this.nb_results(nbHits)} trovat${nbHits > 1 ? 'i' : 'o'} in ${processing} ms`;
    },
    cs: function (nbHits, processing) {
      return `${this.nb_results(nbHits)} nalezen${nbHits > 1 ? (nbHits > 4 ? 'o' : 'y') : ''} za ${processing} ms`;
    },
    ru: function (nbHits, processing) {
      return `${this.nb_results(nbHits)} за ${processing} мс`;
    }
  },
  search_by: {
    default: algolia => `Search by ${algolia}`,
    fr: algolia => `Recherche par ${algolia}`,
    de: algolia => `Suche über ${algolia}`,
    es: algolia => `Búsqueda por ${algolia}`,
    it: algolia => `Cerca per ${algolia}`,
    cs: algolia => `Vyhledávat s využitím služby ${algolia}`,
    ru: algolia => `Найти в ${algolia}`
  },
  tags: {
    default: 'Tags',
    es: 'Etiquetas',
    it: 'Tag',
    cs: 'Značky',
    ru: 'Теги'
  }
};

function setLang(userTranslations, langKey) {
  for (var key in TRANSLATIONS) {
    if (!TRANSLATIONS.hasOwnProperty(key)) continue;
    var itemTranslation = TRANSLATIONS[key];
    var itemUserTranslation = userTranslations[key];

    var trad = itemTranslation[langKey] ||
      itemTranslation['default'] ||
      itemUserTranslation[langKey] ||
      itemUserTranslation['default'];

    if (['change_query', 'clear_filters'].indexOf(key) !== -1) {
      trad = `<span class="ais-link ais-${key.replace(/_/g, '-')}">${trad}</span>`;
    }
    if (['nb_results', 'quoted'].indexOf(key) !== -1) {
      trad = function (trad) {
        return function (...args) {
          return `<span class="ais-${key.replace(/_/g, '-')}">${trad.call(this, ...args)}</span>`;
        };
      }(trad);
    }

    if (typeof trad === 'function') {
      trad = function (trad) {
        return function (...args) {
          return trad.call(userTranslations, ...args);
        };
      }(trad);
    }

    userTranslations[key] = trad;
  }
}

export function loadTranslations(options) {
  let I18n = require('./I18n.js');
  setLang(options.translations, I18n.locale);
}

export default loadTranslations;
