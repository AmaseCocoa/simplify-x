import { optionKeys, type OptionKey } from './options';

export const SETTINGS_KEY = 'xHiderSettings';
export type Settings = Record<string, unknown> & Record<OptionKey, boolean>;

export function normalizeSettings(stored: unknown): Settings {
    const isSettingsObject = stored !== null && typeof stored === 'object' && !Array.isArray(stored);
    const settings = { ...(isSettingsObject ? stored : {}) } as Settings;

    for (const key of optionKeys) {
        if (typeof settings[key] !== 'boolean') {
            settings[key] = true;
        }
    }
    return settings;
}

export function loadSettings(): Settings {
    try {
        return normalizeSettings(GM_getValue(SETTINGS_KEY, {}));
    } catch {
        return normalizeSettings({});
    }
}

export function saveSettings(settings: Settings): void {
    GM_setValue(SETTINGS_KEY, { ...settings });
}
