/**
 * Translation hook for easier i18n usage
 */
import { localizationService } from '../services/i18n/LocalizationService';

export const useTranslation = () => {
  const t = (key, params = {}) => {
    return localizationService.t(key, params);
  };

  const formatNumber = (number, decimals = 1) => {
    return localizationService.formatNumber(number, decimals);
  };

  const getCurrentLanguage = () => {
    return localizationService.getCurrentLanguage();
  };

  const getAvailableLanguages = () => {
    return localizationService.getAvailableLanguages();
  };

  return {
    t,
    formatNumber,
    getCurrentLanguage,
    getAvailableLanguages,
  };
};