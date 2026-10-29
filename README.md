# Copy Phone Number

Thunderbird add-on that adds **"Rufnummer kopieren"** (copy phone number) to the right-click menu.
It copies the number to the clipboard in international format. The country is detected from `+CC` / `00CC`;
numbers without a country code use the default country from the options (Switzerland unless changed).

Thunderbird-Add-on: Rechtsklick auf einen `tel:`-Link oder eine markierte Telefonnummer → **Rufnummer kopieren**.
Die Nummer landet international formatiert in der Zwischenablage, z. B. `+41 44 123 45 67`.
Das Land wird an der Vorwahl erkannt; für Nummern ohne Ländervorwahl gilt das Land aus den Einstellungen (Standard: Schweiz).

## Examples (default country Switzerland)

| Input | Copied |
|---|---|
| `076 681 52 38` | `+41 76 681 52 38` |
| `0041 44 123 45 67` | `+41 44 123 45 67` |
| `+41 (0)44 123 45 67` | `+41 44 123 45 67` |
| `+423 234 56 78` | `+423 234 56 78` |
| `+49 (0)30 1234 5678` | `+49 30 1234 5678` |
| `+39 02 1234 5678` | `+39 02 1234 5678` |
| `+1 212 555 0100` | `+1 212 555 0100` |

## Options

*Add-ons and Themes → Copy Phone Number → Options*

- **Default country** for numbers without a country code: Switzerland, Liechtenstein, Germany, Austria, France,
  Italy, Netherlands, Belgium, Luxembourg, United Kingdom, Spain, Portugal, USA/Canada
- **Format**: with spaces (`+41 44 123 45 67`) or without (`+41441234567`)

## Installation

Install from [addons.thunderbird.net](https://addons.thunderbird.net/) or download the `.xpi` from
[Releases](https://github.com/ces-repo/copy-phone-number/releases) and open it via
*Add-ons and Themes → gear icon → Install Add-on From File*.

Requires Thunderbird 115 or newer.

## Permissions

- `menus` – context menu entry
- `clipboardWrite` – copy the number
- `notifications` – short confirmation showing the copied number
- `storage` – remember the options

No data leaves your computer.

## Version history

### v1.1.0
- International: the country is detected from +CC / 00CC, national numbers use a default country (Switzerland unless changed)
- Options page: default country (13 countries) and format with or without spaces
- Renamed from "Copy Phone Number (Swiss)" to "Copy Phone Number"
- No upper Thunderbird version limit, so new Thunderbird releases no longer disable the add-on

### v1.0.5
- Menu entry appears again for selected numbers that are not a tel: link (broken in 1.0.3)

### v1.0.3
- One menu entry instead of a submenu when a `tel:` link is selected
- `+41 (0)44 …` and `+41 044 …` are formatted correctly
- Correct country code for non-Swiss numbers (e.g. `+49`, `+1`, `+33`)
- Liechtenstein numbers formatted as `+423 XXX XX XX`
- Malformed `tel:` links no longer cause an error

### v1.0.0 – v1.0.2
- Initial release

## License

MIT – © CES Catering & Event Services GmbH
