import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations (adjust path as needed for your directory structure)
import en from '../../public/locales/en/common.json';
import fr from '../../public/locales/fr/common.json';
import es from '../../public/locales/es/common.json';
import de from '../../public/locales/de/common.json';

const resources = {
  en: { translation: en },
  fr: { translation: fr },
  es: { translation: es },
  de: { translation: de }
};

if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
      detection: {
        // optionally configure detection; default is fine for most
        order: ['localStorage', 'navigator', 'htmlTag'],
        caches: ['localStorage'],
      },
      react: {
        useSuspense: false // disables React suspense, prevents hydration errors in Next.js
      }
    });
}

export default i18n;