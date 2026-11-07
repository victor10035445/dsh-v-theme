/**
 * 会话提示音（chime）子系统契约校验（Node，无浏览器）。
 *
 * 驱动方式（对照 spec-driven 设计 D2–D7）：
 *   加载 lib/client.js → apply(ctx)（stub MutationObserver 捕获 observer 回调、
 *   假会话行 DOM（closest/querySelector stub）、注入 stub AudioContext）
 *   → 经 observer 回调驱动边沿判定 → 断言：
 *   边沿矩阵 / 三门矩阵 / 合成音型 / 反存键语义 / 生命周期清理。
 */
const fs = require("fs");
const path = require("path");

const CODE = fs.readFileSync(path.join(__dirname, "..", "lib", "client.js"), "utf8");

let failures = 0;
function ok(cond, msg) {
  if (cond) return true;
  failures++;
  console.log("  ✗ " + msg);
  return false;
}

/* ---------- 假会话行 DOM（信号源可变；closest/querySelector stub） ---------- */
function makeRow(key, init) {
  init = init || {};
  const cell = { state: init.state || "", label: init.label || "" };
  const dot = {
    nodeType: 1,
    closest: () => row,
    getAttribute: (n) => (n === "data-state" ? cell.state : null)
  };
  const slot = {
    nodeType: 1,
    closest: () => row,
    querySelector: (sel) => (sel === "[data-state]" && cell.state ? dot : null),
    querySelectorAll: () => (cell.label ? [{ textContent: cell.label }] : [])
  };
  const row = {
    nodeType: 1,
    isConnected: init.connected !== false,
    getAttribute: (n) => (n === "data-row-key" ? key : null),
    closest: (sel) => (String(sel).includes("sessionRow") ? row : null),
    querySelector: (sel) => (String(sel).includes("slot") ? slot : null)
  };
  row._cell = cell;
  row._slot = slot;
  row._dot = dot;
  return row;
}
function setRowState(row, state, label) {
  row._cell.state = state;
  row._cell.label = label || "";
}
/** 构造 mutation record：attr=StateDot 属性翻转；slot-add=行首 slot 点插入；remount=行重挂载。 */
function recordsFor(kind, row) {
  if (kind === "attr") return [{ type: "attributes", target: row._dot, addedNodes: [] }];
  if (kind === "slot-add") return [{ type: "childList", target: row._slot, addedNodes: [row._dot], removedNodes: [] }];
  if (kind === "remount") return [{ type: "childList", target: { nodeType: 1, closest: () => null }, addedNodes: [row], removedNodes: [] }];
  throw new Error("unknown record kind " + kind);
}

/* ---------- stub AudioContext：记录振荡器频率 / 包络 / 滤波 / 主音量 ---------- */
function makeAudioCtor(opts) {
  opts = opts || {};
  const made = [];
  function AudioContext() {
    const ctx = {
      state: "suspended",
      currentTime: 0,
      destination: { kind: "destination" },
      resumeCalls: 0,
      closeCalls: 0,
      oscs: [],
      gains: [],
      filters: [],
      resume() {
        this.resumeCalls++;
        if (opts.deferredResume) return Promise.resolve().then(() => { this.state = "running"; });
        this.state = "running";
        return Promise.resolve();
      },
      close() {
        this.closeCalls++;
        this.state = "closed";
        return Promise.resolve();
      },
      createGain() {
        const param = {
          value: 0,
          ops: [],
          setValueAtTime(v, t) { this.ops.push(["set", v, t]); },
          exponentialRampToValueAtTime(v, t) { this.ops.push(["ramp", v, t]); }
        };
        const g = { gain: param, connect() {}, disconnect() {} };
        ctx.gains.push(g);
        return g;
      },
      createOscillator() {
        const o = {
          type: "",
          frequency: { value: 0 },
          connect() {},
          startAt: null,
          stopAt: null,
          start(t) { this.startAt = t; },
          stop(t) { this.stopAt = t; },
          onended: null
        };
        ctx.oscs.push(o);
        return o;
      },
      createBiquadFilter() {
        const f = { type: "", frequency: { value: 0 }, connect() {}, disconnect() {} };
        ctx.filters.push(f);
        return f;
      }
    };
    made.push(ctx);
    return ctx;
  }
  AudioContext.made = made;
  return AudioContext;
}

/* ---------- 单用例独立全局沙箱 ---------- */
async function runCase(name, init, fn) {
  init = init || {};
  const saved = {
    document: global.document,
    localStorage: global.localStorage,
    MutationObserver: global.MutationObserver,
    AudioContext: global.AudioContext,
    DateNow: Date.now
  };
  const env = {
    clockNow: init.clockStart || Date.now(),
    storage: new Map(Object.entries(init.storage || {})),
    rows: init.rows || [],
    docListeners: [],
    observers: [],
    setHidden(v) {
      env.document.hidden = !!v;
    },
    gesture() {
      for (const l of env.docListeners.slice()) if (l.type === "pointerdown" && !l.removed) l.fn();
    },
    flush() {
      return new Promise((r) => setImmediate(r));
    }
  };
  const localStorageApi = {
    getItem: (k) => (env.storage.has(k) ? env.storage.get(k) : null),
    setItem: (k, v) => void env.storage.set(k, String(v)),
    removeItem: (k) => void env.storage.delete(k)
  };
  const bodyClasses = new Set();
  env.document = {
    body: {
      classList: {
        add: (...cs) => cs.forEach((c) => bodyClasses.add(c)),
        remove: (...cs) => cs.forEach((c) => bodyClasses.delete(c)),
        contains: (c) => bodyClasses.has(c)
      }
    },
    head: { appendChild() {} },
    createElement: () => ({ dataset: {}, style: {}, textContent: "", appendChild() {}, remove() {} }),
    hidden: !!init.hidden,
    hasFocus: () => (init.focused === undefined ? false : !!init.focused),
    addEventListener: (type, fn) => env.docListeners.push({ type, fn, removed: false }),
    removeEventListener: (type, fn) => {
      for (const l of env.docListeners) if (l.type === type && l.fn === fn) l.removed = true;
    },
    querySelectorAll: (sel) => env.rows.filter((r) => r.isConnected !== false && String(sel).includes("sessionRow"))
  };
  Date.now = () => env.clockNow;

  const registrations = [];
  global.window = { __ModuleLoader__: { load: (reg) => registrations.push(reg) } };
  global.localStorage = localStorageApi;
  global.document = env.document;
  global.MutationObserver = class {
    constructor(cb) {
      this.cb = cb;
      this.config = null;
      this.disconnected = false;
      env.observers.push(this);
    }
    observe(target, config) {
      this.config = { target, ...config };
    }
    disconnect() {
      this.disconnected = true;
    }
  };
  if (init.audio !== false) global.AudioContext = makeAudioCtor(init.audioOpts || {});

  const fakeJsx = { jsx: (t, p) => ({ t, p }), jsxs: (t, p) => ({ t, p }) };
  const stores = [];
  const fakeStore = {
    defineStore: (decl) => {
      const handle = {
        decl,
        create: () => {
          const state = decl.init();
          const bound = {};
          for (const [k, fn] of Object.entries(decl.actions)) bound[k] = (...a) => fn(state, ...a);
          return { state, bound };
        }
      };
      stores.push(handle);
      return handle;
    }
  };
  const requireStub = (spec) => {
    if (spec === "react/jsx-runtime") return fakeJsx;
    if (spec === "@deepseek-ai/dsh-client-store") return fakeStore;
    throw new Error("unexpected require: " + spec);
  };

  const disposers = [];
  const localeDicts = {};
  const theme = {
    preference: "system",
    getTheme() { return { preference: this.preference }; },
    setTheme() {},
    overrideTokens: () => () => {},
    on() { return () => {}; }
  };
  let slotProps = null;
  const ctx = {
    theme,
    locale: {
      register: (ns, dicts) => {
        localeDicts[ns] = dicts;
        return () => {};
      },
      bind: () => () => undefined
    },
    slots: {
      inject: (name2, cb) => cb(),
      register: (decl, comp) => {
        const handle = stores[stores.length - 1];
        const state = handle.decl.init();
        const actions = {};
        for (const [k, fn] of Object.entries(handle.decl.actions)) actions[k] = (...a) => fn(state, ...a);
        slotProps = decl.inject(actions);
        env.slotState = state;
        return () => {};
      }
    },
    on: (ev, fn) => theme.on(fn),
    effect: (fn2) => {
      const d = fn2();
      if (typeof d === "function") disposers.push(d);
    }
  };

  try {
    new Function("require", CODE)(requireStub);
    const exports_ = registrations[registrations.length - 1].factory(requireStub);
    exports_.apply(ctx);
    env.teardown = () => {
      const d = disposers[disposers.length - 1];
      d();
    };
    env.slotProps = slotProps;
    env.localeDicts = localeDicts;
    env.chimeObserver = () => [...env.observers].reverse().find((o) => o.config && o.config.attributeFilter);
    env.drive = (records) => env.chimeObserver().cb(records);
    env.audioCtxs = global.AudioContext ? global.AudioContext.made : [];
    env.storageApi = env.storage;
    if (typeof fn === "function") await fn(env);
    console.log("  ✓ " + name);
  } catch (e) {
    failures++;
    console.log("  ✗ " + name + " → " + (e && e.message ? e.message : e));
  } finally {
    global.document = saved.document;
    global.localStorage = saved.localStorage;
    global.MutationObserver = saved.MutationObserver;
    global.AudioContext = saved.AudioContext;
    Date.now = saved.DateNow;
  }
}

(async () => {
  console.log("chime contract checks (add-session-chime)");

  /* ── 反存键语义 + store/props 面 ── */
  await runCase(
    "反存默认开：无任何键 → chime 武装且无首访写入",
    { rows: [makeRow("session:a", { state: "ongoing" })] },
    (env) => {
      ok(env.chimeObserver() && !env.chimeObserver().disconnected, "缺省应武装");
      ok(!env.storage.has("dsh-v-theme:chime"), "首访不得写 chime 键");
    }
  );
  await runCase(
    '反存 "0" 关：存 "0" → chime 不武装',
    { storage: { "dsh-v-theme:chime": "0" }, rows: [makeRow("session:a", { state: "ongoing" })] },
    (env) => {
      ok(!env.chimeObserver(), '存 "0" 后不得武装');
    }
  );
  await runCase(
    "store init 恰为 {enabled,themeId,chimeOn,volume} + props 三动作 + 词典 v.chime.*",
    { rows: [] },
    (env) => {
      const keys = Object.keys(env.slotState || {}).sort().join();
      ok(keys === "chimeOn,enabled,themeId,volume", "store init 键面不符: " + keys);
      ok(typeof env.slotProps.setChime === "function", "props 缺 setChime");
      ok(typeof env.slotProps.setVolume === "function", "props 缺 setVolume");
      ok(typeof env.slotProps.previewChime === "function", "props 缺 previewChime");
      ok(!("setGlow" in env.slotProps) && !("toggleGlow" in env.slotProps), "props 不得含 glow 面");
      const dicts = env.localeDicts["settings.v-cyber"] || {};
      for (const k of ["v.chime.label", "v.chime.toggle", "v.chime.volume", "v.chime.previewDone", "v.chime.previewWarning", "v.chime.desc"]) {
        ok(dicts.zh && dicts.zh[k] && dicts.en && dicts.en[k], "词典缺 " + k);
      }
      ok(dicts.zh["v.chime.previewWarning"] !== dicts.en["v.chime.previewWarning"], "zh/en 文案应有区分");
    }
  );

  /* ── 边沿矩阵 ── */
  await runCase(
    "边沿：首扫基线不响 / warning 边沿响上行双音 / 持续态不响 / done 边沿响下行双音",
    {
      rows: [
        makeRow("session:a", { state: "ongoing" }),
        makeRow("session:b", { state: "ongoing" }),
        makeRow("session:c", { state: "ongoing" })
      ]
    },
    async (env) => {
      env.gesture();
      ok(env.audioCtxs.length === 1 && env.audioCtxs[0].state === "running", "手势应懒创建并解锁 AudioContext");
      env.drive(recordsFor("attr", env.rows[0]));
      ok(env.audioCtxs[0].oscs.length === 0, "首扫基线不得发声");
      setRowState(env.rows[0], "warning", "等待审批");
      env.drive(recordsFor("attr", env.rows[0]));
      const ctxA = env.audioCtxs[0];
      ok(ctxA.oscs.length === 2, "warning 边沿应播双音, got " + ctxA.oscs.length);
      ok(ctxA.oscs[0].frequency.value === 523.25 && ctxA.oscs[1].frequency.value === 784, "上行应为 C5(523.25)→G5(784)");
      ok(ctxA.oscs.every((o) => o.type === "sine"), "音色必须 sine（禁方波/锯齿）");
      ok(ctxA.oscs[1].stopAt - ctxA.oscs[0].startAt <= 0.5, "单次总时长 ≤0.5s, got " + (ctxA.oscs[1].stopAt - ctxA.oscs[0].startAt));
      /* 持续态：同一 warning 再来一条 record → 不响 */
      env.drive(recordsFor("attr", env.rows[0]));
      ok(ctxA.oscs.length === 2, "持续态不得发声");
      /* 冷却内 done 边沿被抑制（任何出声抑制完成） */
      setRowState(env.rows[1], "done", "已完成");
      env.drive(recordsFor("slot-add", env.rows[1]));
      ok(ctxA.oscs.length === 2, "冷却内 done 边沿应被抑制");
      /* 冷却外 done 边沿（另一会话）播下行 E5→C5 */
      env.clockNow += 1600;
      setRowState(env.rows[2], "done", "已完成");
      env.drive(recordsFor("attr", env.rows[2]));
      ok(ctxA.oscs.length === 4, "冷却外 done 边沿应播双音, got " + ctxA.oscs.length);
      ok(ctxA.oscs[2].frequency.value === 659.25 && ctxA.oscs[3].frequency.value === 523.25, "下行应为 E5(659.25)→C5(523.25)");
      ok(ctxA.oscs[3].stopAt <= 0.5, "done 总时长 ≤0.5s");
      /* 回前台：实现根本不注册 visibilitychange / focus 监听（结构性不补响） */
      const types = env.docListeners.map((l) => l.type);
      ok(types.includes("pointerdown") && types.includes("keydown") && types.length === 2, "手势监听外不得注册其他文档监听: " + types);
    }
  );

  await runCase(
    "边沿：无点行不响 / 空闲标签不响（标签消歧）/ 快照已被静默更新",
    {
      rows: [
        makeRow("session:d", { state: "" }),
        makeRow("session:e", { state: "ongoing" }),
        makeRow("session:f", { state: "ongoing" })
      ]
    },
    (env) => {
      env.gesture();
      const ctx = env.audioCtxs[0];
      /* 无点行（slot 无 [data-state]）翻转记录 → 信号源缺失 → 静默 */
      env.drive(recordsFor("remount", env.rows[0]));
      ok(ctx.oscs.length === 0, "无点行不得发声");
      /* done + 空闲标签（防御官方漂移的消歧）→ 不发声，但快照更新（不再视作 ongoing） */
      setRowState(env.rows[1], "done", "空闲");
      env.drive(recordsFor("attr", env.rows[1]));
      ok(ctx.oscs.length === 0, "done+空闲标签不得发声");
      /* 快照已是 done：补上已完成标签 → 完成边沿（空闲→已完成 视作完成） */
      setRowState(env.rows[1], "done", "已完成");
      env.drive(recordsFor("attr", env.rows[1]));
      ok(ctx.oscs.length === 2, "空闲(done+空闲)→已完成 应播完成音, got " + ctx.oscs.length);
      /* 会话行外变更：record target 无法归属到行 → 零判定 */
      env.clockNow += 1600;
      setRowState(env.rows[2], "warning", "等待回答");
      env.drive([{ type: "attributes", target: { nodeType: 1, closest: () => null }, addedNodes: [] }]);
      ok(ctx.oscs.length === 2, "会话行外变更不得触发发声");
      env.drive(recordsFor("attr", env.rows[2]));
      ok(ctx.oscs.length === 4, "行内 warning 边沿应发声");
    }
  );

  await runCase(
    "行重挂载：复用 data-row-key 快照不误响；卸载窗口翻转在重挂载记录上补判",
    {
      rows: [
        makeRow("session:g", { state: "warning", label: "等待审批" }),
        makeRow("session:h", { state: "ongoing" })
      ]
    },
    (env) => {
      env.gesture();
      const ctx = env.audioCtxs[0];
      /* 状态未变重挂载 → 快照仍在 → 不误响 */
      env.rows[0].isConnected = false;
      env.drive(recordsFor("remount", env.rows[0]));
      env.rows[0].isConnected = true;
      env.drive(recordsFor("remount", env.rows[0]));
      ok(ctx.oscs.length === 0, "重挂载且状态未变不得误响");
      /* 卸载窗口内的翻转：脱离文档不判定，重挂载记录上补判边沿 */
      env.rows[1].isConnected = false;
      env.drive(recordsFor("attr", env.rows[1]));
      ok(ctx.oscs.length === 0, "脱离文档的行不得判定");
      setRowState(env.rows[1], "warning", "计划评审");
      env.rows[1].isConnected = true;
      env.drive(recordsFor("remount", env.rows[1]));
      ok(ctx.oscs.length === 2, "重挂载应按存量快照补判边沿, got " + ctx.oscs.length);
    }
  );

  await runCase(
    "重新武装：关闭不回放 / 重开重建基线 / 此后新边正常发声",
    { rows: [makeRow("session:i", { state: "ongoing" })] },
    (env) => {
      env.gesture();
      const first = env.chimeObserver();
      env.slotProps.setChime(false);
      ok(first.disconnected, "关闭应断开观察者");
      ok(env.storage.get("dsh-v-theme:chime") === "0", "关闭应落盘反存键");
      setRowState(env.rows[0], "done", "已完成"); /* 关闭期间发生的事件 */
      env.slotProps.setChime(true);
      const second = env.chimeObserver();
      ok(second && second !== first && !second.disconnected, "重开应武装全新观察者");
      ok(!env.storage.has("dsh-v-theme:chime"), "开启应移除反存键（缺省即开）");
      ok(second.config && second.config.target === global.document.body, "新观察者应观察 document.body");
      ok(second.config.childList && second.config.subtree && second.config.attributes, "新观察者配置应 childList+subtree+attributes");
      ok(JSON.stringify(second.config.attributeFilter) === JSON.stringify(["data-state"]), "新观察者应 attributeFilter [data-state]");
      ok(env.audioCtxs[0].oscs.length === 0, "重新武装的基线扫描不得回放关闭期间的完成事件");
      setRowState(env.rows[0], "warning", "等待回答");
      env.drive(recordsFor("attr", env.rows[0]));
      ok(env.audioCtxs[0].oscs.length === 2, "重开后新边沿应正常发声");
    }
  );

  /* ── 三门矩阵 ── */
  await runCase(
    "可见性门：前台可见静默且不消费冷却（随后隐藏立即响）",
    {
      rows: [makeRow("session:j", { state: "ongoing" }), makeRow("session:k", { state: "ongoing" })],
      hidden: false,
      focused: true
    },
    (env) => {
      env.gesture();
      const ctx = env.audioCtxs[0];
      setRowState(env.rows[0], "warning", "等待审批");
      env.drive(recordsFor("attr", env.rows[0]));
      ok(ctx.oscs.length === 0, "前台可见不得出声");
      env.setHidden(true);
      setRowState(env.rows[1], "warning", "等待回答");
      env.drive(recordsFor("attr", env.rows[1]));
      ok(ctx.oscs.length === 2, "静默边沿不得消费冷却——隐藏后应立即响");
    }
  );

  await runCase(
    "解锁门：suspended 跳过且不写冷却（ctx 缺失 → 解锁后 done 边沿立即响）",
    { rows: [makeRow("session:l", { state: "ongoing" }), makeRow("session:m", { state: "ongoing" })] },
    (env) => {
      /* 不做手势：audioCtx 为 null → playChime 返回 false → 跳过 */
      setRowState(env.rows[0], "warning", "等待审批");
      env.drive(recordsFor("attr", env.rows[0]));
      ok(env.audioCtxs.length === 0, "解锁前不得创建 AudioContext");
      env.gesture();
      const ctx = env.audioCtxs[0];
      /* 若被跳过的边沿误写了冷却，随后的 done 边沿（<1.5s）会被抑制 */
      setRowState(env.rows[1], "done", "已完成");
      env.drive(recordsFor("slot-add", env.rows[1]));
      ok(ctx.oscs.length === 2, "解锁门失败不得消费冷却——随后的 done 应立即响");
    }
  );

  await runCase(
    "冷却代数：done 刚响后 warning 覆盖播放；warning 冷却内合并丢弃",
    {
      rows: [
        makeRow("session:n", { state: "ongoing" }),
        makeRow("session:o", { state: "ongoing" }),
        makeRow("session:p", { state: "ongoing" }),
        makeRow("session:q", { state: "ongoing" })
      ]
    },
    (env) => {
      env.gesture();
      const ctx = env.audioCtxs[0];
      setRowState(env.rows[0], "done", "已完成");
      env.drive(recordsFor("slot-add", env.rows[0]));
      ok(ctx.oscs.length === 2, "done 边沿应响");
      setRowState(env.rows[1], "warning", "等待审批");
      env.drive(recordsFor("attr", env.rows[1]));
      ok(ctx.oscs.length === 4, "冷却内 warning 应覆盖刚响的完成");
      const oscCount = ctx.oscs.length;
      env.clockNow += 800;
      env.drive(recordsFor("attr", env.rows[1])); /* 持续态，不响（快照相同） */
      ok(ctx.oscs.length === oscCount, "持续态不响");
      /* 冷却内的第二个 warning（另一会话）→ 合并丢弃 */
      setRowState(env.rows[2], "warning", "计划评审");
      env.drive(recordsFor("attr", env.rows[2]));
      ok(ctx.oscs.length === oscCount, "冷却内第二个 warning 应合并丢弃");
      env.clockNow += 1600;
      setRowState(env.rows[3], "warning", "等待回答");
      env.drive(recordsFor("attr", env.rows[3]));
      ok(ctx.oscs.length === oscCount + 2, "冷却结束后 warning 应正常响");
    }
  );

  await runCase(
    "解锁门（suspended context）：resume 未生效时跳过且不写冷却",
    {
      rows: [makeRow("session:r", { state: "ongoing" }), makeRow("session:s", { state: "ongoing" })],
      audioOpts: { deferredResume: true }
    },
    async (env) => {
      env.gesture();
      ok(env.audioCtxs.length === 1 && env.audioCtxs[0].state === "suspended", "deferred resume 下应保持 suspended");
      setRowState(env.rows[0], "warning", "等待审批");
      env.drive(recordsFor("attr", env.rows[0]));
      ok(env.audioCtxs[0].oscs.length === 0, "suspended 不得调度声音");
      await env.flush();
      ok(env.audioCtxs[0].state === "running", "flush 后应 running");
      setRowState(env.rows[1], "done", "已完成");
      env.drive(recordsFor("slot-add", env.rows[1]));
      ok(env.audioCtxs[0].oscs.length === 2, "跳过的边沿不得消费冷却——done 应立即响");
    }
  );

  /* ── 合成音型 + 音量 ── */
  await runCase(
    "合成断言：低通 4kHz / 包络终点非零 / 主音量默认 0.3、setVolume 即改即生效并落盘",
    { rows: [makeRow("session:t", { state: "ongoing" }), makeRow("session:u", { state: "ongoing" })] },
    (env) => {
      env.gesture();
      const ctx = env.audioCtxs[0];
      setRowState(env.rows[0], "warning", "等待审批");
      env.drive(recordsFor("attr", env.rows[0]));
      ok(ctx.filters.length === 1 && ctx.filters[0].type === "lowpass" && ctx.filters[0].frequency.value === 4000, "须 lowpass ~4kHz");
      const envGains = ctx.gains.filter((g) => g.gain.ops.length);
      ok(envGains.length === 2, "每音应有包络 GainNode");
      for (const g of envGains) {
        const ramps = g.gain.ops.filter((op) => op[0] === "ramp");
        ok(ramps.length === 2, "包络应为 攻起+指数衰减 两段 ramp");
        ok(ramps[ramps.length - 1][1] === 0.0001, "包络终点须 ~0.0001 非 0");
        ok(ramps[0][1] > 0 && ramps[0][1] <= 1, "峰值须在 (0,1]");
      }
      const masters = ctx.gains.filter((g) => !g.gain.ops.length);
      ok(masters.length === 1 && masters[0].gain.value === 0.3, "主音量默认 30% → 0.3, got " + (masters[0] && masters[0].gain.value));
      /* setVolume 即改即生效：主音量跟随 + 落盘 */
      env.slotProps.setVolume(55);
      ok(env.storage.get("dsh-v-theme:volume") === "55", "音量变更应即时落盘");
      env.clockNow += 1600;
      setRowState(env.rows[1], "warning", "等待回答");
      env.drive(recordsFor("attr", env.rows[1]));
      const masters2 = ctx.gains.filter((g) => !g.gain.ops.length);
      ok(masters2[masters2.length - 1].gain.value === 0.55, "音量 55 → 主音量 0.55");
    }
  );

  /* ── 试听：不经边沿与三门 ── */
  await runCase(
    "试听：前台可见（可见性门必不成立）仍直接发声；滑杆 setVolume 不发声",
    {
      rows: [makeRow("session:v", { state: "ongoing" })],
      hidden: false,
      focused: true
    },
    async (env) => {
      env.slotProps.previewChime("warning");
      await env.flush();
      ok(env.audioCtxs.length === 1, "试听应同手势懒创建 AudioContext");
      const ctx = env.audioCtxs[0];
      ok(ctx.state === "running" && ctx.oscs.length === 2, "可见时试听仍应发声（不经门）");
      ok(ctx.oscs[0].frequency.value === 523.25 && ctx.oscs[1].frequency.value === 784, "试听该你了=上行 C5→G5");
      const before = ctx.oscs.length;
      env.slotProps.setVolume(80);
      ok(ctx.oscs.length === before, "滑杆调整不得发声");
      env.slotProps.previewChime("done");
      await env.flush();
      ok(ctx.oscs.length === before + 2, "第二枚试听应发声");
      ok(ctx.oscs[before].frequency.value === 659.25 && ctx.oscs[before + 1].frequency.value === 523.25, "试听完成=下行 E5→C5");
    }
  );

  /* ── 生命周期 ── */
  await runCase(
    "卸载（有手势）：observer 断开 / AudioContext close / 手势监听移除",
    { rows: [makeRow("session:w", { state: "ongoing" })] },
    (env) => {
      env.gesture();
      ok(env.audioCtxs.length === 1, "前置：手势已创建 context");
      env.teardown();
      ok(env.chimeObserver().disconnected, "卸载应断开 chime observer");
      ok(env.audioCtxs[0].closeCalls === 1, "卸载应 close AudioContext");
      ok(env.docListeners.every((l) => l.removed), "卸载应摘除全部手势监听");
    }
  );
  await runCase(
    "卸载（无手势）：无 context 不抛错 / 手势监听仍被摘除",
    { rows: [makeRow("session:x", { state: "ongoing" })] },
    (env) => {
      env.teardown();
      ok(env.audioCtxs.length === 0, "无手势不得创建 context");
      ok(env.docListeners.length === 2 && env.docListeners.every((l) => l.removed), "卸载应摘除手势监听");
      ok(env.chimeObserver().disconnected, "卸载应断开 observer");
    }
  );

  if (failures) {
    console.log("\nCHIME CHECK: FAIL (" + failures + ")");
    process.exit(1);
  }
  console.log("\nCHIME CHECK: PASS");
})().catch((e) => {
  console.error("runner error:", e);
  process.exit(1);
});
