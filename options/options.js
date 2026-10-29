const countrySelect = document.getElementById("country");
const statusLine = document.getElementById("status");

// Sample national numbers for the format preview
const SAMPLES = {
  CH: "044 123 45 67", LI: "234 56 78", DE: "030 1234 5678", AT: "01 234 5678",
  FR: "01 42 68 53 00", IT: "02 1234 5678", NL: "020 123 4567", BE: "02 123 45 67",
  LU: "26 12 34", GB: "020 7946 0018", ES: "912 345 678", PT: "213 456 789",
  US: "(212) 555-0100",
};

for (const c of COUNTRIES) {
  const option = document.createElement("option");
  option.value = c.id;
  option.textContent = `${c.name} (+${c.cc})`;
  countrySelect.append(option);
}

function currentSettings() {
  const style = document.querySelector('input[name="style"]:checked');
  return { country: countrySelect.value, style: style ? style.value : "spaced" };
}

function updateExamples() {
  const { country } = currentSettings();
  const sample = SAMPLES[country] || SAMPLES.CH;
  document.getElementById("example-spaced").textContent = formatPhone(sample, { country, style: "spaced" });
  document.getElementById("example-compact").textContent = formatPhone(sample, { country, style: "compact" });
}

async function save() {
  updateExamples();
  try {
    await browser.storage.local.set(currentSettings());
    statusLine.textContent = "Gespeichert";
  } catch (e) {
    statusLine.textContent = "Speichern fehlgeschlagen";
    console.error("Copy Phone Number: could not save settings", e);
  }
}

async function init() {
  let settings = DEFAULT_SETTINGS;
  try {
    settings = { ...DEFAULT_SETTINGS, ...(await browser.storage.local.get(DEFAULT_SETTINGS)) };
  } catch (e) {
    console.warn("Copy Phone Number: could not read settings", e);
  }
  countrySelect.value = settings.country;
  const style = document.querySelector(`input[name="style"][value="${settings.style}"]`);
  if (style) style.checked = true;
  updateExamples();

  countrySelect.addEventListener("change", save);
  for (const radio of document.querySelectorAll('input[name="style"]')) {
    radio.addEventListener("change", save);
  }
}

init();
