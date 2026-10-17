import translations from './i18n.json';

export type SiteLanguage = keyof typeof translations;
type LocalizedSelectorKey = keyof typeof translations.ja.selectors;

interface LanguageDefinition {
    name: string;
    textLabels: { forYouTab: string };
    selectors: Record<LocalizedSelectorKey, readonly string[]>;
}

const definitions: Record<SiteLanguage, LanguageDefinition> = translations;
export const siteLanguages = Object.keys(definitions) as SiteLanguage[];
export const languageNames = Object.fromEntries(siteLanguages.map(language => [language, definitions[language].name])) as Record<SiteLanguage, string>;

export type SelectorDefinition = string | { i18n: string };

function supportedLanguage(language: string): SiteLanguage | undefined {
    const base = language.trim().toLowerCase().split(/[-_]/)[0];
    return siteLanguages.find(candidate => candidate === base);
}

export function resolveLanguage(language: string): SiteLanguage {
    return supportedLanguage(language) ?? 'ja';
}

export function isSupportedLanguage(language: string): boolean {
    return supportedLanguage(language) !== undefined;
}

/** CSS生成と設定画面で、同じ検出元を使用する。 */
export function detectPageLanguage(): string {
    return document.documentElement?.lang || navigator.language;
}

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

export function forYouTabLabel(language: SiteLanguage): string {
    return definitions[language].textLabels.forYouTab;
}
