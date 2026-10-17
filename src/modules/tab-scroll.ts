import type { Settings } from '../settings';

export const TAB_SCROLL_FIT_MARK = 'data-simplify-x-tab-scroll-fit';
const LIST = '[data-testid="ScrollSnap-SwipeableList"] > [data-testid="ScrollSnap-List"][role="tablist"]:has(> [data-simplify-x-for-you])';

/** 非表示中など幅が取れない場合は、スクロール不要と決めつけない。 */
export function fitsWithoutScrolling(list: Pick<HTMLElement, 'clientWidth' | 'scrollWidth'>): boolean {
    return list.clientWidth > 0 && list.scrollWidth <= list.clientWidth + 1;
}

export function createTabScrollController(settings: Settings) {
    let scheduled = false;
    const containers = new Set<Element>();
    const observed = new Set<Element>();
    const resizeObserver = new ResizeObserver(schedule);

    function refresh(): void {
        const activeContainers = new Set<Element>();
        const activeElements = new Set<Element>();
        if (settings.hideForYouTab) {
            for (const list of document.querySelectorAll<HTMLElement>(LIST)) {
                const container = list.parentElement?.parentElement;
                if (!container) continue;
                activeContainers.add(container);
                activeElements.add(list);
                // タブの追加・幅変更にも追従する。ページ全体は監視しない。
                for (const child of list.children) activeElements.add(child);
                const fits = fitsWithoutScrolling(list);
                if (container.hasAttribute(TAB_SCROLL_FIT_MARK) !== fits) {
                    container.toggleAttribute(TAB_SCROLL_FIT_MARK, fits);
                }
            }
        }

        for (const container of containers) {
            if (!activeContainers.has(container)) container.removeAttribute(TAB_SCROLL_FIT_MARK);
        }
        containers.clear();
        activeContainers.forEach(container => containers.add(container));
        for (const element of observed) {
            if (!activeElements.has(element)) {
                resizeObserver.unobserve(element);
                observed.delete(element);
            }
        }
        for (const element of activeElements) {
            if (!observed.has(element)) {
                observed.add(element);
                resizeObserver.observe(element);
            }
        }
    }

    function schedule(): void {
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(() => {
            scheduled = false;
            refresh();
        });
    }

    return { schedule };
}
