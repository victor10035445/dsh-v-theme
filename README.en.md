# dsh-v-theme · V CYBER (Multi-Colorway)

[简体中文](README.md) | **English**

A **hacker / cyber theme plugin** for the DeepSeek Harness Web client, featuring seven switchable styles:

| Style | Vibe | Signature |
|---|---|---|
| **NEON** (赛博霓虹, baseline) | Bioluminescent neon in a wormhole gradient | Neon pink `#FF2E97` × electric blue `#4DA8FF` (inline-code / file-address pills are fixed ice-blue, see Shared Texture), CRT flicker + session status frames (guarded by a baseline fingerprint, see `tests/check-baseline.cjs`) |
| **Sunset Drive** (日落公路) | Horizon, highway, golden hour | Sunset orange `#FF6B35` × dusk violet `#B967FF` × electric cyan, orange→violet wormhole gradient |
| **Dream Core** (梦核) | Soft creamy neon, coziest at night | Cream pink `#FF71CE` × ice cyan `#01CDFE` × mint `#05FFA1` |
| **Neon Violet** (紫夜极光) | Deep-space night flight, coldest and most mysterious | Electric violet `#C07CFF` × laser cyan `#00E5FF` × rose-pink channel |
| **Y2K Chrome** (银翼千禧) | Liquid metal, bubbles, millennial nostalgia | Hot pink `#FF69B4` × electric cyan `#00E5FF` + chrome-silver highlight layer |
| **Blue Nocturne** (蓝调夜曲) | Inverted primary/secondary, most restrained for daytime work | Ice blue `#5CC8FF` primary (9.69:1, highest of all) × neon pink accents |
| **TACTICAL** (战术面板 · 红蓝作战中心) | SOC red/blue ops board + FUI neon | SOC cyan `#56D4E0` blue-team channel + crimson→magenta red-team alerts + AAA-contrast base (14.3:1) |

Purely additive: it never replaces or disables any official plugin; zero side effects while off.

> Colors & typography based on the ui-ux-pro-max design skill library (Retro-Futurism / Vaporwave / Y2K / HUD-FUI style profiles + font pairing) and a local SOC FUI reference mock (design/refs/, not in the repository). Concept-layer explorations live in `design/palette-synthwave.md` and `design/concept-layer.md`.

## Visuals

### NEON (赛博霓虹 · baseline · protected)
- Native DSH dark base, neon pink primary, electric blue secondary (the only exception: inline-code / file-address pills are fixed ice-blue, per user spec)
- Space Grotesk + DM Sans for UI text, JetBrains Mono for code
- Title CRT flicker + streaming top sweep + pink-violet neon shadows & gradient borders (all component-scoped)
- Palette & FX layer content are guarded by a SHA-256 baseline fingerprint (`node tests/check-baseline.cjs`) — any touch fails the test (unseal log in the test header)

### Neon colorway family ×5 (Sunset Drive / Dream Core / Neon Violet / Y2K Chrome / Blue Nocturne)
- Each = a full accent-layer palette (contrast verified case by case, see `design/palette-synthwave.md`) + parametric FX via `buildNeonFX` (family signature shares the baseline structure)
- **Concept layer** (metaphor as feature documentation): `compaction` context fold = **wormhole channel** (vertical primary→partner tunnel, gold reserved for handoff approvals); reference chips end in a **portal ring**; `tool-result` arrival = **synapse fire** (one-shot pulse, success green / error crimson); assistant messages = **mycelium-growth neural trunks**; streaming = **emergence bloom**
- Y2K Chrome adds metallic highlights (chrome-beaded swatches + composer top white glow)
- Permanent loops are family-signature only (CRT flicker / streaming sweep); concept effects are strictly one-shot; `prefers-reduced-motion` disables everything

### TACTICAL (战术面板 · 红蓝作战中心)
- SOC deep blue-black base (`#0A0E14` → `#131820 / #1E2530 / #262F3D`), **solid blue-gray borders** (`#2E3848`)
- **Red/blue dual channel = the organizing principle**: blue team (cyan `#56D4E0`/`#00D4FF`) = defense · execution · monitoring; red team (crimson `#FF3366`→magenta `#FF00FF`) = adversarial · alert · anomaly (error tool cards **switch border & brackets to crimson** as a silent signal); command authority = DEFCON gold `#F0C239`; victory = bright green `#00FF88`
- **Calm tool cards**: tool cards are procedural background info — **no top highlight line** (DEFCON gradient top edge and alert sweep removed; `.panel` translucent body, hover glow and L tactical brackets retained); user bubble gradient top edge and composer top glow are untouched
- **Hive cells**: hexagons prepend queue/task titles (reference-mock dot-hex recipe); **fractal depth**: nested tool-card L brackets shrink self-similarly (`:has()` detection, graceful without); **ops radar**: conic sweep on the queue panel (8s low-frequency, the only new permanent loop in the plugin); **engine ignition**: ONLINE text stepped reveal
- IBM Plex Sans for text + IBM Plex Mono / JetBrains Mono for code; cyan syntax highlighting

### Shared Texture
- **Console texture**: title signal interference (CRT flicker), terminal-style code block edges, settings-row monospace mark (`█ V://CYBER █`) — all colors follow the theme
- **Inline-code / file-address pills** (unified across all seven): inline code inside conversations (file addresses, short snippets) = rounded pill with 14% theme-color background + brightened primary text — file addresses carry the theme's special color in every style (the tactical recipe generalized; the neon family reads each variant's primary via `color-mix`); **NEON is the sole exception**: pills are fixed ice-blue `rgba(92,200,255,.14)` background + `#95DBFF` text (user spec, deliberately not following its neon pink primary)
- **Session status frames**: sidebar session rows light up per the official `StateDot [data-state]` — **ongoing** = 3px per-colorway channel bar + faint same-color tint; **waiting for you** = gold bar ("your turn", constant across all seven); **completed** = bright green `#00FF88` bar + status dot synced green (constant across all seven; the official client renders completed and idle as the same DOM state, so the plugin uses a MutationObserver over screen-reader labels to tell them apart); **idle** = frame silently fades out. Tints use `background-image` so official hover / selected backgrounds layer on top undisturbed
- Style switching = **hot swap**: token layer replaced in place + FX layer re-dressed wholesale, no restart needed; your choice persists in localStorage
- Respects `prefers-reduced-motion`

## Install

> **Host requirement**: DeepSeek Harness `>= 0.1.2-rc.1` — since that version the client store engine moved to the platform seed word `@deepseek-ai/dsh-client-store`. For host `0.1.1-rc.2` or earlier, use plugin `0.5.0`.

**Option 1 · Install directly from GitHub (recommended)** — this plugin is hand-written with zero build steps and no install-time scripts, so a git install needs no build authorization:

```sh
dsh plugin --profile web add "github:victor10035445/dsh-v-theme"
```

To pin a version (later pushes can't silently change what actually runs):

```sh
dsh plugin --profile web add "github:victor10035445/dsh-v-theme#<commit-sha>"
```

After installing, **restart `dsh web`** and refresh the page.

**Option 2 · Local clone + link** (no packaging needed; changes take effect after restarting `dsh web` — best for development):

```sh
git clone https://github.com/victor10035445/dsh-v-theme.git
dsh plugin --profile web add "link:<clone path>"
```

**Option 3 · Packed tgz**:

```sh
npm pack                       # produces dsh-v-theme-0.7.2.tgz
dsh plugin --profile web add "<absolute path to the tgz>"
```

`add` registers `dsh-v-theme` into the profile's bundle list.

## Usage

Open **Settings → Skin** and find the **V CYBER** card:

- **Master switch** (terminal card): click to connect / disconnect — connecting pins Appearance to dark and overlays the current theme; state persists in localStorage and auto-reconnects on restart
- **Style picker** (seven chips, wrapping grid): NEON / Sunset Drive / Dream Core / Neon Violet / Y2K Chrome / Blue Nocturne / TACTICAL — **hot swap on click while connected** (token layer + FX layer re-dressed, no restart); your choice persists and is restored on restart
- Turning the master switch off removes the token & FX layers and restores the appearance preference captured before activation
- Switching Appearance to light / system auto-disconnects this theme (your base choice is respected)

## How It Works

| Mechanism | Details |
|---|---|
| Multi-colorway | Theme registry (7 entries × palette + fx + swatch); the five neon colorways are generated parametrically via `buildNeonFX(P, extra)` — palette constants are the single source of color truth, FX reads tokens directly |
| Colors | A full 89/89 `--dsw-alias-*` / `--dsw-specific-*` token override layer per theme; built-in light/dark themes untouched; contract checks (no background tokens + full accent set + contrast floor) cover all 7 |
| Persistence | Connecting pins the built-in preference to `dark` (persistable); theme choice stored in localStorage |
| FX | A plugin-private stylesheet scoped to `body.v-cyber`, swapped wholesale with the theme; scrollbar follows the official `--dsh-scrollbar-thumb` rebind contract |
| Baseline guard | The NEON baseline palette & FX layer are fingerprinted with SHA-256; any touch fails `check-baseline` |
| Settings row | `ctx.slots.inject("settings.section")` injects a dedicated Skin page (switch + seven style chips); `ctx.locale.register` provides zh/en strings |
| Self-healing | Listens to `theme/change`: re-adds the layer if removed (sentinel token prevents feedback loops), auto-disconnects if the base palette is switched away |

The host-side `lib/index.js` is a logic-free empty plugin — it exists only so the cordis loader can resolve this package, letting client-modules compile `lib/client.js` into the `/plugins` boot graph.

## Repository Layout

```
package.json        Plugin manifest (dsh.bundle.patch + dsh.client declaration)
cordis.patch.yml    Loader insert entry
lib/index.js        Host-side entry (empty plugin)
lib/client.js       Client bundle (factory form, hand-written, zero build)
design/             Design reference: palette-fusion.md / palette-synthwave.md / concept-layer.md
                    (visual mocks and official-frontend extractions under refs/ are kept
                    locally only and are not part of the repository)
tools/              Official frontend asset extraction scripts (extract-css / list-tokens,
                    re-run after DSH upgrades)
tests/              Runnable checks (Node, no browser)
```

Verification commands (run each after releases / changes):

```sh
npm run check                    # syntax check for lib/*.js
npm test                         # same as tests/smoke.cjs (plugin contract smoke + five-colorway hot swap)
node tests/check-palettes.cjs    # palette contract ×7: no background tokens + full accent set + contrast floor
node tests/check-statusrow.cjs   # session status frame contract + neon builder template structure
node tests/check-baseline.cjs    # NEON baseline fingerprint (SHA-256)
node tests/verify-install.cjs    # install discovery check (requires the package installed in a profile;
                                 # profile path via argv[2] or the DSH_PROFILE env var,
                                 # defaults to ~/.dsh/profiles/web)
```

## License

MIT
