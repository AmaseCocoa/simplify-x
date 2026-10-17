import { expect, test } from 'vitest';
import { generateCss } from '../src/lite/css';
import { resolveSelectors } from '../src/i18n';
import { options, optionKeys } from '../src/options';

test('only selected CSS options are included, in definition order', () => {
    const css = generateCss(['hideGrok', 'hideCalls', 'hideCalls'], '1.6.1');
    expect(css).toContain('a[href="/i/calls"]');
    expect(css).toContain('a[href="/i/grok"]');
    expect(css).not.toContain('a[href="/i/premium_sign_up"]');
    expect(css.match(/a\[href="\/i\/calls"\]/g)).toHaveLength(1);
    expect(css.indexOf('a[href="/i/calls"]')).toBeLessThan(css.indexOf('a[href="/i/grok"]'));
});

test('Lite excludes every rule that requires a userscript marker', () => {
    const css = generateCss(optionKeys, '1.6.1');
    expect(css).not.toContain('data-simplify-x');
    expect(css).not.toContain('GM_');
    expect(css).not.toContain('<script');
    expect(css).toContain('https://ads.x.com/');
    expect(options.hideAds.scriptSelectors).toContain('[data-testid="cellInnerDiv"]:has([data-testid="eventHero"][data-simplify-x-ad])');
});

test('every standalone selector gets an independent rule', () => {
    const css = generateCss(optionKeys, '1.6.1');
    const rules = optionKeys.flatMap(key => resolveSelectors(options[key].selectors, 'ja'));
    for (const selector of rules) {
        expect(css).toContain(`${selector} {\n    display: none !important;\n}`);
    }
});

test('empty selection does not generate any hiding rules', () => {
    const css = generateCss([], '1.6.1');
    expect(css).not.toContain('display: none');
    expect(css).toContain('選択されていません');
});

test('plain CSS includes version and manual update instructions', () => {
    const css = generateCss(['hideImagine'], '2.0.0');
    expect(css).toContain('v2.0.0');
    expect(css).toContain('更新は手動');
    expect(css).not.toContain('@-moz-document');
    expect(css).not.toContain('@updateURL');
});

test('Stylus export is domain-scoped UserCSS without auto-update URL', () => {
    const css = generateCss(['hidePremium'], '1.6.1', 'stylus');
    expect(css).toContain('==UserStyle==');
    expect(css).toContain('@version 1.6.1');
    expect(css).toContain('@-moz-document domain("x.com"), domain("twitter.com") {');
    expect(css).not.toContain('@updateURL');
    expect(css).toContain('    a[href="/i/premium_sign_up"]');
});
