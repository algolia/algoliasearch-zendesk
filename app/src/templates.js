import Hogan from 'hogan.js';

function compile(str) {
  const compiled = Hogan.compile(str);
  return compiled.render.bind(compiled);
}

const defaultTemplates = {
  autocomplete: {
    // Algolia logo
    algolia: subdomain => (
`<a
  href="https://www.algolia.com/?utm_source=zendesk&utm_medium=link&utm_campaign=autocomplete-${subdomain}"
  class="aa-powered-by-link"
>
  Algolia
</a>`
    ),

    // Autocompletion template for an article
    article: compile(
`<div
  class="
    aa-article-hit
    {{# isCategoryHeader }}aa-article-hit__category-first{{/ isCategoryHeader }}
    {{# isSectionHeader }}aa-article-hit__section-first{{/ isSectionHeader }}
    {{# sizeModifier }}aa-article-hit__{{ sizeModifier }}{{/ sizeModifier}}
  "
>
  <div class="aa-article-hit--category">
    <span class="aa-article-hit--category--content">
      {{ category.title }}
    </span>
  </div>
  <div class="aa-article-hit--line">
    <div class="aa-article-hit--section">
      {{ section.title }}
    </div>
    <div class="aa-article-hit--content">
      <div class="aa-article-hit--headline">
        <span class="aa-article-hit--title">
          {{& _highlightResult.title.value }}
        </span>
      </div>
      {{# _snippetResult.body_safe.value }}
        <div class="aa-article-hit--body">{{& _snippetResult.body_safe.value }}</div>
      {{/ _snippetResult.body_safe.value }}
    </div>
  </div>
</div>
<div class="clearfix"></div>`
    ),

    // Powered By
    poweredBy: compile(
`<div class="aa-powered-by">
  {{& content }}
</div>`
    ),

    // CSS to add to handle the color
    css: compile(
`.aa-article-hit--highlight {
  color: {{ color }};
}

.aa-article-hit--section {
  color: {{ color }};
}

.aa-article-hit--title .aa-article-hit--highlight {
  color: {{ highlightColor }};
}

.aa-article-hit--title .aa-article-hit--highlight::before {
  background-color: {{ highlightColor }};
}`
    )
  }
};

export default function loadTemplates(options) {
  options.templates = {
    autocomplete: {
      ...defaultTemplates.autocomplete,
      ...options.templates.autocomplete
    }
  };
}
