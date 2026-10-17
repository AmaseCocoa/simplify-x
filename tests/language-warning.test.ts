import { afterEach, expect, test, vi } from 'vitest';
import { languageWarning, updateLanguageWarning } from '../src/modules/language-warning';

afterEach(() => vi.unstubAllGlobals());

test.each(['ja', 'ja-JP', 'JA_jp'])('supported language %s does not warn', language => {
    expect(languageWarning(language)).toBeUndefined();
});

test('unsupported language warning preserves the detected code and links to a prefilled issue', () => {
    const content = languageWarning('fr-CA')!;
    expect(content.message).toContain('fr-CA');
    expect(content.message).toContain('一部の機能が正常に動作しない可能性');
    expect(content.message).toContain('日本語');
    const url = new URL(content.issueUrl);
    expect(url.origin + url.pathname).toBe('https://github.com/AmaseCocoa/simplify-x/issues/new');
    expect(url.searchParams.get('title')).toContain('fr-CA');
    expect(url.searchParams.get('body')).toContain('fr-CA');
});

test('warning updates between unsupported languages and disappears for a supported language', () => {
    const message = { textContent: '' };
    const link = { href: '' };
    const warning = { hidden: true, querySelector: (selector: string) => selector === 'p' ? message : link };
    const shadow = { getElementById: () => warning } as unknown as ShadowRoot;
    const root = { lang: 'fr' };
    vi.stubGlobal('document', { documentElement: root });
    vi.stubGlobal('navigator', { language: 'ja-JP' });
    updateLanguageWarning(shadow);
    expect(warning.hidden).toBe(false);
    expect(message.textContent).toContain('「fr」');
    root.lang = 'de-DE';
    updateLanguageWarning(shadow);
    expect(message.textContent).toContain('「de-DE」');
    root.lang = 'ja-JP';
    updateLanguageWarning(shadow);
    expect(warning.hidden).toBe(true);
    root.lang = '';
    updateLanguageWarning(shadow);
    expect(warning.hidden).toBe(true);
});

test('unchanged detection does not rewrite the warning DOM', () => {
    const message = { textContent: '' };
    const link = { href: '' };
    const warning = { hidden: true, querySelector: (selector: string) => selector === 'p' ? message : link };
    const shadow = { getElementById: () => warning } as unknown as ShadowRoot;
    vi.stubGlobal('document', { documentElement: { lang: 'fr' } });
    updateLanguageWarning(shadow);
    Object.freeze(message);
    Object.freeze(link);
    Object.freeze(warning);
    expect(() => updateLanguageWarning(shadow)).not.toThrow();
});
