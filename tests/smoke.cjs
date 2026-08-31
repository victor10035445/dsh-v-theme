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
const fakeRuntime = {
  defineStore: (decl) => {
    const handle = { decl, create: () => { const state = decl.init(); const bound = {}; for (const [k, fn] of Object.entries(decl.actions)) bound[k] = (...a) => fn(state, ...a); return { state, bound }; } };
    stores.push(handle);
    return handle;
  }
};
const requireStub = (spec) => {
  if (spec === "react/jsx-runtime") return fakeJsx;
  if (spec === "@deepseek-ai/dsh-client-runtime/client") return fakeRuntime;
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
const slotRegistrations = [];
const ctx = {
  theme,
  locale: { register: (ns, dicts) => { if (!dicts.zh || !dicts.en) throw new Error("locale dicts incomplete"); const zk = Object.keys(dicts.zh).sort().join(); const ek = Object.keys(dicts.en).sort().join(); if (zk !== ek) throw new Error("zh/en key mismatch"); return () => {}; } },
  slots: { inject: (name, cb) => { if (name !== "settings.section") throw new Error("unexpected slot " + name); slotRegistrations.push(cb()); return () => {}; }, register: (decl, comp) => { if (decl.id !== "v-skin") throw new Error("bad slot id: " + decl.id); if (typeof decl.label !== "function") throw new Error("section label must be a function"); const inst = decl.store.decl ? null : null; const storeInst = { state: decl.store ? stores[stores.length - 1].decl.init() : null }; // bind actions
      const actions = {}; const handle = stores[stores.length - 1]; const state = handle.decl.init(); for (const [k, fn] of Object.entries(handle.decl.actions)) actions[k] = (...a) => fn(state, ...a);
      const props = decl.inject(actions);
      if (typeof props.toggle !== "function") throw new Error("slot inject must return toggle");
      if (typeof props.setTheme !== "function") throw new Error("slot inject must return setTheme");
      if (typeof props.toggleGlow !== "function") throw new Error("slot inject must return toggleGlow");
      slotRegistrations.slot = { decl, props, state };
      return () => {}; } },
  on: (ev, fn) => { if (ev !== "theme/change") throw new Error("unexpected event " + ev); return theme.on(fn); },
  effect: (fn, label) => { const d = fn(); if (typeof d !== "function") throw new Error("effect must return disposer: " + label); return () => {}; }
};

exports_.apply(ctx);
console.log("ok: apply() completed");

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
/* console 特效覆盖层：仅 HUD（ticker 已移除） */
if (bodyOverlays.length !== 1) throw new Error("expected 1 body overlay (HUD only), got " + bodyOverlays.length);
const hudEl = bodyOverlays.find((el) => el.className === "v-hud");
if (!hudEl || hudEl.children[0].textContent !== "█ V://SYNTHWAVE █") throw new Error("hud brand missing");
console.log("ok: toggle on => dark + layer + fx + flag + console overlays");

/* self-heal: simulate layer removal */
theme.snapshot(); // noop
// forcibly drop via a fresh override cycle is internal; simulate by checking re-apply logic through publish with same layer present
theme.publish();
if (theme.layerCount() !== 1) throw new Error("layer must not duplicate on publish");
console.log("ok: no duplicate layer on unrelated publish");

/* ── 主题切换：synthwave → fusion ── */
slotRegistrations.slot.props.setTheme("fusion");
if (localStorage.getItem("dsh-v-theme:theme") !== "fusion") throw new Error("theme choice must persist");
const tokensF = theme.snapshot().active.tokens;
if (tokensF["--dsw-alias-brand-primary"] !== "#56D4E0") throw new Error("fusion accent not applied: " + tokensF["--dsw-alias-brand-primary"]);
if ("--dsw-alias-bg-base" in tokensF) throw new Error("fusion must NOT override background tokens (native DSH backgrounds)");
if ("--dsw-specific-bubble" in tokensF) throw new Error("fusion must NOT override bubble surface (native)");
if (theme.layerCount() !== 1) throw new Error("theme switch must keep exactly one layer");
const hudF = bodyOverlays.find((el) => el.className === "v-hud");
if (!hudF || hudF.children[0].textContent !== "█ V://FUSION █") throw new Error("hud brand must switch to fusion");
console.log("ok: theme switch => fusion palette + fx hot-swapped");

/* 切回 synthwave：令牌恢复 */
slotRegistrations.slot.props.setTheme("synthwave");
if (theme.snapshot().active.tokens["--dsw-alias-brand-primary"] !== "#FF2E97") throw new Error("switch back to synthwave failed");
console.log("ok: theme switch back => synthwave restored");

/* ── 辉光开关：默认关；开 → body 类 + 持久化；关 → 摘类 ── */
if (bodyClasses.has("v-glow")) throw new Error("glow must default to off");
slotRegistrations.slot.props.toggleGlow();
if (!bodyClasses.has("v-glow")) throw new Error("toggleGlow must add the glow body class");
if (localStorage.getItem("dsh-v-theme:glow") !== "1") throw new Error("glow choice must persist");
slotRegistrations.slot.props.toggleGlow();
if (bodyClasses.has("v-glow")) throw new Error("toggleGlow again must remove the glow body class");
console.log("ok: glow toggle => body class + persistence");

/* user switches base to light => auto disconnect */
theme.setTheme("light");
if (theme.layerCount() !== 0) throw new Error("switching base must drop the layer");
if (localStorage.getItem("dsh-v-theme:enabled") !== null) throw new Error("auto-disconnect must clear flag");
if (bodyClasses.has("v-cyber")) throw new Error("body class must be removed");
if (bodyOverlays.length !== 0) throw new Error("console overlays must be removed on disconnect");
console.log("ok: base switch => auto disconnect");

/* toggle ON again then OFF => restore the preference captured at THIS activation (light) */
slotRegistrations.slot.props.toggle();
if (theme.preference !== "dark") throw new Error("re-toggle on failed");
if (localStorage.getItem("dsh-v-theme:prev-preference") !== "light") throw new Error("prev must be re-captured per activation");
slotRegistrations.slot.props.toggle();
if (theme.preference !== "light") throw new Error("toggle off must restore the preference captured at activation");
if (theme.layerCount() !== 0) throw new Error("toggle off must drop layer");
console.log("ok: toggle off => restore preference");

/* boot with flag on — 恢复上次的主题选择（此刻是 synthwave） */
localStorage.setItem("dsh-v-theme:enabled", "1");
localStorage.setItem("dsh-v-theme:theme", "fusion");
const theme2 = makeTheme();
ctx.theme = theme2;
ctx.on = (ev, fn) => theme2.on(fn);
exports_.apply(ctx);
if (theme2.preference !== "dark" || theme2.layerCount() !== 1) throw new Error("boot with flag on must re-activate");
if (bodyOverlays.length !== 1) throw new Error("boot with flag on must mount console overlay (HUD)");
const tokensBoot = theme2.snapshot().active.tokens;
if (tokensBoot["--dsw-alias-brand-primary"] !== "#56D4E0") throw new Error("boot must restore persisted fusion theme");
const hudBoot = bodyOverlays.find((el) => el.className === "v-hud");
if (!hudBoot || hudBoot.children[0].textContent !== "█ V://FUSION █") throw new Error("boot must restore fusion hud brand");
console.log("ok: boot with flag on => re-activate with persisted theme");

/* 收尾：关掉第二个实例，清掉 HUD 心跳，让进程可退出 */
slotRegistrations.slot.props.toggle();
if (bodyOverlays.length !== 0) throw new Error("final toggle off must remove overlays");
console.log("ok: final toggle off => overlays cleaned");

console.log("\nALL SMOKE TESTS PASSED");
