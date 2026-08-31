const fs = require('fs');
// StateDot is bundled into ui-workspace's own deps? Search ui-sidebar & runtime too.
const candidates = [
  'C:/Users/xuenbo01/AppData/Local/npm-cache/_npx/1e7f6d9597241db0/node_modules/@deepseek-ai/dsh-client-ui-workspace/lib/client.js',
  'C:/Users/xuenbo01/AppData/Local/npm-cache/_npx/1e7f6d9597241db0/node_modules/@deepseek-ai/dsh-client-ui-sidebar/lib/client.js',
  'C:/Users/xuenbo01/AppData/Local/npm-cache/_npx/1e7f6d9597241db0/node_modules/@deepseek-ai/dsh-client-runtime/lib/client.js'
];
for (const p of candidates) {
  try {
    const c = fs.readFileSync(p, 'utf8');
    const i = c.indexOf('StateDot');
    if (i >= 0) {
      console.log('== ' + p.split('/').pop() + ' @' + i + ' ==');
      console.log(c.slice(Math.max(0, i - 300), i + 1300).replace(/\s+/g, ' ').slice(0, 1400));
    }
  } catch {}
}
