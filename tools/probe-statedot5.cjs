const c = require('fs').readFileSync('C:/Users/xuenbo01/AppData/Local/npm-cache/_npx/1e7f6d9597241db0/node_modules/@deepseek-ai/dsh-web-frontend/dist/assets/index-ClqxG24t.js', 'utf8');
// StateDot is Pu — find its definition: function Pu( or Pu= 
for (const pat of ['function Pu(', 'var Pu=', 'Pu=']) {
  const i = c.indexOf(pat);
  if (i >= 0) {
    console.log('=== ' + pat + ' @' + i + ' ===');
    console.log(c.slice(i, i + 900).replace(/\s+/g, ' '));
    break;
  }
}
