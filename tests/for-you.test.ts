import { afterEach, expect, test, vi } from 'vitest';
import { createForYouFilter, FOR_YOU_MARK, isForYouTab } from '../src/modules/for-you';
import { normalizeSettings } from '../src/settings';
import { generateCss } from '../src/lite/css';

afterEach(() => vi.unstubAllGlobals());

function card(text: string, role = 'presentation') {
    const attributes = new Map<string, string>();
    const tab = { textContent: text };
    const element = {
        isConnected: true,
        getAttribute: () => role,
        querySelector: () => tab,
        hasAttribute: (name: string) => attributes.has(name),
        setAttribute: (name: string, value: string) => attributes.set(name, value),
        removeAttribute: (name: string) => attributes.delete(name),
    } as unknown as Element;
    return { element, tab };
}

test('matches the localized tab title and leaves other tabs alone', () => {
    expect(isForYouTab(card('おすすめ').element, 'ja')).toBe(true);
    expect(isForYouTab(card('For you').element, 'en')).toBe(true);
    expect(isForYouTab(card('Following').element, 'en')).toBe(false);
    expect(isForYouTab(card('フォロー中').element, 'ja')).toBe(false);
    expect(isForYouTab(card('おすすめの記事').element, 'ja')).toBe(false);
    expect(isForYouTab(card('おすすめ', 'article').element, 'ja')).toBe(false);
});

test('marks the wrapper and restores it when reused or disabled', () => {
    vi.stubGlobal('document', { documentElement: { lang: 'ja' } });
    const settings = normalizeSettings({});
    const filter = createForYouFilter(settings);
    const { element, tab } = card('おすすめ');
    filter.inspect(element);
    expect(element.hasAttribute(FOR_YOU_MARK)).toBe(true);
    tab.textContent = 'フォロー中';
    filter.inspect(element);
    expect(element.hasAttribute(FOR_YOU_MARK)).toBe(false);
    tab.textContent = 'おすすめ';
    filter.inspect(element);
    settings.hideForYouTab = false;
    filter.inspect(element);
    expect(element.hasAttribute(FOR_YOU_MARK)).toBe(false);
});

test('Lite does not output a nonfunctional userscript-only setting', () => {
    const css = generateCss(['hideForYouTab'], '1.6.1');
    expect(css).not.toContain('display: none');
    expect(css).not.toContain(FOR_YOU_MARK);
});
