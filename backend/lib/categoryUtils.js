const CATEGORY_LABELS = {
  debt_management: 'Debt Management',
  financial_planning: 'Financial Planning',
  credit_scores: 'Credit Scores',
  legal_advice: 'Legal Advice'
};

const CATEGORY_ALIAS_SOURCE = {
  debt_management: ['debt management', 'debt-management', 'debt', 'debt advice', 'debt help'],
  financial_planning: ['financial planning', 'financial-planning', 'finance', 'financial advice', 'money management'],
  credit_scores: ['credit scores', 'credit-scores', 'credit', 'credit advice', 'credit repair'],
  legal_advice: ['legal advice', 'legal-advice', 'legal', 'law', 'legal help']
};

const sanitizeCategoryValue = (value) =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ');

const CATEGORY_LOOKUP = new Map();

Object.entries(CATEGORY_LABELS).forEach(([key, label]) => {
  const aliases = CATEGORY_ALIAS_SOURCE[key] || [];
  const aliasValues = [key, label, ...aliases];

  aliasValues.forEach((aliasValue) => {
    if (!aliasValue) return;
    CATEGORY_LOOKUP.set(sanitizeCategoryValue(aliasValue), key);
  });
});

CATEGORY_LOOKUP.set('all', 'all');
CATEGORY_LOOKUP.set('all posts', 'all');

const normalizeCategoryKey = (value, options = {}) => {
  const { fallback = 'debt_management', allowAll = false } = options;

  if (!value) {
    return allowAll ? fallback ?? 'all' : fallback;
  }

  const normalizedValue = sanitizeCategoryValue(value);
  const mappedKey = CATEGORY_LOOKUP.get(normalizedValue);

  if (mappedKey === 'all') {
    return allowAll ? 'all' : fallback;
  }

  if (mappedKey) {
    return mappedKey;
  }

  return fallback;
};

const getCategoryLabel = (key) => CATEGORY_LABELS[key] || CATEGORY_LABELS.debt_management;

const getCategoryQueryValues = (key) => {
  if (!key || key === 'all' || !CATEGORY_LABELS[key]) {
    return [];
  }

  const label = getCategoryLabel(key);
  const aliases = CATEGORY_ALIAS_SOURCE[key] || [];
  const values = new Set([key, label, ...aliases]);

  Array.from(values).forEach((value) => {
    if (!value) return;
    const strValue = value.toString();
    values.add(strValue.toLowerCase());
    values.add(strValue.replace(/\s+/g, '_'));
    values.add(strValue.replace(/\s+/g, '-'));
  });

  return Array.from(values).filter(Boolean);
};

const getCategoryMetadata = (categories, options = {}) => {
  const { fallback = 'debt_management' } = options;
  const categoryArray = Array.isArray(categories) ? categories.filter(Boolean) : [];

  if (categoryArray.length === 0) {
    return {
      key: fallback,
      label: getCategoryLabel(fallback),
      values: []
    };
  }

  for (const rawCategory of categoryArray) {
    const normalizedKey = normalizeCategoryKey(rawCategory, { fallback });
    if (normalizedKey && normalizedKey !== 'all') {
      return {
        key: normalizedKey,
        label: getCategoryLabel(normalizedKey),
        values: categoryArray
      };
    }
  }

  return {
    key: fallback,
    label: getCategoryLabel(fallback),
    values: categoryArray
  };
};

module.exports = {
  CATEGORY_LABELS,
  normalizeCategoryKey,
  getCategoryLabel,
  getCategoryQueryValues,
  getCategoryMetadata
};
