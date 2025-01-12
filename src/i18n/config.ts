import en from './locales/en.json';
import zh from './locales/zh.json';

export const LOCALES = ['en', 'zh'] as const;
export type Locale = typeof LOCALES[number];

export const DEFAULT_LOCALE: Locale = 'zh';

export const messages = {
  en,
  zh,
} as const;

export function getLocaleFromUrl(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  
  const params = new URLSearchParams(window.location.search);
  const locale = params.get('lang');
  
  return LOCALES.includes(locale as Locale) ? (locale as Locale) : DEFAULT_LOCALE;
}

export function setLocaleInUrl(locale: Locale) {
  if (typeof window === 'undefined') return;
  
  const url = new URL(window.location.href);
  url.searchParams.set('lang', locale);
  window.location.href = url.toString();
}
