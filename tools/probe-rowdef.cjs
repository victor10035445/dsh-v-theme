const c = require('fs').readFileSync('C:/Users/xuenbo01/AppData/Local/npm-cache/_npx/1e7f6d9597241db0/node_modules/@deepseek-ai/dsh-client-ui-workspace/lib/client.js', 'utf8');
// find the SessionRow component body: where dot/running/completed become JSX
let i = c.indexOf('function SessionRow');
if (i < 0) i = c.indexOf('SessionRow = (');
if (i < 0) i = c.indexOf('const SessionRow');
console.log('def @', i);
console.log(c.slice(i, i + 2600).replace(/\s+/g, ' '));
