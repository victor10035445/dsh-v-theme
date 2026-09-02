# dsh-v-theme · V CYBER (Multi-Theme)

[简体中文](README.md) | **English**

A **hacker / cyber theme plugin** for the DeepSeek Harness Web client, featuring two switchable styles:

| Style | Vibe | Signature |
|---|---|---|
| **NEON** (赛博霓虹) | Retro-futurism, Miami nights | Neon pink `#FF2E97` × electric blue × violet night sky, **bottom horizon glow** (retro neon sunset rising) |
| **TACTICAL** (战术面板) | SOC dashboard + FUI neon | SOC cyan `#56D4E0` for primary actions + FUI green `#00FF88` + AAA-contrast base (14.3:1), **top cyan radial glow**, solid tactical borders |

Purely additive: it never replaces or disables any official plugin; zero side effects while off.

> Colors & typography based on the ui-ux-pro-max design skill library (Retro-Futurism / HUD-FUI style profiles + font pairing) and a local SOC FUI reference mock (design/refs/, not in the repository).

## Visuals

### NEON (赛博霓虹)
- Deep blue-violet night base (`#141126` → `#1B1834 / #221E42 / #2A2550`), neon pink primary, electric blue secondary, violet accents
- Space Grotesk + DM Sans for UI text, JetBrains Mono for code
- CRT scanlines + purple vignette + horizon glow + pink-violet neon shadows

### TACTICAL (战术面板)
- SOC deep blue-black base (`#0A0E14` → `#131820 / #1E2530 / #262F3D`), **solid blue-gray borders** (`#2E3848` — the precision of a tactical panel)
- SOC semantic status colors all ≥7:1 contrast: cyan `#56D4E0` (9.5:1) / green `#5DDB72` / red `#FF7B72` / yellow `#f0c239`; FUI green `#00FF88` as the HUD brand color
- IBM Plex Sans for text + IBM Plex Mono / JetBrains Mono for code
- Top cyan radial glow + cyan scanlines & glow + cyan syntax highlighting

### Shared Texture
- **Console texture** (a nod to digital archaeology): ASCII data-stream ticker (top/bottom edges), Console HUD (`█ V://NEON █` / `█ V://TACTICAL █`, switches with the theme), CRT rolling band, title signal interference, terminal-style code block edges — all colors follow the theme
- **Session status frames**: sidebar session rows light up per the official `StateDot [data-state]` — **ongoing** = 3px cyan (Tactical) / pink-blue (Neon) left edge bar + faint same-color tint, the official matrix pixel animation dot carried through via `--dsh-state-ongoing`; **waiting for you** (approvals / plan reviews / questions) = yellow / gold bar ("your turn"); **completed** = bright green `#00FF88` (FUI green · success semantics) bar + status dot synced green — the official client renders completed and idle as the same DOM state (`done`), so the plugin uses a MutationObserver to read each row's screen-reader label (workspace dictionary, zh/en built in) to tell them apart precisely; **idle** = frame silently fades out. Tints use `background-image` so official hover / selected backgrounds layer on top undisturbed; rows are matched with `:has()` negation, and browsers without support simply get no frame (zero-side-effect degradation)
- Theme switching = **hot swap**: token layer replaced in place + FX layer re-dressed wholesale, no restart needed; your choice persists in localStorage
- Respects `prefers-reduced-motion`

## Install

**Option 1 · Install directly from GitHub (recommended)**:

```sh
dsh plugin --profile web add "https://github.com/victor10035445/dsh-v-theme"
```

After installing, **restart `dsh web`** and refresh the page.

**Option 2 · Local clone + link** (no packaging needed; changes take effect after restarting `dsh web` — best for development):

```sh
git clone https://github.com/victor10035445/dsh-v-theme.git
dsh plugin --profile web add "link:<clone path>"
```

**Option 3 · Packed tgz**:

```sh
npm pack                       # produces dsh-v-theme-0.5.0.tgz
dsh plugin --profile web add "<absolute path to the tgz>"
```

`add` registers `dsh-v-theme` into the profile's bundle list.

## Usage

Open **Settings → General** and find the **V CYBER** row:

- **Master switch** (terminal card): click to connect / disconnect — connecting pins Appearance to dark and overlays the current theme; state persists in localStorage and auto-reconnects on restart
- **Style picker** (two chips): "赛博霓虹 / NEON" / "战术面板 / TACTICAL" — **hot swap on click while connected** (token layer + FX layer re-dressed, no restart); your choice persists and is restored on restart (legacy persisted theme ids migrate automatically)
- Turning the master switch off removes the token & FX layers and restores the appearance preference captured before activation
- Switching Appearance to light / system auto-disconnects this theme (your base choice is respected)

## How It Works

| Mechanism | Details |
|---|---|
| Multi-theme | Theme registry (palette + fx + HUD brand line + swatch dots); `overrideTokens` same-source replacement for hot switching |
| Colors | A full 89/89 `--dsw-alias-*` / `--dsw-specific-*` token override layer per theme; built-in light/dark themes untouched |
| Persistence | Connecting pins the built-in preference to `dark` (persistable); theme choice stored in localStorage |
| FX | A plugin-private stylesheet scoped to `body.v-cyber`, swapped wholesale with the theme; scrollbar follows the official `--dsh-scrollbar-thumb` rebind contract |
| Settings row | `ctx.slots.inject("settings.general.item")` injects the switch + theme chips; `ctx.locale.register` provides zh/en strings |
| Self-healing | Listens to `theme/change`: re-adds the layer if removed (sentinel token prevents feedback loops), auto-disconnects if the base palette is switched away |

The host-side `lib/index.js` is a logic-free empty plugin — it exists only so the cordis loader can resolve this package, letting client-modules compile `lib/client.js` into the `/plugins` boot graph.

## Repository Layout

```
package.json        Plugin manifest (dsh.bundle.patch + dsh.client declaration)
cordis.patch.yml    Loader insert entry
lib/index.js        Host-side entry (empty plugin)
lib/client.js       Client bundle (factory form, hand-written, zero build)
design/             Design reference: palette-fusion.md design-language doc
                    (visual mocks and official-frontend extractions under refs/ are kept
                    locally only and are not part of the repository)
tools/              Official frontend asset extraction scripts (extract-css / list-tokens,
                    re-run after DSH upgrades)
tests/              Runnable checks (Node, no browser)
```

Verification commands (run each after releases / changes):

```sh
npm run check                    # syntax check for lib/*.js
node tests/smoke.cjs             # plugin contract smoke: register / toggle / hot switch / self-heal / disconnect
node tests/check-palettes.cjs    # palette contract: no background tokens + full accent set
node tests/check-statusrow.cjs   # session status frame contract
node tests/verify-install.cjs    # install discovery check (requires the package installed in a profile;
                                 # profile path via argv[2] or the DSH_PROFILE env var,
                                 # defaults to ~/.dsh/profiles/web)
```

## License

MIT
