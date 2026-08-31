const c = require('fs').readFileSync('C:/Users/xuenbo01/AppData/Local/npm-cache/_npx/1e7f6d9597241db0/node_modules/@deepseek-ai/dsh-client-ui-workspace/lib/client.js', 'utf8');
let idx = c.indexOf('Rows_module_css_default.sessionRow');
let n = 0;
while (idx >= 0 && n < 4) {
  const seg = c.slice(idx, idx + 700).replace(/\s+/g, ' ');
  console.log('=== @' + idx + ' ===');
  console.log(seg.slice(0, 620));
  console.log();
  idx = c.indexOf('Rows_module_css_default.sessionRow', idx + 1);
  n++;
}
