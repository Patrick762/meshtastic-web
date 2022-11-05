import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import translation_en from './translations/en';
import translation_de from './translations/de';

// the translations
const resources = {
  en: translation_en,
  de: translation_de
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: "de",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;