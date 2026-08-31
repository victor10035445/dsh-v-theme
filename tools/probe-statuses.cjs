const c = require('fs').readFileSync('C:/Users/xuenbo01/AppData/Local/npm-cache/_npx/1e7f6d9597241db0/node_modules/@deepseek-ai/dsh-client-ui-workspace/lib/client.js', 'utf8');
// sessionStatuses(): the state model of the status dot
let i = c.indexOf('function sessionStatuses');
if (i < 0) i = c.indexOf('sessionStatuses =');
console.log('def @', i);
console.log(c.slice(i, i + 1800).replace(/\s+/g, ' '));
console.log('\n=== SessionStatusDots ===');
let j = c.indexOf('function SessionStatusDots');
if (j < 0) j = c.indexOf('SessionStatusDots =');
console.log(c.slice(j, j + 1200).replace(/\s+/g, ' '));
