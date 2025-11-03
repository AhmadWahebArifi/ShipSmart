import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './locales/en.json';
import prsTranslations from './locales/prs.json'; // Dari (Afghan Persian)
import pbtTranslations from './locales/pbt.json'; // Pashto

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations
      },
      prs: {
        translation: prsTranslations
      },
      pbt: {
        translation: pbtTranslations
      }
    },
    lng: typeof window !== 'undefined' ? (localStorage.getItem('language') || 'en') : 'en', // Default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes
    },
    react: {
      useSuspense: false
    }
  });

export default i18n;

