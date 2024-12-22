import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import translationEN from './locales/en/translation.json';
import translationFR from './locales/fr/translation.json';

const resources = {
  en: {
    translation: translationEN,
  },
  fr: {
    translation: translationFR,
  },
};

i18n
  .use(LanguageDetector) // Utiliser le détecteur de langue du navigateur
  .use(initReactI18next) // Passer i18n instance à react-i18next
  .init({
    resources,
    fallbackLng: 'fr', // Utiliser le français si la langue détectée n'est pas disponible
    detection: {
      order: ['querystring', 'localStorage', 'navigator'], // Détecter la langue à partir du querystring, localStorage, et navigateur
      caches: ['localStorage'] // Mettre en cache la langue détectée dans localStorage
    },
    interpolation: {
      escapeValue: false, // React se charge déjà de l'échappement des valeurs
    },
  });

export default i18n;