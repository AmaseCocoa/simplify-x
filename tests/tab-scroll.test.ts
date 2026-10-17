import { afterEach, expect, test, vi } from 'vitest';
import { createTabScrollController, fitsWithoutScrolling, TAB_SCROLL_FIT_MARK } from '../src/modules/tab-scroll';
import { normalizeSettings } from '../src/settings';

afterEach(() => vi.unstubAllGlobals());

test.each([
    [438, 438, true], [438, 439, true], [438, 500, false], [0, 0, false],
])('width %s and scroll width %s: fit=%s', (clientWidth, scrollWidth, expected) => {
    expect(fitsWithoutScrolling({ clientWidth, scrollWidth })).toBe(expected);
});

test('arrows are hidden only while tabs fit, and restored on overflow or disabling', () => {
    let frame: () => void = () => {};
    let resize: () => void = () => {};
    const attributes = new Set<string>();
    const container = {
        hasAttribute: (key: string) => attributes.has(key),
        toggleAttribute: (key: string, enabled: boolean) => enabled ? attributes.add(key) : attributes.delete(key),
        removeAttribute: (key: string) => attributes.delete(key),
    };
    const child = {};
    const list = { clientWidth: 438, scrollWidth: 438, children: [child], parentElement: { parentElement: container } };
    const observe = vi.fn();
    const unobserve = vi.fn();
    vi.stubGlobal('document', { querySelectorAll: () => [list] });
    vi.stubGlobal('requestAnimationFrame', (callback: () => void) => { frame = callback; });
    vi.stubGlobal('ResizeObserver', class {
        constructor(callback: () => void) { resize = callback; }
        observe = observe;
        unobserve = unobserve;
    });
    const settings = normalizeSettings({});
    const controller = createTabScrollController(settings);
    controller.schedule();
    frame();
    expect(attributes.has(TAB_SCROLL_FIT_MARK)).toBe(true);
    expect(observe).toHaveBeenCalledWith(list);
    expect(observe).toHaveBeenCalledWith(child);
    list.scrollWidth = 600;
    resize();
    frame();
    expect(attributes.has(TAB_SCROLL_FIT_MARK)).toBe(false);
    list.scrollWidth = 438;
    resize();
    frame();
    expect(attributes.has(TAB_SCROLL_FIT_MARK)).toBe(true);
    settings.hideForYouTab = false;
    controller.schedule();
    frame();
    expect(attributes.has(TAB_SCROLL_FIT_MARK)).toBe(false);
    expect(unobserve).toHaveBeenCalledWith(list);
    expect(unobserve).toHaveBeenCalledWith(child);
});
