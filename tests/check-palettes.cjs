/* 校验全部主题调色板（7 套）：背景族令牌必须完全缺席（交还 DSH 原生），
   保留集（强调/边框/文字/状态/字体）必须完整；
   文本层级对比度地板：label-primary ≥7:1、label-secondary ≥4.5:1（对原生深色底 #151517）。
   调色板声明用 `const PALETTE_X = {` 全匹配枚举——新增色板自动纳管，零测试改动。 */
const fs = require("fs");
const path = require("path");
const src = fs.readFileSync(path.join(__dirname, "..", "lib", "client.js"), "utf8");

/* 必须移除的背景族令牌（出现即失败） */
const BANNED = [
  "--dsw-alias-bg-base", "--dsw-alias-bg-layer-1", "--dsw-alias-bg-layer-2", "--dsw-alias-bg-layer-3",
  "--dsw-alias-bg-mask-1", "--dsw-alias-bg-mask-2", "--dsw-alias-bg-mask-3", "--dsw-alias-bg-mask-photo", "--dsw-alias-bg-mask-drop",
  "--dsw-alias-bg-module-platform", "--dsw-alias-bg-multi-select", "--dsw-alias-bg-overlay", "--dsw-alias-bg-skeleton",
  "--dsw-alias-markdown-citation", "--dsw-alias-markdown-code-block", "--dsw-alias-markdown-code-block-banner",
  "--dsw-alias-markdown-code-segment-selected", "--dsw-alias-markdown-code-segment-unselected",
  "--dsw-alias-markdown-inline-code", "--dsw-alias-markdown-placeholder", "--dsw-alias-markdown-tag",
  "--dsw-alias-toast-bg", "--dsw-alias-tooltip-bg",
  "--dsw-specific-bubble", "--dsw-specific-bubble-highlight", "--dsw-specific-input-major", "--dsw-specific-login-input",
  "--dsw-specific-menu", "--dsw-specific-selector", "--dsw-specific-sidebar-fill",
  "--dsw-specific-sidebar-nav-item-active", "--dsw-specific-sidebar-nav-item-hover", "--dsw-specific-tip",
  "--dsw-alias-button-elevated-fill", "--dsw-alias-button-floating-fill", "--dsw-alias-button-floating-hover",
  "--dsw-alias-button-ghost-active-fill", "--dsw-alias-button-ghost-active-hover", "--dsw-alias-button-primary-dimmed",
  "--dsw-alias-button-tool-bar-fill", "--dsw-alias-button-tool-bar-fill-invisible", "--dsw-alias-button-tool-bar-hover",
  "--dsw-alias-interactive-bg-hover-solid",
  "--dsw-alias-scrollbar-bg-l1", "--dsw-alias-scrollbar-bg-l2",
  "--dsw-alias-state-business-tertiary", "--dsw-alias-state-success-tertiary", "--dsw-alias-state-warn-tertiary",
  "--dsw-alias-label-dimmed", "--dsw-alias-label-primary-inverted"
];

/* 必须保留的强调集 */
const REQUIRED = [
  "--dsw-alias-brand-primary", "--dsw-alias-brand-text",
  "--dsw-alias-border-l1", "--dsw-alias-border-l2", "--dsw-alias-border-l3", "--dsw-alias-border-l4",
  "--dsw-alias-label-primary", "--dsw-alias-label-secondary", "--dsw-alias-label-tertiary",
  "--dsw-alias-state-business-primary", "--dsw-alias-state-error-primary", "--dsw-alias-state-success-primary", "--dsw-alias-state-warn-primary",
  "--dsw-alias-button-primary-fill", "--dsw-alias-button-info-fill",
  "--dsw-alias-scrollbar-hover-l1",
  "--dsw-specific-sidebar-nav-item-active-accent",
  "--dsw-font-family", "--ds-font-family-code"
];

/* 对比度基准：DSH 原生深色底（--dsw-static-neutral-bluish-950，已对现装产物核实） */
const BASE = "#151517";

function lum(hex) {
  const c = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4]
    .map((i) => parseInt(c.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function ratio(a, b) {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

/* `const PALETTE_X = {` 全匹配枚举（防前缀串误命中） */
const names = [...src.matchAll(/const (PALETTE_[A-Z0-9_]+) = \{/g)].map((m) => m[1]);

function paletteSlice(name) {
  const start = src.indexOf("const " + name + " = {");
  return src.slice(start, src.indexOf("};", start));
}
function paletteKeys(name) {
  return new Set([...paletteSlice(name).matchAll(/"(--d[s]?[sw]-[a-z0-9-]*)"\s*:/g)].map((m) => m[1]));
}
function paletteValue(name, token) {
  const m = paletteSlice(name).match(new RegExp('"' + token + '"\\s*:\\s*"([^"]+)"'));
  return m ? m[1] : null;
}

let fail = false;
if (names.length !== 7) {
  console.log("✗ expected 7 palette declarations (neon + 5 neon + tactical), got " + names.length + ": " + names.join(", "));
  fail = true;
}
for (const name of names) {
  const keys = paletteKeys(name);
  const leaked = BANNED.filter((t) => keys.has(t));
  const missing = REQUIRED.filter((t) => !keys.has(t));
  console.log(name + ": " + keys.size + " tokens");
  if (leaked.length) { console.log("  ✗ BACKGROUND LEAKED:", leaked.join(", ")); fail = true; }
  if (missing.length) { console.log("  ✗ MISSING ACCENT:", missing.join(", ")); fail = true; }

  /* 文本层级对比度地板（colorway-registry spec：primary ≥7:1 / secondary ≥4.5:1） */
  const lp = paletteValue(name, "--dsw-alias-label-primary");
  const ls = paletteValue(name, "--dsw-alias-label-secondary");
  if (!lp || !ls) { console.log("  ✗ label tokens missing"); fail = true; }
  else {
    const r1 = ratio(lp, BASE);
    const r2 = ratio(ls, BASE);
    if (r1 < 7) { console.log("  ✗ label-primary " + lp + " contrast " + r1.toFixed(2) + " < 7 (base " + BASE + ")"); fail = true; }
    if (r2 < 4.5) { console.log("  ✗ label-secondary " + ls + " contrast " + r2.toFixed(2) + " < 4.5 (base " + BASE + ")"); fail = true; }
    if (r1 >= 7 && r2 >= 4.5) console.log("  ✓ text contrast: primary " + r1.toFixed(2) + ":1 / secondary " + r2.toFixed(2) + ":1");
  }

  if (!leaked.length && !missing.length) console.log("  ✓ accents only, backgrounds native");
}
process.exit(fail ? 1 : 0);
