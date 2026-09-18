/**
 * 会话状态框体契约校验（Node，无浏览器）：
 * 对照研究结论（官方 StateDot [data-state] 信号 + workspace Rows.module 的 sessionRow 行）
 * 校验 lib/client.js 两个特效层：
 *  1. 每层都有 [class*="sessionRow"]:has([data-state="ongoing"|"warning"]) 两条框体规则
 *  2. 底色必须走 background-image（不得用 background 简写，否则吃掉官方 hover/选中底色）
 *  3. 进行中矩阵像素点同色贯穿（--dsh-state-ongoing 按主题通道色覆写）
 *  4. 完成态框体必须挂在 data-v-completed 标记上（亮绿 #00FF88 + 状态点同步），
 *     不得直接挂在 data-state="done" 上（官方把完成与空闲都渲染成 done）
 *  5. 失效选择器 navItemActive（当前前端构建零命中）不得回潮
 *  6. 主题配色与设计方案一致（Tactical 青/黄 · Neon 粉蓝/金 · 完成=亮绿）
 *  7. JS 侧标记链路完备：DONE_ATTR 常量 + zh/en 标签匹配集 + MutationObserver 扫描
 */
const fs = require("fs");
const path = require("path");

const src = fs.readFileSync(path.join(__dirname, "..", "lib", "client.js"), "utf8");

const synStart = src.indexOf("const FX_NEON");
const fusStart = src.indexOf("const FX_TACTICAL");
const palStart = src.indexOf("const PALETTE_NEON");
if (synStart < 0 || fusStart < 0 || palStart < 0 || !(synStart < fusStart && fusStart < palStart))
  throw new Error("FX layer markers not found / out of order");
const SYN = src.slice(synStart, fusStart);
const FUS = src.slice(fusStart, palStart);

const PLAN = {
  tactical: {
    block: FUS,
    ongoingBar: "#56D4E0",
    ongoingTint: "rgba(86,212,224,.05)",
    warningBar: "#F0C239",
    warningTint: "rgba(240,194,57,.06)",
    matrix: "--dsh-state-ongoing:#56D4E0",
    completedTint: "rgba(0,255,136,.05)"
  },
  neon: {
    block: SYN,
    ongoingBar: "#4DA8FF",
    ongoingTint: "rgba(77,168,255,.06)",
    warningBar: "#FFC857",
    warningTint: "rgba(255,200,87,.06)",
    matrix: "--dsh-state-ongoing:#4DA8FF",
    completedTint: "rgba(0,255,136,.06)"
  }
};

const ROW = '[class*="sessionRow"]:has([data-state=';
const COMPLETED = '[class*="sessionRow"][data-v-completed]';
const COMPLETED_GREEN = "#00FF88";
let fail = false;

for (const [name, p] of Object.entries(PLAN)) {
  const b = p.block;
  const need = (cond, msg) => {
    if (!cond) { console.log(`  ✗ ${name}: ${msg}`); fail = true; }
  };

  const ongoing = b.indexOf(ROW + '"ongoing"])');
  const warning = b.indexOf(ROW + '"warning"])');
  need(ongoing >= 0, "缺少进行中框体规则 [class*=sessionRow]:has([data-state=ongoing])");
  need(warning >= 0, "缺少待交互框体规则 [class*=sessionRow]:has([data-state=warning])");

  // 框体颜色与底色 tint
  const ongBlock = ongoing >= 0 ? b.slice(ongoing, ongoing + 220) : "";
  const warnBlock = warning >= 0 ? b.slice(warning, warning + 220) : "";
  need(ongBlock.includes("box-shadow:inset 3px 0 0 " + p.ongoingBar), `进行中左缘条应为 ${p.ongoingBar}`);
  need(ongBlock.includes("background-image:linear-gradient(" + p.ongoingTint + "," + p.ongoingTint + ")"), `进行中底色应为 background-image ${p.ongoingTint}`);
  need(warnBlock.includes("box-shadow:inset 3px 0 0 " + p.warningBar), `待交互左缘条应为 ${p.warningBar}`);
  need(warnBlock.includes("background-image:linear-gradient(" + p.warningTint + "," + p.warningTint + ")"), `待交互底色应为 background-image ${p.warningTint}`);

  // 底色不得用 background 简写（会吃掉官方 hover/选中底色）
  need(!/background:(?!-)/.test(ongBlock) && !/background:(?!-)/.test(warnBlock), "框体不得使用 background 简写（须 background-image）");

  // 矩阵像素点同色贯穿
  need(b.includes("body.${BODY_CLASS} [data-state=\"ongoing\"]{" + p.matrix + "}"), `矩阵像素点须覆写 ${p.matrix}`);

  // 完成态：框体挂在 data-v-completed 标记上（不得直接挂 data-state="done"）
  const completed = b.indexOf(COMPLETED);
  need(completed >= 0, "缺少完成态框体规则（data-v-completed 标记选择器）");
  const doneBlock = completed >= 0 ? b.slice(completed, completed + 300) : "";
  need(doneBlock.includes("box-shadow:inset 3px 0 0 " + COMPLETED_GREEN), `完成态左缘条应为 ${COMPLETED_GREEN}`);
  need(doneBlock.includes("background-image:linear-gradient(" + p.completedTint + "," + p.completedTint + ")"), `完成态底色应为 background-image ${p.completedTint}`);
  need(b.includes(COMPLETED + ' [data-state="done"]{color:' + COMPLETED_GREEN + "}"), "完成态官方状态点须同步亮绿");
  need(!/background:(?!-)/.test(doneBlock), "完成态框体不得使用 background 简写");

  console.log(`  ✓ ${name}: ongoing=${p.ongoingBar} warning=${p.warningBar} completed=${COMPLETED_GREEN} matrix=${p.matrix.split(":")[1]}`);
}

/* ── 霓虹族构建器模板结构校验（逐案色值断言在 smoke 运行时侧——模板内是 ${…} 令牌插值而非字面量 hex） ── */
const bStart = src.indexOf("function buildNeonFX");
const bEnd = src.indexOf("const NEON_EXTRA");
if (bStart < 0 || bEnd < 0 || !(bStart < bEnd)) {
  console.log("  ✗ neon: buildNeonFX / NEON_EXTRA not found or out of order");
  fail = true;
} else {
  const B = src.slice(bStart, bEnd);
  const need2 = (cond, msg) => {
    if (!cond) { console.log("  ✗ neon: " + msg); fail = true; }
  };
  need2(B.includes("box-shadow:inset 3px 0 0 #00FF88"), "完成框体须恒定 #00FF88 字面量（跨色板锚点）");
  need2(B.includes('body.${BODY_CLASS} [data-state="ongoing"]{--dsh-state-ongoing:${business}}'), "ongoing 须走 business 令牌映射占位（非字面量 hex）");
  need2(B.includes('P["--dsw-alias-state-business-primary"]'), "构建器须直读调色板令牌（单一色彩源）");
  need2(B.includes("prefers-reduced-motion:reduce"), "构建器须带 prefers-reduced-motion 块");
  need2(B.includes("vSynapse") && B.includes("vGrow") && B.includes("vEmerge"), "概念特效（点火/生长/涌现）须在场");
  need2(B.includes("vSynapseE"), "出错卡须走赤红脉冲（成功/出错语义不混）");
  /* 常驻循环仅限家族签名：vFlicker（CRT flicker）/ vScan（流式扫光）；概念特效全为一次性 */
  const loops = [...B.matchAll(/animation:[^;]*infinite[^;}]*/g)].map((m) => m[0]);
  need2(loops.length > 0 && loops.every((l) => l.includes("vFlicker") || l.includes("vScan")), "构建器 infinite 仅限 vFlicker/vScan，got: " + loops.join(" | "));
  /* 色值泄漏守卫：构建器内 6 位 hex 字面量仅允许全族常量（完成绿/审批金/选区白/阴影黑） */
  const hexes = [...new Set([...B.matchAll(/#[0-9A-Fa-f]{6}/g)].map((m) => m[0].toUpperCase()))];
  const ALLOWED = new Set(["#00FF88", "#FFC857", "#FFFFFF", "#0A0A0C"]);
  const leaked = hexes.filter((h) => !ALLOWED.has(h));
  need2(leaked.length === 0, "构建器不得硬编码他案色值，leaked: " + leaked.join(","));
  if (!fail) console.log("  ✓ neon: builder template structure ok（一次性概念特效 + 家族签名循环 + 令牌直读）");
}

/* done 无框：不得出现 data-state="done" 的框体选择器（完成态走 data-v-completed 标记） */
if (/sessionRow\"]:has\(\[data-state=\"done\"\]/.test(src)) { console.log("  ✗ done 状态必须无直接框体"); fail = true; }
else console.log("  ✓ done: 无直接框体（完成=标记亮绿 / 空闲=静默）");

/* 失效选择器不得回潮（当前 DSH 前端构建零命中，选中态交还官方底色） */
if (src.includes("navItemActive")) { console.log("  ✗ 失效选择器 navItemActive 不得回潮"); fail = true; }
else console.log("  ✓ navItemActive: 已移除（选中态=官方 hover 底色）");

/* JS 侧标记链路完备性 */
const WIRING = [
  ['data-v-completed', "DONE_ATTR 标记属性"],
  ['"已完成", "Completed"', "完成态 zh/en 标签匹配集"],
  ['"空闲", "Idle"', "空闲态 zh/en 标签匹配集"],
  ["new MutationObserver", "MutationObserver 扫描器"],
  ['ctx.locale.bind("workspace")', "运行时状态文案解析（workspace 词典）"]
];
for (const [needle, what] of WIRING) {
  if (src.includes(needle)) console.log("  ✓ wiring: " + what);
  else { console.log("  ✗ wiring 缺失: " + what + "（" + needle + "）"); fail = true; }
}

if (fail) { console.log("\nSTATUS-ROW CHECK: FAIL"); process.exit(1); }
console.log("\nSTATUS-ROW CHECK: PASS");
