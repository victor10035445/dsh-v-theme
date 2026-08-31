const fs = require('fs');
const js = fs.readFileSync('C:/Users/xuenbo01/AppData/Local/npm-cache/_npx/1e7f6d9597241db0/node_modules/@deepseek-ai/dsh-web-frontend/dist/assets/index-ClqxG24t.js', 'utf8');
// find context around dsh-client-ui-slots occurrence
for (const needle of ['dsh-client-ui-slots', 'dsh-client-ui-primitives', 'seed', 'static']) {
  let i = -1, count = 0;
  while ((i = js.indexOf(needle, i + 1)) !== -1 && count < 2) {
    console.log('=== ' + needle + ' @' + i + ' ===');
    console.log(js.slice(Math.max(0, i - 300), i + 300).replace(/\n/g, ' '));
    console.log();
    count++;
  }
}
