import { options, optionKeys, type OptionKey } from '../options';

import { resolveSelectors, languageNames, type SiteLanguage } from '../i18n';

export type CssFormat = 'css' | 'stylus';

/** LiteにはCSSだけで動くセレクターを含める。DOM判定用のマークは生成しない。 */
export function generateCss(selected: readonly OptionKey[], version: string, format: CssFormat = 'css', language: SiteLanguage = 'ja'): string {
    const enabled = new Set(selected);
    const sections = optionKeys
        .filter(key => enabled.has(key))
        .map(key => {
            const option = options[key];
            const rules = resolveSelectors(option.selectors, language)
                .map(selector => `${selector} {\n    display: none !important;\n}`)
                .join('\n\n');
            return `/* ${option.title}${option.liteDescription ? `\n * ${option.liteDescription}` : ''} */\n${rules}`;
        });

    const body = sections.length > 0 ? sections.join('\n\n') : '/* 非表示にする項目が選択されていません。 */';
    const notes = `/* Simplify X Lite v${version}\n * 対象: x.com / twitter.com のみ\n * Xの表示言語: ${languageNames[language]} (${language})\n * 更新は手動です。このページで再生成し、適用済みのCSSを置き換えてください。\n * 広告のDOM判定とX内の設定画面は含まれません。\n */`;

    if (format === 'stylus') {
        return `/* ==UserStyle==\n@name Simplify X Lite\n@namespace github.com/AmaseCocoa/simplify-x\n@version ${version}\n@description Xの表示を整理するカスタムCSS。更新は手動。\n@license MIT\n==/UserStyle== */\n\n${notes}\n\n@-moz-document domain("x.com"), domain("twitter.com") {\n${body.split('\n').map(line => line ? `    ${line}` : '').join('\n')}\n}\n`;
    }

    return `${notes}\n\n${body}\n`;
}
