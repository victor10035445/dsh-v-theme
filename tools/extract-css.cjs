/* 从 DSH 官方前端包（@deepseek-ai/dsh-client-ui-theme）提取内建 CSS 到 design/refs/。
 *
 * 用法（三选一）：
 *   node tools/extract-css.cjs <官方包 client.js 的路径>
 *   DSH_UI_THEME_PKG=<路径> node tools/extract-css.cjs
 *   直接运行（尝试 require.resolve 解析官方包）
 *
 * 提取产物（*.ref.css）仅作本地参照，不入仓库（版权属于官方包）。
 */
const fs = require('fs');
const path = require('path');

let srcPath = process.argv[2] || process.env.DSH_UI_THEME_PKG;
if (!srcPath) {
  try {
    srcPath = require.resolve('@deepseek-ai/dsh-client-ui-theme/lib/client.js');
  } catch {
    console.error('未找到 @deepseek-ai/dsh-client-ui-theme/lib/client.js');
    console.error('用法: node tools/extract-css.cjs <官方包 client.js 路径>');
    console.error('  或: DSH_UI_THEME_PKG=<路径> node tools/extract-css.cjs');
    process.exit(1);
  }
}
const src = fs.readFileSync(srcPath, 'utf8');
for (const name of ['design_platform_css_default', 'base_css_default', 'gradient_shadow_text_css_default', 'shiki_css_default', 'scrollbar_css_default']) {
  const re = new RegExp('var ' + name + ' = "([\\s\\S]*?)";\\r?\\n');
  const m = src.match(re);
  if (!m) { console.log('NO MATCH:', name); continue; }
  const css = JSON.parse('"' + m[1] + '"');
  const out = path.join(__dirname, '..', 'design', 'refs', name.replace(/_default$/, '').replace(/_/g, '-') + '.ref.css');
  fs.writeFileSync(out, css);
  console.log('wrote', out, css.length, 'bytes');
}
