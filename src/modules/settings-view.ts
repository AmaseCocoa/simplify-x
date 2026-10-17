import { options, optionKeys, type OptionKey } from "../options";
import { updateLanguageWarning } from "./language-warning";
import type { Settings } from "../settings";

export const navigationStyles = `
[data-simplify-x-covered] {
    display:none !important;
}
#simplify-x-entry {
    display:flex;
    align-items:center;
    justify-content:space-between;
    padding:16px;
    min-height:48px;
    color:inherit;
    text-decoration:none;
    font:inherit;
}
#simplify-x-entry[aria-current="page"] {
    background:rgba(128,128,128,.08);
    border-right:2px solid #1d9bf0;
}
[data-simplify-x-nav] [role="tab"][aria-selected="false"] {
    border-right-color:transparent !important;
    background-color:transparent !important;
}
#simplify-x-entry:hover {
    background:rgba(128,128,128,.1);
}
#simplify-x-entry:focus-visible {
    outline:2px solid #1d9bf0;
    outline-offset:-2px;
}
`;

export function isPlainClick(event: MouseEvent): boolean {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

export function renderSettingsView(
  shadow: ShadowRoot,
  settings: Settings,
  darkMode: boolean,
  onChange: (key: OptionKey, checked: boolean, status: HTMLElement) => void,
  onBack: () => void,
): void {
  shadow.innerHTML = `
<style>
:host {
    display:block;
    width:100%;
    color:var(--sx-text);
    font:15px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
    color-scheme:${darkMode ? 'dark' : 'light'};
}
* {
    box-sizing:border-box;
}
header {
    display:flex;
    align-items:center;
    gap:24px;
    min-height:56px;
    padding:0 16px;
}
h2 {
    font-size:20px;
    line-height:24px;
    margin:0;
    font-weight:700;
}
h2:focus {
    outline:none;
}
a {
    display:grid;
    place-items:center;
    width:32px;
    height:32px;
    margin-left:-8px;
    border-radius:50%;
    color:inherit;
    text-decoration:none;
}
a:hover {
    background:rgba(128,128,128,.15);
}
p {
    color:var(--sx-muted);
    font-size:13px;
    margin:0;
}
.intro {
    padding:12px 16px 20px;
    border-bottom:1px solid var(--sx-border);
}
h3 {
    font-size:20px;
    margin:0;
    padding:16px;
}
label {
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:24px;
    min-height:76px;
    padding:14px 16px;
    cursor:pointer;
}
label:hover {
    background:rgba(128,128,128,.04);
}
label span {
    display:block;
}
label p {
    margin-top:3px;
}
input {
    appearance:none;
    width:20px;
    height:20px;
    flex:0 0 20px;
    margin:0;
    border:2px solid var(--sx-muted);
    border-radius:4px;
    cursor:pointer;
}
input:checked {
    background:#1d9bf0;
    border-color:#1d9bf0;
}
input:checked::after {
    content:'';
    display:block;
    width:5px;
    height:10px;
    border:solid white;
    border-width:0 2px 2px 0;
    transform:rotate(45deg);
    margin:1px 0 0 5px;
}
:focus-visible {
    outline:2px solid #1d9bf0;
    outline-offset:4px;
}
#language-warning {
    margin:16px;
    padding:16px;
    border:1px solid #b98725;
    border-radius:8px;
    background:rgba(185,135,37,.12);
}
#language-warning[hidden] {
    display:none;
}
#language-warning p {
    color:inherit;
    overflow-wrap:anywhere;
}
#language-warning a {
    display:inline-block;
    width:auto;
    height:auto;
    margin:8px 0 0;
    border-radius:0;
    text-decoration:underline;
}
#status {
    padding:16px;
    min-height:52px;
    border-top:1px solid var(--sx-border);
}
</style>
<section aria-labelledby="title">
<header>
<a href="/settings" aria-label="設定に戻る">
<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
<path d="M7.414 11H21v2H7.414l5.293 5.293-1.414 1.414L3.586 12l7.707-7.707 1.414 1.414z"/>
</svg>
</a>
<h2 id="title" tabindex="-1">Simplify X</h2>
</header>
<p class="intro">Xに表示する項目を管理します。変更は自動で保存され、すぐに反映されます。</p>
<aside id="language-warning" role="alert" hidden>
<p></p>
<a target="_blank" rel="noopener noreferrer">GitHub Issueで言語対応をリクエストする</a>
</aside>
<h3>非表示にする項目</h3>
<div id="fields">
</div>
<p id="status" role="status" aria-live="polite">チェックした項目を非表示にします。</p>
</section>`;
  updateLanguageWarning(shadow);
  const backLink = shadow.querySelector("a")!;
  const fields = shadow.getElementById("fields")!;
  const status = shadow.getElementById("status")!;
  backLink.href = `${location.pathname}${location.search}`;

  for (const key of optionKeys) {
    const option = options[key];
    const label = document.createElement("label");
    const text = document.createElement("span");
    text.textContent = option.title;

    const help = document.createElement("p");
    help.textContent = option.description;
    help.id = `help-${key}`;
    text.append(help);

    const input = document.createElement("input");
    input.type = "checkbox";
    input.name = key;
    input.checked = settings[key];
    input.setAttribute("aria-describedby", help.id);
    input.addEventListener("change", () =>
      onChange(key, input.checked, status),
    );

    label.append(text, input);
    fields.append(label);
  }

  backLink.addEventListener("click", (event) => {
    if (!isPlainClick(event)) return;
    event.preventDefault();
    event.stopPropagation();
    onBack();
  });
}
