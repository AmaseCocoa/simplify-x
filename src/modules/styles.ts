import { options, optionKeys } from '../options';
import type { Settings } from '../settings';
import { MARK } from './ads';

export function createStyles(settings: Settings) {
    const style = document.createElement('style');
    style.id = 'simplify-x-style';

    function updateStyle() {
        const selectors: string[] = optionKeys.flatMap(key => settings[key] ? [...options[key].selectors] : []);
        if (settings.hideAds) selectors.push(`[${MARK}]`);

        style.textContent = selectors.map(selector => `${selector} { display: none !important; }`).join('\n');
        mountStyle();
    }

    function mountStyle() {
        if (!style.isConnected && document.documentElement) (document.head || document.documentElement).append(style);
    }

    return { style, updateStyle, mountStyle };
}
