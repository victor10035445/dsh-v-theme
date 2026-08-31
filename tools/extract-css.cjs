const fs = require('fs');
const src = fs.readFileSync('C:/Users/xuenbo01/AppData/Local/npm-cache/_npx/1e7f6d9597241db0/node_modules/@deepseek-ai/dsh-client-ui-theme/lib/client.js', 'utf8');
for (const name of ['design_platform_css_default', 'base_css_default', 'gradient_shadow_text_css_default', 'shiki_css_default', 'scrollbar_css_default']) {
  const re = new RegExp('var ' + name + ' = "([\\s\\S]*?)";\\r?\\n');
  const m = src.match(re);
  if (!m) { console.log('NO MATCH:', name); continue; }
  const css = JSON.parse('"' + m[1] + '"');
  const out = require('path').join(__dirname, '..', 'design', 'refs', name.replace(/_default$/, '').replace(/_/g, '-') + '.ref.css');
  fs.writeFileSync(out, css);
  console.log('wrote', out, css.length, 'bytes');
}
