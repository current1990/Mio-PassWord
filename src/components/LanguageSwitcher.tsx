'use client';

import { useTranslation } from '@/i18n/useTranslation';
import { LOCALES } from '@/i18n/config';

export function LanguageSwitcher() {
  const { locale, changeLocale } = useTranslation();
  
  return (
    <div className="absolute top-4 right-4 z-50">
      <select
        value={locale}
        onChange={(e) => changeLocale(e.target.value as typeof locale)}
        className="bg-white/90 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 shadow-lg hover:bg-white/95 transition-colors cursor-pointer outline-none"
      >
        {LOCALES.map((loc) => (
          <option key={loc} value={loc}>
            {loc === 'zh' ? '中文' : 'English'}
          </option>
        ))}
      </select>
    </div>
  );
}
