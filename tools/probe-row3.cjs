const c = require('fs').readFileSync('C:/Users/xuenbo01/AppData/Local/npm-cache/_npx/1e7f6d9597241db0/node_modules/@deepseek-ai/dsh-client-ui-workspace/lib/client.js', 'utf8');
// minified: dot likely accessed as .dot in a destructured/property form — search 'dot' near 'running'
for (const frag of ['running', 'completed']) {
  let i = c.indexOf('completed:');
  console.log('=== first "' + frag + '" context ===');
  const j = c.indexOf('completed: ', c.indexOf('SessionRow') > 0 ? c.indexOf('SessionRow') : 0);
}
// Show the session row render: search for aria-selected near sessionRow (already found @35457)
const k = c.indexOf('Rows_module_css_default.sessionRow');
// go BACK: the component definition is before its usage; find the JSX return containing this
const start = c.lastIndexOf('return (0, react_jsx_runtime.jsx', k);
console.log('--- JSX around sessionRow ---');
console.log(c.slice(k - 2600, k + 300).replace(/\s+/g, ' '));
