import {
  isPlainClick,
  navigationStyles,
  renderSettingsView,
} from "./settings-view";
import { saveSettings, type Settings } from "../settings";

export function createSettingsPage(
  settings: Settings,
  updateStyle: () => void,
  rescan: () => void,
) {
  const isSettingsRoute = () => /^\/settings(?:\/|$)/.test(location.pathname);
  const settingsUrl = () => `${location.pathname}${location.search}#simplify-x`;
  let pageHost: HTMLDivElement | null = null;
  let hiddenNodes: Element[] = [];
  let uiScheduled = false;
  let selectedTabs: Element[] = [];
  let detailLabel: {
    node: Element;
    label: string | null;
    labelledby: string | null;
  } | null = null;

  function coverChildren(container: Element) {
    for (const node of container.children) {
      if (node === pageHost || hiddenNodes.includes(node)) continue;
      hiddenNodes.push(node);
      node.setAttribute("data-simplify-x-covered", "");
    }
  }

  const uiStyle = document.createElement("style");
  uiStyle.textContent = navigationStyles;

  function restorePage() {
    hiddenNodes.forEach((node) =>
      node.removeAttribute("data-simplify-x-covered"),
    );
    hiddenNodes = [];
    selectedTabs.forEach((node) => {
      if (node.isConnected) node.setAttribute("aria-selected", "true");
    });
    selectedTabs = [];
    document
      .querySelectorAll("[data-simplify-x-nav]")
      .forEach((node) => node.removeAttribute("data-simplify-x-nav"));
    document
      .getElementById("simplify-x-entry")
      ?.removeAttribute("aria-current");
    if (detailLabel) {
      const { node, label, labelledby } = detailLabel;
      for (const [key, value] of [
        ["aria-label", label],
        ["aria-labelledby", labelledby],
      ] as const) {
        if (value === null) {
          node.removeAttribute(key);
        } else {
          node.setAttribute(key, value);
        }
      }
      detailLabel = null;
    }
    pageHost?.remove();
    pageHost = null;
  }

  function openSettings() {
    if (isSettingsRoute()) {
      location.hash = "simplify-x";
      syncSettingsPage();
    } else location.assign("/settings#simplify-x");
  }

  function scheduleSettingsPage() {
    if (uiScheduled) return;
    if (!isSettingsRoute() && !pageHost) return;
    uiScheduled = true;
    requestAnimationFrame(() => {
      uiScheduled = false;
      syncSettingsPage();
    });
  }

  function ensureNavigationEntry(
    list: Element | undefined,
  ): HTMLAnchorElement | undefined {
    if (!list) return;
    let entry = list.querySelector<HTMLAnchorElement>("#simplify-x-entry");
    if (!entry) {
      entry = document.createElement("a");
      entry.id = "simplify-x-entry";
      entry.href = settingsUrl();
      entry.innerHTML =
        '<span>Simplify X</span><svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M14.586 12L7.543 4.96l1.414-1.42L17.414 12l-8.457 8.46-1.414-1.42L14.586 12z"/></svg>';
      entry.addEventListener("click", (event) => {
        if (!isPlainClick(event)) return;
        event.preventDefault();
        event.stopPropagation();
        openSettings();
        pageHost?.shadowRoot?.querySelector("h2")?.focus();
      });
      list.append(entry);
    }
    if (entry) entry.href = settingsUrl();
    return entry ?? undefined;
  }

  function syncSettingsPage() {
    const onSettings = isSettingsRoute();
    const active = onSettings && location.hash === "#simplify-x";
    if (!active) restorePage();
    if (!isSettingsRoute()) return;
    const list = [...document.querySelectorAll('[role="tablist"]')].find((el) =>
      el.querySelector('a[href="/settings/account"]'),
    );
    const detail =
      document.querySelector(
        '[role="region"][aria-labelledby~="detail-header"]',
      ) || detailLabel?.node;
    if (!list && !detail) {
      if (pageHost && !pageHost.isConnected) restorePage();
      return;
    }
    if (!uiStyle.isConnected)
      (document.head || document.documentElement).append(uiStyle);
    const entry = ensureNavigationEntry(list);
    if (!active) return;
    const detailVisible =
      detail?.isConnected &&
      getComputedStyle(detail).display !== "none" &&
      detail.getBoundingClientRect().width > 0;
    const container = detailVisible ? detail : list?.parentElement;
    if (!container) return;
    if (pageHost?.isConnected && pageHost.parentElement === container) {
      coverChildren(container);
      return;
    }
    mountSettingsPage(container, list, detail, entry);
  }

  function mountSettingsPage(
    container: Element,
    list: Element | undefined,
    detail: Element | null | undefined,
    entry: HTMLAnchorElement | undefined,
  ) {
    restorePage();
    pageHost = document.createElement("div");
    pageHost.id = "simplify-x-settings";
    const shadow = pageHost.attachShadow({ mode: "open" });
    const nativeText =
      list?.querySelector('a[href="/settings/account"] span') ||
      document.getElementById("detail-header");
    const foreground = nativeText
      ? getComputedStyle(nativeText).color
      : getComputedStyle(document.body).color;
    const rgb = foreground.match(/\d+/g)?.map(Number) || [15, 20, 25];
    const darkMode = (rgb[0] + rgb[1] + rgb[2]) / 3 > 150;
    pageHost.style.setProperty("--sx-text", foreground);
    pageHost.style.setProperty("--sx-muted", darkMode ? "#8b98a5" : "#536471");
    pageHost.style.setProperty("--sx-border", darkMode ? "#38444d" : "#eff3f4");
    renderSettingsView(
      shadow,
      settings,
      darkMode,
      (key, checked, status) => {
        settings[key] = checked;
        updateStyle();
        rescan();
        try {
          saveSettings(settings);
          status.textContent = "保存しました";
        } catch {
          status.textContent =
            "保存できませんでした。この画面では適用済みです。変更し直すと再試行します。";
        }
      },
      () => {
        location.hash = "";
        syncSettingsPage();
        entry?.focus();
      },
    );
    if (container === detail) {
      detailLabel = {
        node: detail,
        label: detail.getAttribute("aria-label"),
        labelledby: detail.getAttribute("aria-labelledby"),
      };
      detail.removeAttribute("aria-labelledby");
      detail.setAttribute("aria-label", "Simplify X");
    }
    if (list && !container.contains(list)) {
      list.setAttribute("data-simplify-x-nav", "");
      selectedTabs = [
        ...list.querySelectorAll('[role="tab"][aria-selected="true"]'),
      ];
      selectedTabs.forEach((node) =>
        node.setAttribute("aria-selected", "false"),
      );
      entry?.setAttribute("aria-current", "page");
    }
    coverChildren(container);
    container.append(pageHost);
  }

  function start() {
    window.addEventListener("hashchange", syncSettingsPage);
    window.addEventListener("popstate", syncSettingsPage);
    window.addEventListener("resize", scheduleSettingsPage);
    syncSettingsPage();
  }

  return { start, scheduleSettingsPage };
}
