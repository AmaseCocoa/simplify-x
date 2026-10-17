import { afterEach, expect, test, vi } from 'vitest';
import translations from '../src/i18n.json';
import { resolveSelectors, resolveLanguage, siteLanguages } from '../src/i18n';
import { options, optionKeys } from '../src/options';
import { generateCss } from '../src/lite/css';
import { createStyles } from '../src/modules/styles';
import { normalizeSettings } from '../src/settings';

afterEach(() => vi.unstubAllGlobals());

test.each([['ja-JP', 'ja'], ['en-US', 'en'], ['EN_gb', 'en'], ['fr', 'en'], ['', 'en']])('normalizes %s to %s', (input, expected) => {
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

test.each(['css', 'stylus'] as const)('Lite generates %s for the selected X language', format => {
    const selected = ['hidePremium', 'hideGrok', 'hideRecommendedUsers', 'hideImpression'] as const;
    const ja = generateCss(selected, '1.6.1', format, 'ja');
    const en = generateCss(selected, '1.6.1', format, 'en');
    expect(ja).toContain('aria-label="おすすめユーザー"');
    expect(en).toContain('aria-label="Who to follow"');
    expect(en).toContain('aria-label="Grok actions"');
    expect(en).toContain('aria-label="Generate image"');
    expect(en).toContain('aria-label="Subscribe to Premium"');
    expect(en).toContain('aria-label$=" views. View post analytics"');
    expect(en).not.toContain('aria-label="おすすめユーザー"');
    expect(en).not.toContain('{{');
    expect(en).not.toContain('data-simplify-x');
    expect(ja).toContain('a[href="/i/premium_sign_up"]');
    expect(en).toContain('a[href="/i/premium_sign_up"]');
});

test('UserScript refreshes its CSS when html lang changes', () => {
    const style = { id: '', textContent: '', isConnected: true };
    const root = { lang: 'ja' };
    vi.stubGlobal('document', { createElement: () => style, documentElement: root });
    vi.stubGlobal('navigator', { language: 'en-US' });
    const { updateStyle, refreshLanguage } = createStyles(normalizeSettings({}));
    updateStyle();
    expect(style.textContent).toContain('aria-label="おすすめユーザー"');
    root.lang = 'en-US';
    refreshLanguage();
    expect(style.textContent).toContain('aria-label="Who to follow"');
    expect(style.textContent).not.toContain('aria-label="おすすめユーザー"');
    root.lang = '';
    refreshLanguage();
    expect(style.textContent).toContain('aria-label="Who to follow"');
});

test('localized rules can change operators, structure, and number of candidates', () => {
    const original = translations.en.selectors.grok;
    const variants = [
        'button[aria-label*="Grok"]',
        'button[aria-label^="Ask Grok"]',
        'div:has(> button[aria-label$="Grok"])',
        '[data-testid="grok-button"]',
    ];
    translations.en.selectors.grok = variants;
    try {
        expect(resolveSelectors([{ i18n: 'grok' }], 'en')).toEqual(variants);
        expect(resolveSelectors([{ i18n: 'grok' }], 'ja')).toEqual(['button[aria-label="Grok"]']);
        const css = generateCss(['hideGrok'], '1.6.1', 'css', 'en');
        for (const selector of variants) {
            expect(css).toContain(`${selector} {\n    display: none !important;\n}`);
        }
        expect(css).not.toContain('button[aria-label="Grok"] {');
    } finally {
        translations.en.selectors.grok = original;
    }
});

test('empty localized lists omit a language-specific rule without removing common selectors', () => {
    const original = translations.en.selectors.grok;
    translations.en.selectors.grok = [];
    try {
        expect(resolveSelectors(['a[href="/i/grok"]', { i18n: 'grok' }], 'en'))
            .toEqual(['a[href="/i/grok"]']);
    } finally {
        translations.en.selectors.grok = original;
    }
});

test('expanded rules are deduplicated and all English view variants are emitted', () => {
    const selectors = resolveSelectors([{ i18n: 'grok' }, { i18n: 'grok' }, 'button[aria-label="Grok"]'], 'en');
    expect(selectors).toEqual(['button[aria-label="Grok"]']);
    const css = generateCss(['hideImpression'], '1.6.1', 'css', 'en');
    expect(css).toContain('aria-label$=" view. View post analytics"');
    expect(css).toContain('aria-label$=" views. View post analytics"');
});
