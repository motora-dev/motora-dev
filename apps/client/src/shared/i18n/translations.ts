import { errorI18n } from '$i18n/error';
import { uiI18n } from '$i18n/ui';
import { SupportedLanguage } from './supported-languages';

// 言語ごとの翻訳データを合成
export const TRANSLATIONS: Record<SupportedLanguage, any> = {
  ja: {
    ...uiI18n.ja,
    ...errorI18n.ja,
  },
  // 新しい言語を追加する場合:
  // en: {
  //   ...uiI18n.en,
  //   ...errorI18n.en,
  // },
};

// 言語ごとの翻訳データを合成
export const ERROR_TRANSLATIONS: Record<SupportedLanguage, any> = {
  ja: {
    ...errorI18n.ja,
  },
  // 新しい言語を追加する場合:
  // en: {
  //   ...errorI18n.en,
  // },
};
