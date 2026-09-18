# V 调色板 · Tactical 设计语言

> 来源：`本地参照稿（不入仓库）`（APT 紫队工具 · Tactical 模式）的完整视觉提炼。
> 用途：dsh-v-theme 及后续增量设计的**唯一色彩与线条参照**。
> 原则：**SOC 克制基底 + FUI 霓虹点睛 + 语义色信息编码**——三层各司其职，永不混用。

---

## 1 · 色彩三层体系

### 1.1 SOC 基底层（大面积 · AAA 对比度 · 永不做强调）

| 变量 | 色值 | 对比度 | 用途 |
|---|---|---|---|
| `--bg` | `#0a0e14` | — | 页面/应用底色 |
| `--surface` | `#131820` | — | 一级卡片、导航条 |
| `--surface2` | `#1e2530` | — | 二级表面、表格 hover、tab hover |
| `--text` | `#e8ecf1` | **14.3:1** | 主文本 |
| `--secondary` | `#a8b2c1` | **7.3:1** | 次文本、标签、表头 |
| `--border` | `#2e3848` | — | 全部实线边框（1px） |

**规则**：基底四色（bg/surface/text/border）负责 90% 的画面面积；任何强调色不得用作大面积背景。

### 1.2 FUI 霓虹强调层（只点睛 · 分工明确）

| 变量 | 色值 | 对比度 | 语义角色 | 禁忌 |
|---|---|---|---|---|
| `--primary` | `#56d4e0` SOC 青 | 9.5:1 | **主操作色**：logo、active tab、focus 环、主按钮、状态点(蓝) | 不做危险/成功语义 |
| `--accent` | `#00FF88` FUI 绿 | — | **健康态**：Hero 标题、boot 序列、成功 | 不做交互 hover |
| `--accent2` | `#FF00FF` FUI 品红 | — | **最强强调**：AGREEMENT 卡、magenta 面板、CRIT glitch 辅色 | **全页至多 1-2 处** |
| `--accent3` | `#00D4FF` FUI 青蓝 | — | **信息/蓝队**：radar 面板、信息链接、数据高亮 | 与 primary 区分：primary=操作，accent3=信息 |

### 1.3 语义状态层（信息编码 · 全部 ≥7:1）

| 变量 | 色值 | 对比度 | 语义 |
|---|---|---|---|
| `--green` | `#5ddb72` | 8.2:1 | 在线/成功/LOW |
| `--red` | `#ff7b72` | 7.1:1 | 失败/红队/HIGH |
| `--crit` | `#FF3366` FUI 赤红 | — | **CRITICAL 专属**（唯一允许 glitch 动画的颜色） |
| `--yellow` | `#f0c239` | 10.1:1 | 警告/MEDIUM/DEFCON 标签/计时数值 |

**四层取用规则**：新增任何 UI 元素前，先问语义（操作？状态？信息？警告？）→ 对号入座取色 → **禁止新造色相**。

---

## 2 · 透明度阶梯（alpha 全部约定值，禁自造）

| 用途 | alpha | 示例 |
|---|---|---|
| sev 胶囊底 | **.14–.20** | `rgba(255,51,102,.2)` CRITICAL / `.15` HIGH·MEDIUM·LOW |
| 面板辉光（静态） | **.08–.15** | `0 0 15px rgba(0,255,136,.15)` |
| 边框辉光（静态） | **.08–.10** | `0 0 15px rgba(0,212,255,.1)` |
| 大面积氛围光 | **.04–.10** | hero 顶部 `rgba(0,212,255,.08)` |
| text-shadow 辉光 | **.3–.5** | `0 0 8px rgba(86,212,224,.4)` |
| 扫描线 | **.015–.04** | hero 内 `rgba(86,212,224,.04)` |
| hover 点亮（唯一高值） | **.4** | `.neon-pulse:hover 0 0 25px rgba(0,255,136,.4)` |
| DEFCON 未激活 | **.3** | `.defcon-level{opacity:.3}` |

---

## 3 · 线条与形状语言

### 3.1 边框

| 样式 | 规格 | 用途 |
|---|---|---|
| **实线 1px** | `1px solid var(--border)` | 所有卡片/面板/表格的默认边 |
| **顶边强调 3px** | `border-top: 3px solid <语义色>` | 多色身份编码（红蓝队卡、LLM 三栏） |
| **左缘线** | `box-shadow: inset 3px 0 0 <色>` 或 border-left 3px | 分区、错误条、DEFCON 条 |
| **HUD L 角标** | `::before/::after` 16px、`border:2px solid var(--accent)`、只留两边 | FUI 面板（top-left + bottom-right 一对） |
| **HUD 短角标** | 10-12px 缩版、opacity .55-.6 | 密集卡片场景 |

### 3.2 切角（clip-path）

```css
/* 大切角 16px（面板/统计卡/Composer/Hero） */
clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px));
/* 小切角 8px（三栏内卡） */
clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));
```

**规则**：切角元素的外发光必须用 `filter: drop-shadow(...)`（跟随裁剪形状），**禁用 box-shadow**（会被裁掉）。切角元素 `border-radius: 2-4px`（近直角），与 SOC 圆角卡片区分。

### 3.3 圆角体系

| 半径 | 用途 |
|---|---|
| `--radius: 12px` | SOC 卡片（红蓝队、LLM 面板、metric 卡） |
| `4px` | badge、sev 标签、HUD 面板 |
| `3px` | sev 标签、小元素 |
| `2px` | 切角元素、数据行 |
| `999px` / `50%` | 状态灯、进度条 |

### 3.4 分隔线

- 表格行：`border-bottom: 1px solid rgba(46,56,72,.5)`（border 的 50% 透明）
- 状态条分隔符：文字 `|`，色 = `--border`

---

## 4 · 点睛元素配方（copy-paste 级）

### 4.1 状态灯（6px 圆点 + 同色辉光）

```css
.status-light { width:6px; height:6px; border-radius:50%; }
.status-active  { background:var(--green); box-shadow:0 0 4px var(--green); }
.status-dormant { background:var(--yellow); }
.status-lost    { background:var(--red); }
```

### 4.2 六边形点（8px clip-path + 同色辉光）

```css
.dot-hex {
  width:8px; height:8px;
  clip-path: polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);
  background:var(--accent); box-shadow:0 0 6px var(--accent);
}
```

### 4.3 sev 分级胶囊（同色 15-20% 底 + 同色字）

```css
.sev { padding:1px 6px; border-radius:3px; font-size:10px; font-weight:700; }
.sev-CRITICAL { background:rgba(255,51,102,.2);  color:var(--crit);  }
.sev-HIGH     { background:rgba(255,123,114,.15); color:var(--red);   }
.sev-MEDIUM   { background:rgba(240,194,57,.15);  color:var(--yellow);}
.sev-LOW      { background:rgba(93,219,114,.15);  color:var(--green); }
```
CRITICAL 追加 `.glitch-crit`（0.3s 克制 glitch，唯一动画特权）。

### 4.4 渐变徽章（badge-tactical）

```css
.badge-tactical {
  background:linear-gradient(135deg, var(--accent), var(--accent3)); /* 绿→青蓝 */
  color:var(--bg); font-size:11px; font-weight:700;
  padding:2px 10px; border-radius:4px; letter-spacing:1px;
}
```

### 4.5 DEFCON 五级条

```css
.defcon-level { width:60px; height:8px; border-radius:2px; opacity:.3; }
.defcon-level.active { opacity:1; box-shadow:0 0 8px currentColor; }
/* 1=crit 赤红 2=red 3=yellow 4=primary 青 5=green */
```

### 4.6 Hero 氛围（FUI 面板的仪式感）

```css
.hero {
  background:radial-gradient(ellipse at top, rgba(0,212,255,.08), transparent 70%);
  clip-path: polygon(...16px 切角...);
  border:1px solid var(--primary);
  box-shadow:0 0 30px rgba(86,212,224,.15);
}
.hero::before { /* 内置 2px/4px 青扫描线，4s 循环 */
  background:repeating-linear-gradient(0deg, transparent, transparent 2px,
    rgba(86,212,224,.04) 2px, rgba(86,212,224,.04) 4px);
  animation:scanline 4s linear infinite;
}
```

### 4.7 面板玻璃底（FUI Panel）

```css
.panel {
  background:rgba(19,24,32,.85);      /* surface 的 85% */
  backdrop-filter:blur(8px);
  border:1px solid var(--border);
}
.panel.accent-cyan { border-color:var(--accent3); box-shadow:0 0 15px rgba(0,212,255,.15); }
```

### 4.8 霓虹脉冲（hover 点亮）

```css
.neon-pulse { transition:box-shadow .2s; }
.neon-pulse:hover { box-shadow:0 0 25px rgba(0,255,136,.4); }
```

### 4.9 Boot 序列打字行（等宽 + 前缀符号）

```
[✓] 正常步骤 → --accent 绿
[!]  警告行   → --yellow
字体：JetBrains Mono 13px；行 fade-in 0.3s 逐行延迟 0.4s
```

---

## 5 · 排版体系

| 角色 | 字体 | 规格 | 约定 |
|---|---|---|---|
| **Display** | Orbitron 700/900 | 16-32px | 大写、letter-spacing 2-3px、可加同色 text-shadow |
| **正文** | IBM Plex Sans 400/700 | 13-14px | 正常大小写、行高 1.5-1.8 |
| **代码/数据** | IBM Plex Mono 500 / JetBrains Mono 400-500 | 11-13px | 表格、状态条、boot 行 |
| **卡片标签** | 继承 | **10-12px + uppercase + letter-spacing 1-2px** + `--secondary` | 永远安静 |
| **仪表数值** | Orbitron 900 | **28-32px + 同色 text-shadow 12px** | 永远大声 |

**对比规则**：标签小而灰（uppercase 次文色），数值大而亮（主题色+辉光）——"标签安静、数值大声"。

---

## 6 · 语义通道映射（V 适配层 · 已落地）

参照稿 的多色顶边/状态灯编码，映射到 DSH 会话区的四个通道（边框/辉光/标题/标题辉光四载体同色贯穿）：

| 通道 | Tactical 色 | Neon 色 | 落点 |
|---|---|---|---|
| Todo | FUI 绿 `#00FF88` | 暖粉 `#FF5CB0` | todo-panel |
| 队列 | 青蓝 `#00D4FF` | 粉蓝 `#4DA8FF` | queue-dock |
| 审批 | 黄 `#F0C239` | 金 `#FFC857` | approval |
| 错误 | **品红 `#FF00FF`**（CRIT 特权） | 艳粉红 `#FF3B5C` | error 节点 |

**工具卡状态顶边**（运行态三色）：

| 状态 | 渐变 |
|---|---|
| 运行中 | `linear-gradient(90deg, #56D4E0, #00D4FF)` |
| 完成 | `linear-gradient(90deg, #5DDB72, #56D4E0)` |
| 出错 | `linear-gradient(90deg, #FF3366, #FF00FF)` |

---

## 7 · 反模式清单（incremental design 时逐条对照）

1. ❌ 强调色做大面积背景（SOC 基底色才是大面积）
2. ❌ 一张卡多种强调色（一张卡一个声音，四通道同色贯穿）
3. ❌ 静态辉光超过 .15 alpha（hover 才允许 .4）
4. ❌ 品红 `#FF00FF` 出现超过 2 处 / 用于非强调场景
5. ❌ box-shadow 加在 clip-path 元素上（必须 filter:drop-shadow）
6. ❌ 新造色相（只能从四层表取色）
7. ❌ CRIT 红用于非错误语义 / glitch 动画滥用
8. ❌ 动画用 width/left（只用 transform/opacity）
9. ❌ 忽略 `prefers-reduced-motion`（glitch/scanline/boot 全要可关）
10. ❌ 切角元素配大圆角（切角 = 2-4px 近直角；圆角 = 12px SOC 卡）

---

## 8 · 快速决策表（"我要加一个 X"）

| 需求 | 配方 |
|---|---|
| 新增一张信息卡 | SOC：surface + 1px border + radius 12px；FUI：切角 + 玻璃底 + HUD 角标 |
| 状态指示 | 圆点（4.1）或六边形（4.2），色取语义层 |
| 等级/严重度 | sev 胶囊（4.3）或 DEFCON 条（4.5） |
| 强调徽章 | 渐变徽章（4.4），文字用 `--bg` 反色 |
| 仪式感区块 | Hero 氛围（4.6） |
| 数值仪表 | Orbitron 28-32px + 同色辉光 + 10px uppercase 标签 |
| hover 反馈 | neon-pulse（4.8），200ms |
| 并列身份区分 | 顶边 3px 语义色编码（第 6 节） |
