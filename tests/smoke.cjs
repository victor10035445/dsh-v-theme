/**
 * dsh-v-theme 契约冒烟测试（Node，无浏览器）：
 * stub window.__ModuleLoader__ / require / document / localStorage，
 * 加载 lib/client.js，验证：
 *  1. factory 导出 { apply, inject }
 *  2. TOKENS 全部是 {light,dark} 字符串对
 *  3. apply 后 theme.overrideTokens 被调用且偏好固定为 dark
 *  4. toggle on/off 流程、theme/change 自愈与自动断开
 */
const fs = require("fs");
const path = require("path");

/* ---------- stubs ---------- */
const registrations = [];
global.window = { __ModuleLoader__: { load: (reg) => registrations.push(reg) } };

const localStorageData = new Map();
global.localStorage = {
  getItem: (k) => (localStorageData.has(k) ? localStorageData.get(k) : null),
  setItem: (k, v) => void localStorageData.set(k, String(v)),
  removeItem: (k) => void localStorageData.delete(k)
};

const bodyClasses = new Set();
const headTags = [];
const bodyOverlays = [];
function makeElement() {
  return {
    dataset: {},
    style: {},
    textContent: "",
    className: "",
    children: [],
    appendChild(c) {
      this.children.push(c);
    },
    remove() {
      const h = headTags.indexOf(this);
      if (h >= 0) headTags.splice(h, 1);
      const b = bodyOverlays.indexOf(this);
      if (b >= 0) bodyOverlays.splice(b, 1);
    }
  };
}
global.document = {
  body: {
    classList: {
      add: (...cs) => cs.forEach((c) => bodyClasses.add(c)),
      remove: (...cs) => cs.forEach((c) => bodyClasses.delete(c)),
      contains: (c) => bodyClasses.has(c),
      toggle: (c, force) => {
        const on = force === undefined ? !bodyClasses.has(c) : !!force;
        if (on) bodyClasses.add(c);
        else bodyClasses.delete(c);
        return on;
      }
    },
    appendChild: (el) => bodyOverlays.push(el)
  },
  head: { appendChild: (t) => headTags.push(t) },
  createElement: () => makeElement()
};

const fakeJsx = { jsx: (t, p) => ({ t, p }), jsxs: (t, p) => ({ t, p }) };
const stores = [];
const fakeStore = {
  defineStore: (decl) => {
    const handle = { decl, create: () => { const state = decl.init(); const bound = {}; for (const [k, fn] of Object.entries(decl.actions)) bound[k] = (...a) => fn(state, ...a); return { state, bound }; } };
    stores.push(handle);
    return handle;
  }
};
const requireStub = (spec) => {
  if (spec === "react/jsx-runtime") return fakeJsx;
  if (spec === "@deepseek-ai/dsh-client-store") return fakeStore;
  throw new Error("unexpected require: " + spec);
};

/* ---------- load bundle ---------- */
const code = fs.readFileSync(path.join(__dirname, "..", "lib", "client.js"), "utf8");
new Function("require", code)(requireStub);
if (registrations.length !== 1) throw new Error("expected exactly 1 module registration");
const reg = registrations[0];
if (reg.id !== "dsh-v-theme") throw new Error("bad module id: " + reg.id);
const exports_ = reg.factory(requireStub);
if (typeof exports_.apply !== "function") throw new Error("apply missing");
if (!Array.isArray(exports_.inject) || exports_.inject.join() !== "theme,locale,slots") throw new Error("bad inject: " + exports_.inject);
console.log("ok: module registration + exports");

/* ---------- mock theme runtime ---------- */
function makeTheme() {
  const listeners = [];
  const overrides = new Map();
  let seq = 0;
  const theme = {
    preference: "system",
    getTheme() { return this.snapshot(); },
    setTheme(id) {
      if (!["light", "dark", "system"].includes(id)) throw new Error("unknown theme " + id);
      if (this.preference === id) return;
      this.preference = id;
      this.publish();
    },
    overrideTokens(source, tokens) {
      for (const [name, v] of Object.entries(tokens)) {
        if (typeof v !== "object" || typeof v.light !== "string" || typeof v.dark !== "string")
          throw new Error("bad token pair: " + name);
      }
      overrides.set(source, { seq: seq++, tokens });
      this.publish();
      const layer = overrides.get(source);
      return () => { if (overrides.get(source) === layer) { overrides.delete(source); this.publish(); } };
    },
    snapshot() {
      const tokens = {};
      for (const layer of [...overrides.values()].sort((a, b) => a.seq - b.seq))
        for (const [name, modes] of Object.entries(layer.tokens)) tokens[name] = modes.dark;
      return Object.freeze({ preference: this.preference, active: Object.freeze({ id: "dark", colorScheme: "dark", tokens: Object.freeze(tokens) }), revision: 0 });
    },
    publish() { const s = this.snapshot(); for (const fn of listeners.slice()) fn(s); },
    on(fn) { listeners.push(fn); return () => listeners.splice(listeners.indexOf(fn), 1); },
    layerCount: () => overrides.size
  };
  return theme;
}

/* ---------- mock ctx ---------- */
const theme = makeTheme();
let localeDicts = null;
const slotRegistrations = [];
const ctx = {
  theme,
  locale: { register: (ns, dicts) => { if (!dicts.zh || !dicts.en) throw new Error("locale dicts incomplete"); const zk = Object.keys(dicts.zh).sort().join(); const ek = Object.keys(dicts.en).sort().join(); if (zk !== ek) throw new Error("zh/en key mismatch"); localeDicts = dicts; return () => {}; } },
  slots: { inject: (name, cb) => { if (name !== "settings.section") throw new Error("unexpected slot " + name); slotRegistrations.push(cb()); return () => {}; }, register: (decl, comp) => { if (decl.id !== "v-skin") throw new Error("bad slot id: " + decl.id); if (typeof decl.label !== "function") throw new Error("section label must be a function"); const inst = decl.store.decl ? null : null; const storeInst = { state: decl.store ? stores[stores.length - 1].decl.init() : null }; // bind actions
      const actions = {}; const handle = stores[stores.length - 1]; const state = handle.decl.init(); for (const [k, fn] of Object.entries(handle.decl.actions)) actions[k] = (...a) => fn(state, ...a);
      const props = decl.inject(actions);
      if (typeof props.toggle !== "function") throw new Error("slot inject must return toggle");
      if (typeof props.setTheme !== "function") throw new Error("slot inject must return setTheme");
      if ("toggleGlow" in props) throw new Error("slot inject must NOT return toggleGlow (feature removed)");
      slotRegistrations.slot = { decl, props, state };
      return () => {}; } },
  on: (ev, fn) => { if (ev !== "theme/change") throw new Error("unexpected event " + ev); return theme.on(fn); },
  effect: (fn, label) => { const d = fn(); if (typeof d !== "function") throw new Error("effect must return disposer: " + label); return () => {}; }
};

/* 预设已移除特性的陈旧持久化键：apply 必须以字面量键清理（设计决策 5） */
localStorage.setItem("dsh-v-theme:glow", "1");
exports_.apply(ctx);
console.log("ok: apply() completed");
if (localStorage.getItem("dsh-v-theme:glow") !== null) throw new Error("stale glow key must be purged on apply");
console.log("ok: stale glow key purged on apply");

/* layer applied at boot only when flag on — flag is off here */
if (theme.layerCount() !== 0) throw new Error("layer should not be applied with flag off");
if (theme.preference !== "system") throw new Error("preference must stay system with flag off");
console.log("ok: flag off => no side effects");

/* toggle ON */
slotRegistrations.slot.props.toggle();
if (theme.preference !== "dark") throw new Error("toggle on must pin dark");
if (theme.layerCount() !== 1) throw new Error("toggle on must apply exactly one layer");
const tokens = theme.snapshot().active.tokens;
if (tokens["--dsw-alias-brand-primary"] !== "#FF2E97") throw new Error("accent not applied");
if (tokens["--v-cyber-on"] !== "1") throw new Error("sentinel missing");
if (!bodyClasses.has("v-cyber")) throw new Error("body class missing");
if (!headTags.some((t) => String(t.dataset.pluginCss || "").includes("cyber-fx"))) throw new Error("fx stylesheet missing");
if (localStorage.getItem("dsh-v-theme:enabled") !== "1") throw new Error("flag not persisted");
/* 反向断言（cyber-fx-layer）：特效层只妆组件——body 直接子级零插件节点、无辉光类 */
if (bodyOverlays.length !== 0) throw new Error("fx layer must not attach any body overlay, got " + bodyOverlays.length);
if (bodyClasses.has("v-glow")) throw new Error("v-glow body class must not exist");
console.log("ok: toggle on => dark + layer + fx + flag, body untouched");

/* self-heal: simulate layer removal */
theme.snapshot(); // noop
// forcibly drop via a fresh override cycle is internal; simulate by checking re-apply logic through publish with same layer present
theme.publish();
if (theme.layerCount() !== 1) throw new Error("layer must not duplicate on publish");
console.log("ok: no duplicate layer on unrelated publish");

/* ── 主题切换：neon → tactical ── */
slotRegistrations.slot.props.setTheme("tactical");
if (localStorage.getItem("dsh-v-theme:theme") !== "tactical") throw new Error("theme choice must persist");
const tokensF = theme.snapshot().active.tokens;
if (tokensF["--dsw-alias-brand-primary"] !== "#56D4E0") throw new Error("tactical accent not applied: " + tokensF["--dsw-alias-brand-primary"]);
if ("--dsw-alias-bg-base" in tokensF) throw new Error("tactical must NOT override background tokens (native DSH backgrounds)");
if ("--dsw-specific-bubble" in tokensF) throw new Error("tactical must NOT override bubble surface (native)");
if (theme.layerCount() !== 1) throw new Error("theme switch must keep exactly one layer");
if (bodyOverlays.length !== 0 || bodyClasses.has("v-glow")) throw new Error("theme switch must not create body overlays or glow class");
console.log("ok: theme switch => tactical palette + fx hot-swapped, body still untouched");

/* 切回 neon：令牌恢复 */
slotRegistrations.slot.props.setTheme("neon");
if (theme.snapshot().active.tokens["--dsw-alias-brand-primary"] !== "#FF2E97") throw new Error("switch back to neon failed");
console.log("ok: theme switch back => neon restored");

/* ── 霓虹色板族：注册表 7 条目 + 逐案热切换（运行时 FX 插值产物断言，见 design.md 决策 6） ── */
const paletteDecls = [...code.matchAll(/const PALETTE_[A-Z0-9_]+ = \{/g)].length;
if (paletteDecls !== 7) throw new Error("expected 7 palette declarations, got " + paletteDecls);
const NEED_LABELS = ["neon", "outrun", "vaporwave", "neon-violet", "y2k-chrome", "blue-nocturne", "tactical"].map((k) => "v.theme." + k);
for (const k of NEED_LABELS) {
  if (!(k in localeDicts.zh) || !(k in localeDicts.en)) throw new Error("missing theme label: " + k);
}
if (localeDicts.zh["v.theme.neon"] !== "赛博霓虹") throw new Error("neon label must be 赛博霓虹");
if (localeDicts.en["v.theme.neon"] !== "NEON") throw new Error("neon label must be NEON");
if (JSON.stringify(localeDicts).includes("粉蓝霓虹")) throw new Error("legacy label 粉蓝霓虹 must be gone from visible copy");
const NEON_IDS = ["outrun", "vaporwave", "neon-violet", "y2k-chrome", "blue-nocturne"];
const NEON_PRIMARY = { outrun: "#FF6B35", vaporwave: "#FF71CE", "neon-violet": "#C07CFF", "y2k-chrome": "#FF69B4", "blue-nocturne": "#5CC8FF" };
const fxTag = () => headTags.find((t) => String(t.dataset.pluginCss || "").includes("cyber-fx"));
for (const id of NEON_IDS) {
  slotRegistrations.slot.props.setTheme(id);
  if (localStorage.getItem("dsh-v-theme:theme") !== id) throw new Error(id + ": theme choice must persist");
  const tk = theme.snapshot().active.tokens;
  if (tk["--dsw-alias-brand-primary"] !== NEON_PRIMARY[id]) throw new Error(id + ": brand accent mismatch: " + tk["--dsw-alias-brand-primary"]);
  if ("--dsw-alias-bg-base" in tk) throw new Error(id + ": must NOT override background tokens (native DSH backgrounds)");
  const fx = fxTag().textContent;
  const business = tk["--dsw-alias-state-business-primary"];
  if (!fx.includes("box-shadow:inset 3px 0 0 " + business)) throw new Error(id + ": ongoing frame must use per-variant business channel");
  if (!fx.includes("inset 3px 0 0 #00FF88")) throw new Error(id + ": completed frame must stay #00FF88");
  if (fx.includes("undefined")) throw new Error(id + ": fx interpolation leaked undefined");
  if (bodyOverlays.length !== 0 || bodyClasses.has("v-glow")) throw new Error(id + ": must not create body overlays or glow class");
}
console.log("ok: neon colorways => 5 variants hot-swap, per-variant frames, completed green constant, no leaks");
/* 切回 neon：后续断言基于基线态 */
slotRegistrations.slot.props.setTheme("neon");
if (theme.snapshot().active.tokens["--dsw-alias-brand-primary"] !== "#FF2E97") throw new Error("switch back to neon (post-neon) failed");
console.log("ok: switch back to baseline after neon tour");

/* ── 行内 code / 文件地址胶囊：七案统一（战术面板行内 code 配方推广） + 融合工具卡去顶边回归 ── */
for (const id of ["neon", ...NEON_IDS, "tactical"]) {
  slotRegistrations.slot.props.setTheme(id);
  const fx = fxTag().textContent;
  if (!fx.includes("[data-conversation-scroll] :not(pre) > code")) throw new Error(id + ": inline-code pill (file-address color) missing");
  if (fx.includes("undefined")) throw new Error(id + ": pill interpolation leaked undefined");
}
console.log("ok: inline-code pill present in all seven styles");
slotRegistrations.slot.props.setTheme("tactical");
const fxTactical = fxTag().textContent;
if (fxTactical.includes('callRow"]::before')) throw new Error("tactical: tool-card top edge must stay removed");
if (fxTactical.includes("vAlertSweep")) throw new Error("tactical: alert sweep must stay removed");
if (!fxTactical.includes('[data-chat-flow-kind="tool-result"][data-error]::after')) throw new Error("tactical: quiet error bracket swap missing");
if (!fxTactical.includes('[data-chat-flow-kind="user"] [class*="bubble"]::before')) throw new Error("tactical: user bubble top edge must stay");
if (!fxTactical.includes("vRadar")) throw new Error("tactical: ops radar must stay");
slotRegistrations.slot.props.setTheme("neon");
if (theme.snapshot().active.tokens["--dsw-alias-brand-primary"] !== "#FF2E97") throw new Error("switch back to neon (post-fx-contract) failed");
console.log("ok: tactical tool cards calm (no top edge / no sweep), bubble top edge + radar kept");

/* ── store 回归：镜像状态收窄为 enabled/themeId，无 glow 状态面 ── */
const slotState = slotRegistrations.slot.state;
if (slotState.enabled !== true) throw new Error("store must mirror enabled=true while on");
if (slotState.themeId !== "neon") throw new Error("store must mirror themeId");
if ("glow" in slotState) throw new Error("store state must not contain glow");
const storeDecl = stores[stores.length - 1].decl;
if ("glow" in storeDecl.init()) throw new Error("store init must not contain glow field");
if ("setGlow" in storeDecl.actions || "toggleGlow" in storeDecl.actions) throw new Error("store actions must not contain setGlow/toggleGlow");
if (localStorage.getItem("dsh-v-theme:glow") !== null) throw new Error("glow key must stay absent (feature removed)");
console.log("ok: store mirror => enabled/themeId only, no glow surface");

/* user switches base to light => auto disconnect */
theme.setTheme("light");
if (theme.layerCount() !== 0) throw new Error("switching base must drop the layer");
if (localStorage.getItem("dsh-v-theme:enabled") !== null) throw new Error("auto-disconnect must clear flag");
if (bodyClasses.has("v-cyber")) throw new Error("body class must be removed");
if (bodyOverlays.length !== 0 || bodyClasses.has("v-glow")) throw new Error("disconnect must leave no body overlays and no glow class");
console.log("ok: base switch => auto disconnect");

/* toggle ON again then OFF => restore the preference captured at THIS activation (light) */
slotRegistrations.slot.props.toggle();
if (theme.preference !== "dark") throw new Error("re-toggle on failed");
if (localStorage.getItem("dsh-v-theme:prev-preference") !== "light") throw new Error("prev must be re-captured per activation");
slotRegistrations.slot.props.toggle();
if (theme.preference !== "light") throw new Error("toggle off must restore the preference captured at activation");
if (theme.layerCount() !== 0) throw new Error("toggle off must drop layer");
console.log("ok: toggle off => restore preference");

/* boot with flag on — 恢复上次的主题选择（此刻是 neon） */
localStorage.setItem("dsh-v-theme:enabled", "1");
localStorage.setItem("dsh-v-theme:theme", "tactical");
const theme2 = makeTheme();
ctx.theme = theme2;
ctx.on = (ev, fn) => theme2.on(fn);
exports_.apply(ctx);
if (theme2.preference !== "dark" || theme2.layerCount() !== 1) throw new Error("boot with flag on must re-activate");
if (bodyOverlays.length !== 0 || bodyClasses.has("v-glow")) throw new Error("boot must not mount body overlays or glow class");
const tokensBoot = theme2.snapshot().active.tokens;
if (tokensBoot["--dsw-alias-brand-primary"] !== "#56D4E0") throw new Error("boot must restore persisted tactical theme");
console.log("ok: boot with flag on => re-activate with persisted theme");

/* 收尾：关掉第二个实例，让进程可退出 */
slotRegistrations.slot.props.toggle();
if (bodyOverlays.length !== 0 || bodyClasses.has("v-glow")) throw new Error("final toggle off must leave body untouched");
console.log("ok: final toggle off => body untouched");

console.log("\nALL SMOKE TESTS PASSED");
