import { options, optionKeys, descriptions } from '../options';
import { saveSettings, type Settings } from '../settings';
export function createSettingsPage(settings: Settings, updateStyle: () => void, rescan: () => void) {
    const isSettingsRoute = () => /^\/settings(?:\/|$)/.test(location.pathname);
    const settingsUrl = () => `${location.pathname}${location.search}#simplify-x`;
    let pageHost: HTMLDivElement | null = null;
    let hiddenNodes: Element[] = [];
    let uiScheduled = false;
    let selectedTabs: Element[] = [];
    let detailLabel: { node: Element; label: string | null; labelledby: string | null } | null = null;
    function coverChildren(container: Element) {
        for (const node of container.children) {
            if (node === pageHost || hiddenNodes.includes(node)) continue;
            hiddenNodes.push(node);
            node.setAttribute('data-simplify-x-covered', '');
        }
    }
    const uiStyle = document.createElement('style');
    uiStyle.textContent = '[data-simplify-x-covered] { display:none !important; } #simplify-x-entry { display:flex; align-items:center; justify-content:space-between; padding:16px; min-height:48px; color:inherit; text-decoration:none; font:inherit; } #simplify-x-entry[aria-current="page"] { background:rgba(128,128,128,.08); border-right:2px solid #1d9bf0; } [data-simplify-x-nav] [role="tab"][aria-selected="false"] { border-right-color:transparent !important; background-color:transparent !important; } #simplify-x-entry:hover { background:rgba(128,128,128,.1); } #simplify-x-entry:focus-visible { outline:2px solid #1d9bf0; outline-offset:-2px; }';
    function restorePage() {
        hiddenNodes.forEach(node => node.removeAttribute('data-simplify-x-covered'));
        hiddenNodes = [];
        selectedTabs.forEach(node => { if (node.isConnected) node.setAttribute('aria-selected', 'true'); });
        selectedTabs = [];
        document.querySelectorAll('[data-simplify-x-nav]').forEach(node => node.removeAttribute('data-simplify-x-nav'));
        document.getElementById('simplify-x-entry')?.removeAttribute('aria-current');
        if (detailLabel) {
            const { node, label, labelledby } = detailLabel;
            for (const [key, value] of [['aria-label', label], ['aria-labelledby', labelledby]] as const) {
                if (value === null) node.removeAttribute(key); else node.setAttribute(key, value);
            }
            detailLabel = null;
        }
        pageHost?.remove(); pageHost = null;
    }
    function openSettings() {
        if (isSettingsRoute()) {
            location.hash = 'simplify-x';
            syncSettingsPage();
        } else location.assign('/settings#simplify-x');
    }
    function scheduleSettingsPage() {
        if (uiScheduled) return;
        if (!isSettingsRoute() && !pageHost) return;
        uiScheduled = true;
        requestAnimationFrame(() => { uiScheduled = false; syncSettingsPage(); });
    }
    function syncSettingsPage() {
        const onSettings = isSettingsRoute();
        const active = onSettings && location.hash === '#simplify-x';
        if (!active) restorePage();
        if (!isSettingsRoute()) return;
        // 観測した設定一覧のroleとリンクを組み合わせ、他のタブ一覧への挿入を避ける。
        const list = [...document.querySelectorAll('[role="tablist"]')].find(el => el.querySelector('a[href="/settings/account"]'));
        const detail = document.querySelector('[role="region"][aria-labelledby~="detail-header"]') || detailLabel?.node;
        if (!list && !detail) { if (pageHost && !pageHost.isConnected) restorePage(); return; }
        if (!uiStyle.isConnected) (document.head || document.documentElement).append(uiStyle);
        let entry = list?.querySelector<HTMLAnchorElement>('#simplify-x-entry');
        if (list && !entry) {
            entry = document.createElement('a');
            entry.id = 'simplify-x-entry'; entry.href = settingsUrl();
            // role=tabのネイティブ項目に並べるが、独立ページへ移動するリンクとして扱う。
            entry.innerHTML = '<span>Simplify X</span><svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M14.586 12L7.543 4.96l1.414-1.42L17.414 12l-8.457 8.46-1.414-1.42L14.586 12z"/></svg>';
            entry.addEventListener('click', event => {
                if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                event.preventDefault(); event.stopPropagation(); openSettings();
                pageHost?.shadowRoot?.querySelector('h2')?.focus();
            });
            list.append(entry);
        }
        if (entry) entry.href = settingsUrl();
        if (!active) return;
        // PC版はネイティブの右詳細欄、単一カラムでは表示中の設定エリアを使う。
        const detailVisible = detail?.isConnected && getComputedStyle(detail).display !== 'none' && detail.getBoundingClientRect().width > 0;
        const container = detailVisible ? detail : list?.parentElement;
        if (!container) return;
        if (pageHost?.isConnected && pageHost.parentElement === container) {
            coverChildren(container);
            return;
        }
        restorePage();
        pageHost = document.createElement('div'); pageHost.id = 'simplify-x-settings';
        const shadow = pageHost.attachShadow({ mode: 'open' });
        const nativeText = list?.querySelector('a[href="/settings/account"] span') || document.getElementById('detail-header');
        const foreground = nativeText ? getComputedStyle(nativeText).color : getComputedStyle(document.body).color;
        const rgb = foreground.match(/\d+/g)?.map(Number) || [15,20,25];
        const dark = (rgb[0] + rgb[1] + rgb[2]) / 3 > 150;
        pageHost.style.setProperty('--sx-text', foreground);
        pageHost.style.setProperty('--sx-muted', dark ? '#8b98a5' : '#536471');
        pageHost.style.setProperty('--sx-border', dark ? '#38444d' : '#eff3f4');
        shadow.innerHTML = `
<style>
:host { display:block; width:100%; color:var(--sx-text); font:15px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; color-scheme:${dark ? 'dark' : 'light'}; }
* { box-sizing:border-box; } header { display:flex; align-items:center; gap:24px; min-height:56px; padding:0 16px; }
h2 { font-size:20px; line-height:24px; margin:0; font-weight:700; } h2:focus { outline:none; }
a { display:grid; place-items:center; width:32px; height:32px; margin-left:-8px; border-radius:50%; color:inherit; text-decoration:none; } a:hover { background:rgba(128,128,128,.15); }
p { color:var(--sx-muted); font-size:13px; margin:0; } .intro { padding:12px 16px 20px; border-bottom:1px solid var(--sx-border); }
h3 { font-size:20px; margin:0; padding:16px; } label { display:flex; align-items:center; justify-content:space-between; gap:24px; min-height:76px; padding:14px 16px; cursor:pointer; } label:hover { background:rgba(128,128,128,.04); } label span { display:block; } label p { margin-top:3px; }
input { appearance:none; width:20px; height:20px; flex:0 0 20px; margin:0; border:2px solid var(--sx-muted); border-radius:4px; cursor:pointer; }
input:checked { background:#1d9bf0; border-color:#1d9bf0; } input:checked::after { content:''; display:block; width:5px; height:10px; border:solid white; border-width:0 2px 2px 0; transform:rotate(45deg); margin:1px 0 0 5px; }
:focus-visible { outline:2px solid #1d9bf0; outline-offset:4px; } #status { padding:16px; min-height:52px; border-top:1px solid var(--sx-border); }
</style>
<section aria-labelledby="title"><header><a href="/settings" aria-label="設定に戻る"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7.414 11H21v2H7.414l5.293 5.293-1.414 1.414L3.586 12l7.707-7.707 1.414 1.414z"/></svg></a><h2 id="title" tabindex="-1">Simplify X</h2></header>
<p class="intro">Xに表示する項目を管理します。変更は自動で保存され、すぐに反映されます。</p>
<h3>非表示にする項目</h3><div id="fields"></div><p id="status" role="status" aria-live="polite">チェックした項目を非表示にします。</p></section>`;
        shadow.querySelector('a')!.href = `${location.pathname}${location.search}`;
        for (const key of optionKeys) {
            const [title] = options[key];
            const label = document.createElement('label');
            const text = document.createElement('span'); text.textContent = title;
            const help = document.createElement('p'); help.textContent = descriptions[key]; help.id = `help-${key}`;
            text.append(help);
            const input = document.createElement('input'); input.type = 'checkbox'; input.name = key; input.checked = settings[key];
            input.setAttribute('aria-describedby', help.id);
            label.append(text, input); shadow.getElementById('fields')!.append(label);
            input.addEventListener('change', () => {
                settings[key] = input.checked; updateStyle(); rescan();
                const status = shadow.getElementById('status')!;
                try { saveSettings(settings); status.textContent = '保存しました'; }
                catch { status.textContent = '保存できませんでした。この画面では適用済みです。変更し直すと再試行します。'; }
            });
        }
        shadow.querySelector('a')!.addEventListener('click', event => {
            if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            event.preventDefault(); event.stopPropagation();
            location.hash = ''; syncSettingsPage(); entry?.focus();
        });
        // X自身のDOMは削除せず、ページを離れると表示状態を元に戻す。
        if (container === detail) {
            detailLabel = { node: detail, label: detail.getAttribute('aria-label'), labelledby: detail.getAttribute('aria-labelledby') };
            detail.removeAttribute('aria-labelledby'); detail.setAttribute('aria-label', 'Simplify X');
        }
        if (list && !container.contains(list)) {
            list.setAttribute('data-simplify-x-nav', '');
            selectedTabs = [...list.querySelectorAll('[role="tab"][aria-selected="true"]')];
            selectedTabs.forEach(node => node.setAttribute('aria-selected', 'false'));
            entry?.setAttribute('aria-current', 'page');
        }
        coverChildren(container);
        container.append(pageHost);
    }
    function start() {
        window.addEventListener('hashchange', syncSettingsPage);
        window.addEventListener('popstate', syncSettingsPage);
        window.addEventListener('resize', scheduleSettingsPage);
        // XのSPA遷移はDOM更新で検知。スクリプト側でhistory APIを書き換えない。
        syncSettingsPage();
        if (typeof GM_registerMenuCommand === 'function') {
            GM_registerMenuCommand('⚙️ Simplify X の設定を開く', openSettings);
        }
    }
    return { start, scheduleSettingsPage };
}
