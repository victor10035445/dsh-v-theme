/**
 * 基线指纹校验（colorway-registry spec「赛博霓虹基线稳定性」）：
 * 赛博霓虹基线（id neon）的调色板与特效层是用户已验收的受保护内容——
 * 本测试对基线的 PALETTE_NEON / FX_NEON 常量声明取 SHA-256 快照，
 * 任何差异（哪怕是注释/空白）即失败：触碰基线必须走独立变更显式解封（更新快照并记录理由）。
 *
 * 用法：
 *   node tests/check-baseline.cjs          校验当前源码指纹 === 快照
 *   node tests/check-baseline.cjs --emit   打印当前指纹（生成/解封快照时使用）
 *
 * 解封记录：
 *   - v0.7.1（inline-code-pill-and-calm-tool-calls）：用户裁决「文件地址特殊色补齐全部风格」，
 *     FX_NEON 增补行内 code 胶囊规则（primary 14% 底 + 65/35 提亮主色字，
 *     对齐战术面板行内 code 配方）；PALETTE_NEON 未触碰（指纹与 v0.6.0 一致）。
 *   - v0.7.2（baseline-pill-ice-blue）：用户裁决「基线胶囊由霓虹粉改为蓝调夜曲浅冰蓝」——
 *     仅行内 code 胶囊一处改为固定浅冰蓝（bg rgba(92,200,255,.14) + 字 #95DBFF），
 *     基线其余内容全部保持霓虹粉（PALETTE_NEON 恢复 v0.6.0 原内容与原指纹）。
 *     （曾误实施整主题粉→冰蓝换色，经用户澄清当日回退。）
 *   - v0.7.2（port-jiuyu-colorways，品牌适配移植）：自 dsh-theme-jiuyu 移植至本仓库，
 *     常量更名 PALETTE_SYNTHWAVE→PALETTE_NEON、FX_SYNTHWAVE→FX_NEON；标识符品牌替换
 *     （body class jiuyu-cyber→v-cyber、keyframes jyFlicker/jyScan→vFlicker/vScan、
 *     data-jiuyu-completed→data-v-completed、注释头 dsh-theme-jiuyu→dsh-v-theme）。
 *     逐行 diff 验证：PALETTE 54 行仅常量名一差异（内容 100% 一致）；FX 251 行
 *     仅 11 处标识符/注释差异，零视觉语义变化。快照更新为新指纹。
 */

/* 品牌适配（2026-09-18，port-jiuyu-colorways）：本文件自 dsh-theme-jiuyu v0.7.2 移植。
   适配变更：常量更名 PALETTE_SYNTHWAVE→PALETTE_NEON、FX_SYNTHWAVE→FX_NEON、
   PALETTE_FUSION→PALETTE_TACTICAL、FX_FUSION→FX_TACTICAL；主题 id synthwave→neon、
   fusion→tactical；显示名 粉蓝霓虹→赛博霓虹、融合战术·红蓝作战中心→战术面板。
   指纹对象为常量内容，内容零改动，v0.6.0/v0.7.2 快照值不变。 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

/** 快照：v0.7.2（port-jiuyu-colorways 品牌适配解封：仅标识符/注释重命名，语义零变化）。 */
const BASELINE = {
  FX_NEON: "98bc26b50c50e9bb5406b4055bdf241eb42bd2d66529a82a18c440b662bcfc79",
  PALETTE_NEON: "686a93e1a4c5b7afcf52addc23b3f5e57774f0bf7fc3a16bf21d009fd303bb06"
};

/** 从源码提取 `const <name> = ...` 完整声明（模板字符串到收尾反引号，对象到 `};`）。 */
function sliceConst(src, name) {
  const marker = "const " + name + " = ";
  const start = src.indexOf(marker);
  if (start < 0) throw new Error("declaration not found: " + name);
  const tick = src.indexOf("`", start);
  const brace = src.indexOf("{", start);
  let end;
  if (tick !== -1 && (brace === -1 || tick < brace)) end = src.indexOf("`;", tick) + 2;
  else end = src.indexOf("};", start) + 2;
  if (end < 2) throw new Error("declaration end not found: " + name);
  return src.slice(start, end);
}

const src = fs.readFileSync(path.join(__dirname, "..", "lib", "client.js"), "utf8");
const emit = process.argv.includes("--emit");
let fail = false;

for (const name of Object.keys(BASELINE)) {
  let decl;
  try {
    decl = sliceConst(src, name);
  } catch (e) {
    console.log("  ✗ " + name + ": " + e.message);
    fail = true;
    continue;
  }
  const hash = crypto.createHash("sha256").update(decl).digest("hex");
  if (emit) {
    console.log(name + ': "' + hash + '"');
    continue;
  }
  const expected = BASELINE[name];
  if (!expected) {
    console.log("  ✗ " + name + ": 快照为空——请以 --emit 生成并提交 v0.6.0 指纹");
    fail = true;
  } else if (hash !== expected) {
    console.log("  ✗ " + name + ": 基线指纹不符（受保护内容被触碰）");
    console.log("      expected " + expected);
    console.log("      actual   " + hash);
    console.log("      基线受保护：触碰需独立变更显式解封（更新 BASELINE 快照并在变更记录中说明理由）");
    fail = true;
  } else {
    console.log("  ✓ " + name + ": 基线指纹一致 (" + hash.slice(0, 12) + "…)");
  }
}

if (emit) process.exit(0);
if (fail) {
  console.log("\nBASELINE CHECK: FAIL");
  process.exit(1);
}
console.log("\nBASELINE CHECK: PASS（赛博霓虹基线未被触碰）");
