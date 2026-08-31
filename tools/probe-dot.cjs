const c = require('fs').readFileSync('C:/Users/xuenbo01/AppData/Local/npm-cache/_npx/1e7f6d9597241db0/node_modules/@deepseek-ai/dsh-client-ui-workspace/lib/client.js', 'utf8');
let idx = c.indexOf('YDXeBa_dot');
let n = 0;
while (idx >= 0 && n < 6) {
  console.log('=== @' + idx + ' ===');
  console.log(c.slice(idx - 250, idx + 450).replace(/\s+/g, ' ').slice(0, 640));
  console.log();
  idx = c.indexOf('YDXeBa_dot', idx + 1);
  n++;
}
