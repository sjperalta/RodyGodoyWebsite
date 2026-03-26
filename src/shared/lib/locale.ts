interface LocalizedString {
  en: string;
  es: string;
}

export function pickLocalized(obj: LocalizedString, language: string): string {
  if (!obj) return '';
  if (language === 'es') return obj.es || obj.en;
  return obj.en || obj.es;
}
