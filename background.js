/**
 * Copy Phone Number — Thunderbird MailExtension
 *
 * Adds a "Rufnummer kopieren" entry to the right-click menu on:
 *   - tel: links
 *   - selected text that contains a phone number
 * Copies the number to the clipboard in international format. The country
 * is detected from +CC/00CC; national numbers use the country set in the
 * options (Switzerland by default). Formatting lives in phone.js.
 */

async function loadSettings() {
  try {
    const stored = await browser.storage.local.get(DEFAULT_SETTINGS);
    return { ...DEFAULT_SETTINGS, ...stored };
  } catch (e) {
    console.warn("Copy Phone Number: could not read settings", e);
    return DEFAULT_SETTINGS;
  }
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (e) {
    // Fallback for older Thunderbird or focus issues
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
}

let toastTimer = null;

async function notify(message) {
  const id = "copy-phone-toast";
  try {
    await browser.notifications.create(id, {
      type: "basic",
      title: "Rufnummer kopiert",
      message,
    });
  } catch (e) {
    console.warn("Copy Phone Number: notification failed", e);
    return;
  }
  // Restart the timer so a second copy is not hidden by the first one's timeout
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => browser.notifications.clear(id).catch(() => {}), 2500);
}

function numberFromTelLink(url) {
  // tel:+41446681234;ext=12 → +41446681234
  let value = url.slice(4).split(/[;?]/)[0];
  try {
    value = decodeURIComponent(value);
  } catch (e) {
    // Malformed escape sequence — use the raw text
  }
  return value;
}

// tel: links get their own entry, filtered by URL pattern.
browser.menus.create({
  id: "copy-phone-link",
  title: "Rufnummer kopieren",
  contexts: ["link"],
  targetUrlPatterns: ["tel:*"],
});

// Text selections get a second entry. Its content is only checked on click,
// because onShown does not receive selectionText for message content.
browser.menus.create({
  id: "copy-phone-selection",
  title: "Rufnummer kopieren",
  contexts: ["selection"],
});

// A selected tel: link would match both entries and Thunderbird would group
// them into a submenu. Hide the selection entry whenever a link was clicked;
// the tel: link entry covers that case.
browser.menus.onShown.addListener((info) => {
  if (!info.menuIds.includes("copy-phone-selection")) return;
  const onLink = info.contexts.includes("link");
  browser.menus.update("copy-phone-selection", { visible: !onLink });
  browser.menus.refresh();
});

browser.menus.onHidden.addListener(() => {
  browser.menus.update("copy-phone-selection", { visible: true });
});

browser.menus.onClicked.addListener(async (info) => {
  if (info.menuItemId !== "copy-phone-link" && info.menuItemId !== "copy-phone-selection") return;

  let raw = null;
  if (info.linkUrl?.startsWith("tel:")) {
    raw = numberFromTelLink(info.linkUrl);
  }
  if (!raw) {
    raw = extractPhone(info.selectionText);
  }

  if (!raw) {
    await notify("Keine Rufnummer erkannt");
    return;
  }

  const formatted = formatPhone(raw, await loadSettings());
  if (!formatted) {
    await notify("Keine Rufnummer erkannt");
    return;
  }
  try {
    await copyToClipboard(formatted);
  } catch (e) {
    console.error("Copy Phone Number: copy failed", e);
    await notify("Kopieren fehlgeschlagen");
    return;
  }
  await notify(formatted);
});

console.log("Copy Phone Number: loaded");
