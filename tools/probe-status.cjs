const c = require('fs').readFileSync('C:/Users/xuenbo01/AppData/Local/npm-cache/_npx/1e7f6d9597241db0/node_modules/@deepseek-ai/dsh-client-ui-workspace/lib/client.js', 'utf8');
// status-ish class fragments
for (const frag of ['status', 'Status', 'dot', 'Dot', 'pending', 'Pending', 'spin', 'Spin', 'running', 'Running', 'live', 'Live']) {
  const m = [...c.matchAll(new RegExp('"[a-zA-Z0-9]{6}_' + frag + '\\w*"', 'g'))];
  if (m.length) console.log('-- ' + frag + ' --\n  ' + [...new Set(m.map(x => x[0].slice(1)))].join('  '));
}
// where pendingInteraction drives UI
const i = c.indexOf('pendingInteraction');
console.log('=== pendingInteraction @' + i + ' ===');
if (i >= 0) console.log(c.slice(i - 200, i + 700).replace(/\s+/g, ' '));
