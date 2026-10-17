import { options, optionKeys, type OptionKey } from '../src/options';
import { generateCss, type CssFormat } from '../src/lite/css';
import { siteLanguages, languageNames, resolveLanguage, type SiteLanguage } from '../src/i18n';
import { version } from '../package.json';

const liteOptionKeys = optionKeys.filter(key => options[key].selectors.length > 0);
const STORAGE_KEY = 'simplify-x-lite-preferences';
const output = document.querySelector<HTMLTextAreaElement>('#css-output')!;
const formatSelect = document.querySelector<HTMLSelectElement>('#format')!;
const languageSelect = document.querySelector<HTMLSelectElement>('#site-language')!;
const status = document.querySelector<HTMLElement>('#output-status')!;
const fields = document.querySelector<HTMLFieldSetElement>('#options')!;
const checkboxes = new Map<OptionKey, HTMLInputElement>();

interface Preferences {
    selected: OptionKey[];
    format: CssFormat;
    language: SiteLanguage;
}

function loadPreferences(): Preferences {
    const defaults: Preferences = { selected: [...optionKeys], format: 'css', language: 'ja' };
    try {
        const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
        if (!value || typeof value !== 'object' || !('selected' in value) || !Array.isArray(value.selected)) {
            return defaults;
        }
        const selected = value.selected;
        return {
            selected: optionKeys.filter(key => selected.includes(key)),
            language: 'language' in value && typeof value.language === 'string' ? resolveLanguage(value.language) : 'ja',
            format: 'format' in value && value.format === 'stylus' ? 'stylus' : 'css',
        };
    } catch {
        return defaults;
    }
}

const preferences = loadPreferences();
formatSelect.value = preferences.format;
for (const language of siteLanguages) {
    const option = document.createElement('option');
    option.value = language;
    option.textContent = languageNames[language];
    languageSelect.append(option);
}
languageSelect.value = preferences.language;

function selectedOptions(): OptionKey[] {
    return liteOptionKeys.filter(key => checkboxes.get(key)?.checked);
}

function selectedFormat(): CssFormat {
    return formatSelect.value === 'stylus' ? 'stylus' : 'css';
}

function filename(): string {
    return selectedFormat() === 'stylus' ? 'simplify-x-lite.user.css' : 'simplify-x-lite.css';
}

function updateOutput(save = true): void {
    const selected = selectedOptions();
    output.value = generateCss(selected, version, selectedFormat(), resolveLanguage(languageSelect.value));
    document.querySelector('#filename')!.textContent = filename();
    document.querySelector('#selection-count')!.textContent = `${selected.length} / ${liteOptionKeys.length} 項目`;
    status.textContent = selected.length === 0
        ? '項目が選択されていないため、非表示ルールは出力されません。'
        : 'CSSを更新しました。コピーまたはダウンロードして適用してください。';

    if (!save) return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ selected, format: selectedFormat(), language: resolveLanguage(languageSelect.value) }));
    } catch {
        status.textContent = 'CSSは生成できましたが、選択を保存できません。このブラウザーでは再訪時に選び直してください。';
    }
}

for (const key of optionKeys) {
    const option = options[key];
    const label = document.createElement('label');
    label.className = 'option';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.name = key;
    input.disabled = !liteOptionKeys.includes(key);
    input.checked = !input.disabled && preferences.selected.includes(key);
    input.setAttribute('aria-describedby', `description-${key}`);

    const text = document.createElement('span');
    const title = document.createElement('span');
    title.className = 'option-title';
    title.textContent = option.title;
    if (option.liteDescription) {
        const badge = document.createElement('span');
        badge.className = 'partial-badge';
        badge.textContent = input.disabled ? '対象外' : '一部対応';
        title.append(badge);
    }
    const description = document.createElement('span');
    description.id = `description-${key}`;
    description.className = 'option-help';
    description.textContent = option.liteDescription ?? option.description;
    text.append(title, description);
    label.append(input, text);
    fields.append(label);
    checkboxes.set(key, input);
    input.addEventListener('change', () => updateOutput());
}

for (const [id, checked] of [['select-all', true], ['select-none', false]] as const) {
    document.getElementById(id)!.addEventListener('click', () => {
        checkboxes.forEach(input => { input.checked = !input.disabled && checked; });
        updateOutput();
    });
}

formatSelect.addEventListener('change', () => updateOutput());
languageSelect.addEventListener('change', () => updateOutput());
document.querySelector('#copy-css')!.addEventListener('click', async () => {
    const css = output.value;
    try {
        await navigator.clipboard.writeText(css);
        status.textContent = 'CSSをコピーしました。適用先と手動更新の案内を確認してください。';
    } catch {
        output.focus();
        output.select();
        status.textContent = '自動コピーできませんでした。選択したCSSをCtrl+C / ⌘Cでコピーしてください。';
    }
});

document.querySelector('#download-css')!.addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([output.value], { type: 'text/css;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename();
    document.body.append(link);
    link.click();
    link.remove();
    // ダウンロード開始前にBlob URLを破棄しない。
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status.textContent = `${filename()} のダウンロードを開始しました。更新時は以前のCSSを置き換えてください。`;
});

for (const element of document.querySelectorAll('[data-version]')) {
    element.textContent = `v${version}`;
}
updateOutput(false);
document.getElementById('generator')!.hidden = false;
