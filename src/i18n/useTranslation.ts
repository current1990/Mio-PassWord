'use client';

import { useState, useEffect } from 'react';
import { messages, Locale, getLocaleFromUrl, setLocaleInUrl, DEFAULT_LOCALE } from './config';

type NestedKeyOf<T> = {
  [K in keyof T & (string | number)]: T[K] extends object
    ? `${K}` | `${K}.${NestedKeyOf<T[K]>}`
    : `${K}`;
}[keyof T & (string | number)];

type MessageKey = NestedKeyOf<typeof messages.en>;

export function useTranslation() {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
  
  useEffect(() => {
    setLocale(getLocaleFromUrl());
  }, []);
  
  const t = (key: MessageKey): any => {
    const keys = key.split('.');
    let value: any = messages[locale];
    
    for (const k of keys) {
      value = value[k];
    }
    
    return value;
  };
  
  const changeLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    setLocaleInUrl(newLocale);
  };
  
  return {
    t,
    locale,
    changeLocale
  };
}
