import { detectPageLanguage, forYouTabLabel, resolveLanguage, type SiteLanguage } from '../i18n';
import type { Settings } from '../settings';

export const FOR_YOU_MARK = 'data-simplify-x-for-you';
const CANDIDATE = '[role="presentation"]:has(> [role="tab"])';
const TARGETS = `${CANDIDATE}, [${FOR_YOU_MARK}]`;

export function isForYouTab(node: Element, language: SiteLanguage): boolean {
    if (node.getAttribute('role') !== 'presentation') return false;
    const tab = node.querySelector(':scope > [role="tab"]');
    const text = tab?.textContent?.replace(/\s+/g, ' ').trim();
    return text === forYouTabLabel(language);
}

export function createForYouFilter(settings: Settings) {
    function inspect(node: Element): void {
        if (!node.isConnected) return;
        const hidden = settings.hideForYouTab && isForYouTab(node, resolveLanguage(detectPageLanguage()));
        if (hidden && !node.hasAttribute(FOR_YOU_MARK)) node.setAttribute(FOR_YOU_MARK, '');
        if (!hidden && node.hasAttribute(FOR_YOU_MARK)) node.removeAttribute(FOR_YOU_MARK);
    }

    function rescan(): void {
        document.querySelectorAll(TARGETS).forEach(inspect);
    }

    function collect(root: Node, targets: Set<Element>): void {
        const element = root instanceof Element ? root : root.parentElement;
        if (!element || element.closest('#simplify-x-settings')) return;
        const owner = element.closest(TARGETS);
        if (owner) targets.add(owner);
        element.querySelectorAll(TARGETS).forEach(node => targets.add(node));
    }

    function processMutations(records: MutationRecord[]): void {
        if (!settings.hideForYouTab) return;
        if (records.some(record => record.type === 'attributes' && record.attributeName === 'lang')) {
            rescan();
            return;
        }
        const targets = new Set<Element>();
        for (const record of records) {
            collect(record.target, targets);
            record.addedNodes.forEach(node => collect(node, targets));
        }
        targets.forEach(inspect);
    }

    return { inspect, rescan, processMutations };
}
