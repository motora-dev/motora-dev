/** サポートする言語 */
export const SUPPORTED_LANGUAGES = ['ja'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
