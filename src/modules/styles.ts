import { options, optionKeys } from '../options';
import type { Settings } from '../settings';
import { resolveSelectors, resolveLanguage, type SiteLanguage } from '../i18n';
import { MARK } from './ads';

export function createStyles(settings: Settings) {
    const style = document.createElement('style');
    style.id = 'simplify-x-style';
    let currentLanguage: SiteLanguage | undefined;

    function pageLanguage(): SiteLanguage {
        return resolveLanguage(document.documentElement?.lang || navigator.language);
    }

    function refreshLanguage(): void {
        if (currentLanguage !== pageLanguage()) updateStyle();
    }

    function updateStyle() {
        const language = pageLanguage();
        currentLanguage = language;
        const selectors = optionKeys.flatMap(key => {
            if (!settings[key]) return [];
            return resolveSelectors([
                ...options[key].selectors,
                ...(options[key].scriptSelectors ?? []),
            ], language);
        });
        if (settings.hideAds) selectors.push(`[${MARK}]`);

        style.textContent = selectors.map(selector => `${selector} { display: none !important; }`).join('\n');
        mountStyle();
    }

    function mountStyle() {
        if (!style.isConnected && document.documentElement) (document.head || document.documentElement).append(style);
    }

    return { style, updateStyle, mountStyle, refreshLanguage };
}
