# dsh-v-theme · V CYBER（多色板）

**简体中文** | [English](README.en.md)

DeepSeek Harness Web 客户端的**黑客 / 赛博主题插件**，七套可切换风格：

| 风格 | 气质 | 签名 |
|---|---|---|
| **赛博霓虹**（NEON，基线） | 虫洞渐变的生物霓虹系统 | 霓虹粉 `#FF2E97` × 电光蓝 `#4DA8FF`（行内 code / 文件地址胶囊固定浅冰蓝，见共享质感），CRT flicker + 会话状态框体（受基线指纹守卫，见 `tests/check-baseline.cjs`） |
| **日落公路**（Sunset Drive） | 地平线、公路、日落时分 | 落日橙 `#FF6B35` × 黄昏紫 `#B967FF` × 电光青，橙→紫虫洞渐变 |
| **梦核**（Dream Core） | 柔和奶油霓虹，夜间最舒适 | 奶油粉 `#FF71CE` × 冰青 `#01CDFE` × 薄荷 `#05FFA1` |
| **紫夜极光**（Neon Violet） | 深空夜航，最冷最神秘 | 电紫 `#C07CFF` × 激光青 `#00E5FF` × 玫粉通道 |
| **银翼千禧**（Y2K Chrome） | 液态金属、泡泡、千禧怀旧 | 亮粉 `#FF69B4` × 电青 `#00E5FF` + 铬银高光层 |
| **蓝调夜曲**（Blue Nocturne） | 主辅倒置，白天办公最克制 | 冰蓝 `#5CC8FF` 主色（9.69:1 全场最高）× 霓虹粉点睛 |
| **战术面板**（TACTICAL · 红蓝作战中心） | SOC 攻防态势板 + FUI 霓虹 | SOC 青 `#56D4E0` 蓝队通道 + 赤红→品红红队警报 + AAA 对比度基底（14.3:1） |

纯增量插件：不替换、不禁用任何官方插件；不开时零副作用。

> 配色与字体依据 ui-ux-pro-max 设计技能库（Retro-Futurism / Vaporwave / Y2K / HUD-FUI 风格档案 + 字体配对）与本地 SOC FUI 参照稿（design/refs/，不入仓库），概念层探索见 `design/palette-synthwave.md`、`design/concept-layer.md`。

## 效果

### 赛博霓虹（NEON · 基线 · 受保护）
- 深色底走 DSH 原生，霓虹粉主色，电光蓝辅色（唯一例外：行内 code / 文件地址胶囊固定浅冰蓝，用户指定）
- Space Grotesk + DM Sans 界面正文，JetBrains Mono 代码
- 标题 CRT flicker + 流式输出顶部扫光 + 粉紫霓虹阴影与渐变描边（全部组件级）
- 调色板与特效层内容经 SHA-256 基线指纹守卫（`node tests/check-baseline.cjs`），任何触碰即测试失败（解封记录见测试头部）

### 霓虹色板族 ×5（日落公路 / 梦核 / 紫夜极光 / 银翼千禧 / 蓝调夜曲）
- 每套 = 全量强调层调色板（对比度逐案实测达标，见 `design/palette-synthwave.md`）+ `buildNeonFX` 参数化特效（家族签名结构与基线同源）
- **概念层**（隐喻即功能说明）：`compaction` 上下文折叠 = **虫洞通道**（primary→partner 竖向隧道，金色让渡审批专用）；引用 chip 尾端**门户环**；`tool-result` 到达 = **神经元点火**（一次性突触脉冲，成功绿/出错赤红）；助手消息 = **菌丝生长神经干**；流式 = **涌现绽放**
- 银翼千禧附 Y2K 金属高光（swatch 珠粒镀铬 + composer 顶部白光）
- 常驻循环仅家族签名（CRT flicker / 流式扫光），概念特效全部一次性；`prefers-reduced-motion` 全量可关

### 战术面板（TACTICAL · 红蓝作战中心）
- SOC 深蓝黑基底（`#0A0E14` → `#131820 / #1E2530 / #262F3D`），**实线蓝灰边框**（`#2E3848`）
- **红蓝双通道 = 组织原则**：蓝队（青 `#56D4E0`/`#00D4FF`）= 防御·执行·监控；红队（赤红 `#FF3366`→品红 `#FF00FF`）= 对抗·警报·异常（出错工具卡**边框与角标换赤红**的静默信号）；指挥权 = DEFCON 金 `#F0C239`；战果 = 亮绿 `#00FF88`
- **工具卡弱化呈现**：工具卡是过程性背景信息——**不使用顶部高亮线**（DEFCON 渐变顶边与警报扫频已移除，保留 `.panel` 半透明卡体、hover 辉光与 L 战术角标）；用户气泡渐变顶边与 composer 顶部辉光保留不动
- **蜂巢巢室点**：队列/任务标题前置六边形（参照稿 dot-hex 配方）；**分形深度**：嵌套工具卡 L 角标自相似缩小（`:has()` 检测，不支持则退化）；**态势雷达**：队列面板 conic 扫描扇（8s 低频，全插件唯一新增常驻循环）；**引擎点火**：ONLINE 文案步进揭幕
- IBM Plex Sans 正文 + IBM Plex Mono / JetBrains Mono 代码；青色语法高亮

### 共享质感
- **Console 质感**：标题信号干扰（CRT flicker）、代码块终端边、设置行等宽标识（`█ V://CYBER █`）——颜色全部随主题
- **行内 code / 文件地址胶囊**（七案统一）：会话内行内 code（文件地址、短代码）= 主题色 14% 底 + 提亮主色文字的圆角胶囊——文件地址在任意风格下都带主题特殊色（战术面板配方推广到全部风格，霓虹族以 `color-mix` 直读各案主色）；**赛博霓虹为唯一特例**：胶囊固定浅冰蓝 `rgba(92,200,255,.14)` 底 + `#95DBFF` 字（用户指定，不随其霓虹粉主色）
- **会话状态框体**：侧栏会话行按官方 `StateDot [data-state]` 点亮——**进行中** = 左缘 3px 各案通道色条 + 极淡同色底；**待交互** = 金条（「该你了」，七案恒定）；**已完成** = 亮绿 `#00FF88` 条 + 状态点同步亮绿（七案恒定，官方把完成与空闲渲染成同一 DOM 状态，插件用 MutationObserver 读屏幕阅读器标签精确区分）；**空闲** = 无框静默退场。底色走 `background-image`，官方 hover / 选中底色正交叠加不受干扰
- 风格切换 = **热替换**：令牌层同源替换 + 特效层整体换装，无需重启；选择持久化在 localStorage
- 尊重 `prefers-reduced-motion`

## 安装

> **宿主要求**：DeepSeek Harness `>= 0.1.2-rc.1`——自该版本起客户端 store 引擎改为平台 seed 词 `@deepseek-ai/dsh-client-store`。宿主 `0.1.1-rc.2` 及更早请使用插件 `0.5.0`。

**方式一 · GitHub 地址直装（推荐）**——本插件手写零构建、无任何安装期脚本，git 安装无需构建授权：

```sh
dsh plugin --profile web add "github:victor10035445/dsh-v-theme"
```

如需锁定版本（后续推送不会悄悄改变实际运行的代码）：

```sh
dsh plugin --profile web add "github:victor10035445/dsh-v-theme#<commit-sha>"
```

装完**重启 `dsh web`**，刷新页面生效。

**方式二 · 本地 clone + link 直连**（免打包，改动后重启 `dsh web` 生效，适合开发调试）：

```sh
git clone https://github.com/victor10035445/dsh-v-theme.git
dsh plugin --profile web add "link:<克隆路径>"
```

**方式三 · tgz 打包安装**：

```sh
npm pack                       # 产出 dsh-v-theme-0.7.2.tgz
dsh plugin --profile web add "<tgz 的绝对路径>"
```

`add` 会把 `dsh-v-theme` 注册进 profile 的 bundle 列表。

## 使用

打开 **设置 → 皮肤**，找到「**V CYBER**」卡片：

- **总开关**（终端卡片）：点击接入/断开——接入时自动把「外观」固定为深色并叠加当前主题；状态存 localStorage，重启自动重连
- **风格选择**（七枚 chips，换行网格）：赛博霓虹 / 日落公路 / 梦核 / 紫夜极光 / 银翼千禧 / 蓝调夜曲 / 战术面板——**开启状态下切换即时热替换**（令牌层 + 特效层整体换装，无需重启）；选择持久化，重启后恢复
- 关闭总开关：撤掉令牌层与特效，还原开启前的外观偏好
- 在「外观」里切到浅色/跟随系统会自动断开本主题（尊重你的基底选择）

## 技术原理

| 机制 | 说明 |
|---|---|
| 多色板 | 主题注册表（7 条目 × palette + fx + swatch），五套霓虹色板由 `buildNeonFX(P, extra)` 参数化生成——调色板常量为唯一色彩源，FX 直读令牌 |
| 配色 | 每主题 89/89 令牌全覆盖的 `--dsw-alias-*` / `--dsw-specific-*` 覆写层，不动内建 light/dark 主题；契约校验（背景族禁入 + 强调集齐全 + 对比度地板）覆盖全部 7 套 |
| 持久化 | 开启即把内建偏好写成 `dark`（可持久化）；主题选择存 localStorage |
| 特效 | `body.v-cyber` 作用域的插件私有样式表，随主题整体替换；滚动条走官方 `--dsh-scrollbar-thumb` rebind 契约 |
| 基线守卫 | 赛博霓虹基线的调色板与特效层取 SHA-256 指纹快照，任何触碰即 `check-baseline` 失败 |
| 设置行 | `ctx.slots.inject("settings.section")` 注入「皮肤」独立分页（开关 + 七枚风格 chips），`ctx.locale.register` 提供中英文案 |
| 自愈 | 监听 `theme/change`：层被摘掉就补回（哨兵令牌防自激），基底被切走就自动断开 |

宿主端 `lib/index.js` 是无逻辑的空插件，仅让 cordis loader 能解析本包，从而由 client-modules 把 `lib/client.js` 编进 `/plugins` 启动图。

## 文件

```
package.json        插件清单（dsh.bundle.patch + dsh.client 声明）
cordis.patch.yml    loader 插入条目
lib/index.js        宿主端入口（空插件）
lib/client.js       客户端 bundle（factory 形式，手写零构建）
design/             设计参照：palette-fusion.md / palette-synthwave.md / concept-layer.md
                    （refs/ 下的视觉参照稿与官方前端提取产物仅本地保留，不入仓库）
tools/              官方前端产物提取脚本（extract-css / list-tokens，DSH 升级后重新提取时复用）
tests/              可运行校验（Node，无浏览器）
```

校验命令（发布/改动后逐条跑）：

```sh
npm run check                    # 语法检查 lib/*.js
npm test                         # 同 tests/smoke.cjs（插件契约冒烟 + 五色板热切换）
node tests/check-palettes.cjs    # 调色板契约 ×7：背景族禁入 + 强调集齐全 + 对比度地板
node tests/check-statusrow.cjs   # 会话状态框体契约 + 霓虹构建器模板结构
node tests/check-baseline.cjs    # 赛博霓虹基线指纹（SHA-256）
node tests/verify-install.cjs    # 安装发现校验（需 profile 已装本包；profile 路径可用
                                 # argv[2] 或环境变量 DSH_PROFILE 指定，默认 ~/.dsh/profiles/web）
```

## License

MIT
