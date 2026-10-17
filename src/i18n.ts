import translations from './i18n.json';

export type SiteLanguage = keyof typeof translations;
type LocalizedSelectorKey = keyof typeof translations.ja.selectors;

interface LanguageDefinition {
    name: string;
    selectors: Record<LocalizedSelectorKey, readonly string[]>;
}

// 各言語に同じキーを要求する。対象がない場合は空配列で明示する。
const definitions: Record<SiteLanguage, LanguageDefinition> = translations;
export const siteLanguages = Object.keys(definitions) as SiteLanguage[];
export const languageNames = Object.fromEntries(siteLanguages.map(language => [language, definitions[language].name])) as Record<SiteLanguage, string>;

/** 共通CSS文字列、またはi18n.json内の言語別セレクター配列への参照。 */
export type SelectorDefinition = string | { i18n: string };

/** 地域付き言語コードも受け入れる。未対応の言語は英語へフォールバックする。 */
export function resolveLanguage(language: string): SiteLanguage {
    const base = language.trim().toLowerCase().split(/[-_]/)[0];
    return siteLanguages.find(candidate => candidate === base) ?? 'en';
}

/** 一致演算子やDOM構造を加工せず、言語別の候補を独立したルールへ展開する。 */
export function resolveSelectors(selectors: readonly SelectorDefinition[], language: SiteLanguage): string[] {
    const localized = definitions[language].selectors;
    const expanded = selectors.flatMap(selector => {
        if (typeof selector === 'string') return [selector];
        if (!Object.hasOwn(localized, selector.i18n)) {
            throw new Error(`Unknown localized selector: ${selector.i18n}`);
        }
        return localized[selector.i18n as LocalizedSelectorKey];
    });
    return [...new Set(expanded)];
}
