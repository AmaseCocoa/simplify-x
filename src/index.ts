import { loadSettings } from "./settings";
import { createStyles } from "./modules/styles";
import { createAdFilter, CANDIDATE, MARK } from "./modules/ads";
import { createSettingsPage } from "./modules/settings-page";

const settings = loadSettings();
const { style, updateStyle, mountStyle, refreshLanguage } = createStyles(settings);
const { collect, inspect, rescan } = createAdFilter(settings, style);
const settingsPage = createSettingsPage(settings, updateStyle, rescan);

const observer = new MutationObserver((records) => {
  mountStyle();
  refreshLanguage();
  settingsPage.scheduleSettingsPage();
  if (!settings.hideAds) return;
  const targets = new Set<Element>();
  for (const record of records) {
    const element =
      record.target instanceof Element
        ? record.target
        : record.target.parentElement;
    if (
      element &&
      !element.closest("#simplify-x-settings") &&
      element !== style
    ) {
      const owner = element.closest(`${CANDIDATE}, [${MARK}]`);
      if (owner) targets.add(owner);
    }
    record.addedNodes.forEach((node) => collect(node, targets));
  }
  targets.forEach(inspect);
});

updateStyle();

observer.observe(document, {
  subtree: true,
  childList: true,
  characterData: true,
  attributes: true,
  attributeFilter: ["data-testid", "role", "lang"],
});

rescan();

settingsPage.start();
