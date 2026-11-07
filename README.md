# dsh-v-theme · V CYBER（多色板）

**简体中文** | [English](README.en.md)

DeepSeek Harness Web 客户端的**黑客 / 赛博主题插件**，七套可切换风格。纯增量：不替换、不禁用任何官方插件；不开时零副作用。

| 风格 | 签名 |
|---|---|
| **赛博霓虹**（NEON，基线） | 霓虹粉 `#FF2E97` × 电光蓝，指纹守卫的受保护基线 |
| **日落公路**（Sunset Drive） | 落日橙 × 黄昏紫，公路日落渐变 |
| **梦核**（Dream Core） | 奶油粉 × 冰青 × 薄荷，夜间最柔和 |
| **紫夜极光**（Neon Violet） | 电紫 × 激光青，深空夜航 |
| **银翼千禧**（Y2K Chrome） | 亮粉 × 电青，铬银高光 |
| **蓝调夜曲**（Blue Nocturne） | 冰蓝主辅倒置，白天办公最克制 |
| **战术面板**（TACTICAL） | SOC 红蓝作战中心 + FUI 霓虹 |

> 配色与字体依据 ui-ux-pro-max 设计技能库与本地参照稿；设计语言详见 `design/`（palette-synthwave.md / concept-layer.md / palette-fusion.md）。

## 效果

**赛博霓虹（NEON · 基线 · 受保护）**
- 霓虹粉 × 电光蓝；组件级装饰：CRT flicker、流式扫光、渐变描边、会话状态框体
- 调色板与特效层经 SHA-256 指纹守卫（`tests/check-baseline.cjs`），任何触碰即测试失败

**霓虹色板族 ×5（日落公路 / 梦核 / 紫夜极光 / 银翼千禧 / 蓝调夜曲）**
- `buildNeonFX` 参数化生成：全量强调层调色板（对比度逐案实测 ≥7:1）+ 与基线同源的家族签名特效
- 概念层一次性特效：compaction = 虫洞通道、引用 chip = 门户环、tool-result = 神经元点火、流式 = 涌现绽放；常驻循环仅家族签名

**战术面板（TACTICAL · 红蓝作战中心）**
- 红蓝双通道：蓝队（青）= 防御·执行，红队（赤红→品红）= 对抗·警报，指挥 = DEFCON 金，战果 = 亮绿
- 工具卡弱化呈现（无顶部高亮线）+ 蜂巢巢室点 / 分形深度角标 / 态势雷达

**共享质感**
- 行内 code / 文件地址胶囊：主题色圆角胶囊七案统一（基线特例固定浅冰蓝）
- 会话状态框体：进行中 = 通道色条、待交互 = 金条、完成 = 亮绿、空闲 = 静默退场
- 风格热替换无需重启；尊重 `prefers-reduced-motion`

## 安装

> **宿主要求**：DeepSeek Harness `>= 0.1.2-rc.1`（更早版本请用插件 `0.5.0`）。

**GitHub 地址直装（推荐）**——手写零构建，无需构建授权：

```sh
dsh plugin --profile web add "github:victor10035445/dsh-v-theme"
```

锁定版本加 `#<commit-sha>`；也可 clone 后 `add "link:<克隆路径>"`，或 `npm pack` 后装 tgz。装完**重启 `dsh web`** 生效。

## 使用

**设置 → 皮肤 → V CYBER**：

- **总开关**：接入 / 断开——接入时固定深色外观并叠加主题，状态持久化、重启自动重连
- **风格选择**：七枚 chips，开启状态下点击即时热替换，无需重启
- **提示音控制区**：开关 chip（默认开启）+ 音量滑杆（0–100，默认 30，拖动不发声）+ 两枚试听按钮（完成音 / 该你了音，点击即响）；全部即改即生效
- 在「外观」里切走深色会自动断开本主题（提示音不受影响）

## 提示音

侧栏会话行发生状态**边沿**时出声，实现「可见用眼睛、不可见用耳朵」的双通道提醒：

- **该你了**（上行双音 C5→G5）：任意会话进入「等待审批 / 计划评审 / 等待回答」
- **完成**（下行双音 E5→C5）：任意会话变为「已完成」（与空闲经屏幕阅读器标签消歧区分）
- **默认开启**；只在页面**不可见或失焦**时出声（看得见就不吵，可见提醒由状态框体承担）
- **三重舒适门**：可见性门 → 1.5s 冷却合并（多会话齐翻至多一声；「该你了」可覆盖刚响的完成）→ 手势解锁门（首次点击 / 按键前 AudioContext 静默）
- **抗后台节流**：独立 MutationObserver 同步判定，无定时器依赖，标签页后台超过 5 分钟照常出声
- **启停解耦**：主题关闭照常工作；关闭提示音后重新开启只建新基线，不回放关闭期间的事件

**已知限制**：多开 GUI 标签页会各自出声；解锁（首次点击 / 按键）前错过的事件静默丢失；提示音关闭期间的事件不回放。

## 技术原理

| 机制 | 说明 |
|---|---|
| 多色板 | 7 条目注册表（palette + fx + swatch），五套霓虹色板由 `buildNeonFX(P, extra)` 参数化生成 |
| 配色 | 每主题 89/89 令牌全覆盖覆写层，不动内建 light/dark 主题；契约校验覆盖全部 7 套 |
| 持久化 | 主题选择存 localStorage，开关状态与外观偏好跨重启恢复 |
| 特效 | `body.v-cyber` 作用域的插件私有样式表，随主题整体替换 |
| 基线守卫 | 赛博霓虹基线取 SHA-256 指纹快照，触碰需显式解封 |
| 自愈 | 监听 `theme/change`：层被摘掉就补回，基底被切走就自动断开 |
| 提示音 | 独立 chime MutationObserver（`childList + attributes[data-state]`，同步无去抖）：`closest` 归属过滤 → 行级快照边沿判定（`data-row-key` 键控、首扫建基线）→ 三重舒适门 → Web Audio 合成（sine + 指数衰减包络 + 低通 4kHz，零素材） |

## 文件与校验

```
lib/client.js       客户端 bundle（factory 形式，手写零构建）
lib/index.js        宿主端入口（空插件）
cordis.patch.yml    loader 插入条目
design/             设计参照文档（refs/ 参照稿仅本地保留，不入仓库）
tools/              官方前端产物提取脚本
tests/              可运行校验（Node，无浏览器）
```

```sh
npm run check                    # 语法检查
npm test                         # 插件契约冒烟 + 五色板热切换 + 提示音生命周期
node tests/check-palettes.cjs    # 调色板契约 ×7
node tests/check-statusrow.cjs   # 会话状态框体契约 + chime 官方锚点断言
node tests/check-chime.cjs       # 提示音契约（边沿 / 三门 / 合成音型 / 反存 / 生命周期）
node tests/check-baseline.cjs    # 基线指纹（SHA-256）
node tests/verify-install.cjs    # 安装发现校验（需 profile 已装本包）
```

## License

MIT
