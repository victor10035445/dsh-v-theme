const c = require('fs').readFileSync('C:/Users/xuenbo01/AppData/Local/npm-cache/_npx/1e7f6d9597241db0/node_modules/@deepseek-ai/dsh-web-frontend/dist/assets/index-ClqxG24t.js', 'utf8');
// StateDot impl: search for state prop classes like "warning"/"ongoing"/"done" near "dot"
const m = [...c.matchAll(/StateDot|stateDot/g)].map(x => x.index).slice(0, 5);
console.log('StateDot refs:', m.length);
for (const i of m) {
  console.log('=== @' + i + ' ===');
  console.log(c.slice(Math.max(0, i - 400), i + 900).replace(/\s+/g, ' ').slice(0, 1100));
}
