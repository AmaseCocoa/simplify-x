import { loadSettings } from './settings';
import { createStyles } from './modules/styles';
import { createAdFilter, CANDIDATE, MARK } from './modules/ads';
import { createSettingsPage } from './modules/settings-page';

const settings = loadSettings();
const { style, updateStyle, mountStyle } = createStyles(settings);
const { collect, inspect, rescan } = createAdFilter(settings, style);
const page = createSettingsPage(settings, updateStyle, rescan);
const observer = new MutationObserver(records => {
    mountStyle();
    page.scheduleSettingsPage();
    if (!settings.hideAds) return;
    const targets = new Set<Element>();
    for (const record of records) {
        // target自体の所属ポストを再判定し、削除や再利用で古い広告マークを残さない。
        const el = record.target instanceof Element ? record.target : record.target.parentElement;
        if (el && !el.closest('#simplify-x-settings') && el !== style) {
            const owner = el.closest(`${CANDIDATE}, [${MARK}]`);
            if (owner) targets.add(owner);
        }
        record.addedNodes.forEach(node => collect(node, targets));
    }
    targets.forEach(inspect);
});
updateStyle();
observer.observe(document, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['data-testid', 'role'] });
rescan();
page.start();
