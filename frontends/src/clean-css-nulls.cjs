const fs = require('fs');
const f = 'frontends/src/index.css';
let css = fs.readFileSync(f, 'utf8');
const before = css.length;
const nulls = (css.match(/\u0000/g) || []).length;
css = css.replace(/\u0000/g, '');
fs.writeFileSync(f, css);
console.log('nulls removed:', nulls, 'bytes', before, '->', css.length);
