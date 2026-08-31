# dsh-v-theme · V CYBER（多主题）

DeepSeek Harness Web 客户端的**黑客 / 赛博主题插件**，内含两套可切换风格：

| 主题 | 气质 | 签名 |
|---|---|---|
| **合成波 '84**（Synthwave） | 复古未来主义，迈阿密之夜 | 霓虹粉 `#FF2E97` × 电光蓝 × 紫罗兰夜空，**底部地平线辉光**（合成波日落升起） |
| **融合战术**（Fusion） | SOC 战术面板 + FUI 霓虹（参照 demo5-fusion.html） | SOC 青 `#56D4E0` 主操作 + FUI 绿 `#00FF88` + AAA 对比度基底（14.3:1），**顶部青色径向辉光**，实线战术边框 |

纯增量插件：不替换、不禁用任何官方插件；不开时零副作用。

> 配色与字体依据 ui-ux-pro-max 设计技能库（Retro-Futurism / HUD-FUI 风格档案 + 字体配对）与 demo5-fusion.html 参照设计。

## 效果

### 合成波 '84
- 深蓝紫夜空底（`#141126` → `#1B1834 / #221E42 / #2A2550`），霓虹粉主色，电光蓝辅色，紫罗兰点缀
- Space Grotesk + DM Sans 界面正文，JetBrains Mono 代码
- CRT 扫描线 + 紫调暗角 + 地平线辉光 + 粉紫霓虹阴影

### 融合战术
- SOC 深蓝黑基底（`#0A0E14` → `#131820 / #1E2530 / #262F3D`），**实线蓝灰边框**（`#2E3848`，战术面板的精确感）
- SOC 语义状态色全部 ≥7:1：青 `#56D4E0`（9.5:1）/ 绿 `#5DDB72` / 红 `#FF7B72` / 黄 `#f0c239`；FUI 绿 `#00FF88` 做 HUD 品牌色
- IBM Plex Sans 正文 + IBM Plex Mono / JetBrains Mono 代码
- 顶部青色径向辉光（对应 demo5 Hero）+ 青色系扫描线与辉光 + 青色语法高亮

### 共享质感
- **Console 质感**（致敬数字考古 gift）：ASCII 数据流 ticker（上下边缘）、Console HUD（`█ V://SYNTHWAVE █` / `█ V://FUSION █`，随主题切换）、CRT 滚动亮带、标题信号干扰、代码块终端边——颜色全部随主题
- **会话状态框体**：侧栏会话行按官方 `StateDot [data-state]` 点亮——**进行中** = 左缘 3px 青（Fusion）/ 粉蓝（Synthwave）条 + 极淡同色底，官方矩阵像素动画点经 `--dsh-state-ongoing` 同色贯穿；**待交互**（审批 / 计划评审 / 提问）= 黄 / 金条（「该你了」）；**已完成** = 亮绿 `#00FF88`（demo5 FUI 绿 · 成功语义）条 + 状态点同步亮绿——官方把完成与空闲渲染成同一个 DOM 状态（`done`），插件用 MutationObserver 读行内屏幕阅读器标签（workspace 词典，zh/en 内置兜底）精确区分；**空闲** = 无框静默退场。底色走 `background-image`，官方 hover / 选中底色正交叠加不受干扰；用 `:has()` 反选整行，不支持的浏览器自动无框（零副作用退化）
- 主题切换 = **热替换**：令牌层同源替换 + 特效层整体换装，无需重启；选择持久化在 localStorage
- 尊重 `prefers-reduced-motion`

## 安装

方式 A（本地开发，link 直连本仓库）：

```sh
dsh plugin --profile web add "link:c:\project\dsh-plugin-v\dsh-v-theme"
```

方式 B（打包后安装 tgz）：

```sh
npm pack                       # 产出 dsh-v-theme-0.5.0.tgz
dsh plugin --profile web add "<tgz 的绝对路径>"
```

两种方式 `add` 都会把 `dsh-v-theme` 注册进 profile 的 bundle 列表。装完**重启 `dsh web`**，刷新页面生效。

## 使用

打开 **设置 → 通用**，找到「**V CYBER**」一行：

- **总开关**（终端卡片）：点击接入/断开——接入时自动把「外观」固定为深色并叠加当前主题；状态存 localStorage，重启自动重连
- **风格选择**（两枚 chips）：「合成波 '84」/「融合战术」——**开启状态下切换即时热替换**（令牌层 + 特效层整体换装，无需重启）；选择持久化，重启后恢复
- 关闭总开关：撤掉令牌层与特效，还原开启前的外观偏好
- 在「外观」里切到浅色/跟随系统会自动断开本主题（尊重你的基底选择）

## 技术原理

| 机制 | 说明 |
|---|---|
| 多主题 | 主题注册表（palette + fx + HUD 品牌行 + 色点示意），`overrideTokens` 同源替换实现热切换 |
| 配色 | 每主题 89/89 令牌全覆盖的 `--dsw-alias-*` / `--dsw-specific-*` 覆写层，不动内建 light/dark 主题 |
| 持久化 | 开启即把内建偏好写成 `dark`（可持久化）；主题选择存 localStorage |
| 特效 | `body.v-cyber` 作用域的插件私有样式表，随主题整体替换；滚动条走官方 `--dsh-scrollbar-thumb` rebind 契约 |
| 设置行 | `ctx.slots.inject("settings.general.item")` 注入开关 + 主题 chips，`ctx.locale.register` 提供中英文案 |
| 自愈 | 监听 `theme/change`：层被摘掉就补回（哨兵令牌防自激），基底被切走就自动断开 |

宿主端 `lib/index.js` 是无逻辑的空插件，仅让 cordis loader 能解析本包，从而由 client-modules 把 `lib/client.js` 编进 `/plugins` 启动图。

## 文件

```
package.json        插件清单（dsh.bundle.patch + dsh.client 声明）
cordis.patch.yml    loader 插入条目
lib/index.js        宿主端入口（空插件）
lib/client.js       客户端 bundle（factory 形式，手写零构建）
openspec/           OpenSpec 范式目录（目前仅 config.yaml；specs/ 与 changes/ 待补录）
design/             设计参照：palette-fusion.md 设计语言 + refs/（官方 CSS 与令牌提取产物、demo5-fusion.html 参照稿）
tools/              官方前端产物提取脚本（extract-css / list-tokens，DSH 升级后重新提取时复用）
tests/              可运行校验（Node，无浏览器）
```

校验命令（发布/改动后逐条跑）：

```sh
npm run check                    # 语法检查 lib/*.js
node tests/smoke.cjs             # 插件契约冒烟：注册 / 开关 / 热切换 / 自愈 / 断开
node tests/check-palettes.cjs    # 调色板契约：背景族禁入 + 强调集齐全
node tests/check-statusrow.cjs   # 会话状态框体契约
node tests/verify-install.cjs    # 安装发现校验（需 profile 已装本包）
```

## License

MIT
