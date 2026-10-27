# Copy Phone Number (Swiss)

Thunderbird add-on that adds **"Rufnummer kopieren"** (copy phone number) to the right-click menu.
It copies the number to the clipboard in Swiss international format: `+41 XX XXX XX XX`.

Thunderbird-Add-on: Rechtsklick auf einen `tel:`-Link oder eine markierte Telefonnummer → **Rufnummer kopieren**.
Die Nummer landet formatiert als `+41 XX XXX XX XX` in der Zwischenablage.

## Examples

| Input | Copied |
|---|---|
| `076 681 52 38` | `+41 76 681 52 38` |
| `0041 44 123 45 67` | `+41 44 123 45 67` |
| `+41 (0)44 123 45 67` | `+41 44 123 45 67` |
| `+423 234 56 78` | `+423 234 56 78` |
| `+49 30 12345678` | `+49 3012345678` |

Numbers without a country code are treated as Swiss.

## Installation

Install from [addons.thunderbird.net](https://addons.thunderbird.net/) or download the `.xpi` from
[Releases](https://github.com/ces-repo/copy-phone-number/releases) and open it via
*Add-ons and Themes → gear icon → Install Add-on From File*.

Requires Thunderbird 115 or newer.

## Permissions

- `menus` – context menu entry
- `clipboardWrite` – copy the number
- `notifications` – short confirmation showing the copied number

No data leaves your computer.

## Version history

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
