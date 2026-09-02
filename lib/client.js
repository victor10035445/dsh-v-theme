/*!
 * dsh-v-theme — V CYBER（多主题）
 * DeepSeek Harness Web 客户端主题插件（黑客 / 赛博风）。
 *
 * 主题（v0.5.0）：
 *  - 赛博霓虹（Neon）：霓虹粉 × 电光蓝 × 紫罗兰夜空 + 地平线辉光
 *  - 战术面板（Tactical）：SOC 战术面板基底（AAA 对比度）+ FUI 霓虹强调
 *    （青 #56d4e0 主操作 / 绿 #00FF88 健康 / 黄 #f0c239 警示 / 赤红 #FF3366），
 *    参照本地 SOC FUI 参照稿（design/refs/，不入仓库），顶部青色径向辉光 + HUD 扫描线
 *  - 会话状态框体：侧栏会话行按官方 StateDot [data-state] 点亮——
 *    进行中=左缘青/粉蓝条 + 矩阵像素点同色贯穿，待交互=黄/金条（该你了），
 *    完成=亮绿 #00ff88 条（官方与空闲同用 done 态，插件扫描屏幕阅读器
 *    标签精确区分），空闲=静默退场；:has() 反选整行，官方 hover/选中底色正交叠加
 *
 * 形态：lazy-CJS factory bundle（window.__ModuleLoader__.load）。
 * 手写、零构建步骤；只 require 引导基线里必有的外部模块。
 *
 * 机制：
 *  - ctx.theme.overrideTokens() 在深色基底上叠完整 --dsw-alias-* /
 *    --dsw-specific-* 令牌覆写（89/89 全覆盖），主题切换 = 换表重叠（同源替换）；
 *  - 开启时固定外观偏好为 dark（内建可持久化偏好，重启不被 settings adopt 冲掉）；
 *  - 特效层（扫描线 / 辉光 / ticker / HUD / 滚动带）随主题整体热替换；
 *  - 主题选择持久化在 localStorage，设置 → 通用 里切换；
 *  - 状态自愈：层被摘掉补回（哨兵令牌防自激），基底被切走自动断开。
 */
window.__ModuleLoader__.load({
  id: "dsh-v-theme",
  factory: (require) => {
    "use strict";
    const module = { exports: {} };
    const exports = module.exports;

    const { jsx, jsxs } = require("react/jsx-runtime");
    const { defineStore } = require("@deepseek-ai/dsh-client-runtime/client");

    /* ------------------------------------------------------------------ *
     * 常量
     * ------------------------------------------------------------------ */

    const PLUGIN_ID = "dsh-v-theme";
    const THEME_SOURCE = PLUGIN_ID;
    /** localStorage：总开关。 */
    const FLAG_KEY = "dsh-v-theme:enabled";
    /** localStorage：主题选择。 */
    const THEME_KEY = "dsh-v-theme:theme";
    /** localStorage：边缘辉光开关（地平线/顶部径向辉光）。 */
    const GLOW_KEY = "dsh-v-theme:glow";
    /** localStorage：开启前的内建外观偏好。 */
    const PREV_KEY = "dsh-v-theme:prev-preference";
    /** 开启期间挂在 body 上的特效类（所有主题共用）。 */
    const BODY_CLASS = "v-cyber";
    /** 辉光生效时额外挂在 body 上的类。 */
    const GLOW_CLASS = "v-glow";
    /** 哨兵令牌：layer 是否存活以此为准。 */
    const SENTINEL = "--v-cyber-on";
    /** 设置行文案的 locale 命名空间。 */
    const SETTINGS_NS = "settings.v-cyber";
    /** 默认主题。 */
    const DEFAULT_THEME = "neon";
    /** 旧主题 id → 新 id 迁移映射（boot 时读原始存值，命中即回写）。 */
    const THEME_MIGRATION = { synthwave: "neon", fusion: "tactical" };
    /** 完成态标记属性：扫描器挂在会话行上，CSS 依此点亮亮绿框体。 */
    const DONE_ATTR = "data-v-completed";
    /** 完成态屏幕阅读器标签匹配集（workspace 词典 zh/en 内置，运行时再补充其他语言）。 */
    const COMPLETED_LABELS = ["已完成", "Completed"];
    /** 空闲态屏幕阅读器标签匹配集（用于显式摘标记，防跨语言误判）。 */
    const IDLE_LABELS = ["空闲", "Idle"];

    /* ------------------------------------------------------------------ *
     * 主题注册表
     * ------------------------------------------------------------------ */

    /**
     * 赛博霓虹特效层（仅主题开启时挂载；body.v-cyber 作用域）。
     * 霓虹粉 / 电光蓝 / 紫罗兰；底部地平线辉光是本主题的签名。
     */
    const FX_NEON = `/* dsh-v-theme: 赛博霓虹特效层 */
body.${BODY_CLASS}{
  --dsh-scrollbar-thumb:#453B7A;
  --dsh-scrollbar-thumb-hover:#FF2E97;
  --dsw-shadow-lv1:0 0 1px #FF2E9759;
  --dsw-shadow-lv1-blur:0 0 10px #FF2E9714;
  --dsw-shadow-lv2:0 0 1px #4DA8FF4D,0 4px 20px #4DA8FF1A;
  --dsw-shadow-lv3:0 0 1px #FF2E9773,0 16px 40px #0A0A0Ce6,0 0 32px #FF2E9726;
  --shiki-token-constant:#4DA8FF;
  --shiki-token-string:#FF5CB0;
  --shiki-token-comment:#7E6F84;
  --shiki-token-keyword:#FF2E97;
  --shiki-token-parameter:#FFC857;
  --shiki-token-function:#4DA8FF;
  --shiki-token-string-expression:#FF8FC2;
  --shiki-token-punctuation:#BCA8BC;
  --shiki-token-link:#4DA8FF;
}
/* 全屏扫描线覆膜 / ASCII ticker 已移除（清晰度优先）；辉光受 vGlow 开关控制 */
body.${BODY_CLASS}.v-glow::after{
  content:"";
  position:fixed;
  left:0;
  right:0;
  bottom:0;
  height:32vh;
  z-index:2147482999;
  pointer-events:none;
  background:linear-gradient(0deg,rgba(255,46,151,.16) 0%,rgba(77,168,255,.08) 38%,rgba(77,168,255,.04) 62%,transparent 100%);
}
body.${BODY_CLASS} ::selection{background:#FF2E9759;color:#FFF0F8;text-shadow:none}
body.${BODY_CLASS} :is(textarea,input,[contenteditable=true]){caret-color:#FF2E97}
body.${BODY_CLASS} *:focus-visible{outline:1px solid #FF2E97;outline-offset:1px;box-shadow:0 0 10px #FF2E9766}
body.${BODY_CLASS} a{color:#4DA8FF;text-shadow:0 0 10px #4DA8FF40}
body.${BODY_CLASS} pre{box-shadow:inset 2px 0 0 #FF2E9740}
body.${BODY_CLASS} :is(h1,h2,h3){animation:vFlicker 9s steps(1) infinite}
@keyframes vFlicker{0%,100%{opacity:1}3%{opacity:.86}4%{opacity:1}47%{opacity:1}48%{opacity:.92}49%{opacity:1}}
.v-hud{position:fixed;left:16px;bottom:30px;z-index:2147482995;pointer-events:none;font-family:var(--ds-font-family-code);font-size:10px;line-height:1.7;letter-spacing:1.5px;color:#4DA8FF;opacity:.42;text-shadow:0 0 8px #4DA8FF33}
.v-hud .v-hudBrand{color:#FF2E97;opacity:.95;text-shadow:0 0 8px #FF2E9755}
.v-hud .v-hudDim{opacity:.55}
/* CRT 滚动亮带已移除（清晰度优先） */
/* ═══ Neon 深度造型：圆润 · 渐变描边 · 霓虹氛围光 ═══ */

/* P0 · 用户气泡：粉→紫渐变描边（双层 background 技巧）+ 氛围光 */
body.${BODY_CLASS} [data-chat-flow-kind="user"] [class*="bubble"]{
  border:1px solid transparent;
  border-radius:16px;
  background:
    linear-gradient(var(--dsw-specific-bubble),var(--dsw-specific-bubble)) padding-box,
    linear-gradient(135deg,#FF2E97,#4DA8FF) border-box;
  box-shadow:0 0 20px rgba(255,46,151,.14);
}

/* P0 · 助手消息：左缘粉蓝内嵌线 */
body.${BODY_CLASS} [data-chat-flow-kind="assistant"]{
  box-shadow:inset 2px 0 0 #4DA8FF33;
  padding-left:10px;
}

/* P0 · 工具卡：玻璃底 + 渐变辉光描边；运行 = 粉蓝 / 结果 = 粉 / 出错 = 品红红 */
body.${BODY_CLASS} [data-chat-flow-kind="tool-call"] [class*="callRow"],
body.${BODY_CLASS} [data-chat-flow-kind="tool-call"] > div > div{
  position:relative;
  backdrop-filter:blur(6px);
  -webkit-backdrop-filter:blur(6px);
  border:1px solid transparent;
  border-radius:12px;
  background:
    linear-gradient(rgba(21,21,23,.72),rgba(21,21,23,.72)) padding-box,
    linear-gradient(135deg,#4DA8FF59,#FF2E9740) border-box;
  box-shadow:0 0 16px rgba(77,168,255,.10);
}
body.${BODY_CLASS} [data-chat-flow-kind="tool-result"] [class*="callRow"],
body.${BODY_CLASS} [data-chat-flow-kind="tool-result"] > div > div{
  background:
    linear-gradient(rgba(21,21,23,.72),rgba(21,21,23,.72)) padding-box,
    linear-gradient(135deg,#FF5CB059,#4DA8FF40) border-box;
}
body.${BODY_CLASS} [data-chat-flow-kind="tool-result"][data-error] [class*="callRow"],
body.${BODY_CLASS} [data-chat-flow-kind="tool-result"][data-error] > div > div{
  background:
    linear-gradient(rgba(21,21,23,.72),rgba(21,21,23,.72)) padding-box,
    linear-gradient(135deg,#FF3B5C73,#FF2E9740) border-box;
  box-shadow:0 0 16px rgba(255,59,92,.16);
}

/* P0 · Composer 卡片：粉→粉蓝渐变描边 + 聚焦氛围光 + 内部粉色径向光 */
body.${BODY_CLASS} [data-composer-card]{
  border:1px solid transparent;
  background:
    radial-gradient(ellipse at top,rgba(255,46,151,.08),transparent 70%),
    linear-gradient(var(--dsw-specific-input-major),var(--dsw-specific-input-major)) padding-box,
    linear-gradient(135deg,#FF2E9740,#4DA8FF40) border-box;
  box-shadow:0 0 18px rgba(255,46,151,.10);
  transition:box-shadow .25s;
}
body.${BODY_CLASS} [data-composer-card]:focus-within{
  box-shadow:0 0 28px rgba(255,46,151,.24);
}

/* P0 · 代码块：左缘霓虹粉强化（底色走原生） */
body.${BODY_CLASS} pre{
  border:1px solid #FF2E9726;
  box-shadow:inset 3px 0 0 #FF2E9766;
}

/* P0 · 会话运行状态条 → 粉蓝通道 card（去官方渐变文字底图，四通道同色贯穿） */
body.${BODY_CLASS} [class*="turnStatus"]{
  background:transparent;
  color:#4DA8FF;
  -webkit-text-fill-color:#4DA8FF;
  text-shadow:0 0 10px rgba(77,168,255,.45);
  border:1px solid #4DA8FF40;
  border-radius:10px;
  box-shadow:0 0 12px rgba(77,168,255,.12);
  padding:2px 10px;
}

/* P1 · 引用 chip：粉蓝渐变胶囊 */
body.${BODY_CLASS} [data-ref-chip]{
  border:1px solid transparent;
  border-radius:999px;
  background:
    linear-gradient(rgba(42,26,42,.6),rgba(42,26,42,.6)) padding-box,
    linear-gradient(135deg,#FF2E9759,#4DA8FF59) border-box;
}

/* P1 · 错误节点：由四色通道阵列的艳粉红通道接管（见下方通道 4） */

/* P1 · compaction 标记：金色左缘 */
body.${BODY_CLASS} [data-chat-flow-kind="compaction"]{
  box-shadow:inset 3px 0 0 #FFC857;
  padding-left:8px;
}

/* P2 · 流式/思考中：顶部粉→紫扫光 */
body.${BODY_CLASS} [data-streaming]{
  position:relative;
}
body.${BODY_CLASS} [data-streaming]::before{
  content:"";
  position:absolute;
  top:0;left:0;right:0;
  height:2px;
  background:linear-gradient(90deg,transparent,#FF2E97,#4DA8FF,transparent);
  animation:vScan 3s linear infinite;
  pointer-events:none;
}
@keyframes vScan{
  0%{transform:scaleX(0);transform-origin:left}
  50%{transform:scaleX(1);transform-origin:left}
  51%{transform:scaleX(1);transform-origin:right}
  100%{transform:scaleX(0);transform-origin:right}
}

/* P2 · 审批面板：粉顶边圆角 */
body.${BODY_CLASS} [data-approval-scroll]{
  border:1px solid #4DA8FF33;
  border-top:3px solid #FF2E97;
  border-radius:12px;
}

/* ═══ 会话行状态框体：官方 StateDot [data-state] 信号 → 左缘条 + 极淡同色底 ═══
   ongoing=进行中（矩阵像素动画为官方自带彩蛋）/ warning=待你交互 / done=完成即退场（无框）。
   底色走 background-image：官方 hover/选中/菜单打开的 background 底色照常生效（正交叠加）；
   浏览器不支持 :has() 时整组选择器自动失效（无框退化，不破坏任何东西）。 */
body.${BODY_CLASS} [class*="sessionRow"]:has([data-state="ongoing"]){
  box-shadow:inset 3px 0 0 #4DA8FF;
  background-image:linear-gradient(rgba(77,168,255,.06),rgba(77,168,255,.06));
}
body.${BODY_CLASS} [class*="sessionRow"]:has([data-state="warning"]){
  box-shadow:inset 3px 0 0 #FFC857;
  background-image:linear-gradient(rgba(255,200,87,.06),rgba(255,200,87,.06));
}
/* 进行中的矩阵像素点换成粉蓝通道色（官方该点着色走 --dsh-state-ongoing） */
body.${BODY_CLASS} [data-state="ongoing"]{--dsh-state-ongoing:#4DA8FF}
/* 完成（区别于空闲静默）：亮绿 #00FF88（FUI 绿 · 成功语义）。
   官方把完成与空闲都渲染成 data-state="done"，由标签扫描挂 data-v-completed 精确区分 */
body.${BODY_CLASS} [class*="sessionRow"][data-v-completed]{
  box-shadow:inset 3px 0 0 #00FF88;
  background-image:linear-gradient(rgba(0,255,136,.06),rgba(0,255,136,.06));
}
/* 完成行的官方状态点同步亮绿通道（空闲行保持官方成功色，静默退场） */
body.${BODY_CLASS} [class*="sessionRow"][data-v-completed] [data-state="done"]{color:#00FF88}

/* ═══ 四色通道阵列（参照稿 stat-row 手法：边框/辉光/文字/文字辉光同色贯穿） ═══
   todo=暖粉 #FF5CB0 / 队列=粉蓝 #4DA8FF / 审批=金 #FFC857 / 错误=艳粉红 #FF3B5C */

/* 通道 1 · Todo 面板：暖粉 */
body.${BODY_CLASS} [data-testid="todo-panel"]{
  border:1px solid #FF5CB040;
  border-radius:10px;
  box-shadow:0 0 15px rgba(255,92,176,.10);
  background:rgba(21,21,23,.72);
}
body.${BODY_CLASS} [data-testid="todo-panel"] :is(h1,h2,h3,h4,strong,[class*="title"]){
  color:#FF5CB0;
  text-shadow:0 0 12px rgba(255,92,176,.4);
}
body.${BODY_CLASS} [data-testid="todo-panel"] [class*="check"],body.${BODY_CLASS} [data-testid="todo-panel"] [class*="done"]{
  color:#FF5CB0;
  filter:drop-shadow(0 0 4px rgba(255,92,176,.5));
}

/* 通道 2 · 队列 dock：粉蓝 */
body.${BODY_CLASS} [data-queue-dock]{
  border:1px solid #4DA8FF40;
  border-radius:10px;
  box-shadow:0 0 15px rgba(77,168,255,.10);
}
body.${BODY_CLASS} [data-queue-dock] > [class*="panel"]{
  background:rgba(21,21,23,.72);
  border:1px solid #4DA8FF40;
  border-radius:10px;
}
body.${BODY_CLASS} [data-queue-dock] :is(strong,[class*="title"]){
  color:#4DA8FF;
  text-shadow:0 0 12px rgba(77,168,255,.4);
}

/* 通道 3 · 审批面板：金 */
body.${BODY_CLASS} [data-approval-scroll]{
  border:1px solid #FFC85740;
  border-top:3px solid #FFC857;
  border-radius:10px;
  box-shadow:0 0 15px rgba(255,200,87,.10);
}
body.${BODY_CLASS} [data-approval-key] > [class*="card"]{
  background:rgba(21,21,23,.72);
  border:1px solid #FFC85740;
  border-radius:10px;
  box-shadow:0 0 15px rgba(255,200,87,.10);
}
body.${BODY_CLASS} [data-approval-key] :is(h1,h2,h3,h4,strong){
  color:#FFC857;
  text-shadow:0 0 12px rgba(255,200,87,.4);
}

/* 通道 4 · 错误节点：艳粉红 */
body.${BODY_CLASS} [data-chat-flow-kind="error"]{
  border-left:3px solid #FF3B5C;
  background:rgba(255,59,92,.07);
}
body.${BODY_CLASS} [data-chat-flow-kind="error"] [class*="turnErrorTitle"],
body.${BODY_CLASS} [data-chat-flow-kind="error"] [class*="turnErrorCopy"]{
  background:rgba(255,59,92,.14);
  color:#FF8FA3;
  border-radius:3px;
  padding:1px 6px;
  text-shadow:0 0 8px rgba(255,59,92,.35);
}

@media (prefers-reduced-motion:reduce){
  .vOn .vState::after{animation:none}
  body.${BODY_CLASS} :is(h1,h2,h3){animation:none}
  body.${BODY_CLASS} [data-streaming]::before{animation:none}
}`;

    /**
     * 战术面板特效层：SOC 基底 + FUI 强调。
     * 顶部青色径向辉光（参照稿 Hero），青色系扫描线与辉光。
     */
    const FX_TACTICAL = `/* dsh-v-theme: 战术面板特效层 */
body.${BODY_CLASS}{
  --dsh-scrollbar-thumb:#2E3848;
  --dsh-scrollbar-thumb-hover:#56D4E0;
  --dsw-shadow-lv1:0 0 1px #56D4E040;
  --dsw-shadow-lv1-blur:0 0 8px #56D4E014;
  --dsw-shadow-lv2:0 0 1px #56D4E033,0 4px 16px #00000066;
  --dsw-shadow-lv3:0 0 1px #56D4E059,0 12px 32px #000000cc,0 0 24px #56D4E014;
  --shiki-token-constant:#00D4FF;
  --shiki-token-string:#5DDB72;
  --shiki-token-comment:#6B7686;
  --shiki-token-keyword:#FF7B72;
  --shiki-token-parameter:#F0C239;
  --shiki-token-function:#56D4E0;
  --shiki-token-string-expression:#5DDB72;
  --shiki-token-punctuation:#A8B2C1;
  --shiki-token-link:#00D4FF;
}
/* 全屏扫描线覆膜 / ASCII ticker 已移除（清晰度优先）；顶部辉光受 vGlow 开关控制 */
body.${BODY_CLASS}.v-glow::after{
  content:"";
  position:fixed;
  left:0;
  right:0;
  top:0;
  height:36vh;
  z-index:2147482999;
  pointer-events:none;
  background:radial-gradient(ellipse at top,rgba(86,212,224,.07),transparent 65%);
}
body.${BODY_CLASS} ::selection{background:#56D4E059;color:#EAFCFF;text-shadow:none}
body.${BODY_CLASS} :is(textarea,input,[contenteditable=true]){caret-color:#56D4E0}
body.${BODY_CLASS} *:focus-visible{outline:1px solid #56D4E0;outline-offset:1px;box-shadow:0 0 10px #56D4E066}
body.${BODY_CLASS} a{color:#00D4FF;text-shadow:0 0 8px #00D4FF33}
body.${BODY_CLASS} pre{box-shadow:inset 2px 0 0 #56D4E040}
body.${BODY_CLASS} :is(h1,h2,h3){animation:vFlicker 11s steps(1) infinite}
@keyframes vFlicker{0%,100%{opacity:1}3%{opacity:.86}4%{opacity:1}47%{opacity:1}48%{opacity:.92}49%{opacity:1}}
.v-hud{position:fixed;left:16px;bottom:30px;z-index:2147482995;pointer-events:none;font-family:var(--ds-font-family-code);font-size:10px;line-height:1.7;letter-spacing:1.5px;color:#56D4E0;opacity:.44;text-shadow:0 0 8px #56D4E033}
.v-hud .v-hudBrand{color:#00FF88;opacity:.95;text-shadow:0 0 8px #00FF8855}
.v-hud .v-hudDim{opacity:.55}
/* CRT 滚动亮带已移除（清晰度优先） */
/* ═══ Tactical 深度造型：SOC 克制 + FUI 点睛（切角 / HUD 角标 / DEFCON 状态） ═══ */

/* P0 · 用户气泡：FUI 切角 + 实线战术边 + 渐变顶边（徽章式青→青蓝）+ drop-shadow 辉光
   （clip-path 会裁掉 box-shadow，用 filter:drop-shadow 跟随切角形状） */
body.${BODY_CLASS} [data-chat-flow-kind="user"] [class*="bubble"]{
  clip-path:polygon(0 0,calc(100% - 14px) 0,100% 14px,100% 100%,14px 100%,0 calc(100% - 14px));
  border:1px solid #2E3848;
  border-radius:4px;
  background:var(--dsw-specific-bubble);
  filter:drop-shadow(0 0 12px rgba(86,212,224,.14));
  padding:10px 16px;
  position:relative;
}
/* 渐变顶边：border-top 无法用渐变，用内嵌伪元素画（参照稿徽章配方） */
body.${BODY_CLASS} [data-chat-flow-kind="user"] [class*="bubble"]::before{
  content:"";
  position:absolute;
  top:0;left:0;right:0;
  height:3px;
  background:linear-gradient(90deg,#56D4E0,#00D4FF);
  opacity:.9;
  pointer-events:none;
}

/* P0 · 助手消息：左缘战术分区线 */
body.${BODY_CLASS} [data-chat-flow-kind="assistant"]{
  box-shadow:inset 2px 0 0 #2E3848;
  padding-left:10px;
}

/* P0 · 工具卡：参照稿 .panel 配方（半透明 + blur）+ 渐变 DEFCON 状态顶边 + neon-pulse
   伪元素分工：卡片 ::before = 渐变顶边；外层 flowItem ::after = HUD 角标（::before 留给流式扫描线）
   运行中 = 青→青蓝 / 结果 = 绿→青 / 出错 = 赤红→品红（参照稿多色顶边编码完整版） */
body.${BODY_CLASS} [data-chat-flow-kind="tool-call"] [class*="callRow"],
body.${BODY_CLASS} [data-chat-flow-kind="tool-call"] > div > div,
body.${BODY_CLASS} [data-chat-flow-kind="tool-result"] [class*="callRow"],
body.${BODY_CLASS} [data-chat-flow-kind="tool-result"] > div > div{
  position:relative;
  background:rgba(21,21,23,.85);
  backdrop-filter:blur(8px);
  -webkit-backdrop-filter:blur(8px);
  border:1px solid #2E3848;
  border-radius:2px;
  overflow:hidden;
  transition:box-shadow .25s;
}
body.${BODY_CLASS} [data-chat-flow-kind="tool-call"] [class*="callRow"]::before,
body.${BODY_CLASS} [data-chat-flow-kind="tool-call"] > div > div::before{
  content:"";
  position:absolute;
  top:0;left:0;right:0;
  height:3px;
  background:linear-gradient(90deg,#56D4E0,#00D4FF);
  pointer-events:none;
  z-index:1;
}
body.${BODY_CLASS} [data-chat-flow-kind="tool-result"] [class*="callRow"]::before,
body.${BODY_CLASS} [data-chat-flow-kind="tool-result"] > div > div::before{
  content:"";
  position:absolute;
  top:0;left:0;right:0;
  height:3px;
  background:linear-gradient(90deg,#5DDB72,#56D4E0);
  pointer-events:none;
  z-index:1;
}
body.${BODY_CLASS} [data-chat-flow-kind="tool-result"][data-error] [class*="callRow"]::before,
body.${BODY_CLASS} [data-chat-flow-kind="tool-result"][data-error] > div > div::before{
  background:linear-gradient(90deg,#FF3366,#FF00FF);
}
/* neon-pulse hover（参照稿配方：hover 辉光增强） */
body.${BODY_CLASS} [data-chat-flow-kind="tool-call"] [class*="callRow"]:hover,
body.${BODY_CLASS} [data-chat-flow-kind="tool-call"] > div > div:hover{
  box-shadow:0 0 25px rgba(86,212,224,.18);
}
body.${BODY_CLASS} [data-chat-flow-kind="tool-result"] [class*="callRow"]:hover,
body.${BODY_CLASS} [data-chat-flow-kind="tool-result"] > div > div:hover{
  box-shadow:0 0 25px rgba(93,219,114,.15);
}
/* HUD L 型角标：挂在外层 flowItem 的 ::after（左上/右下角线，参照稿 .hud-corner 缩版） */
body.${BODY_CLASS} [data-chat-flow-kind="tool-call"]::after,
body.${BODY_CLASS} [data-chat-flow-kind="tool-result"]::after{
  content:"";
  position:absolute;
  top:0;
  left:0;
  width:11px;
  height:11px;
  border-top:2px solid #56D4E0;
  border-left:2px solid #56D4E0;
  opacity:.6;
  pointer-events:none;
  z-index:1;
}
body.${BODY_CLASS} [data-chat-flow-kind="tool-result"]::after{
  border-top-color:#5DDB72;
  border-left-color:#5DDB72;
}
/* flowItem 需要定位上下文给角标 */
body.${BODY_CLASS} [data-chat-flow-kind="tool-call"],
body.${BODY_CLASS} [data-chat-flow-kind="tool-result"]{
  position:relative;
}

/* P0 · Composer 卡片：切角 + 顶部 hero 径向辉光（参照稿 Hero 配方）+ 聚焦态 */
body.${BODY_CLASS} [data-composer-card]{
  clip-path:polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,16px 100%,0 calc(100% - 16px));
  border:1px solid #2E3848;
  border-radius:2px;
  background:
    radial-gradient(ellipse at top,rgba(86,212,224,.10),transparent 70%),
    var(--dsw-specific-input-major);
  box-shadow:0 0 18px rgba(86,212,224,.08);
  transition:box-shadow .2s;
}
body.${BODY_CLASS} [data-composer-card]:focus-within{
  box-shadow:0 0 26px rgba(86,212,224,.22);
}

/* P0 · 代码块：banner 深一档 + 左缘青线强化 */
body.${BODY_CLASS} pre{
  border:1px solid #232C39;
  box-shadow:inset 3px 0 0 #56D4E059;
}

/* P0 · 会话运行状态条 → 青蓝通道 card（去官方渐变文字底图，四通道同色贯穿） */
body.${BODY_CLASS} [class*="turnStatus"]{
  background:transparent;
  color:#00D4FF;
  -webkit-text-fill-color:#00D4FF;
  text-shadow:0 0 10px rgba(0,212,255,.45);
  border:1px solid #00D4FF40;
  border-radius:3px;
  box-shadow:0 0 12px rgba(0,212,255,.12);
  padding:2px 10px;
}

/* P1 · 引用 chip：实线青边胶囊 + 发光状态点 */
body.${BODY_CLASS} [data-ref-chip]{
  border:1px solid #56D4E059;
  border-radius:4px;
  box-shadow:0 0 8px rgba(86,212,224,.12);
}

/* P1 · 错误节点：由四色通道阵列的品红通道接管（见下方通道 4） */
@keyframes vGlitch{
  0%,92%,100%{transform:none;text-shadow:none}
  93%{transform:translateX(-1px);text-shadow:-1px 0 rgba(86,212,224,.5)}
  94%{transform:translateX(1px);text-shadow:1px 0 rgba(255,0,255,.5)}
  95%{transform:none}
}

/* P1 · compaction 标记：黄色 DEFCON 条 */
body.${BODY_CLASS} [data-chat-flow-kind="compaction"]{
  box-shadow:inset 3px 0 0 #F0C239;
  padding-left:8px;
}

/* P2 · 流式/思考中：顶部青色扫描线（参照稿 hero::before 配方） */
body.${BODY_CLASS} [data-streaming]{
  position:relative;
}
body.${BODY_CLASS} [data-streaming]::before{
  content:"";
  position:absolute;
  top:0;left:0;right:0;
  height:2px;
  background:linear-gradient(90deg,transparent,#56D4E0,transparent);
  animation:vScan 3s linear infinite;
  pointer-events:none;
}
@keyframes vScan{
  0%{transform:scaleX(0);transform-origin:left}
  50%{transform:scaleX(1);transform-origin:left}
  51%{transform:scaleX(1);transform-origin:right}
  100%{transform:scaleX(0);transform-origin:right}
}

/* P2 · 审批面板：切角 + 青顶边 */
body.${BODY_CLASS} [data-approval-scroll]{
  border:1px solid #2E3848;
  border-top:3px solid #F0C239;
  border-radius:2px;
}

/* ═══ 会话行状态框体：官方 StateDot [data-state] 信号 → 左缘条 + 极淡同色底 ═══
   ongoing=进行中（矩阵像素动画为官方自带彩蛋）/ warning=待你交互 / done=完成即退场（无框）。
   底色走 background-image：官方 hover/选中/菜单打开的 background 底色照常生效（正交叠加）；
   浏览器不支持 :has() 时整组选择器自动失效（无框退化，不破坏任何东西）。 */
body.${BODY_CLASS} [class*="sessionRow"]:has([data-state="ongoing"]){
  box-shadow:inset 3px 0 0 #56D4E0;
  background-image:linear-gradient(rgba(86,212,224,.05),rgba(86,212,224,.05));
}
body.${BODY_CLASS} [class*="sessionRow"]:has([data-state="warning"]){
  box-shadow:inset 3px 0 0 #F0C239;
  background-image:linear-gradient(rgba(240,194,57,.06),rgba(240,194,57,.06));
}
/* 进行中的矩阵像素点换成 SOC 青通道色（官方该点着色走 --dsh-state-ongoing） */
body.${BODY_CLASS} [data-state="ongoing"]{--dsh-state-ongoing:#56D4E0}
/* 完成（区别于空闲静默）：亮绿 #00FF88（FUI 绿 · 成功语义）。
   官方把完成与空闲都渲染成 data-state="done"，由标签扫描挂 data-v-completed 精确区分 */
body.${BODY_CLASS} [class*="sessionRow"][data-v-completed]{
  box-shadow:inset 3px 0 0 #00FF88;
  background-image:linear-gradient(rgba(0,255,136,.05),rgba(0,255,136,.05));
}
/* 完成行的官方状态点同步亮绿通道（空闲行保持官方成功色，静默退场） */
body.${BODY_CLASS} [class*="sessionRow"][data-v-completed] [data-state="done"]{color:#00FF88}

/* ═══ 参照稿精美细节移植 ═══ */

/* 六边形状态点：引用 chip 前置 8px 六边形（clip-path + 同色辉光，参照稿 .dot-hex） */
body.${BODY_CLASS} [data-ref-chip]{
  border:1px solid #56D4E059;
  border-radius:4px;
  box-shadow:0 0 8px rgba(86,212,224,.12);
  position:relative;
  padding-left:20px;
}
body.${BODY_CLASS} [data-ref-chip]::after{
  content:"";
  position:absolute;
  left:8px;
  top:50%;
  margin-top:-4px;
  width:8px;
  height:8px;
  clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);
  background:#56D4E0;
  box-shadow:0 0 6px #56D4E0;
  pointer-events:none;
}

/* 错误节点的 CRIT 胶囊由四色通道阵列的品红通道接管 */

/* compaction：sev-MEDIUM 黄胶囊气质（黄 15% 底） */
body.${BODY_CLASS} [data-chat-flow-kind="compaction"]{
  background:rgba(240,194,57,.07);
  border-radius:3px;
}

/* Thinking 正文：提亮一档（tertiary→secondary），官方运行中的行扫光动画保留 */
body.${BODY_CLASS} [data-variant="think"] [class*="thinkBody"]{
  color:#A8B2C1;
}
body.${BODY_CLASS} [data-variant="think"] [class*="summary"]{
  color:#8FA0B4;
}

/* Markdown 数据表：hover 行高亮（参照稿 .data-table tr:hover 同款 surface2） */
body.${BODY_CLASS} [data-conversation-scroll] tr:hover{
  background:var(--dsw-alias-bg-layer-2);
}
/* 表头：SOC 卡片标题气质（次文色 + 上下细线） */
body.${BODY_CLASS} [data-conversation-scroll] th{
  color:var(--dsw-alias-label-secondary);
  font-family:var(--ds-font-family-code);
}

/* 行内 code：sev 胶囊风（青 15% 底 + 青字，参照稿 sev-HIGH 配方换色） */
body.${BODY_CLASS} [data-conversation-scroll] :not(pre) > code{
  background:rgba(86,212,224,.14);
  color:#7EE3EC;
  border-radius:3px;
  padding:.1em .35em;
}

/* HUD 信号条分级色（DEFCON 色阶映射：WEAK=黄 / READABLE=青 / STRONG=青蓝 / CLEAR=绿） */
.v-hud .v-hudSig[data-lv="weak"]{color:#F0C239}
.v-hud .v-hudSig[data-lv="readable"]{color:#56D4E0}
.v-hud .v-hudSig[data-lv="strong"]{color:#00D4FF}
.v-hud .v-hudSig[data-lv="clear"]{color:#5DDB72}

/* ═══ 四色通道阵列（参照稿 stat-row 手法：边框/辉光/文字/文字辉光同色贯穿） ═══
   todo=绿 #00FF88 / 队列=青蓝 #00D4FF / 审批=黄 #F0C239 / 错误=品红 #FF00FF */

/* 通道 1 · Todo 面板：绿 */
body.${BODY_CLASS} [data-testid="todo-panel"]{
  border:1px solid #00FF8840;
  border-radius:3px;
  box-shadow:0 0 15px rgba(0,255,136,.10);
  background:rgba(21,21,23,.85);
}
body.${BODY_CLASS} [data-testid="todo-panel"] :is(h1,h2,h3,h4,strong,[class*="title"]){
  color:#00FF88;
  text-shadow:0 0 12px rgba(0,255,136,.4);
}
body.${BODY_CLASS} [data-testid="todo-panel"] [class*="check"],body.${BODY_CLASS} [data-testid="todo-panel"] [class*="done"]{
  color:#00FF88;
  filter:drop-shadow(0 0 4px rgba(0,255,136,.5));
}

/* 通道 2 · 队列 dock：青蓝 */
body.${BODY_CLASS} [data-queue-dock]{
  border:1px solid #00D4FF40;
  border-radius:3px;
  box-shadow:0 0 15px rgba(0,212,255,.10);
}
body.${BODY_CLASS} [data-queue-dock] > [class*="panel"]{
  background:rgba(21,21,23,.85);
  border:1px solid #00D4FF40;
  border-radius:3px;
}
body.${BODY_CLASS} [data-queue-dock] :is(strong,[class*="title"]){
  color:#00D4FF;
  text-shadow:0 0 12px rgba(0,212,255,.4);
}

/* 通道 3 · 审批面板：黄 */
body.${BODY_CLASS} [data-approval-scroll]{
  border:1px solid #F0C23940;
  border-top:3px solid #F0C239;
  border-radius:2px;
  box-shadow:0 0 15px rgba(240,194,57,.10);
}
body.${BODY_CLASS} [data-approval-key] > [class*="card"]{
  background:rgba(21,21,23,.85);
  border:1px solid #F0C23940;
  border-radius:3px;
  box-shadow:0 0 15px rgba(240,194,57,.10);
}
body.${BODY_CLASS} [data-approval-key] :is(h1,h2,h3,h4,strong){
  color:#F0C239;
  text-shadow:0 0 12px rgba(240,194,57,.4);
}

/* 通道 4 · 错误节点：品红 */
body.${BODY_CLASS} [data-chat-flow-kind="error"]{
  border-left:3px solid #FF00FF;
  background:rgba(255,0,255,.05);
  animation:vGlitch 4s steps(1) infinite;
}
body.${BODY_CLASS} [data-chat-flow-kind="error"] [class*="turnErrorTitle"],
body.${BODY_CLASS} [data-chat-flow-kind="error"] [class*="turnErrorCopy"]{
  background:rgba(255,0,255,.14);
  color:#FF6EFF;
  border-radius:3px;
  padding:1px 6px;
  text-shadow:0 0 8px rgba(255,0,255,.35);
}

@media (prefers-reduced-motion:reduce){
  .vOn .vState::after{animation:none}
  body.${BODY_CLASS} :is(h1,h2,h3){animation:none}
  body.${BODY_CLASS} [data-chat-flow-kind="error"]{animation:none}
  body.${BODY_CLASS} [data-streaming]::before{animation:none}
}`;

    /** 赛博霓虹调色板：粉 / 粉蓝强调层（背景族全部走 DSH 原生配色）。 */
    const PALETTE_NEON = {
      /* 边框：粉调 alpha 线 */
      "--dsw-alias-border-inverted": "#FF2E971F",
      "--dsw-alias-border-inverted2": "#FF2E9733",
      "--dsw-alias-border-l1": "#FF2E9712",
      "--dsw-alias-border-l2": "#FF2E9724",
      "--dsw-alias-border-l2-darkmode-thin": "#FF2E9712",
      "--dsw-alias-border-l3": "#FF2E9733",
      "--dsw-alias-border-l4": "#FF2E9747",
      /* 品牌与主按钮：霓虹粉 */
      "--dsw-alias-brand-primary": "#FF2E97",
      "--dsw-alias-brand-primary-invert": "#2A0A1C",
      "--dsw-alias-brand-primary-new-colorprimary-new-color": "#FF2E97",
      "--dsw-alias-brand-text": "#FFE9F4",
      /* 按钮族（仅强调性按钮；表面类填充走原生） */
      "--dsw-alias-button-contrast-fill": "#FFE9F4",
      "--dsw-alias-button-ghost-active-border": "#4DA8FF59",
      "--dsw-alias-button-info-fill": "#4DA8FF",
      "--dsw-alias-button-info-hover": "#7FC2FF",
      "--dsw-alias-button-primary-fill": "#FF2E97",
      "--dsw-alias-button-primary-hover": "#FF5CB0",
      /* 交互底色（半透明强调；solid 表面走原生） */
      "--dsw-alias-interactive-bg-active": "#FF2E9733",
      "--dsw-alias-interactive-bg-hover": "#FF2E9714",
      "--dsw-alias-interactive-bg-hover-accent": "#FF2E9726",
      "--dsw-alias-interactive-bg-hover-danger": "#FF3B5C26",
      /* 文本层级：冷粉白 → 灰粉 */
      "--dsw-alias-label-primary": "#F2E4EE",
      "--dsw-alias-label-primary-bluish": "#4DA8FF",
      "--dsw-alias-label-primary-dimmed": "#DCC6DB",
      "--dsw-alias-label-primary-foreground": "#2A0A1C",
      "--dsw-alias-label-secondary": "#BCA8BC",
      "--dsw-alias-label-tertiary": "#95849A",
      "--dsw-alias-label-caption": "#7E6F84",
      /* 滚动条悬停（轨道走原生） */
      "--dsw-alias-scrollbar-hover-l1": "#FF2E97",
      "--dsw-alias-scrollbar-hover-l2": "#FF5CB0",
      /* 状态色 */
      "--dsw-alias-state-business-primary": "#4DA8FF",
      "--dsw-alias-state-error-primary": "#FF3B5C",
      "--dsw-alias-state-error-secondary": "#FF7A8F",
      "--dsw-alias-state-success-primary": "#FF5CB0",
      "--dsw-alias-state-success-secondary": "#FF8FC2",
      "--dsw-alias-state-warn-label": "#FFC857",
      "--dsw-alias-state-warn-primary": "#FFC857",
      "--dsw-alias-state-warn-secondary": "#FFDD8A",
      /* 侧栏激活强调条 */
      "--dsw-specific-sidebar-nav-item-active-accent": "#FF2E97",
      /* 字体：Space Grotesk / DM Sans 正文 + JetBrains Mono 代码 */
      "--dsw-font-family":
        '"Space Grotesk","DM Sans","IBM Plex Sans",-apple-system,"Segoe UI","PingFang SC","Hiragino Sans GB","Microsoft YaHei","Helvetica Neue",Helvetica,Arial,sans-serif',
      "--ds-font-family-code":
        '"JetBrains Mono","Fira Code","Cascadia Code","SF Mono",Consolas,"Liberation Mono",Menlo,"PingFang SC","Microsoft YaHei",monospace'
    };

    /** 战术面板调色板：SOC 青 / FUI 强调层（背景族全部走 DSH 原生配色）。 */
    const PALETTE_TACTICAL = {
      /* 边框：SOC 实线蓝灰（战术面板的精确感） */
      "--dsw-alias-border-inverted": "#56D4E01F",
      "--dsw-alias-border-inverted2": "#56D4E033",
      "--dsw-alias-border-l1": "#232C39",
      "--dsw-alias-border-l2": "#2E3848",
      "--dsw-alias-border-l2-darkmode-thin": "#232C39",
      "--dsw-alias-border-l3": "#3A465A",
      "--dsw-alias-border-l4": "#47546A",
      /* 品牌与主操作：SOC 青（9.5:1） */
      "--dsw-alias-brand-primary": "#56D4E0",
      "--dsw-alias-brand-primary-invert": "#06232A",
      "--dsw-alias-brand-primary-new-colorprimary-new-color": "#56D4E0",
      "--dsw-alias-brand-text": "#E8ECF1",
      /* 按钮族（仅强调性按钮；表面类填充走原生） */
      "--dsw-alias-button-contrast-fill": "#E8ECF1",
      "--dsw-alias-button-ghost-active-border": "#3A465A",
      "--dsw-alias-button-info-fill": "#00B8D9",
      "--dsw-alias-button-info-hover": "#00D4FF",
      "--dsw-alias-button-primary-fill": "#56D4E0",
      "--dsw-alias-button-primary-hover": "#7EE3EC",
      /* 交互底色：青色系（半透明强调；solid 表面走原生） */
      "--dsw-alias-interactive-bg-active": "#56D4E026",
      "--dsw-alias-interactive-bg-hover": "#56D4E014",
      "--dsw-alias-interactive-bg-hover-accent": "#56D4E01F",
      "--dsw-alias-interactive-bg-hover-danger": "#FF7B7226",
      /* 文本层级：AAA 对比度（14.3:1 / 7.3:1） */
      "--dsw-alias-label-primary": "#E8ECF1",
      "--dsw-alias-label-primary-bluish": "#56D4E0",
      "--dsw-alias-label-primary-dimmed": "#C3CCD8",
      "--dsw-alias-label-primary-foreground": "#06232A",
      "--dsw-alias-label-secondary": "#A8B2C1",
      "--dsw-alias-label-tertiary": "#7D8899",
      "--dsw-alias-label-caption": "#6B7686",
      /* 滚动条悬停（轨道走原生） */
      "--dsw-alias-scrollbar-hover-l1": "#56D4E0",
      "--dsw-alias-scrollbar-hover-l2": "#7EE3EC",
      /* 状态色：SOC 语义色（全部 ≥7:1） */
      "--dsw-alias-state-business-primary": "#00D4FF",
      "--dsw-alias-state-error-primary": "#FF7B72",
      "--dsw-alias-state-error-secondary": "#FFA39C",
      "--dsw-alias-state-success-primary": "#5DDB72",
      "--dsw-alias-state-success-secondary": "#8EE89E",
      "--dsw-alias-state-warn-label": "#F0C239",
      "--dsw-alias-state-warn-primary": "#F0C239",
      "--dsw-alias-state-warn-secondary": "#F6D66B",
      /* 侧栏激活强调条 */
      "--dsw-specific-sidebar-nav-item-active-accent": "#56D4E0",
      /* 字体：IBM Plex Sans 正文 + IBM Plex Mono / JetBrains Mono 代码 */
      "--dsw-font-family":
        '"IBM Plex Sans","Space Grotesk",-apple-system,"Segoe UI","PingFang SC","Hiragino Sans GB","Microsoft YaHei","Helvetica Neue",Helvetica,Arial,sans-serif',
      "--ds-font-family-code":
        '"IBM Plex Mono","JetBrains Mono","Fira Code","Cascadia Code","SF Mono",Consolas,"Liberation Mono",Menlo,"PingFang SC","Microsoft YaHei",monospace'
    };

    /** overrideTokens 校验要求 { light, dark } 成对；light 键填同值（本层只骑 dark 基底）。 */
    function buildTokens(palette) {
      const tokens = {};
      for (const name of Object.keys(palette)) {
        tokens[name] = { light: palette[name], dark: palette[name] };
      }
      tokens[SENTINEL] = { light: "1", dark: "1" };
      return tokens;
    }

    /**
     * 主题注册表。每个主题：显示名（locale key）、HUD 品牌行、ticker 品牌
     * 令牌、选中 chips 的示意色点、调色板与特效层。
     */
    const THEMES = {
      neon: {
        id: "neon",
        labelKey: "v.theme.neon",
        hudBrand: "█ V://NEON █",
        swatch: ["#FF2E97", "#FF5CB0", "#4DA8FF"],
        palette: PALETTE_NEON,
        fx: FX_NEON,
        tokens: buildTokens(PALETTE_NEON)
      },
      tactical: {
        id: "tactical",
        labelKey: "v.theme.tactical",
        hudBrand: "█ V://TACTICAL █",
        swatch: ["#56D4E0", "#00FF88", "#F0C239"],
        palette: PALETTE_TACTICAL,
        fx: FX_TACTICAL,
        tokens: buildTokens(PALETTE_TACTICAL)
      }
    };
    const THEME_LIST = [THEMES.neon, THEMES.tactical];

    /* ------------------------------------------------------------------ *
     * 设置行样式（随插件常驻，跟随当前别名令牌自适应明暗）
     * ------------------------------------------------------------------ */

    const ROW_CSS = `/* dsh-v-theme: 设置 → 通用 的开关行 + 主题选择 */
.vGroup{border-bottom:1px solid var(--dsw-alias-border-l2);flex-direction:column;gap:8px;padding:16px 0;display:flex}
.vTitle{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:400;line-height:22px}
.vCube{box-sizing:border-box;width:100%;border:1px solid var(--dsw-alias-border-l2);font:inherit;color:var(--dsw-alias-label-primary);cursor:pointer;background:var(--dsw-alias-bg-layer-1);border-radius:12px;align-items:center;gap:12px;padding:14px 16px;display:flex;text-align:left;transition:border-color .2s,box-shadow .2s,background .2s}
.vCube:hover{border-color:var(--dsw-alias-border-l4)}
.vCube.vOn{border-color:transparent;background:linear-gradient(var(--dsw-alias-bg-layer-1),var(--dsw-alias-bg-layer-1)) padding-box,linear-gradient(135deg,var(--dsw-alias-brand-primary),var(--dsw-alias-state-business-primary)) border-box;box-shadow:0 0 0 1px var(--dsw-alias-interactive-bg-hover-accent),0 0 18px var(--dsw-alias-interactive-bg-hover-accent)}
.vIcon{flex:none;width:20px;height:20px;color:var(--dsw-alias-label-secondary)}
.vOn .vIcon{color:var(--dsw-alias-brand-primary);filter:drop-shadow(0 0 6px var(--dsw-alias-brand-primary))}
.vTexts{flex:1;min-width:0;flex-direction:column;gap:2px;display:flex}
.vName{font-family:var(--ds-font-family-code);font-size:13px;letter-spacing:.08em}
.vState{font-family:var(--ds-font-family-code);font-size:11px;letter-spacing:.12em;color:var(--dsw-alias-label-tertiary)}
.vOn .vState{background:linear-gradient(90deg,var(--dsw-alias-brand-primary),var(--dsw-alias-state-business-primary));-webkit-background-clip:text;background-clip:text;color:transparent}
.vOn .vState::after{content:"▮";margin-left:6px;color:var(--dsw-alias-brand-primary);background:none;-webkit-background-clip:border-box;background-clip:border-box;animation:vBlink 1.1s steps(1) infinite}
@keyframes vBlink{50%{opacity:0}}
.vSwitch{flex:none;width:34px;height:20px;border-radius:999px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);position:relative}
.vSwitch::after{content:"";position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;background:var(--dsw-alias-label-tertiary);transition:transform .2s,background .2s,box-shadow .2s}
.vOn .vSwitch{border-color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-interactive-bg-hover-accent)}
.vOn .vSwitch::after{transform:translateX(14px);background:var(--dsw-alias-brand-primary);box-shadow:0 0 8px var(--dsw-alias-brand-primary)}
.vThemesLabel{font-size:11px;color:var(--dsw-alias-label-tertiary);letter-spacing:.08em}
.vThemeRow{display:flex;gap:8px}
.vChip{flex:1;display:inline-flex;align-items:center;gap:8px;padding:8px 10px;border:1px solid var(--dsw-alias-border-l2);border-radius:9px;background:var(--dsw-alias-bg-layer-1);font:inherit;font-size:12px;color:var(--dsw-alias-label-secondary);cursor:pointer;transition:border-color .2s,color .2s,box-shadow .2s}
.vChip:hover{border-color:var(--dsw-alias-border-l4);color:var(--dsw-alias-label-primary)}
.vChipOn{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-label-primary);box-shadow:0 0 8px var(--dsw-alias-interactive-bg-hover-accent)}
.vDots{display:inline-flex;gap:3px;flex:none}
.vDots i{width:8px;height:8px;border-radius:50%;display:block;box-shadow:0 0 4px currentColor}
.vDesc{font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary)}
.vGlowChip{width:auto;flex:none}
.vGlowDot{flex:none;width:8px;height:8px;border-radius:50%;background:var(--dsw-alias-label-tertiary);transition:background .2s,box-shadow .2s}
.vChipOn .vGlowDot{background:var(--dsw-alias-brand-primary);box-shadow:0 0 6px var(--dsw-alias-brand-primary)}
@media (prefers-reduced-motion:reduce){.vOn .vState::after{animation:none}}`;

    /* ------------------------------------------------------------------ *
     * 设置行文案（zh 为准，en 对齐键集）
     * ------------------------------------------------------------------ */

    const zh = {
      "v.nav": "皮肤",
      "v.title": "V CYBER",
      "v.state.on": "已接入 // ONLINE",
      "v.state.off": "未接入 // OFFLINE",
      "v.themeLabel": "风格 STYLE",
      "v.theme.neon": "赛博霓虹",
      "v.theme.tactical": "战术面板",
      "v.glowLabel": "氛围 AMBIENCE",
      "v.glow": "边缘辉光",
      "v.desc": "V 赛博主题：两套风格可切换——赛博霓虹（霓虹粉 × 电光蓝 × 地平线辉光）与战术面板（SOC 战术面板基底 + FUI 青色霓虹）。侧栏会话行随官方状态点亮框体：进行中=青/粉蓝、待交互=黄/金、完成=亮绿、空闲静默退场。开启期间固定深色基底；在「外观」里切走深色会自动断开。"
    };
    const en = {
      "v.nav": "Skin",
      "v.title": "V CYBER",
      "v.state.on": "ONLINE",
      "v.state.off": "OFFLINE",
      "v.themeLabel": "STYLE",
      "v.theme.neon": "NEON",
      "v.theme.tactical": "TACTICAL",
      "v.glowLabel": "AMBIENCE",
      "v.glow": "Edge glow",
      "v.desc": "V CYBER with two switchable styles — NEON (neon pink × electric blue × horizon glow) and TACTICAL (SOC dashboard base + FUI cyan neon). Session rows light up with the official status: ongoing = cyan / blue edge bar, waiting for you = gold / yellow, completed = bright green, idle = no frame. Pins the dark base palette while active."
    };

    /* ------------------------------------------------------------------ *
     * 设置行组件（开关 + 主题选择）
     * ------------------------------------------------------------------ */

    function TermIcon() {
      return jsxs("svg", {
        className: "vIcon",
        viewBox: "0 0 20 20",
        fill: "none",
        "aria-hidden": true,
        children: [
          jsx("rect", { x: "1.5", y: "2.5", width: "17", height: "15", rx: "2", stroke: "currentColor", strokeWidth: "1.4" }),
          jsx("path", { d: "M5 7l3.2 3L5 13", stroke: "currentColor", strokeWidth: "1.4", strokeLinecap: "round", strokeLinejoin: "round" }),
          jsx("path", { d: "M10 13h5", stroke: "currentColor", strokeWidth: "1.4", strokeLinecap: "round" })
        ]
      });
    }

    /**
     * 「皮肤」设置分页（settings.section 第一层导航项）：
     * 总开关 + 风格选择 + 辉光开关 + 描述，一页承载插件全部设置。
     */
    function VSkinSection({ t, useStore, toggle, setTheme, toggleGlow }) {
      const enabled = useStore((s) => s.enabled);
      const themeId = useStore((s) => s.themeId);
      const glow = useStore((s) => s.glow);
      return jsxs("div", {
        className: "vGroup",
        children: [
          jsx("div", { className: "vTitle", children: t("v.title") }),
          jsxs("button", {
            type: "button",
            className: enabled ? "vCube vOn" : "vCube",
            "aria-pressed": enabled,
            onClick: () => toggle(),
            children: [
              jsx(TermIcon, {}),
              jsxs("span", {
                className: "vTexts",
                children: [
                  jsx("span", { className: "vName", children: "█ V://CYBER █" }),
                  jsx("span", { className: "vState", children: t(enabled ? "v.state.on" : "v.state.off") })
                ]
              }),
              jsx("span", { className: "vSwitch", "aria-hidden": true })
            ]
          }),
          jsx("div", { className: "vThemesLabel", children: t("v.themeLabel") }),
          jsx("div", {
            className: "vThemeRow",
            children: THEME_LIST.map((th) =>
              jsxs(
                "button",
                {
                  type: "button",
                  className: themeId === th.id ? "vChip vChipOn" : "vChip",
                  "aria-pressed": themeId === th.id,
                  onClick: () => setTheme(th.id),
                  children: [
                    jsx("span", {
                      className: "vDots",
                      children: th.swatch.map((c) => jsx("i", { key: c, style: { background: c, color: c } }))
                    }),
                    jsx("span", { children: t(th.labelKey) })
                  ]
                },
                th.id
              )
            )
          }),
          jsx("div", { className: "vThemesLabel", children: t("v.glowLabel") }),
          jsxs("button", {
            type: "button",
            className: glow ? "vChip vChipOn vGlowChip" : "vChip vGlowChip",
            "aria-pressed": glow,
            onClick: () => toggleGlow(),
            children: [
              jsx("span", { className: "vGlowDot", "aria-hidden": true }),
              jsx("span", { children: t("v.glow") })
            ]
          }),
          jsx("div", { className: "vDesc", children: t("v.desc") })
        ]
      });
    }

    /** 设置行状态：镜像「是否生效」与「当前主题」。 */
    const store = defineStore({
      init: () => ({ enabled: false, themeId: DEFAULT_THEME, glow: false }),
      actions: {
        setEnabled(d, v) {
          d.enabled = !!v;
        },
        setThemeId(d, id) {
          d.themeId = id;
        },
        setGlow(d, v) {
          d.glow = !!v;
        }
      }
    });

    /* ------------------------------------------------------------------ *
     * 插件主体
     * ------------------------------------------------------------------ */

    /** 需要的 cordis 服务：theme（令牌层）、locale（文案）、slots（设置行）。 */
    const inject = ["theme", "locale", "slots"];

    function apply(ctx) {
      const theme = ctx.theme;

      let bound = null;
      let disposeLayer = null;
      let fxTag = null;
      let overlays = null;
      let hudTimer = null;
      let hudStart = 0;
      let sigLevel = 6;
      let themeId = DEFAULT_THEME;

      const storage = typeof localStorage === "undefined" ? null : localStorage;
      const flagOn = () => {
        try {
          return storage?.getItem(FLAG_KEY) === "1";
        } catch {
          return false;
        }
      };
      const setFlag = (on) => {
        try {
          if (on) storage?.setItem(FLAG_KEY, "1");
          else storage?.removeItem(FLAG_KEY);
        } catch {
          /* 隐私模式等场景：开关退化为会话级 */
        }
      };
      const readTheme = () => {
        try {
          const v = storage?.getItem(THEME_KEY);
          return THEMES[v] ? v : DEFAULT_THEME;
        } catch {
          return DEFAULT_THEME;
        }
      };
      const persistTheme = (id) => {
        try {
          storage?.setItem(THEME_KEY, id);
        } catch {
          /* 忽略持久化失败 */
        }
      };
      const glowOn = () => {
        try {
          return storage?.getItem(GLOW_KEY) === "1";
        } catch {
          return false;
        }
      };
      const persistGlow = (on) => {
        try {
          if (on) storage?.setItem(GLOW_KEY, "1");
          else storage?.removeItem(GLOW_KEY);
        } catch {
          /* 忽略持久化失败 */
        }
      };

      const currentTheme = () => THEMES[themeId] ?? THEMES[DEFAULT_THEME];

      function applyLayer() {
        dropLayer();
        disposeLayer = theme.overrideTokens(THEME_SOURCE, currentTheme().tokens);
      }
      function dropLayer() {
        const dispose = disposeLayer;
        disposeLayer = null;
        if (dispose) dispose();
      }

      /** 建一个挂 body 的覆盖层元素。 */
      function makeOverlay(className) {
        const el = document.createElement("div");
        el.className = className;
        el.dataset.plugin = PLUGIN_ID;
        document.body.appendChild(el);
        return el;
      }

      /** HUD 心跳：时钟 / 运行时长 / 信号条随机游走 / 熵读数。 */
      function hudTick() {
        if (!overlays || !overlays.hud) return;
        const now = new Date();
        const pad = (n) => String(n).padStart(2, "0");
        const up = Math.max(0, Date.now() - hudStart);
        const upH = pad(Math.floor(up / 3600000));
        const upM = pad(Math.floor((up % 3600000) / 60000));
        const upS = pad(Math.floor((up % 60000) / 1000));
        sigLevel += Math.random() < 0.5 ? (Math.random() < 0.5 ? -1 : 1) : 0;
        if (sigLevel < 2) sigLevel = 2;
        if (sigLevel > 8) sigLevel = 8;
        const bar = "▓".repeat(sigLevel) + "░".repeat(8 - sigLevel);
        const state = sigLevel >= 8 ? "CLEAR" : sigLevel >= 6 ? "STRONG" : sigLevel >= 4 ? "READABLE" : "WEAK";
        const lv = state.toLowerCase();
        const entropy = (0.03 + Math.random() * 1.8).toFixed(2);
        overlays.hudSys.textContent = "SYS " + pad(now.getHours()) + ":" + pad(now.getMinutes()) + ":" + pad(now.getSeconds()) + " · UP " + upH + ":" + upM + ":" + upS;
        overlays.hudSig.textContent = "SIG " + bar + " " + state;
        overlays.hudSig.dataset.lv = lv;
        overlays.hudEnt.textContent = "ENTROPY " + entropy + "% · FEED OK";
      }

      /* ── 完成态标记：官方把「已完成」与「空闲」都渲染成 data-state="done"，
            唯一区分信号是行内屏幕阅读器标签文本（workspace 词典 status.completed / status.idle）。
            MutationObserver 扫描标签，给已完成的行挂 data-v-completed 供 CSS 点亮亮绿框体；
            空闲行不标记，保持静默退场。标记写入不触发 childList/characterData，观察者不自激。 ── */
      let doneObserver = null;
      let doneScanTimer = null;

      /** workspace 词典里的状态文案（覆盖 zh/en 之外的语言；未就绪则用内置文案）。 */
      function resolveStatusLabels() {
        try {
          const t = ctx.locale.bind("workspace");
          for (const [key, bucket] of [["status.completed", COMPLETED_LABELS], ["status.idle", IDLE_LABELS]]) {
            const v = t(key);
            if (typeof v === "string" && v && v !== key && !bucket.includes(v)) bucket.push(v);
          }
        } catch {
          /* locale 服务未就绪：内置 zh/en 文案兜底 */
        }
      }

      /** 全量扫描会话行：主状态标签 = 已完成 → 挂标记；其余行摘标记。 */
      function scanDoneRows() {
        if (typeof document !== "object" || typeof document.querySelectorAll !== "function") return;
        const rows = document.querySelectorAll("body." + BODY_CLASS + ' [class*="sessionRow"]');
        for (const row of rows) {
          const slot = row.querySelector(':scope > [class*="slot"]');
          const labels = slot ? slot.querySelectorAll(':scope [class*="visuallyHidden"]') : [];
          const first = labels.length ? String(labels[0].textContent || "").trim() : "";
          if (first && COMPLETED_LABELS.includes(first)) row.setAttribute(DONE_ATTR, "");
          else row.removeAttribute(DONE_ATTR);
        }
      }

      /** 去抖扫描（100ms 尾随）：流式输出的变更风暴下至多 10 次/秒。 */
      function queueDoneScan() {
        if (doneScanTimer || typeof setTimeout !== "function") return;
        doneScanTimer = setTimeout(() => {
          doneScanTimer = null;
          try {
            scanDoneRows();
          } catch {
            /* 单轮扫描失败不影响主题 */
          }
        }, 100);
      }

      function armDoneObserver() {
        if (doneObserver || typeof MutationObserver !== "function" || typeof document === "undefined") return;
        resolveStatusLabels();
        try {
          scanDoneRows();
        } catch {
          /* 首扫失败交给观察者补扫 */
        }
        doneObserver = new MutationObserver(queueDoneScan);
        doneObserver.observe(document.body, { childList: true, subtree: true, characterData: true });
      }

      function disarmDoneObserver() {
        if (doneScanTimer && typeof clearTimeout === "function") {
          clearTimeout(doneScanTimer);
          doneScanTimer = null;
        }
        if (doneObserver) {
          doneObserver.disconnect();
          doneObserver = null;
        }
        if (typeof document === "object" && typeof document.querySelectorAll === "function") {
          const tagged = document.querySelectorAll("[" + DONE_ATTR + "]");
          for (const el of tagged) el.removeAttribute(DONE_ATTR);
        }
      }

      function enableFx() {
        if (typeof document === "undefined") return;
        const t = currentTheme();
        document.body.classList.add(BODY_CLASS);
        document.body.classList.toggle(GLOW_CLASS, glowOn());
        if (!fxTag) {
          fxTag = document.createElement("style");
          fxTag.dataset.plugin = PLUGIN_ID;
          fxTag.dataset.pluginCss = PLUGIN_ID + "/cyber-fx.css";
          document.head.appendChild(fxTag);
        }
        fxTag.textContent = t.fx;
        if (!overlays) {
          /* Console HUD（ASCII ticker 已移除：清晰度优先） */
          const hud = makeOverlay("v-hud");
          const brand = document.createElement("div");
          brand.className = "v-hudBrand";
          brand.textContent = t.hudBrand;
          const sys = document.createElement("div");
          sys.className = "v-hudDim";
          const sig = document.createElement("div");
          const ent = document.createElement("div");
          ent.className = "v-hudDim";
          hud.appendChild(brand);
          hud.appendChild(sys);
          hud.appendChild(sig);
          hud.appendChild(ent);
          overlays = { hud, hudSys: sys, hudSig: sig, hudEnt: ent };
          hudStart = Date.now();
          hudTick();
          if (typeof setInterval === "function") {
            hudTimer = setInterval(hudTick, 1000);
          }
        }
        armDoneObserver();
      }
      function disableFx() {
        if (typeof document === "undefined") return;
        disarmDoneObserver();
        document.body.classList.remove(BODY_CLASS, GLOW_CLASS);
        if (fxTag) {
          fxTag.remove();
          fxTag = null;
        }
        if (hudTimer) {
          clearInterval(hudTimer);
          hudTimer = null;
        }
        for (const key of ["hud"]) {
          const el = overlays?.[key];
          if (el) el.remove();
        }
        overlays = null;
      }

      /** 切换主题：持久化 + 若已开启则热替换令牌层与特效层。 */
      function switchTheme(id) {
        if (!THEMES[id] || id === themeId) return;
        themeId = id;
        persistTheme(id);
        bound?.setThemeId(id);
        if (flagOn()) {
          applyLayer();
          disableFx();
          enableFx();
        }
      }

      /**
       * 开启主题。restorePoint=true 时记录当前内建偏好供关闭时还原。
       * 顺序：先写 flag，再固定 dark，再叠层、开特效。
       */
      function activate(restorePoint) {
        if (restorePoint) {
          const prev = theme.getTheme().preference;
          try {
            storage?.setItem(PREV_KEY, prev === "light" || prev === "dark" || prev === "system" ? prev : "system");
          } catch {
            /* 忽略持久化失败 */
          }
          setFlag(true);
        }
        theme.setTheme("dark");
        applyLayer();
        enableFx();
        bound?.setEnabled(true);
      }

      /** 关闭主题。先清 flag 再撤层（防监听自激）。restore=true 还原偏好。 */
      function deactivate(opts) {
        setFlag(false);
        dropLayer();
        disableFx();
        bound?.setEnabled(false);
        if (opts && opts.restore) {
          let prev = "system";
          try {
            const v = storage?.getItem(PREV_KEY);
            if (v === "light" || v === "dark" || v === "system") prev = v;
          } catch {
            /* 保持 system */
          }
          theme.setTheme(prev);
        }
      }

      /* 主题变化：自愈 + 自动断开。 */
      ctx.on("theme/change", (snapshot) => {
        if (!flagOn()) {
          bound?.setEnabled(false);
          return;
        }
        if (snapshot.preference !== "dark") {
          deactivate({ restore: false });
          return;
        }
        if (snapshot.active.tokens[SENTINEL] !== "1") applyLayer();
        enableFx();
        bound?.setEnabled(true);
      });

      /* 设置行样式（随插件生命周期）。 */
      ctx.effect(() => {
        if (typeof document === "undefined") return () => {};
        const tag = document.createElement("style");
        tag.dataset.plugin = PLUGIN_ID;
        tag.dataset.pluginCss = PLUGIN_ID + "/settings-row.css";
        tag.textContent = ROW_CSS;
        document.head.appendChild(tag);
        return () => {
          tag.remove();
        };
      }, "v: settings-row stylesheet");

      /* 设置行文案。 */
      ctx.effect(() => ctx.locale.register(SETTINGS_NS, { zh, en }), "v: settings-row dictionaries");

      /* 恢复上次主题选择（须在槽位注册前——inject 回调会同步进 store）。
         迁移必须先于 readTheme()：readTheme 的 fallback 只认新 id，
         旧 id 若不在此时回写，会被吞成默认主题、用户选择静默重置。 */
      try {
        const raw = storage?.getItem(THEME_KEY);
        if (raw && THEME_MIGRATION[raw]) {
          try {
            storage?.setItem(THEME_KEY, THEME_MIGRATION[raw]);
          } catch {
            /* 隐私模式等场景：只映射不回写，下次 boot 再迁移 */
          }
        }
      } catch {
        /* 存储不可读：交给 readTheme 的既有 catch 走默认主题 */
      }
      themeId = readTheme();

      /* 设置 → 皮肤：独立第一层分页，承载插件全部设置（开关/风格/辉光）。 */
      ctx.slots.inject("settings.section", () =>
        ctx.slots.register(
          {
            name: "settings.section",
            id: "v-skin",
            order: 5,
            label: () => ctx.locale.bind(SETTINGS_NS)("v.nav"),
            store,
            locale: SETTINGS_NS,
            inject: (actions) => {
              bound = actions;
              actions.setEnabled(flagOn());
              actions.setThemeId(themeId);
              actions.setGlow(glowOn());
              return {
                toggle: () => {
                  if (flagOn()) deactivate({ restore: true });
                  else activate(true);
                },
                setTheme: (id) => switchTheme(id),
                toggleGlow: () => {
                  const next = !glowOn();
                  persistGlow(next);
                  actions.setGlow(next);
                  if (flagOn() && typeof document !== "undefined") {
                    document.body.classList.toggle(GLOW_CLASS, next);
                  }
                }
              };
            }
          },
          VSkinSection
        )
      );

      /* 启动恢复：上次离开时处于开启状态则重新接入。 */
      if (flagOn()) activate(false);

      /* fiber 卸载：摘掉我们碰过的一切。 */
      ctx.effect(
        () => () => {
          deactivate({ restore: false });
          bound = null;
        },
        "v: teardown"
      );
    }

    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  }
});
