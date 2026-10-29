/**
 * Phone number detection and formatting, shared by the background script
 * and the options page.
 *
 * Numbers written with +CC or 00CC keep their country (detected from the
 * country code). National numbers (e.g. 044 123 45 67) get the country
 * chosen in the options, Switzerland by default.
 */

// trunk: national prefix dropped after the country code ("0" in most of
// Europe, "1" in North America, null where it is part of the number, e.g. Italy).
// groups: digit grouping of the national number; used only when the length
// matches, otherwise the grouping of the original text is kept.
const COUNTRIES = [
  { id: "CH", name: "Schweiz", cc: "41", trunk: "0", groups: [2, 3, 2, 2] },
  { id: "LI", name: "Liechtenstein", cc: "423", trunk: null, groups: [3, 2, 2] },
  { id: "DE", name: "Deutschland", cc: "49", trunk: "0" },
  { id: "AT", name: "Österreich", cc: "43", trunk: "0" },
  { id: "FR", name: "Frankreich", cc: "33", trunk: "0", groups: [1, 2, 2, 2, 2] },
  { id: "IT", name: "Italien", cc: "39", trunk: null },
  { id: "NL", name: "Niederlande", cc: "31", trunk: "0" },
  { id: "BE", name: "Belgien", cc: "32", trunk: "0" },
  { id: "LU", name: "Luxemburg", cc: "352", trunk: null },
  { id: "GB", name: "Grossbritannien", cc: "44", trunk: "0" },
  { id: "ES", name: "Spanien", cc: "34", trunk: null, groups: [3, 3, 3] },
  { id: "PT", name: "Portugal", cc: "351", trunk: null, groups: [3, 3, 3] },
  { id: "US", name: "USA / Kanada", cc: "1", trunk: "1", groups: [3, 3, 4] },
];

const DEFAULT_SETTINGS = { country: "CH", style: "spaced" };

// Broad regex: catches +41 76 681 52 38, 076 681 52 38, +49 30 12345678, etc.
// Needs at least 7 digits total to reduce false positives.
const PHONE_REGEX = /\+?(?:\d[\s\-().\/]*){7,}\d/;

// ITU country code length: +1 and +7 are 1 digit, these are 2 digits, all others 3.
const TWO_DIGIT_CC = new Set([
  "20", "27", "30", "31", "32", "33", "34", "36", "39", "40", "41", "43", "44",
  "45", "46", "47", "48", "49", "51", "52", "53", "54", "55", "56", "57", "58",
  "60", "61", "62", "63", "64", "65", "66", "81", "82", "84", "86", "90", "91",
  "92", "93", "94", "95", "98",
]);

function extractPhone(text) {
  if (!text) return null;
  const m = text.match(PHONE_REGEX);
  return m ? m[0] : null;
}

function countryCodeLength(digits) {
  if (digits[0] === "1" || digits[0] === "7") return 1;
  return TWO_DIGIT_CC.has(digits.slice(0, 2)) ? 2 : 3;
}

function countryById(id) {
  return COUNTRIES.find((c) => c.id === id) || COUNTRIES[0];
}

function countryByCode(cc) {
  return COUNTRIES.find((c) => c.cc === cc) || null;
}

// Removes `count` digits from the front of a list of digit groups.
function dropDigits(groups, count) {
  const rest = groups.slice();
  while (count > 0 && rest.length) {
    if (rest[0].length <= count) {
      count -= rest[0].length;
      rest.shift();
    } else {
      rest[0] = rest[0].slice(count);
      count = 0;
    }
  }
  return rest;
}

function groupDigits(digits, sizes) {
  const out = [];
  let pos = 0;
  for (const size of sizes) {
    out.push(digits.slice(pos, pos + size));
    pos += size;
  }
  return out.join(" ");
}

/**
 * @param {string} raw - phone number as written, e.g. "+41 (0)44 123 45 67"
 * @param {{country: string, style: "spaced"|"compact"}} settings
 * @returns {string|null}
 */
function formatPhone(raw, settings = DEFAULT_SETTINGS) {
  if (!raw) return null;

  // Optional trunk zero written as "(0)", e.g. +41 (0)44 123 45 67
  const text = raw.replace(/\(\s*0\s*\)/g, " ");
  let groups = text.match(/\d+/g);
  if (!groups) return null;

  const plus = /^\s*\+/.test(text);
  const doubleZero = !plus && groups[0].startsWith("00");
  if (doubleZero) groups = dropDigits(groups, 2);

  let cc;
  let country;
  if (plus || doubleZero) {
    // International number: detect the country from its code
    const all = groups.join("");
    cc = all.slice(0, countryCodeLength(all));
    country = countryByCode(cc);
    groups = dropDigits(groups, cc.length);
  } else {
    // National number: use the default country
    country = countryById(settings.country);
    cc = country.cc;
  }

  // Drop the trunk prefix, also when written after the country code (+41 044 ...)
  const trunk = country ? country.trunk : "0";
  if (trunk && groups.length && groups[0].startsWith(trunk)) {
    const withoutTrunk = dropDigits(groups, trunk.length);
    // For +1 only drop the "1" if a full 10-digit number remains
    if (trunk !== "1" || withoutTrunk.join("").length === 10) groups = withoutTrunk;
  }

  const national = groups.join("");
  if (!national) return null;
  if (settings.style === "compact") return `+${cc}${national}`;

  if (country && country.groups && country.groups.reduce((a, b) => a + b, 0) === national.length) {
    return `+${cc} ${groupDigits(national, country.groups)}`;
  }
  return `+${cc} ${groups.join(" ")}`;
}
