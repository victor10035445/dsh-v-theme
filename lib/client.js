/*!
 * dsh-v-theme — V CYBER（多主题）
 * DeepSeek Harness Web 客户端主题插件（黑客 / 赛博风）。
 *
 * 主题（v0.7.2，七条目注册表）：
 *  - 赛博霓虹（id neon，基线）：霓虹粉 × 电光蓝——用户已验收的受保护基线，
 *    调色板与特效层内容经 tests/check-baseline.cjs 指纹守卫（解封记录：
 *    v0.7.1 行内 code 胶囊增补；v0.7.2 基线胶囊改固定浅冰蓝——唯一例外，
 *    其余全部保持霓虹粉），触碰需独立变更解封
 *  - 霓虹色板族 ×5（outrun / vaporwave / neon-violet / y2k-chrome / blue-nocturne）：
 *    静态 PALETTE_* 常量为唯一色彩源 + buildNeonFX(P, extra) 参数化特效
 *    （含概念层：虫洞 compaction 通道 / 门户环 / 神经元点火 / 菌丝生长 / 涌现绽放）
 *  - 战术面板（Tactical · 红蓝作战中心）：SOC 基底（AAA 对比度）+ FUI 霓虹强调
 *    （青 #56d4e0 主操作 / 绿 #00FF88 健康 / 黄 #f0c239 警示 / 赤红 #FF3366），
 *    参照 demo5-tactical.html 的融合设计；FX 含红蓝作战中心块
 *    （蜂巢巢室点 / 分形深度角标 / 引擎点火 / 态势雷达）；工具卡弱化呈现——
 *    不用顶部高亮线（v0.7.1 移除 DEFCON 顶边与警报扫频），出错 = 边框/角标换赤红
 *  - 行内 code / 文件地址胶囊：七案统一——会话内行内 code（文件地址、短代码）
 *    = 主题色 14% 底 + 提亮主色文字（战术面板行内 code 配方推广到全部风格）
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
 *  - 特效层（组件级描边 / 状态框体 / 流式扫线 / CRT flicker）随主题整体热替换；
 *  - 主题选择持久化在 localStorage，设置 → 皮肤 里切换；
 *  - 状态自愈：层被摘掉补回（哨兵令牌防自激），基底被切走自动断开。
 */
window.__ModuleLoader__.load({
  id: "dsh-v-theme",
  factory: (require) => {
    "use strict";
    const module = { exports: {} };
    const exports = module.exports;

    const { jsx, jsxs } = require("react/jsx-runtime");
    const { defineStore } = require("@deepseek-ai/dsh-client-store");

    /* ------------------------------------------------------------------ *
     * 常量
     * ------------------------------------------------------------------ */

    const PLUGIN_ID = "dsh-v-theme";
    const THEME_SOURCE = PLUGIN_ID;
    /** localStorage：总开关。 */
    const FLAG_KEY = "dsh-v-theme:enabled";
    /** localStorage：主题选择。 */
    const THEME_KEY = "dsh-v-theme:theme";
    /** localStorage：开启前的内建外观偏好。 */
    const PREV_KEY = "dsh-v-theme:prev-preference";
    /** 开启期间挂在 body 上的特效类（所有主题共用）。 */
    const BODY_CLASS = "v-cyber";
    /** 哨兵令牌：layer 是否存活以此为准。 */
    const SENTINEL = "--v-cyber-on";
    /** 设置行文案的 locale 命名空间。 */
    const SETTINGS_NS = "settings.v-cyber";
    /** 默认主题。 */
    const DEFAULT_THEME = "neon";
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
     * 赛博霓虹特效层（基线，id neon；仅主题开启时挂载；body.v-cyber 作用域）。
     * 受 tests/check-baseline.cjs 指纹保护——v0.7.2 起行内 code 胶囊固定浅冰蓝（用户指定特例），
     * 其余内容保持霓虹粉基线。
     * 霓虹粉 / 电光蓝 / 紫罗兰；签名 = 配色 + CRT flicker + 会话状态框体。
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
/* 全屏扫描线覆膜 / ASCII ticker / 区域辉光均已移除（清晰度优先：只妆组件，不刷区域） */
body.${BODY_CLASS} ::selection{background:#FF2E9759;color:#FFF0F8;text-shadow:none}
body.${BODY_CLASS} :is(textarea,input,[contenteditable=true]){caret-color:#FF2E97}
body.${BODY_CLASS} *:focus-visible{outline:1px solid #FF2E97;outline-offset:1px;box-shadow:0 0 10px #FF2E9766}
body.${BODY_CLASS} a{color:#4DA8FF;text-shadow:0 0 10px #4DA8FF40}
body.${BODY_CLASS} pre{box-shadow:inset 2px 0 0 #FF2E9740}
/* 行内 code / 文件地址：浅冰蓝胶囊（v0.7.2 用户指定特例：基线胶囊固定蓝调夜曲浅冰蓝，
   不随霓虹粉主色；bg 14% + 65/35 提亮字，与其余六案配方同源） */
body.${BODY_CLASS} [data-conversation-scroll] :not(pre) > code{
  background:rgba(92,200,255,.14);
  color:#95DBFF;
  border-radius:3px;
  padding:.1em .35em;
}
body.${BODY_CLASS} :is(h1,h2,h3){animation:vFlicker 9s steps(1) infinite}
@keyframes vFlicker{0%,100%{opacity:1}3%{opacity:.86}4%{opacity:1}47%{opacity:1}48%{opacity:.92}49%{opacity:1}}
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
/* 完成（区别于空闲静默）：亮绿 #00FF88（demo5 FUI 绿 · 成功语义）。
   官方把完成与空闲都渲染成 data-state="done"，由标签扫描挂 data-v-completed 精确区分 */
body.${BODY_CLASS} [class*="sessionRow"][data-v-completed]{
  box-shadow:inset 3px 0 0 #00FF88;
  background-image:linear-gradient(rgba(0,255,136,.06),rgba(0,255,136,.06));
}
/* 完成行的官方状态点同步亮绿通道（空闲行保持官方成功色，静默退场） */
body.${BODY_CLASS} [class*="sessionRow"][data-v-completed] [data-state="done"]{color:#00FF88}

/* ═══ 四色通道阵列（demo5 stat-row 手法：边框/辉光/文字/文字辉光同色贯穿） ═══
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
     * 战术面板特效层：SOC 基底 + FUI 强调（参照 demo5-tactical.html），
     * 青色系组件装饰（切角 / 战术角标 / 流式扫线 / 状态框体）。
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
/* 全屏扫描线覆膜 / ASCII ticker / 顶部区域辉光均已移除（清晰度优先：只妆组件，不刷区域） */
body.${BODY_CLASS} ::selection{background:#56D4E059;color:#EAFCFF;text-shadow:none}
body.${BODY_CLASS} :is(textarea,input,[contenteditable=true]){caret-color:#56D4E0}
body.${BODY_CLASS} *:focus-visible{outline:1px solid #56D4E0;outline-offset:1px;box-shadow:0 0 10px #56D4E066}
body.${BODY_CLASS} a{color:#00D4FF;text-shadow:0 0 8px #00D4FF33}
body.${BODY_CLASS} pre{box-shadow:inset 2px 0 0 #56D4E040}
body.${BODY_CLASS} :is(h1,h2,h3){animation:vFlicker 11s steps(1) infinite}
@keyframes vFlicker{0%,100%{opacity:1}3%{opacity:.86}4%{opacity:1}47%{opacity:1}48%{opacity:.92}49%{opacity:1}}
/* CRT 滚动亮带已移除（清晰度优先） */
/* ═══ Tactical 深度造型：SOC 克制 + FUI 点睛（切角 / 战术角标 / DEFCON 状态） ═══ */

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
/* 渐变顶边：border-top 无法用渐变，用内嵌伪元素画（demo5 badge-tactical 配方） */
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

/* P0 · 工具卡：demo5 .panel 配方（半透明 + blur）——弱化呈现，不用顶部高亮线
   （工具卡是过程性背景信息：v0.7.1 移除 DEFCON 渐变顶边与警报扫频，出错语义降级为
   边框/角标换赤红（见下方出错结果卡）；用户气泡渐变顶边与 composer 顶部辉光保留不动） */
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
/* neon-pulse hover（demo5 配方：hover 辉光增强） */
body.${BODY_CLASS} [data-chat-flow-kind="tool-call"] [class*="callRow"]:hover,
body.${BODY_CLASS} [data-chat-flow-kind="tool-call"] > div > div:hover{
  box-shadow:0 0 25px rgba(86,212,224,.18);
}
body.${BODY_CLASS} [data-chat-flow-kind="tool-result"] [class*="callRow"]:hover,
body.${BODY_CLASS} [data-chat-flow-kind="tool-result"] > div > div:hover{
  box-shadow:0 0 25px rgba(93,219,114,.15);
}
/* L 型战术角标：挂在外层 flowItem 的 ::after（左上/右下角线，demo5 角标配方缩版） */
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
/* 出错结果卡：红队信号降级为边框 + 角标换赤红（不设顶部高亮线；运行蓝 → 出错红的状态翻转仍在，
   音量对齐工具卡的弱化定位） */
body.${BODY_CLASS} [data-chat-flow-kind="tool-result"][data-error] [class*="callRow"],
body.${BODY_CLASS} [data-chat-flow-kind="tool-result"][data-error] > div > div{
  border-color:#FF336659;
}
body.${BODY_CLASS} [data-chat-flow-kind="tool-result"][data-error]::after{
  border-top-color:#FF3366;
  border-left-color:#FF3366;
}
/* flowItem 需要定位上下文给角标 */
body.${BODY_CLASS} [data-chat-flow-kind="tool-call"],
body.${BODY_CLASS} [data-chat-flow-kind="tool-result"]{
  position:relative;
}

/* P0 · Composer 卡片：切角 + 顶部 hero 径向辉光（demo5 Hero 配方）+ 聚焦态 */
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

/* P2 · 流式/思考中：顶部青色扫描线（demo5 hero::before 配方） */
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
/* 完成（区别于空闲静默）：亮绿 #00FF88（demo5 FUI 绿 · 成功语义）。
   官方把完成与空闲都渲染成 data-state="done"，由标签扫描挂 data-v-completed 精确区分 */
body.${BODY_CLASS} [class*="sessionRow"][data-v-completed]{
  box-shadow:inset 3px 0 0 #00FF88;
  background-image:linear-gradient(rgba(0,255,136,.05),rgba(0,255,136,.05));
}
/* 完成行的官方状态点同步亮绿通道（空闲行保持官方成功色，静默退场） */
body.${BODY_CLASS} [class*="sessionRow"][data-v-completed] [data-state="done"]{color:#00FF88}

/* ═══ demo5 精美细节移植 ═══ */

/* 六边形状态点：引用 chip 前置 8px 六边形（clip-path + 同色辉光，demo5 .dot-hex） */
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

/* Markdown 数据表：hover 行高亮（demo5 .data-table tr:hover 同款 surface2） */
body.${BODY_CLASS} [data-conversation-scroll] tr:hover{
  background:var(--dsw-alias-bg-layer-2);
}
/* 表头：SOC 卡片标题气质（次文色 + 上下细线） */
body.${BODY_CLASS} [data-conversation-scroll] th{
  color:var(--dsw-alias-label-secondary);
  font-family:var(--ds-font-family-code);
}

/* 行内 code：sev 胶囊风（青 15% 底 + 青字，demo5 sev-HIGH 配方换色） */
body.${BODY_CLASS} [data-conversation-scroll] :not(pre) > code{
  background:rgba(86,212,224,.14);
  color:#7EE3EC;
  border-radius:3px;
  padding:.1em .35em;
}

/* ═══ 四色通道阵列（demo5 stat-row 手法：边框/辉光/文字/文字辉光同色贯穿） ═══
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

/* ═══ 红蓝作战中心（concept-layer.md §3）：红蓝双通道 = 组织原则——
   蓝队（青/青蓝）= 防御·执行·监控，红队（赤红→品红）= 对抗·警报·异常，
   指挥权 = DEFCON 金，战果 = 亮绿。对抗感只来自状态翻转（运行蓝 → 出错红），不做装饰性混排。 ═══ */

/* 红队警报扫频已随工具卡顶边一并移除（v0.7.1：出错 = 边框/角标换赤红的静默信号，无动画） */

/* 蜂巢巢室点：队列/任务标题前置六边形（demo5 dot-hex 配方——排队中的 agent 是待入巢的蜂） */
body.${BODY_CLASS} [data-queue-dock] :is(strong,[class*="title"])::before{
  content:"";
  display:inline-block;
  width:8px;height:8px;
  margin-right:6px;
  vertical-align:-1px;
  clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);
  background:#00D4FF;
  box-shadow:0 0 6px #00D4FF;
}
body.${BODY_CLASS} [data-testid="todo-panel"] :is(h1,h2,h3,h4,strong,[class*="title"])::before{
  content:"";
  display:inline-block;
  width:6px;height:6px;
  margin-right:6px;
  vertical-align:-1px;
  clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);
  background:#00FF88;
  box-shadow:0 0 6px #00FF88;
}

/* 分形空间：嵌套工具卡的自相似角标（外层卡含内层卡 → L 角标 11px→7px 自相似缩小；
   :has() 不支持则整条退化，角标保持均一 11px——与会话状态框体同款退化哲学） */
body.${BODY_CLASS} [data-chat-flow-kind="tool-call"]:has([data-chat-flow-kind])::after,
body.${BODY_CLASS} [data-chat-flow-kind="tool-result"]:has([data-chat-flow-kind])::after{
  width:7px;
  height:7px;
  border-width:1px;
  opacity:.45;
}

/* 态势雷达：队列面板扫描扇（全插件唯一新增常驻循环：8s 低频 + alpha .10 封顶） */
body.${BODY_CLASS} [data-queue-dock] > [class*="panel"]{
  position:relative;
  overflow:hidden;
}
body.${BODY_CLASS} [data-queue-dock] > [class*="panel"]::before{
  content:"";
  position:absolute;
  inset:-40%;
  pointer-events:none;
  background:conic-gradient(from 0deg,rgba(0,212,255,.10),transparent 28%);
  animation:vRadar 8s linear infinite;
}
@keyframes vRadar{to{transform:rotate(360deg)}}

@media (prefers-reduced-motion:reduce){
  .vOn .vState::after{animation:none}
  body.${BODY_CLASS} :is(h1,h2,h3){animation:none}
  body.${BODY_CLASS} [data-chat-flow-kind="error"]{animation:none}
  body.${BODY_CLASS} [data-streaming]::before{animation:none}
  body.${BODY_CLASS} [data-queue-dock] > [class*="panel"]::before{animation:none}
}`;

    /** 赛博霓虹（基线，id neon）调色板：粉 / 粉蓝强调层（背景族全部走 DSH 原生配色）。 */
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

    /** 日落公路（Outrun）调色板：落日橙 × 黄昏紫 × 电光青——补全派系签名里的日落色带。 */
    const PALETTE_OUTRUN = {
      /* 边框：落日橙 alpha 线 */
      "--dsw-alias-border-inverted": "#FF6B351F",
      "--dsw-alias-border-inverted2": "#FF6B3533",
      "--dsw-alias-border-l1": "#FF6B3512",
      "--dsw-alias-border-l2": "#FF6B3524",
      "--dsw-alias-border-l2-darkmode-thin": "#FF6B3512",
      "--dsw-alias-border-l3": "#FF6B3533",
      "--dsw-alias-border-l4": "#FF6B3547",
      /* 品牌与主按钮：落日橙（base 6.43:1） */
      "--dsw-alias-brand-primary": "#FF6B35",
      "--dsw-alias-brand-primary-invert": "#2A1206",
      "--dsw-alias-brand-primary-new-colorprimary-new-color": "#FF6B35",
      "--dsw-alias-brand-text": "#F6E7DC",
      /* 按钮族（仅强调性按钮；表面类填充走原生） */
      "--dsw-alias-button-contrast-fill": "#F6E7DC",
      "--dsw-alias-button-ghost-active-border": "#2DE2E659",
      "--dsw-alias-button-info-fill": "#2DE2E6",
      "--dsw-alias-button-info-hover": "#7DEDF1",
      "--dsw-alias-button-primary-fill": "#FF6B35",
      "--dsw-alias-button-primary-hover": "#FF8A5C",
      /* 交互底色（半透明强调；solid 表面走原生） */
      "--dsw-alias-interactive-bg-active": "#FF6B3533",
      "--dsw-alias-interactive-bg-hover": "#FF6B3514",
      "--dsw-alias-interactive-bg-hover-accent": "#FF6B3526",
      "--dsw-alias-interactive-bg-hover-danger": "#FF4D6D26",
      /* 文本层级：暖沙白 → 沙灰 */
      "--dsw-alias-label-primary": "#F6E7DC",
      "--dsw-alias-label-primary-bluish": "#B967FF",
      "--dsw-alias-label-primary-dimmed": "#E2CBB8",
      "--dsw-alias-label-primary-foreground": "#2A1206",
      "--dsw-alias-label-secondary": "#C9B2A4",
      "--dsw-alias-label-tertiary": "#A69684",
      "--dsw-alias-label-caption": "#8A7C6E",
      /* 滚动条悬停（轨道走原生） */
      "--dsw-alias-scrollbar-hover-l1": "#FF6B35",
      "--dsw-alias-scrollbar-hover-l2": "#FF8A5C",
      /* 状态色：todo=薄荷 / queue=电光青 / warn=金 / error=绯红 */
      "--dsw-alias-state-business-primary": "#2DE2E6",
      "--dsw-alias-state-error-primary": "#FF4D6D",
      "--dsw-alias-state-error-secondary": "#FF8FA3",
      "--dsw-alias-state-success-primary": "#3DFFA8",
      "--dsw-alias-state-success-secondary": "#7FFFC4",
      "--dsw-alias-state-warn-label": "#FFC857",
      "--dsw-alias-state-warn-primary": "#FFC857",
      "--dsw-alias-state-warn-secondary": "#FFDD8A",
      /* 侧栏激活强调条 */
      "--dsw-specific-sidebar-nav-item-active-accent": "#FF6B35",
      /* 字体：沿用赛博霓虹基线配对（色板变体只变色彩不变声腔） */
      "--dsw-font-family":
        '"Space Grotesk","DM Sans","IBM Plex Sans",-apple-system,"Segoe UI","PingFang SC","Hiragino Sans GB","Microsoft YaHei","Helvetica Neue",Helvetica,Arial,sans-serif',
      "--ds-font-family-code":
        '"JetBrains Mono","Fira Code","Cascadia Code","SF Mono",Consolas,"Liberation Mono",Menlo,"PingFang SC","Microsoft YaHei",monospace'
    };

    /** 梦核（Vaporwave）调色板：奶油粉 × 冰青 × 薄荷——柔色系统，夜间长会话最舒适。 */
    const PALETTE_VAPORWAVE = {
      /* 边框：奶油粉 alpha 线 */
      "--dsw-alias-border-inverted": "#FF71CE1F",
      "--dsw-alias-border-inverted2": "#FF71CE33",
      "--dsw-alias-border-l1": "#FF71CE12",
      "--dsw-alias-border-l2": "#FF71CE24",
      "--dsw-alias-border-l2-darkmode-thin": "#FF71CE12",
      "--dsw-alias-border-l3": "#FF71CE33",
      "--dsw-alias-border-l4": "#FF71CE47",
      /* 品牌与主按钮：奶油粉（base 7.39:1） */
      "--dsw-alias-brand-primary": "#FF71CE",
      "--dsw-alias-brand-primary-invert": "#2B0A22",
      "--dsw-alias-brand-primary-new-colorprimary-new-color": "#FF71CE",
      "--dsw-alias-brand-text": "#EFE6F6",
      /* 按钮族（仅强调性按钮；表面类填充走原生） */
      "--dsw-alias-button-contrast-fill": "#EFE6F6",
      "--dsw-alias-button-ghost-active-border": "#01CDFE59",
      "--dsw-alias-button-info-fill": "#01CDFE",
      "--dsw-alias-button-info-hover": "#5BE0FF",
      "--dsw-alias-button-primary-fill": "#FF71CE",
      "--dsw-alias-button-primary-hover": "#FF9BDD",
      /* 交互底色（半透明强调；solid 表面走原生） */
      "--dsw-alias-interactive-bg-active": "#FF71CE33",
      "--dsw-alias-interactive-bg-hover": "#FF71CE14",
      "--dsw-alias-interactive-bg-hover-accent": "#FF71CE26",
      "--dsw-alias-interactive-bg-hover-danger": "#FF5C8A26",
      /* 文本层级：乳紫白 → 灰紫 */
      "--dsw-alias-label-primary": "#EFE6F6",
      "--dsw-alias-label-primary-bluish": "#01CDFE",
      "--dsw-alias-label-primary-dimmed": "#DCC9EA",
      "--dsw-alias-label-primary-foreground": "#2B0A22",
      "--dsw-alias-label-secondary": "#BFB0CE",
      "--dsw-alias-label-tertiary": "#A394B5",
      "--dsw-alias-label-caption": "#85799A",
      /* 滚动条悬停（轨道走原生） */
      "--dsw-alias-scrollbar-hover-l1": "#FF71CE",
      "--dsw-alias-scrollbar-hover-l2": "#FF9BDD",
      /* 状态色：todo=薄荷 / queue=冰青 / warn=金 / error=玫红 */
      "--dsw-alias-state-business-primary": "#01CDFE",
      "--dsw-alias-state-error-primary": "#FF5C8A",
      "--dsw-alias-state-error-secondary": "#FF9AB4",
      "--dsw-alias-state-success-primary": "#05FFA1",
      "--dsw-alias-state-success-secondary": "#6FFFC4",
      "--dsw-alias-state-warn-label": "#FFC857",
      "--dsw-alias-state-warn-primary": "#FFC857",
      "--dsw-alias-state-warn-secondary": "#FFDD8A",
      /* 侧栏激活强调条 */
      "--dsw-specific-sidebar-nav-item-active-accent": "#FF71CE",
      /* 字体：沿用赛博霓虹基线配对 */
      "--dsw-font-family":
        '"Space Grotesk","DM Sans","IBM Plex Sans",-apple-system,"Segoe UI","PingFang SC","Hiragino Sans GB","Microsoft YaHei","Helvetica Neue",Helvetica,Arial,sans-serif',
      "--ds-font-family-code":
        '"JetBrains Mono","Fira Code","Cascadia Code","SF Mono",Consolas,"Liberation Mono",Menlo,"PingFang SC","Microsoft YaHei",monospace'
    };

    /** 紫夜极光（Neon Violet）调色板：电紫 × 激光青 × 玫粉——粉退居通道色。 */
    const PALETTE_NEON_VIOLET = {
      /* 边框：电紫 alpha 线 */
      "--dsw-alias-border-inverted": "#C07CFF1F",
      "--dsw-alias-border-inverted2": "#C07CFF33",
      "--dsw-alias-border-l1": "#C07CFF12",
      "--dsw-alias-border-l2": "#C07CFF24",
      "--dsw-alias-border-l2-darkmode-thin": "#C07CFF12",
      "--dsw-alias-border-l3": "#C07CFF33",
      "--dsw-alias-border-l4": "#C07CFF47",
      /* 品牌与主按钮：电紫（base 6.57:1；提亮版，原案 #B45CFF 卡片上不达标） */
      "--dsw-alias-brand-primary": "#C07CFF",
      "--dsw-alias-brand-primary-invert": "#1D0A2E",
      "--dsw-alias-brand-primary-new-colorprimary-new-color": "#C07CFF",
      "--dsw-alias-brand-text": "#EDE6F7",
      /* 按钮族（仅强调性按钮；表面类填充走原生） */
      "--dsw-alias-button-contrast-fill": "#EDE6F7",
      "--dsw-alias-button-ghost-active-border": "#00E5FF59",
      "--dsw-alias-button-info-fill": "#00E5FF",
      "--dsw-alias-button-info-hover": "#5CECFF",
      "--dsw-alias-button-primary-fill": "#C07CFF",
      "--dsw-alias-button-primary-hover": "#D29CFF",
      /* 交互底色（半透明强调；solid 表面走原生） */
      "--dsw-alias-interactive-bg-active": "#C07CFF33",
      "--dsw-alias-interactive-bg-hover": "#C07CFF14",
      "--dsw-alias-interactive-bg-hover-accent": "#C07CFF26",
      "--dsw-alias-interactive-bg-hover-danger": "#FF3B5C26",
      /* 文本层级：淡紫白 → 灰紫 */
      "--dsw-alias-label-primary": "#EDE6F7",
      "--dsw-alias-label-primary-bluish": "#00E5FF",
      "--dsw-alias-label-primary-dimmed": "#D5C4E8",
      "--dsw-alias-label-primary-foreground": "#1D0A2E",
      "--dsw-alias-label-secondary": "#B4A8C8",
      "--dsw-alias-label-tertiary": "#9C8FB2",
      "--dsw-alias-label-caption": "#7E7396",
      /* 滚动条悬停（轨道走原生） */
      "--dsw-alias-scrollbar-hover-l1": "#C07CFF",
      "--dsw-alias-scrollbar-hover-l2": "#D29CFF",
      /* 状态色：todo=玫粉（extra 覆盖）/ queue=激光青 / warn=金 / error=赤红 */
      "--dsw-alias-state-business-primary": "#00E5FF",
      "--dsw-alias-state-error-primary": "#FF3B5C",
      "--dsw-alias-state-error-secondary": "#FF7A8F",
      "--dsw-alias-state-success-primary": "#3DFFA8",
      "--dsw-alias-state-success-secondary": "#7FFFC4",
      "--dsw-alias-state-warn-label": "#FFC857",
      "--dsw-alias-state-warn-primary": "#FFC857",
      "--dsw-alias-state-warn-secondary": "#FFDD8A",
      /* 侧栏激活强调条 */
      "--dsw-specific-sidebar-nav-item-active-accent": "#C07CFF",
      /* 字体：沿用赛博霓虹基线配对 */
      "--dsw-font-family":
        '"Space Grotesk","DM Sans","IBM Plex Sans",-apple-system,"Segoe UI","PingFang SC","Hiragino Sans GB","Microsoft YaHei","Helvetica Neue",Helvetica,Arial,sans-serif',
      "--ds-font-family-code":
        '"JetBrains Mono","Fira Code","Cascadia Code","SF Mono",Consolas,"Liberation Mono",Menlo,"PingFang SC","Microsoft YaHei",monospace'
    };

    /** 银翼千禧（Y2K Chrome）调色板：亮粉 × 电青 × 铬银高光——唯一引入材质色的方案。 */
    const PALETTE_Y2K_CHROME = {
      /* 边框：亮粉 alpha 线 */
      "--dsw-alias-border-inverted": "#FF69B41F",
      "--dsw-alias-border-inverted2": "#FF69B433",
      "--dsw-alias-border-l1": "#FF69B412",
      "--dsw-alias-border-l2": "#FF69B424",
      "--dsw-alias-border-l2-darkmode-thin": "#FF69B412",
      "--dsw-alias-border-l3": "#FF69B433",
      "--dsw-alias-border-l4": "#FF69B447",
      /* 品牌与主按钮：亮粉（base 6.89:1） */
      "--dsw-alias-brand-primary": "#FF69B4",
      "--dsw-alias-brand-primary-invert": "#2E0A18",
      "--dsw-alias-brand-primary-new-colorprimary-new-color": "#FF69B4",
      "--dsw-alias-brand-text": "#EFEFF5",
      /* 按钮族（仅强调性按钮；表面类填充走原生） */
      "--dsw-alias-button-contrast-fill": "#EFEFF5",
      "--dsw-alias-button-ghost-active-border": "#00E5FF59",
      "--dsw-alias-button-info-fill": "#00E5FF",
      "--dsw-alias-button-info-hover": "#5CECFF",
      "--dsw-alias-button-primary-fill": "#FF69B4",
      "--dsw-alias-button-primary-hover": "#FF8FC4",
      /* 交互底色（半透明强调；solid 表面走原生） */
      "--dsw-alias-interactive-bg-active": "#FF69B433",
      "--dsw-alias-interactive-bg-hover": "#FF69B414",
      "--dsw-alias-interactive-bg-hover-accent": "#FF69B426",
      "--dsw-alias-interactive-bg-hover-danger": "#FF4D6D26",
      /* 文本层级：银白（全场最高 15.92:1） → 银灰 */
      "--dsw-alias-label-primary": "#EFEFF5",
      "--dsw-alias-label-primary-bluish": "#00E5FF",
      "--dsw-alias-label-primary-dimmed": "#DCC0D2",
      "--dsw-alias-label-primary-foreground": "#2E0A18",
      "--dsw-alias-label-secondary": "#AFAFB8",
      "--dsw-alias-label-tertiary": "#96969E",
      "--dsw-alias-label-caption": "#7A7A84",
      /* 滚动条悬停（轨道走原生） */
      "--dsw-alias-scrollbar-hover-l1": "#FF69B4",
      "--dsw-alias-scrollbar-hover-l2": "#FF8FC4",
      /* 状态色：todo=亮粉（extra 覆盖）/ queue=电青 / warn=金 / error=绯红 */
      "--dsw-alias-state-business-primary": "#00E5FF",
      "--dsw-alias-state-error-primary": "#FF4D6D",
      "--dsw-alias-state-error-secondary": "#FF8FA3",
      "--dsw-alias-state-success-primary": "#05FFA1",
      "--dsw-alias-state-success-secondary": "#6FFFC4",
      "--dsw-alias-state-warn-label": "#FFC857",
      "--dsw-alias-state-warn-primary": "#FFC857",
      "--dsw-alias-state-warn-secondary": "#FFDD8A",
      /* 侧栏激活强调条 */
      "--dsw-specific-sidebar-nav-item-active-accent": "#FF69B4",
      /* 字体：沿用赛博霓虹基线配对 */
      "--dsw-font-family":
        '"Space Grotesk","DM Sans","IBM Plex Sans",-apple-system,"Segoe UI","PingFang SC","Hiragino Sans GB","Microsoft YaHei","Helvetica Neue",Helvetica,Arial,sans-serif',
      "--ds-font-family-code":
        '"JetBrains Mono","Fira Code","Cascadia Code","SF Mono",Consolas,"Liberation Mono",Menlo,"PingFang SC","Microsoft YaHei",monospace'
    };

    /** 蓝调夜曲（Blue Nocturne）调色板：冰蓝主色 × 霓虹粉点睛——主辅倒置，白天办公最克制。 */
    const PALETTE_BLUE_NOCTURNE = {
      /* 边框：冰蓝 alpha 线 */
      "--dsw-alias-border-inverted": "#5CC8FF1F",
      "--dsw-alias-border-inverted2": "#5CC8FF33",
      "--dsw-alias-border-l1": "#5CC8FF12",
      "--dsw-alias-border-l2": "#5CC8FF24",
      "--dsw-alias-border-l2-darkmode-thin": "#5CC8FF12",
      "--dsw-alias-border-l3": "#5CC8FF33",
      "--dsw-alias-border-l4": "#5CC8FF47",
      /* 品牌与主按钮：冰蓝（base 9.69:1，全场最高对比主色） */
      "--dsw-alias-brand-primary": "#5CC8FF",
      "--dsw-alias-brand-primary-invert": "#062033",
      "--dsw-alias-brand-primary-new-colorprimary-new-color": "#5CC8FF",
      "--dsw-alias-brand-text": "#E4ECF6",
      /* 按钮族（ghost 边保留霓虹粉——粉降级为点睛的结构性落点） */
      "--dsw-alias-button-contrast-fill": "#E4ECF6",
      "--dsw-alias-button-ghost-active-border": "#FF2E9759",
      "--dsw-alias-button-info-fill": "#5CC8FF",
      "--dsw-alias-button-info-hover": "#8AD9FF",
      "--dsw-alias-button-primary-fill": "#5CC8FF",
      "--dsw-alias-button-primary-hover": "#8AD9FF",
      /* 交互底色（半透明强调；solid 表面走原生） */
      "--dsw-alias-interactive-bg-active": "#5CC8FF33",
      "--dsw-alias-interactive-bg-hover": "#5CC8FF14",
      "--dsw-alias-interactive-bg-hover-accent": "#5CC8FF26",
      "--dsw-alias-interactive-bg-hover-danger": "#FF3B5C26",
      /* 文本层级：冷白 → 蓝灰 */
      "--dsw-alias-label-primary": "#E4ECF6",
      "--dsw-alias-label-primary-bluish": "#9D7BFF",
      "--dsw-alias-label-primary-dimmed": "#C9D6E4",
      "--dsw-alias-label-primary-foreground": "#062033",
      "--dsw-alias-label-secondary": "#9FB2C4",
      "--dsw-alias-label-tertiary": "#8496AC",
      "--dsw-alias-label-caption": "#6E8095",
      /* 滚动条悬停（轨道走原生） */
      "--dsw-alias-scrollbar-hover-l1": "#5CC8FF",
      "--dsw-alias-scrollbar-hover-l2": "#8AD9FF",
      /* 状态色：todo=淡紫（extra 覆盖）/ queue=冰蓝 / warn=金 / error=赤红 */
      "--dsw-alias-state-business-primary": "#5CC8FF",
      "--dsw-alias-state-error-primary": "#FF3B5C",
      "--dsw-alias-state-error-secondary": "#FF7A8F",
      "--dsw-alias-state-success-primary": "#00FF88",
      "--dsw-alias-state-success-secondary": "#7DFFB0",
      "--dsw-alias-state-warn-label": "#FFC857",
      "--dsw-alias-state-warn-primary": "#FFC857",
      "--dsw-alias-state-warn-secondary": "#FFDD8A",
      /* 侧栏激活强调条 */
      "--dsw-specific-sidebar-nav-item-active-accent": "#5CC8FF",
      /* 字体：沿用赛博霓虹基线配对 */
      "--dsw-font-family":
        '"Space Grotesk","DM Sans","IBM Plex Sans",-apple-system,"Segoe UI","PingFang SC","Hiragino Sans GB","Microsoft YaHei","Helvetica Neue",Helvetica,Arial,sans-serif',
      "--ds-font-family-code":
        '"JetBrains Mono","Fira Code","Cascadia Code","SF Mono",Consolas,"Liberation Mono",Menlo,"PingFang SC","Microsoft YaHei",monospace'
    };

    /** hex → "r,g,b"（构建器 rgba() 辉光用）。 */
    function hexRgb(hex) {
      const h = hex.replace("#", "");
      return parseInt(h.slice(0, 2), 16) + "," + parseInt(h.slice(2, 4), 16) + "," + parseInt(h.slice(4, 6), 16);
    }

    /**
     * 霓虹族特效构建器：结构复用赛博霓虹基线（FX_NEON 的家族签名——渐变描边 /
     * 玻璃底 / CRT flicker / 流式扫光 / 会话状态框体 / 四通道阵列），色值全部直读
     * 调色板令牌（单一色彩源，design.md 决策 1）；extra 仅承载令牌表达不了的键：
     * name（注释名）/ thumb（滚动条静态暗调）/ todo（通道色，缺省 = success 语义色）/
     * chrome（Y2K 金属高光）。
     * 概念层（concept-layer.md §2）：虫洞 compaction 通道 / 引用门户环 / 神经元点火 /
     * 菌丝生长神经干 / 涌现绽放——全部一次性入场动画；常驻循环仅家族既有签名
     * （vFlicker CRT flicker / vScan 流式扫光）。prefers-reduced-motion 全量可关。
     */
    function buildNeonFX(P, extra) {
      const primary = P["--dsw-alias-brand-primary"];
      const partner = P["--dsw-alias-label-primary-bluish"];
      const business = P["--dsw-alias-state-business-primary"];
      const success = P["--dsw-alias-state-success-primary"];
      const success2 = P["--dsw-alias-state-success-secondary"];
      const error = P["--dsw-alias-state-error-primary"];
      const error2 = P["--dsw-alias-state-error-secondary"];
      const warn = P["--dsw-alias-state-warn-primary"];
      const secondary = P["--dsw-alias-label-secondary"];
      const caption = P["--dsw-alias-label-caption"];
      const todo = extra.todo || success;
      const rgbP = hexRgb(primary);
      const rgbB = hexRgb(partner);
      const rgbS = hexRgb(success);
      const rgbE = hexRgb(error);
      const rgbT = hexRgb(todo);
      return `/* dsh-v-theme: ${extra.name} 特效层（buildNeonFX 生成 · 概念层：虫洞/神经/涌现/菌丝） */
body.${BODY_CLASS}{
  --dsh-scrollbar-thumb:${extra.thumb};
  --dsh-scrollbar-thumb-hover:${primary};
  --dsw-shadow-lv1:0 0 1px ${primary}59;
  --dsw-shadow-lv1-blur:0 0 10px ${primary}14;
  --dsw-shadow-lv2:0 0 1px ${business}4D,0 4px 20px ${business}1A;
  --dsw-shadow-lv3:0 0 1px ${primary}73,0 16px 40px #0A0A0Ce6,0 0 32px ${primary}26;
  --shiki-token-constant:${business};
  --shiki-token-string:${success};
  --shiki-token-comment:${caption};
  --shiki-token-keyword:${primary};
  --shiki-token-parameter:${warn};
  --shiki-token-function:${business};
  --shiki-token-string-expression:${success2};
  --shiki-token-punctuation:${secondary};
  --shiki-token-link:${business};
}
/* 全屏扫描线覆膜 / ASCII ticker / 区域辉光均已移除（清晰度优先：只妆组件，不刷区域） */
body.${BODY_CLASS} ::selection{background:${primary}59;color:#FFFFFF;text-shadow:none}
body.${BODY_CLASS} :is(textarea,input,[contenteditable=true]){caret-color:${primary}}
body.${BODY_CLASS} *:focus-visible{outline:1px solid ${primary};outline-offset:1px;box-shadow:0 0 10px ${primary}66}
body.${BODY_CLASS} a{color:${business};text-shadow:0 0 10px rgba(${rgbB},.25)}
body.${BODY_CLASS} pre{box-shadow:inset 2px 0 0 ${primary}40}
body.${BODY_CLASS} :is(h1,h2,h3){animation:vFlicker 9s steps(1) infinite}
@keyframes vFlicker{0%,100%{opacity:1}3%{opacity:.86}4%{opacity:1}47%{opacity:1}48%{opacity:.92}49%{opacity:1}}

/* P0 · 用户气泡：primary→partner 虫洞渐变描边（双层 background）+ 氛围光 */
body.${BODY_CLASS} [data-chat-flow-kind="user"] [class*="bubble"]{
  border:1px solid transparent;
  border-radius:16px;
  background:
    linear-gradient(var(--dsw-specific-bubble),var(--dsw-specific-bubble)) padding-box,
    linear-gradient(135deg,${primary},${partner}) border-box;
  box-shadow:0 0 20px rgba(${rgbP},.14);
}

/* P0 · 助手消息：菌丝神经干（渐变线 + 一次性生长入场） */
body.${BODY_CLASS} [data-chat-flow-kind="assistant"]{position:relative;padding-left:10px}
body.${BODY_CLASS} [data-chat-flow-kind="assistant"]::before{
  content:"";
  position:absolute;
  left:0;top:0;bottom:0;
  width:2px;
  background:linear-gradient(180deg,${partner}33,${partner});
  transform-origin:top;
  animation:vGrow .5s ease-out 1;
  pointer-events:none;
}
@keyframes vGrow{from{transform:scaleY(.2);opacity:.3}to{transform:scaleY(1);opacity:1}}

/* P0 · 工具卡：玻璃底 + 渐变辉光描边；运行 = partner / 结果 = success / 出错 = error */
body.${BODY_CLASS} [data-chat-flow-kind="tool-call"] [class*="callRow"],
body.${BODY_CLASS} [data-chat-flow-kind="tool-call"] > div > div{
  position:relative;
  backdrop-filter:blur(6px);
  -webkit-backdrop-filter:blur(6px);
  border:1px solid transparent;
  border-radius:12px;
  background:
    linear-gradient(rgba(21,21,23,.72),rgba(21,21,23,.72)) padding-box,
    linear-gradient(135deg,${partner}59,${primary}40) border-box;
  box-shadow:0 0 16px rgba(${rgbB},.10);
}
body.${BODY_CLASS} [data-chat-flow-kind="tool-result"] [class*="callRow"],
body.${BODY_CLASS} [data-chat-flow-kind="tool-result"] > div > div{
  background:
    linear-gradient(rgba(21,21,23,.72),rgba(21,21,23,.72)) padding-box,
    linear-gradient(135deg,${success}59,${partner}40) border-box;
}
body.${BODY_CLASS} [data-chat-flow-kind="tool-result"][data-error] [class*="callRow"],
body.${BODY_CLASS} [data-chat-flow-kind="tool-result"][data-error] > div > div{
  background:
    linear-gradient(rgba(21,21,23,.72),rgba(21,21,23,.72)) padding-box,
    linear-gradient(135deg,${error}73,${primary}40) border-box;
  box-shadow:0 0 16px rgba(${rgbE},.16);
}

/* 概念层 · 神经元点火：结果卡入场一次性突触脉冲（成功绿 / 出错赤红，语义不混） */
body.${BODY_CLASS} [data-chat-flow-kind="tool-result"]:not([data-error]) [class*="callRow"],
body.${BODY_CLASS} [data-chat-flow-kind="tool-result"]:not([data-error]) > div > div{
  animation:vSynapse .6s ease-out 1;
}
body.${BODY_CLASS} [data-chat-flow-kind="tool-result"][data-error] [class*="callRow"],
body.${BODY_CLASS} [data-chat-flow-kind="tool-result"][data-error] > div > div{
  animation:vSynapseE .6s ease-out 1;
}
@keyframes vSynapse{0%{box-shadow:0 0 0 0 rgba(${rgbS},.45)}100%{box-shadow:0 0 18px rgba(${rgbS},0)}}
@keyframes vSynapseE{0%{box-shadow:0 0 0 0 rgba(${rgbE},.45)}100%{box-shadow:0 0 18px rgba(${rgbE},0)}}

/* P0 · Composer 卡片：primary→partner 渐变描边 + 聚焦氛围光 + 内部径向光 */
body.${BODY_CLASS} [data-composer-card]{
  border:1px solid transparent;
  background:
    ${extra.chrome ? "linear-gradient(180deg,rgba(255,255,255,.12),transparent 55%)," : ""}radial-gradient(ellipse at top,rgba(${rgbP},.08),transparent 70%),
    linear-gradient(var(--dsw-specific-input-major),var(--dsw-specific-input-major)) padding-box,
    linear-gradient(135deg,${primary}40,${partner}40) border-box;
  box-shadow:0 0 18px rgba(${rgbP},.10);
  transition:box-shadow .25s;
}
body.${BODY_CLASS} [data-composer-card]:focus-within{
  box-shadow:0 0 28px rgba(${rgbP},.24);
}
${extra.chrome ? `/* 概念层 · Y2K 金属高光：swatch 珠粒镀铬（设计决策：不触官方按钮结构，不伤文字对比度） */
body.${BODY_CLASS} .vDots i{position:relative;overflow:hidden}
body.${BODY_CLASS} .vDots i::after{
  content:"";
  position:absolute;
  left:0;top:0;right:0;
  height:55%;
  background:linear-gradient(180deg,rgba(255,255,255,.28),transparent);
  pointer-events:none;
}
` : ""}/* P0 · 代码块：左缘 primary 强化（底色走原生） */
body.${BODY_CLASS} pre{
  border:1px solid ${primary}26;
  box-shadow:inset 3px 0 0 ${primary}66;
}

/* 行内 code / 文件地址：primary 胶囊（bg primary 14% + 65/35 提亮主色字；战术面板行内 code 配方同源，七案统一） */
body.${BODY_CLASS} [data-conversation-scroll] :not(pre) > code{
  background:rgba(${rgbP},.14);
  color:color-mix(in srgb, ${primary} 65%, #FFFFFF);
  border-radius:3px;
  padding:.1em .35em;
}

/* P0 · 会话运行状态条 → business 通道 card（四通道同色贯穿） */
body.${BODY_CLASS} [class*="turnStatus"]{
  background:transparent;
  color:${business};
  -webkit-text-fill-color:${business};
  text-shadow:0 0 10px rgba(${rgbB},.45);
  border:1px solid ${business}40;
  border-radius:10px;
  box-shadow:0 0 12px rgba(${rgbB},.12);
  padding:2px 10px;
}

/* P1 · 引用 chip：虫洞渐变胶囊 + 尾端门户环（::before） */
body.${BODY_CLASS} [data-ref-chip]{
  border:1px solid transparent;
  border-radius:999px;
  position:relative;
  padding-right:18px;
  background:
    linear-gradient(rgba(42,26,42,.6),rgba(42,26,42,.6)) padding-box,
    linear-gradient(135deg,${primary}59,${partner}59) border-box;
}
body.${BODY_CLASS} [data-ref-chip]::before{
  content:"";
  position:absolute;
  right:8px;top:50%;
  margin-top:-3px;
  width:6px;height:6px;
  border-radius:50%;
  border:1px solid ${partner};
  box-shadow:0 0 6px rgba(${rgbB},.5);
  pointer-events:none;
}

/* 概念层 · 虫洞通道：compaction = 上下文折叠（primary→partner→primary 竖向隧道；
   金色让渡给审批专用，与 concept-layer.md §2.2 一致） */
body.${BODY_CLASS} [data-chat-flow-kind="compaction"]{position:relative;padding-left:10px}
body.${BODY_CLASS} [data-chat-flow-kind="compaction"]::before{
  content:"";
  position:absolute;
  left:0;top:0;bottom:0;
  width:3px;
  background:linear-gradient(180deg,${primary},${partner},${primary});
  box-shadow:0 0 10px rgba(${rgbP},.35);
  pointer-events:none;
}

/* P2 · 流式/思考中：涌现绽放（一次性）+ 顶部 primary→partner 扫光（家族签名） */
body.${BODY_CLASS} [data-streaming]{position:relative;animation:vEmerge .7s ease-out 1}
@keyframes vEmerge{from{opacity:.55}to{opacity:1}}
body.${BODY_CLASS} [data-streaming]::before{
  content:"";
  position:absolute;
  top:0;left:0;right:0;
  height:2px;
  background:linear-gradient(90deg,transparent,${primary},${partner},transparent);
  animation:vScan 3s linear infinite;
  pointer-events:none;
}
@keyframes vScan{
  0%{transform:scaleX(0);transform-origin:left}
  50%{transform:scaleX(1);transform-origin:left}
  51%{transform:scaleX(1);transform-origin:right}
  100%{transform:scaleX(0);transform-origin:right}
}

/* P2 · 审批面板：金色顶边（跨色板恒定的指挥锚点） */
body.${BODY_CLASS} [data-approval-scroll]{
  border:1px solid #FFC85740;
  border-top:3px solid #FFC857;
  border-radius:12px;
}

/* ═══ 会话行状态框体（家族共享机制）：ongoing=进行中 / warning=待交互 / 完成=标记亮绿 ═══ */
body.${BODY_CLASS} [class*="sessionRow"]:has([data-state="ongoing"]){
  box-shadow:inset 3px 0 0 ${business};
  background-image:linear-gradient(rgba(${rgbB},.06),rgba(${rgbB},.06));
}
body.${BODY_CLASS} [class*="sessionRow"]:has([data-state="warning"]){
  box-shadow:inset 3px 0 0 #FFC857;
  background-image:linear-gradient(rgba(255,200,87,.06),rgba(255,200,87,.06));
}
/* 进行中的矩阵像素点换成 business 通道色（官方该点着色走 --dsh-state-ongoing） */
body.${BODY_CLASS} [data-state="ongoing"]{--dsh-state-ongoing:${business}}
/* 完成（区别于空闲静默）：恒定亮绿 #00FF88（跨主题锚点，由标签扫描挂 data-v-completed 精确区分） */
body.${BODY_CLASS} [class*="sessionRow"][data-v-completed]{
  box-shadow:inset 3px 0 0 #00FF88;
  background-image:linear-gradient(rgba(0,255,136,.06),rgba(0,255,136,.06));
}
body.${BODY_CLASS} [class*="sessionRow"][data-v-completed] [data-state="done"]{color:#00FF88}

/* ═══ 四色通道阵列（todo=success 语义色或 extra.todo / queue=business / 审批=金 / 错误=error） ═══ */

/* 通道 1 · Todo 面板：todo 通道 */
body.${BODY_CLASS} [data-testid="todo-panel"]{
  border:1px solid ${todo}40;
  border-radius:10px;
  box-shadow:0 0 15px rgba(${rgbT},.10);
  background:rgba(21,21,23,.72);
}
body.${BODY_CLASS} [data-testid="todo-panel"] :is(h1,h2,h3,h4,strong,[class*="title"]){
  color:${todo};
  text-shadow:0 0 12px rgba(${rgbT},.4);
}
body.${BODY_CLASS} [data-testid="todo-panel"] [class*="check"],body.${BODY_CLASS} [data-testid="todo-panel"] [class*="done"]{
  color:${todo};
  filter:drop-shadow(0 0 4px rgba(${rgbT},.5));
}

/* 通道 2 · 队列 dock：business */
body.${BODY_CLASS} [data-queue-dock]{
  border:1px solid ${business}40;
  border-radius:10px;
  box-shadow:0 0 15px rgba(${rgbB},.10);
}
body.${BODY_CLASS} [data-queue-dock] > [class*="panel"]{
  background:rgba(21,21,23,.72);
  border:1px solid ${business}40;
  border-radius:10px;
}
body.${BODY_CLASS} [data-queue-dock] :is(strong,[class*="title"]){
  color:${business};
  text-shadow:0 0 12px rgba(${rgbB},.4);
}

/* 通道 3 · 审批面板：金（跨色板恒定） */
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

/* 通道 4 · 错误节点：error */
body.${BODY_CLASS} [data-chat-flow-kind="error"]{
  border-left:3px solid ${error};
  background:rgba(${rgbE},.07);
}
body.${BODY_CLASS} [data-chat-flow-kind="error"] [class*="turnErrorTitle"],
body.${BODY_CLASS} [data-chat-flow-kind="error"] [class*="turnErrorCopy"]{
  background:rgba(${rgbE},.14);
  color:${error2};
  border-radius:3px;
  padding:1px 6px;
  text-shadow:0 0 8px rgba(${rgbE},.35);
}

@media (prefers-reduced-motion:reduce){
  .vOn .vState::after{animation:none}
  body.${BODY_CLASS} :is(h1,h2,h3){animation:none}
  body.${BODY_CLASS} [data-streaming]{animation:none}
  body.${BODY_CLASS} [data-streaming]::before{animation:none}
  body.${BODY_CLASS} [data-chat-flow-kind="assistant"]::before{animation:none}
  body.${BODY_CLASS} [data-chat-flow-kind="tool-result"] [class*="callRow"],
  body.${BODY_CLASS} [data-chat-flow-kind="tool-result"] > div > div{animation:none}
}`;
    }

    /** 霓虹族逐案 extra：仅承载调色板令牌表达不了的键（todo 通道 / 金属高光 / 滚动条暗调）。 */
    const NEON_EXTRA = {
      outrun: { name: "日落公路", thumb: "#5C3A28" },
      vaporwave: { name: "梦核", thumb: "#523055" },
      "neon-violet": { name: "紫夜极光", thumb: "#3E2A5E", todo: "#FF4FA3" },
      "y2k-chrome": { name: "银翼千禧", thumb: "#5A2E44", todo: "#FF69B4", chrome: true },
      "blue-nocturne": { name: "蓝调夜曲", thumb: "#23405C", todo: "#9D7BFF" }
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
     * 主题注册表。每个主题：显示名（locale key）、选中 chips 的示意
     * 色点、调色板与特效层。七条目：赛博霓虹基线 + 五套霓虹色板
     * （buildNeonFX 生成）+ 战术面板 · 红蓝作战中心。
     */
    const THEMES = {
      neon: {
        id: "neon",
        labelKey: "v.theme.neon",
        swatch: ["#FF2E97", "#FF5CB0", "#4DA8FF"],
        palette: PALETTE_NEON,
        fx: FX_NEON,
        tokens: buildTokens(PALETTE_NEON)
      },
      outrun: {
        id: "outrun",
        labelKey: "v.theme.outrun",
        swatch: ["#FF6B35", "#B967FF", "#2DE2E6"],
        palette: PALETTE_OUTRUN,
        fx: buildNeonFX(PALETTE_OUTRUN, NEON_EXTRA.outrun),
        tokens: buildTokens(PALETTE_OUTRUN)
      },
      vaporwave: {
        id: "vaporwave",
        labelKey: "v.theme.vaporwave",
        swatch: ["#FF71CE", "#01CDFE", "#05FFA1"],
        palette: PALETTE_VAPORWAVE,
        fx: buildNeonFX(PALETTE_VAPORWAVE, NEON_EXTRA.vaporwave),
        tokens: buildTokens(PALETTE_VAPORWAVE)
      },
      "neon-violet": {
        id: "neon-violet",
        labelKey: "v.theme.neon-violet",
        swatch: ["#C07CFF", "#00E5FF", "#FF4FA3"],
        palette: PALETTE_NEON_VIOLET,
        fx: buildNeonFX(PALETTE_NEON_VIOLET, NEON_EXTRA["neon-violet"]),
        tokens: buildTokens(PALETTE_NEON_VIOLET)
      },
      "y2k-chrome": {
        id: "y2k-chrome",
        labelKey: "v.theme.y2k-chrome",
        swatch: ["#FF69B4", "#00E5FF", "#C0C0C0"],
        palette: PALETTE_Y2K_CHROME,
        fx: buildNeonFX(PALETTE_Y2K_CHROME, NEON_EXTRA["y2k-chrome"]),
        tokens: buildTokens(PALETTE_Y2K_CHROME)
      },
      "blue-nocturne": {
        id: "blue-nocturne",
        labelKey: "v.theme.blue-nocturne",
        swatch: ["#5CC8FF", "#9D7BFF", "#FF2E97"],
        palette: PALETTE_BLUE_NOCTURNE,
        fx: buildNeonFX(PALETTE_BLUE_NOCTURNE, NEON_EXTRA["blue-nocturne"]),
        tokens: buildTokens(PALETTE_BLUE_NOCTURNE)
      },
      tactical: {
        id: "tactical",
        labelKey: "v.theme.tactical",
        swatch: ["#56D4E0", "#00FF88", "#F0C239"],
        palette: PALETTE_TACTICAL,
        fx: FX_TACTICAL,
        tokens: buildTokens(PALETTE_TACTICAL)
      }
    };
    const THEME_LIST = [
      THEMES.neon,
      THEMES.outrun,
      THEMES.vaporwave,
      THEMES["neon-violet"],
      THEMES["y2k-chrome"],
      THEMES["blue-nocturne"],
      THEMES.tactical
    ];

    /* ------------------------------------------------------------------ *
     * 设置行样式（随插件常驻，跟随当前别名令牌自适应明暗）
     * ------------------------------------------------------------------ */

    const ROW_CSS = `/* dsh-v-theme: 设置 → 皮肤 分页的开关行 + 主题选择 */
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
/* 引擎点火：接入瞬间 ONLINE 文案步进揭幕（clip-path 不触发布局；每次 enable 播放一次） */
.vOn .vState{animation:vBoot 1s steps(12) 1}
@keyframes vBoot{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0 0 0)}}
.vSwitch{flex:none;width:34px;height:20px;border-radius:999px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);position:relative}
.vSwitch::after{content:"";position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;background:var(--dsw-alias-label-tertiary);transition:transform .2s,background .2s,box-shadow .2s}
.vOn .vSwitch{border-color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-interactive-bg-hover-accent)}
.vOn .vSwitch::after{transform:translateX(14px);background:var(--dsw-alias-brand-primary);box-shadow:0 0 8px var(--dsw-alias-brand-primary)}
.vThemesLabel{font-size:11px;color:var(--dsw-alias-label-tertiary);letter-spacing:.08em}
.vThemeRow{display:flex;flex-wrap:wrap;gap:8px}
.vChip{flex:1 1 calc(50% - 4px);display:inline-flex;align-items:center;gap:8px;padding:8px 10px;border:1px solid var(--dsw-alias-border-l2);border-radius:9px;background:var(--dsw-alias-bg-layer-1);font:inherit;font-size:12px;color:var(--dsw-alias-label-secondary);cursor:pointer;transition:border-color .2s,color .2s,box-shadow .2s}
.vChip:hover{border-color:var(--dsw-alias-border-l4);color:var(--dsw-alias-label-primary)}
.vChipOn{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-label-primary);box-shadow:0 0 8px var(--dsw-alias-interactive-bg-hover-accent)}
.vDots{display:inline-flex;gap:3px;flex:none}
.vDots i{width:8px;height:8px;border-radius:50%;display:block;box-shadow:0 0 4px currentColor}
.vDesc{font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary)}
@media (prefers-reduced-motion:reduce){.vOn .vState{animation:none}.vOn .vState::after{animation:none}}`;

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
      "v.theme.outrun": "日落公路",
      "v.theme.vaporwave": "梦核",
      "v.theme.neon-violet": "紫夜极光",
      "v.theme.y2k-chrome": "银翼千禧",
      "v.theme.blue-nocturne": "蓝调夜曲",
      "v.theme.tactical": "战术面板",
      "v.desc": "V 赛博主题：七套风格可切换——赛博霓虹（虫洞渐变基线）、日落公路 / 梦核 / 紫夜极光 / 银翼千禧 / 蓝调夜曲五套霓虹色板（含虫洞通道、神经元点火、菌丝生长、涌现绽放概念特效），以及战术面板 · 红蓝作战中心（蜂巢巢室、分形深度、态势雷达）。侧栏会话行随官方状态点亮框体：进行中=各案通道色、待交互=金、完成=亮绿、空闲静默退场。开启期间固定深色基底；在「外观」里切走深色会自动断开。"
    };
    const en = {
      "v.nav": "Skin",
      "v.title": "V CYBER",
      "v.state.on": "ONLINE",
      "v.state.off": "OFFLINE",
      "v.themeLabel": "STYLE",
      "v.theme.neon": "NEON",
      "v.theme.outrun": "Sunset Drive",
      "v.theme.vaporwave": "Dream Core",
      "v.theme.neon-violet": "Neon Violet",
      "v.theme.y2k-chrome": "Y2K Chrome",
      "v.theme.blue-nocturne": "Blue Nocturne",
      "v.theme.tactical": "TACTICAL",
      "v.desc": "V CYBER with seven switchable styles — NEON (the wormhole-gradient baseline), five neon colorways (Sunset Drive / Dream Core / Neon Violet / Y2K Chrome / Blue Nocturne, each with wormhole channel, synapse fire, mycelium growth and emergence-bloom concept effects), and TACTICAL (hive cells, fractal depth brackets, ops radar). Session rows light up with the official status: ongoing = per-colorway channel, waiting for you = gold, completed = bright green, idle = no frame. Pins the dark base palette while active."
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
     * 总开关 + 风格选择 + 描述，一页承载插件全部设置。
     */
    function VSkinSection({ t, useStore, toggle, setTheme }) {
      const enabled = useStore((s) => s.enabled);
      const themeId = useStore((s) => s.themeId);
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
          jsx("div", { className: "vDesc", children: t("v.desc") })
        ]
      });
    }

    /** 设置行状态：镜像「是否生效」与「当前主题」。 */
    const store = defineStore({
      init: () => ({ enabled: false, themeId: DEFAULT_THEME }),
      actions: {
        setEnabled(d, v) {
          d.enabled = !!v;
        },
        setThemeId(d, id) {
          d.themeId = id;
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
        document.body.classList.add(BODY_CLASS);
        if (!fxTag) {
          fxTag = document.createElement("style");
          fxTag.dataset.plugin = PLUGIN_ID;
          fxTag.dataset.pluginCss = PLUGIN_ID + "/cyber-fx.css";
          document.head.appendChild(fxTag);
        }
        fxTag.textContent = currentTheme().fx;
        armDoneObserver();
      }
      function disableFx() {
        if (typeof document === "undefined") return;
        disarmDoneObserver();
        document.body.classList.remove(BODY_CLASS);
        if (fxTag) {
          fxTag.remove();
          fxTag = null;
        }
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

      /* 恢复上次主题选择（须在槽位注册前——inject 回调会同步进 store）。 */
      themeId = readTheme();

      /* 清理已移除的辉光特性残留键（0.5.x 开过辉光的用户；失败静默）。 */
      try {
        storage?.removeItem("dsh-v-theme:glow");
      } catch {
        /* 隐私模式等存储异常：静默 */
      }

      /* 设置 → 皮肤：独立第一层分页，承载插件全部设置（开关/风格）。 */
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
              return {
                toggle: () => {
                  if (flagOn()) deactivate({ restore: true });
                  else activate(true);
                },
                setTheme: (id) => switchTheme(id)
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
