import { afterEach, expect, test, vi } from 'vitest';
import translations from '../src/i18n.json';
import { localizeSelector, resolveLanguage, siteLanguages } from '../src/i18n';
import { options, optionKeys } from '../src/options';
import { generateCss } from '../src/lite/css';
import { createStyles } from '../src/modules/styles';
import { normalizeSettings } from '../src/settings';

afterEach(() => vi.unstubAllGlobals());

test.each([['ja-JP', 'ja'], ['en-US', 'en'], ['EN_gb', 'en'], ['fr', 'en'], ['', 'en']])('normalizes %s to %s', (input, expected) => {
    expect(resolveLanguage(input)).toBe(expected);
});

test('every language provides the same label keys and resolves all selectors', () => {
    const keys = Object.keys(translations.ja.labels).sort();
    for (const language of siteLanguages) {
        expect(Object.keys(translations[language].labels).sort()).toEqual(keys);
        for (const key of optionKeys) {
            for (const selector of options[key].selectors) {
                expect(localizeSelector(selector, language)).not.toMatch(/\{\{/);
            }
        }
    }
});

test('unknown translation keys fail rather than silently emitting broken CSS', () => {
    expect(() => localizeSelector('[aria-label="{{missing}}"]', 'ja')).toThrow('Unknown selector translation');
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
