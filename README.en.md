# dsh-v-theme · V CYBER (Multi-Colorway)

[简体中文](README.md) | **English**

A **hacker / cyber theme plugin** for the DeepSeek Harness Web client, featuring seven switchable styles. Purely additive: it never replaces or disables any official plugin; zero side effects while off.

| Style | Signature |
|---|---|
| **NEON** (赛博霓虹, baseline) | Neon pink `#FF2E97` × electric blue; fingerprint-protected baseline |
| **Sunset Drive** (日落公路) | Sunset orange × dusk violet highway gradient |
| **Dream Core** (梦核) | Cream pink × ice cyan × mint, softest at night |
| **Neon Violet** (紫夜极光) | Electric violet × laser cyan, deep-space flight |
| **Y2K Chrome** (银翼千禧) | Hot pink × electric cyan, chrome highlights |
| **Blue Nocturne** (蓝调夜曲) | Inverted ice-blue primary, most restrained by day |
| **TACTICAL** (战术面板) | SOC red/blue ops center + FUI neon |

> Colors & typography based on the ui-ux-pro-max design skill library and a local reference mock; the design language is documented in `design/` (palette-synthwave.md / concept-layer.md / palette-fusion.md).

## Visuals

**NEON (baseline · protected)**
- Neon pink × electric blue; component-scoped decoration: CRT flicker, streaming sweep, gradient borders, session status frames
- Palette & FX layer are guarded by a SHA-256 fingerprint (`tests/check-baseline.cjs`) — any touch fails the test

**Neon colorway family ×5 (Sunset Drive / Dream Core / Neon Violet / Y2K Chrome / Blue Nocturne)**
- Generated parametrically via `buildNeonFX`: full accent-layer palettes (contrast verified ≥7:1 per variant) + family-signature FX sharing the baseline structure
- One-shot concept effects: compaction = wormhole channel, reference chips = portal ring, tool-result = synapse fire, streaming = emergence bloom; permanent loops are family-signature only

**TACTICAL (red/blue ops center)**
- Red/blue dual channel: blue team (cyan) = defense · execution, red team (crimson→magenta) = adversarial · alerts, command = DEFCON gold, victory = bright green
- Calm tool cards (no top highlight line) + hive cells / fractal depth brackets / ops radar

**Shared texture**
- Inline-code / file-address pills: rounded theme-color pills unified across all seven styles (baseline exception: fixed ice-blue)
- Session status frames: ongoing = channel bar, waiting = gold, completed = bright green, idle = silent fade
- Hot swap without restart; respects `prefers-reduced-motion`

## Install

> **Host requirement**: DeepSeek Harness `>= 0.1.2-rc.1` (for older hosts use plugin `0.5.0`).

**Install directly from GitHub (recommended)** — hand-written with zero build steps, no build authorization needed:

```sh
dsh plugin --profile web add "github:victor10035445/dsh-v-theme"
```

Append `#<commit-sha>` to pin a version; or clone and `add "link:<clone path>"`, or install a packed tgz. **Restart `dsh web`** after installing.

## Usage

**Settings → Skin → V CYBER**:

- **Master switch**: connect / disconnect — connecting pins the dark appearance and overlays the theme; state persists and auto-reconnects on restart
- **Style picker**: seven chips; hot swap on click while connected, no restart
- Switching Appearance away from dark auto-disconnects the theme

## How It Works

| Mechanism | Details |
|---|---|
| Multi-colorway | 7-entry registry (palette + fx + swatch); the five neon colorways are generated parametrically via `buildNeonFX(P, extra)` |
| Colors | A full 89/89 token override layer per theme; built-in light/dark themes untouched; contract checks cover all 7 |
| Persistence | Theme choice in localStorage; switch state and appearance preference survive restarts |
| FX | A plugin-private stylesheet scoped to `body.v-cyber`, swapped wholesale with the theme |
| Baseline guard | The NEON baseline is fingerprinted with SHA-256; touches require an explicit unseal |
| Self-healing | Listens to `theme/change`: re-adds the layer if removed, auto-disconnects if the base is switched away |

## Repository Layout & Checks

```
lib/client.js       Client bundle (factory form, hand-written, zero build)
lib/index.js        Host-side entry (empty plugin)
cordis.patch.yml    Loader insert entry
design/             Design-language docs (refs/ mocks are local-only, not in the repo)
tools/              Official frontend asset extraction scripts
tests/              Runnable checks (Node, no browser)
```

```sh
npm run check                    # syntax check
npm test                         # plugin contract smoke + five-colorway hot swap
node tests/check-palettes.cjs    # palette contract ×7
node tests/check-statusrow.cjs   # session status frame contract
node tests/check-baseline.cjs    # baseline fingerprint (SHA-256)
node tests/verify-install.cjs    # install discovery check (requires a profile install)
```

## License

MIT
