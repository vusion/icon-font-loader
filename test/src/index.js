import style  from './css/test.css';

const test = 123;

// const icons = require('icons-loader');

const $app = document.getElementById('app');

$app.innerHTML = `
<i class="${require('./icons/slice.svg').class}"></i>
<i class="${require('./icons/sound-off.svg')}"></i>
<i class="${require('./icons/sound-on.svg')}"></i>
<i class="${require('./icons/arrow-left.svg')}"></i>
<i class="${require('./icons/test/arrow-left.svg')}"></i>
<i class="${require('./icons/arrow-right.svg')}"></i>
<i class="${require('./icons/arrow-up.svg')}"></i>
`
