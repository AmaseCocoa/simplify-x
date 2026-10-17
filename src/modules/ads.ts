import type { Settings } from '../settings';
export const MARK = 'data-simplify-x-ad';
export const CANDIDATE = '[data-testid="trend"], article, [data-testid="tweet"]';
const cleanText = (node: Node) => (node.textContent || '').replace(/\s+/g, ' ').trim();
const excluded = '[data-testid="tweetText"], [data-testid="User-Name"], [data-testid="card.wrapper"], [role="link"], a, button, [role="button"], blockquote';
export function isAd(node: Element) {
    if (node.matches('[data-testid="trend"]')) {
        return [...node.querySelectorAll('span')].some(span => {
            if (span.children.length || !/^Promoted by\s+\S/i.test(cleanText(span)) || span.closest('a, button')) return false;
            return [span.parentElement, span.parentElement?.parentElement].some(group =>
                group && node.contains(group) && group.querySelector('svg')
            );
        });
    }
    // 外側のポストだけを処理。引用内のラベルから親ポストを隠さない。
    const name = [...node.querySelectorAll('[data-testid="User-Name"]')].find(el => el.closest(CANDIDATE) === node && !el.closest('[role="link"], blockquote'));
    if (!name) return false;
    let header = name.parentElement;
    for (let depth = 0; header && header !== node && depth < 5; depth++, header = header.parentElement) {
        if (header.querySelector('[data-testid="tweetText"], [data-testid="card.wrapper"], [role="group"]')) break;
        const caret = [...header.querySelectorAll('[data-testid="caret"]')].some(el => el.closest(CANDIDATE) === node);
        if (!caret) continue;
        return [...header.querySelectorAll('span')].some(span =>
            !span.children.length && /^(広告|Ad|Promoted)$/i.test(cleanText(span)) &&
            !span.closest(excluded) && span.closest(CANDIDATE) === node
        );
    }
    return false;
}

export function createAdFilter(settings: Settings, style: HTMLStyleElement) {
    function inspect(node: Element) {
        if (!node.isConnected) return;
        const ad = settings.hideAds && node.matches(CANDIDATE) && isAd(node);
        if (ad && !node.hasAttribute(MARK)) node.setAttribute(MARK, '');
        else if (!ad && node.hasAttribute(MARK)) node.removeAttribute(MARK);
    }
    // MutationObserverの同一配信内で集約。タイマーや全ページの定期走査を使わず、描画前に判定する。
    function collect(root: Node, targets: Set<Element>) {
        const el = root instanceof Element ? root : root.parentElement;
        if (!el || el === style || el.closest('#simplify-x-settings')) return;
        const owner = el.closest(`${CANDIDATE}, [${MARK}]`);
        if (owner) targets.add(owner);
        el.querySelectorAll(CANDIDATE).forEach(node => targets.add(node));
    }
    function rescan() {
        document.querySelectorAll(`${CANDIDATE}, [${MARK}]`).forEach(inspect);
    }
    return { collect, inspect, rescan };
}
