# V 概念层 · 赛博霓虹 × 红蓝作战中心

> 来源：概念词汇「分形空间 / 菌丝工坊 / 蜂巢 / 涌现引擎 / 虫洞 / 神经网络」的两套主题化转译，2026-09。
> 用途：dsh-v-theme 两套主题的**概念叙事层**——让配色之外的特效拥有统一的隐喻来源。
> 原则：概念不是贴纸。每个概念必须绑定**真实 DOM 语义**（DSH 本体就有：hive 蜂巢工作区、agent 涌现、递归子代理树、上下文折叠、流式生成），做到「隐喻即功能说明」。
> 约束继承：背景族禁入、只妆组件、alpha 阶梯（palette-tactical.md §2）、reduced-motion 全量可关。

---

## 0 · 命名决议

| 主题 | 旧名 | 新名 | 说明 |
|---|---|---|---|
| `neon` | 赛博霓虹 '84 | **赛博霓虹**（en: NEON） | 摆脱「1984 复古」的年代锚定，粉×蓝渐变本身就是身份；渐变在概念层获得语义：**粉→蓝 = 虫洞**。主题 id 保持 `neon` 不变（localStorage `THEME_KEY` 兼容），仅改 labelKey 文案与 swatch 不动 |
| `tactical` | 战术面板 | **战术面板 · 红蓝作战中心**（en: TACTICAL） | 名字保留，概念升级：参照稿 的红蓝双栏（红队 C2 / 蓝队检测流）从「参照元素」升格为「组织原则」 |

---

## 1 · 概念分配总表（六个词汇，两套主题，互不重叠）

| 概念 | 赛博霓虹 | 红蓝作战中心 | 差异化理由 |
|---|---|---|---|
| **虫洞** | ✅ 签名概念：粉→蓝渐变 = 虫洞隧道 | — | 渐变隧道是柔性的、空间的，属于霓虹系 |
| **神经网络** | ✅ 突触发光语言 | — | 霓虹 = 神经辉光；作战中心用几何语言 |
| **涌现引擎** | ✅ 涌现绽放（流式） | ✅ 引擎点火（boot 序列） | 同一概念两种表达：生物性的「浮现」 vs 机械性的「点火」 |
| **菌丝工坊** | ✅ 菌丝生长线 | — | 有机蔓延属于柔性系 |
| **蜂巢** | — | ✅ 六边形状态板 | 六边形 = 巢室 = 战术格位，几何系 |
| **分形空间** | — | ✅ 递归深度角标 | 自相似缩角 = 指挥层级，几何系 |
| （新增）**红蓝对抗** | — | ✅ 组织原则：双通道语义 | 见 §3.2 |

---

## 2 · 赛博霓虹 · 概念层

### 2.1 身份陈述

> 「赛博霓虹」不是八十年代怀旧，而是一套**生物霓虹系统**：信息沿神经干流动（神经网络），在突触处点亮（涌现），穿过虫洞折叠空间（上下文压缩），像菌丝一样在对话里蔓延（嵌套子代理）。

色板核心不变：`#FF2E97` × `#4DA8FF`，135deg 渐变现获得专名——**虫洞渐变**。

### 2.2 虫洞（签名概念）

| 落点 | 语义 | 表达 |
|---|---|---|
| `compaction` 节点 | 上下文折叠 = 空间折叠 | 金色左缘条 → **虫洞通道**：竖向 `粉→蓝→粉` 渐变 3px 条 + 同色辉光；金色从此只属于审批（语义更纯） |
| `[data-ref-chip]` 引用 | 虫洞锚点 | 现有渐变胶囊 + 尾端 6px **门户环**（1px 空心圆 + 辉光） |
| `[data-queue-dock]` 队列 | 隧道序列 | 队列项左缘 6px 渐变短划（虫洞中的等候序列） |

### 2.3 神经网络

| 落点 | 语义 | 表达 |
|---|---|---|
| 助手消息左缘 | 神经干 | 静态 2px 内嵌线 → 渐变神经干（上实下淡），消息出现时**生长**（见菌丝 §2.5，同一配方双重语义） |
| `tool-result` 卡片 | 神经元点火 | 新节点挂载时一次性 `box-shadow` 扩散脉冲（绿→透明 .6s）——结果返回 = 突触放电，纯 CSS（新元素入场动画），零 JS |
| `[data-variant="think"]` | 思考回路 | 左缘改 1px **虚线**（信号尚未固化），正文提亮保持现值 |

### 2.4 涌现引擎（绽放版）

| 落点 | 语义 | 表达 |
|---|---|---|
| `[data-streaming]` | 内容涌现 | 保留顶部扫光；容器入场加一次性 `opacity .55→1` 绽放（.7s，transform/opacity only） |
| 设置行 ONLINE | 引擎上线 | 现有 `▮` 光标闪烁保留；ONLINE 文案加一次性 fade-up |

### 2.5 菌丝工坊

| 落点 | 语义 | 表达 |
|---|---|---|
| 助手消息入场 | 菌丝生长 | 神经干 `transform-origin:top; scaleY(.2)→1`（.5s 一次性）——与 §2.3 神经干同一元素，生长即神经延伸 |
| 嵌套工具卡 | 菌丝分支 | 内层 `tool-call` 的左缘线与外层视觉连续（同色系透明度递减 .5 档），子代理调用 = 菌丝分枝 |

### 2.6 配方（copy-paste 级，选择器均已对照 lib/client.js 现状）

```css
/* 虫洞通道：compaction 金条 → 粉蓝渐变竖隧道 */
body.v-cyber [data-chat-flow-kind="compaction"]{position:relative;padding-left:10px}
body.v-cyber [data-chat-flow-kind="compaction"]::before{
  content:"";position:absolute;left:0;top:0;bottom:0;width:3px;
  background:linear-gradient(180deg,#FF2E97,#4DA8FF,#FF2E97);
  box-shadow:0 0 10px rgba(255,46,151,.35);
}

/* 门户环：引用 chip 尾端锚点（::before 当前空闲） */
body.v-cyber [data-ref-chip]{position:relative}
body.v-cyber [data-ref-chip]::before{
  content:"";position:absolute;right:8px;top:50%;margin-top:-3px;
  width:6px;height:6px;border-radius:50%;
  border:1px solid #4DA8FF;box-shadow:0 0 6px rgba(77,168,255,.5);
}

/* 神经元点火：结果卡入场一次性突触脉冲（新节点自动播放，零 JS） */
body.v-cyber [data-chat-flow-kind="tool-result"] [class*="callRow"]{animation:vSynapse .6s ease-out 1}
@keyframes vSynapse{0%{box-shadow:0 0 0 0 rgba(0,255,136,.45)}100%{box-shadow:0 0 18px rgba(0,255,136,0)}}

/* 菌丝生长 / 神经干：助手左缘线（替换 inset box-shadow 静态线） */
body.v-cyber [data-chat-flow-kind="assistant"]{position:relative}
body.v-cyber [data-chat-flow-kind="assistant"]::before{
  content:"";position:absolute;left:0;top:0;bottom:0;width:2px;
  background:linear-gradient(180deg,#4DA8FF33,#4DA8FF);
  transform-origin:top;animation:vGrow .5s ease-out 1;
}
@keyframes vGrow{from{transform:scaleY(.2);opacity:.3}to{transform:scaleY(1);opacity:1}}

/* 涌现绽放：流式容器入场 */
body.v-cyber [data-streaming]{animation:vEmerge .7s ease-out 1}
@keyframes vEmerge{from{opacity:.55}to{opacity:1}}
```

### 2.7 色板从属关系（随更名调整）

| 分册 | 处置 |
|---|---|
| A Miami（基线） | **赛博霓虹默认色板**（名字即色板） |
| C Vaporwave / E Y2K | 粉色主导 → **同族色调分册**（可上） |
| B Outrun / D Neon Violet / F Blue Nocturne | 橙/紫主色偏离「粉蓝」之名 → **归档为未来季节限定**（启用时另起名，不占用赛博霓虹身份） |

---

## 3 · 战术面板 · 红蓝作战中心

### 3.1 身份陈述

> DSH 会话区就是一块**攻防态势板**：agent 执行 = 蓝队行动（防御、稳定、监控），错误与警报 = 红队信号（对抗、突破、异常），审批 = 指挥权在你手里（DEFCON 黄）。参照稿 的红蓝双栏从参照稿升格为整套主题的组织原则。

### 3.2 红蓝双通道语义表（组织原则）

| 通道 | 色 | 语义 | 落点（现行 → 概念化） |
|---|---|---|---|
| **蓝队** | SOC 青 `#56D4E0` / 青蓝 `#00D4FF` | 防御 · 执行 · 监控 | 运行中工具卡顶边（青→青蓝）、队列、主操作——语义不变，叙事升格「蓝队行动中」 |
| **红队** | SOC 红 `#FF7B72` + CRIT 品红 `#FF00FF`（特权） | 对抗 · 警报 · 异常 | 出错顶边（赤红→品红）+ 1.2s 一次性**警报扫频**（亮度 1.6→1）；错误节点品红通道保持 |
| **指挥** | DEFCON 黄 `#F0C239` | 指挥权归属 | 审批面板金顶边 = 「该你了」；语义不动 |
| **战果** | FUI 绿 `#00FF88` | 归档 · 成功 | 完成态绿条保持（跨主题语义锚点） |

规则：红蓝同框只发生在**同一张卡的状态迁移**上（运行蓝 → 出错红），不做红蓝装饰性混排——对抗感来自状态翻转，不来自花纹。

### 3.3 蜂巢

| 落点 | 语义 | 表达 |
|---|---|---|
| `[data-queue-dock]` | 巢室序列 | 标题前置 8px **六边形巢室点**（参照稿 dot-hex 配方，青色）——排队中的 agent 是待入巢的蜂 |
| `[data-testid="todo-panel"]` | 任务巢房 | 完成项 check 前 6px 小六边形（绿） |
| 会话行 warning | 巢门信号 | 待交互行沿用金条；金条端点加 4px 六边形端子（可选项） |

### 3.4 分形空间

| 落点 | 语义 | 表达 |
|---|---|---|
| 嵌套工具卡（子代理再调工具） | 递归深度 | 外层 flow item 含内层 flow item 时（`:has()` 检测，与状态框体同款降级策略）：L 角标 11px→**7px 自相似缩小**、边宽 2→1px、透明度 .6→.45——层级越深，角标越小，指挥链一目了然 |
| 代码块 | 分形边界 | 保持现有 banner 深一档 + 青左缘，不加动效（分形是静态几何语言） |

### 3.5 涌现引擎（点火版）

| 落点 | 语义 | 表达 |
|---|---|---|
| 设置行接入 | 引擎点火 | ONLINE 文案一次性 `clip-path inset` 步进揭幕（1s steps(12)，打字机感；clip-path 动画不触发布局，符合自家的 transform/opacity 精神） |
| `[data-queue-dock]` | 态势雷达 | 面板内 conic-gradient 扫描扇（8s/圈，alpha .10 封顶，reduced-motion 关）——参照稿 radar 面板的组件级转世 |

### 3.6 配方（copy-paste 级）

```css
/* 红队警报扫频：出错顶边一次性亮度脉冲 */
body.v-cyber [data-chat-flow-kind="tool-result"][data-error] [class*="callRow"]::before{
  animation:vAlertSweep 1.2s ease-out 1;
}
@keyframes vAlertSweep{from{filter:brightness(1.6)}to{filter:brightness(1)}}

/* 蜂巢巢室点：队列面板标题前置六边形 */
body.v-cyber [data-queue-dock] :is(strong,[class*="title"])::before{
  content:"";display:inline-block;width:8px;height:8px;margin-right:6px;vertical-align:middle;
  clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);
  background:#00D4FF;box-shadow:0 0 6px #00D4FF;
}

/* 分形深度：含子行动单元的外层卡，角标自相似缩小（:has() 不支持则整体退化，与状态框体同策略） */
body.v-cyber [data-chat-flow-kind="tool-call"]:has([data-chat-flow-kind])::after,
body.v-cyber [data-chat-flow-kind="tool-result"]:has([data-chat-flow-kind])::after{
  width:7px;height:7px;border-width:1px;opacity:.45;
}

/* 引擎点火：ONLINE 文案步进揭幕 */
.vOn .vState{animation:vBoot 1s steps(12) 1}
@keyframes vBoot{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0 0 0)}}

/* 态势雷达：队列面板扫描扇 */
body.v-cyber [data-queue-dock] > [class*="panel"]{position:relative;overflow:hidden}
body.v-cyber [data-queue-dock] > [class*="panel"]::before{
  content:"";position:absolute;inset:-40%;pointer-events:none;
  background:conic-gradient(from 0deg,rgba(0,212,255,.10),transparent 28%);
  animation:vRadar 8s linear infinite;
}
@keyframes vRadar{to{transform:rotate(360deg)}}
```

---

## 4 · 共同规则与落地清单

### 共同规则
1. 全部概念特效为**一次性入场动画**（`.5–.7s`）或**低频环境动画**（雷达 8s），禁常驻循环高亮；`prefers-reduced-motion` 全量 `animation:none`。
2. alpha 不破阶梯：辉光 ≤.15（hover .4 特权不变），雷达扇 .10，神经干渐变端 ≤.2。
3. 概念词不进 UI 文案（按钮、提示语照常说话）；概念只活在视觉层与设置页描述里。
4. 反模式清单（palette-tactical.md §7）继续全量适用。

### 落地清单（green-light 后执行）
- [ ] `lib/client.js`：locale 更名 `v.theme.neon` → zh「赛博霓虹」/ en "NEON"；tactical 文案加「红蓝作战中心」副题（**主题 id 不动**，localStorage 兼容）
- [ ] `FX_NEON` 追加 §2.6 配方块 + reduced-motion 补条目
- [ ] `FX_TACTICAL` 追加 §3.6 配方块 + reduced-motion 补条目
- [ ] compaction 金条 → 虫洞通道（赛博霓虹侧）；融合侧金条不动（指挥语义）
- [ ] README 两主题签名描述更新
- [ ] `tests/check-statusrow.cjs` 跑通回归（概念层不触碰状态框体选择器）
