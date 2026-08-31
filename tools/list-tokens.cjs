const fs = require('fs');
const path = require('path');
const REFS = path.join(__dirname, '..', 'design', 'refs');
const css = fs.readFileSync(path.join(REFS, 'design-platform-css.ref.css'), 'utf8');
// Split into light (body) and dark (body[data-ds-dark-theme]) blocks
const blocks = [];
const re = /(body(?:\[data-ds-dark-theme\])?)\s*\{/g;
let m;
const marks = [];
while ((m = re.exec(css))) marks.push({ sel: m[1], start: m.index + m[0].length });
for (let i = 0; i < marks.length; i++) {
  const end = i + 1 < marks.length ? marks[i + 1].start : css.length;
  blocks.push({ sel: marks[i].sel, body: css.slice(marks[i].start, end) });
}
const report = [];
for (const b of blocks) {
  report.push('=== ' + b.sel + ' ===');
  const pairs = [...b.body.matchAll(/(--dsw-[a-z0-9-]+)\s*:\s*([^;]+);/gi)];
  for (const p of pairs) report.push(p[1] + ' = ' + p[2].trim());
}
fs.writeFileSync(path.join(REFS, 'alias-tokens-full.txt'), report.join('\n'));
console.log('blocks:', blocks.map(b => b.sel).join(' | '));
