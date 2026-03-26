/**
 * i18next / browser often report "en-US", "es-419", etc. CMS JSON uses short keys "en" | "es".
 */
export function normalizeUiLanguage(lang) {
  if (!lang || typeof lang !== 'string') return 'es';
  const l = lang.toLowerCase();
  if (l.startsWith('en')) return 'en';
  if (l.startsWith('es')) return 'es';
  const base = l.split('-')[0];
  if (base === 'en' || base === 'es') return base;
  return base;
}

function hasText(v) {
  return v != null && String(v).trim() !== '';
}

/**
 * Pick a string from a { en?, es?, ... } object using UI language with sensible fallbacks.
 */
export function pickLocalized(obj, lang) {
  if (obj == null || typeof obj !== 'object') return '';
  const short = normalizeUiLanguage(lang);
  const order = [short, lang, 'es', 'en'];
  const seen = new Set();
  for (const k of order) {
    if (k == null || seen.has(k)) continue;
    seen.add(k);
    if (hasText(obj[k])) return String(obj[k]);
  }
  for (const v of Object.values(obj)) {
    if (hasText(v)) return String(v);
  }
  return '';
}
