/* 校验两个主题调色板：背景族令牌必须完全缺席（交还 DSH 原生），
   保留集（强调/边框/文字/状态/字体）必须完整。 */
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

function paletteKeys(marker) {
  const start = src.indexOf(marker);
  if (start === -1) throw new Error("palette not found: " + marker);
  const end = src.indexOf("};", start);
  return new Set([...src.slice(start, end).matchAll(/"(--d[s]?[sw]-[a-z0-9-]*)"\s*:/g)].map((m) => m[1]));
}

let fail = false;
for (const [name, marker] of [["neon", "PALETTE_NEON"], ["tactical", "PALETTE_TACTICAL"]]) {
  const keys = paletteKeys(marker);
  const leaked = BANNED.filter((t) => keys.has(t));
  const missing = REQUIRED.filter((t) => !keys.has(t));
  console.log(name + ":", keys.size, "tokens");
  if (leaked.length) { console.log("  ✗ BACKGROUND LEAKED:", leaked.join(", ")); fail = true; }
  if (missing.length) { console.log("  ✗ MISSING ACCENT:", missing.join(", ")); fail = true; }
  if (!leaked.length && !missing.length) console.log("  ✓ accents only, backgrounds native");
}
process.exit(fail ? 1 : 0);
