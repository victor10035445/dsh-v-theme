const c = require('fs').readFileSync('C:/Users/xuenbo01/AppData/Local/npm-cache/_npx/1e7f6d9597241db0/node_modules/@deepseek-ai/dsh-client-ui-workspace/lib/client.js', 'utf8');
// The dot is rendered inside the row: find "dot" usage in JSX (clsx chain)
let i = c.indexOf('.dot');
let n = 0;
while (i >= 0 && n < 8) {
  const seg = c.slice(i - 100, i + 500).replace(/\s+/g, ' ');
  if (seg.includes('jsx') || seg.includes('clsx') || seg.includes('running') || seg.includes('completed')) {
    console.log('=== @' + i + ' ===');
    console.log(seg.slice(0, 560));
    console.log();
    n++;
  }
  i = c.indexOf('.dot', i + 1);
}
