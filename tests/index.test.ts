import { afterEach, expect, test, vi } from 'vitest';
import { optionKeys } from '../src/options';
import { loadSettings, normalizeSettings, saveSettings, SETTINGS_KEY } from '../src/settings';

afterEach(() => vi.unstubAllGlobals());

test.each([null, undefined, [], 'invalid', 42])('invalid stored settings fall back to enabled options: %s', stored => {
  const settings = normalizeSettings(stored);
  expect(optionKeys.every(key => settings[key] === true)).toBe(true);
});

test('migration preserves disabled options and unknown keys without mutating storage', () => {
  const stored = { hideAds: false, hideCalls: 'invalid', futureOption: { enabled: false } };
  const settings = normalizeSettings(stored);
  expect(settings.hideAds).toBe(false);
  expect(settings.hideCalls).toBe(true);
  expect(settings.futureOption).toEqual({ enabled: false });
  expect(stored.hideCalls).toBe('invalid');
});

test('storage failures still provide usable defaults', () => {
  vi.stubGlobal('GM_getValue', () => { throw new Error('unavailable'); });
  expect(loadSettings()).toEqual(normalizeSettings({}));
});

test('settings use the existing storage key and retain unknown keys when saved', () => {
  const stored = { hideAds: false, futureOption: 1 };
  const getValue = vi.fn(() => stored);
  const setValue = vi.fn();
  vi.stubGlobal('GM_getValue', getValue);
  vi.stubGlobal('GM_setValue', setValue);
  const settings = loadSettings();
  saveSettings(settings);
  expect(getValue).toHaveBeenCalledWith(SETTINGS_KEY, {});
  expect(setValue).toHaveBeenCalledWith('xHiderSettings', expect.objectContaining(stored));
  expect(setValue.mock.calls[0]![1]).not.toBe(settings);
});
