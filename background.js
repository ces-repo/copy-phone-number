/**
 * Copy Phone Number (Swiss) — Thunderbird MailExtension
 *
 * Adds a "Rufnummer kopieren" entry to the right-click menu on:
 *   - tel: links
 *   - selected text that contains a phone number
 * Copies the number to the clipboard, formatted as +41 XX XXX XX XX
 * where possible.
 */

// Broad regex: catches +41 76 681 52 38, 076 681 52 38, +49 30 12345678, etc.
// Needs at least 7 digits total to reduce false positives.
const PHONE_REGEX = /\+?(?:\d[\s\-().\/]*){7,}\d/;

function extractPhone(text) {
  if (!text) return null;
  const m = text.match(PHONE_REGEX);
  return m ? m[0] : null;
}

// ITU country code length: +1 and +7 are 1 digit, these are 2 digits, all others 3.
const TWO_DIGIT_CC = new Set([
  "20", "27", "30", "31", "32", "33", "34", "36", "39", "40", "41", "43", "44",
  "45", "46", "47", "48", "49", "51", "52", "53", "54", "55", "56", "57", "58",
  "60", "61", "62", "63", "64", "65", "66", "81", "82", "84", "86", "90", "91",
  "92", "93", "94", "95", "98",
]);

function countryCodeLength(digits) {
  if (digits[0] === "1" || digits[0] === "7") return 1;
  return TWO_DIGIT_CC.has(digits.slice(0, 2)) ? 2 : 3;
}

function formatSwiss(raw) {
  if (!raw) return null;

  // Drop the optional trunk zero written as "(0)", e.g. +41 (0)44 123 45 67
  let cleaned = raw.replace(/\(\s*0\s*\)/g, "");
  // Keep only digits and a leading +
  cleaned = cleaned.replace(/[^\d+]/g, "");
  cleaned = cleaned.replace(/(?!^)\+/g, "");
  // 00-prefix → +
  if (cleaned.startsWith("00")) cleaned = "+" + cleaned.slice(2);
  // Local Swiss form (0XX ...) → +41XX ...
  if (!cleaned.startsWith("+") && cleaned.startsWith("0")) {
    cleaned = "+41" + cleaned.slice(1);
  }
  // Bare digits without country code — assume Swiss
  if (!cleaned.startsWith("+")) cleaned = "+41" + cleaned;
  // Trunk zero written after the country code: +41044... → +4144...
  if (/^\+410\d{9}$/.test(cleaned)) cleaned = "+41" + cleaned.slice(4);

  // Swiss: +41 XX XXX XX XX (9 digits after country code)
  const ch = cleaned.match(/^\+41(\d{2})(\d{3})(\d{2})(\d{2})$/);
  if (ch) return `+41 ${ch[1]} ${ch[2]} ${ch[3]} ${ch[4]}`;

  // Liechtenstein: +423 XXX XX XX (7 digits after country code)
  const li = cleaned.match(/^\+423(\d{3})(\d{2})(\d{2})$/);
  if (li) return `+423 ${li[1]} ${li[2]} ${li[3]}`;

  // Other countries: single space after the country code
  const digits = cleaned.slice(1);
  if (digits.length > 3) {
    const n = countryCodeLength(digits);
    return `+${digits.slice(0, n)} ${digits.slice(n)}`;
  }

  return cleaned;
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
    console.warn("Copy Phone Number (Swiss): notification failed", e);
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

// One menu entry for tel: links and text selections. Two separate entries
// would both match a selected tel: link, and Thunderbird then groups them
// into a submenu.
browser.menus.create({
  id: "copy-phone",
  title: "Rufnummer kopieren",
  contexts: ["link", "selection"],
  targetUrlPatterns: ["tel:*"],
});

browser.menus.onClicked.addListener(async (info) => {
  if (info.menuItemId !== "copy-phone") return;

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

  const formatted = formatSwiss(raw);
  try {
    await copyToClipboard(formatted);
  } catch (e) {
    console.error("Copy Phone Number (Swiss): copy failed", e);
    await notify("Kopieren fehlgeschlagen");
    return;
  }
  await notify(formatted);
});

console.log("Copy Phone Number (Swiss): loaded");
