import translations from './i18n.json';

export type SiteLanguage = keyof typeof translations;
export const siteLanguages = Object.keys(translations) as SiteLanguage[];
export const languageNames = Object.fromEntries(siteLanguages.map(language => [language, translations[language].name])) as Record<SiteLanguage, string>;

/** 地域付き言語コードも受け入れる。未対応の言語は英語へフォールバックする。 */
export function resolveLanguage(language: string): SiteLanguage {
    const base = language.trim().toLowerCase().split(/[-_]/)[0];
    return siteLanguages.find(candidate => candidate === base) ?? 'en';
}

function escapeCssString(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\r\n|[\n\r\f]/g, '\\a ');
}

/** プレースホルダーはCSSの二重引用符で囲んだ属性値に使う。 */
export function localizeSelector(selector: string, language: SiteLanguage): string {
    const labels = translations[language].labels;
    return selector.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
        if (!Object.hasOwn(labels, key)) throw new Error(`Unknown selector translation: ${key}`);
        return escapeCssString(labels[key as keyof typeof labels]);
    });
}
