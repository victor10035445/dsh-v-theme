const fs = require('fs');
const path = require('path');
const base = 'C:/Users/xuenbo01/AppData/Local/npm-cache/_npx/1e7f6d9597241db0/node_modules/.pnpm';
const dirs = fs.readdirSync(base).filter(d => d.startsWith('dsh-client-ui-primitives'));
console.log('pnpm dirs:', dirs);
for (const d of dirs) {
  const client = path.join(base, d, 'node_modules', '@deepseek-ai', 'dsh-client-ui-primitives', 'lib', 'client.js');
  if (fs.existsSync(client)) {
    const c = fs.readFileSync(client, 'utf8');
    const i = c.indexOf('StateDot');
    console.log('== ' + client + ' ==');
    console.log(c.slice(Math.max(0, i - 200), i + 1600).replace(/\s+/g, ' '));
    break;
  }
}
