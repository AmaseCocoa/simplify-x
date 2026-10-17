import translations from './i18n.json';

export type SiteLanguage = keyof typeof translations;
type LocalizedSelectorKey = keyof typeof translations.ja.selectors;

interface LanguageDefinition {
    name: string;
    selectors: Record<LocalizedSelectorKey, readonly string[]>;
}

const definitions: Record<SiteLanguage, LanguageDefinition> = translations;
export const siteLanguages = Object.keys(definitions) as SiteLanguage[];
export const languageNames = Object.fromEntries(siteLanguages.map(language => [language, definitions[language].name])) as Record<SiteLanguage, string>;

export type SelectorDefinition = string | { i18n: string };

export function resolveLanguage(language: string): SiteLanguage {
    const base = language.trim().toLowerCase().split(/[-_]/)[0];
    return siteLanguages.find(candidate => candidate === base) ?? 'ja';
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
