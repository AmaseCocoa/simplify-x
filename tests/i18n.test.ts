import { afterEach, expect, test, vi } from 'vitest';
import translations from '../src/i18n.json';
import { resolveSelectors, resolveLanguage, siteLanguages } from '../src/i18n';
import { options, optionKeys } from '../src/options';
import { generateCss } from '../src/lite/css';
import { createStyles } from '../src/modules/styles';
import { normalizeSettings } from '../src/settings';

afterEach(() => vi.unstubAllGlobals());

test.each([['ja-JP', 'ja'], ['en-US', 'ja'], ['EN_gb', 'ja'], ['fr', 'ja'], ['', 'ja']])('normalizes %s to %s', (input, expected) => {
    expect(resolveLanguage(input)).toBe(expected);
});

test('every language provides the same label keys and resolves all selectors', () => {
    const keys = Object.keys(translations.ja.selectors).sort();
    for (const language of siteLanguages) {
        expect(Object.keys(translations[language].selectors).sort()).toEqual(keys);
        for (const key of optionKeys) {
            const selectors = resolveSelectors(options[key].selectors, language);
            for (const selector of selectors) {
                expect(selector).not.toMatch(/\{\{/);
            }
        }
    }
});

test('unknown translation keys fail rather than silently emitting broken CSS', () => {
    expect(() => resolveSelectors([{ i18n: 'missing' }], 'ja')).toThrow('Unknown localized selector');
});

test.each(['css', 'stylus'] as const)('Lite generates %s for each configured language', format => {
    for (const language of siteLanguages) {
        const css = generateCss(optionKeys, '1.6.1', format, language);
        expect(css).not.toContain('{{');
        expect(css).not.toContain('data-simplify-x');
        for (const key of optionKeys) {
            for (const selector of resolveSelectors(options[key].selectors, language)) {
                expect(css).toContain(selector);
            }
        }
    }
});

test('UserScript keeps fallback CSS available for unsupported languages', () => {
    const style = { id: '', textContent: '', isConnected: true };
    const root = { lang: 'ja' };
    vi.stubGlobal('document', { createElement: () => style, documentElement: root });
    vi.stubGlobal('navigator', { language: 'ja-JP' });
    const { updateStyle, refreshLanguage } = createStyles(normalizeSettings({}));
    updateStyle();
    const japaneseCss = style.textContent;
    root.lang = 'fr';
    refreshLanguage();
    expect(style.textContent).toBe(japaneseCss);
    root.lang = '';
    refreshLanguage();
    expect(style.textContent).toBe(japaneseCss);
});

test('localized rules can change operators, structure, and number of candidates', () => {
    const original = translations.ja.selectors.premiumSubscribe;
    const variants = [
        'aside[aria-label*="プレミアム"]',
        'aside[aria-label^="プレミアムに"]',
        'div:has(> aside[aria-label$="サブスクライブ"])',
        '[data-testid="premium-banner"]',
    ];
    translations.ja.selectors.premiumSubscribe = variants;
    try {
        expect(resolveSelectors([{ i18n: 'premiumSubscribe' }], 'ja')).toEqual(variants);
        const css = generateCss(['hidePremium'], '1.6.1', 'css', 'ja');
        for (const selector of variants) {
            expect(css).toContain(`${selector} {\n    display: none !important;\n}`);
        }
        expect(css).not.toContain('aside[aria-label="プレミアムにサブスクライブ"] {');
    } finally {
        translations.ja.selectors.premiumSubscribe = original;
    }
});

test('empty localized lists omit a language-specific rule without removing common selectors', () => {
    const original = translations.ja.selectors.premiumSubscribe;
    translations.ja.selectors.premiumSubscribe = [];
    try {
        expect(resolveSelectors(['a[href="/i/premium_sign_up"]', { i18n: 'premiumSubscribe' }], 'ja'))
            .toEqual(['a[href="/i/premium_sign_up"]']);
    } finally {
        translations.ja.selectors.premiumSubscribe = original;
    }
});

test('expanded rules are deduplicated', () => {
    const selectors = resolveSelectors([{ i18n: 'premiumSubscribe' }, { i18n: 'premiumSubscribe' }, 'aside[aria-label="プレミアムにサブスクライブ"]'], 'ja');
    expect(selectors).toEqual(['aside[aria-label="プレミアムにサブスクライブ"]']);
});
