const fs = require('fs');
const path = require('path');
const base = 'C:/Users/xuenbo01/AppData/Local/npm-cache/_npx/1e7f6d9597241db0/node_modules';
// StateDot lives in ui-primitives — find the real path (pnpm layout)
function find(dir, name, depth) {
  if (depth > 4) return null;
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return null; }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === name) return p;
      const r = find(p, name, depth + 1);
      if (r) return r;
    }
  }
  return null;
}
const dir = find(base + '/@deepseek-ai', 'dsh-client-ui-primitives', 0) || find(base + '/.pnpm', 'dsh-client-ui-primitives', 0);
console.log('primitives at:', dir);
if (dir) {
  const c = fs.readFileSync(path.join(dir, 'lib', 'client.js'), 'utf8');
  const i = c.indexOf('StateDot');
  console.log(c.slice(Math.max(0, i - 200), i + 1500).replace(/\s+/g, ' '));
}
