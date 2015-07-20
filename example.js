/*!
 * to-regex-range <https://github.com/jonschlinkert/to-regex-range>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

// console.log(zip('12', '780'));
// console.log(expand(1, 3457));
// console.log(expand(2, 3457));
// console.log(expand(3, 3457));
// console.log(splitToRanges(12, 3456));
// console.log(toRegex(12, 3456));


function toRegex(min, max) {
  min = String(min);

  if (typeof max === 'undefined') {
    if (min.length === 1 || isSame(min)) {
      return min;
    }
  }

  max = String(max);
  if (min === max) {
    return min;
  }

  if (min.length > 2) {
    var arr = min.match(/.{2}/g);
    return arr.map(toRegex).join('');
  }

  var pre = min.slice(0, 1);
  var rest = min.slice(1);
  var res = '';

  if (rest === '1') {
    res = pre + '[01]';
  } else {
    res = pre + '[0-' + rest + ']';
  }
  return res;
}

// 31 => 3[01]
// 39 => 3[0-9]
// console.log(toRegex(9));

console.log(toRegex(123));
// console.log(isSame('9999999999999'));

console.log(areSimilar('111', '998'));
console.log(areSimilar('111', '555'));

console.log(simpleRange('111', '555'))


// 000..255 => ^([01][0-9][0-9]|2[0-4][0-9]|25[0-5])$
// 0 or 000..255 => ^([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])$
// 0 or 000..127 => ^(0?[0-9]?[0-9]|1[01][0-9]|12[0-7])$
// 0..999 => ^([0-9]|[1-9][0-9]|[1-9][0-9][0-9])$
// 000..999 => ^[0-9]{3}$
// 0 or 000..999 => ^[0-9]{1,3}$
// 1..999 => ^([1-9]|[1-9][0-9]|[1-9][0-9][0-9])$
// 001..999 => ^(00[1-9]|0[1-9][0-9]|[1-9][0-9][0-9])$
// 1 or 001..999 => ^(0{0,2}[1-9]|0?[1-9][0-9]|[1-9][0-9][0-9])$
// 0 or 00..59 => ^[0-5]?[0-9]$
// 0 or 000..366 => ^(0?[0-9]?[0-9]|[1-2][0-9][0-9]|3[0-5][0-9]|36[0-6])$

var re;

// 0-77
re = '([0-9]|[1-6][0-9]|7[0-7])';

// 1-77
re = '([1-9]|[1-6][0-9]|7[0-7])';

// 000-998
re = '([0-9]{1,2}|[1-8][0-9]{2}|9[0-8][0-9]|99[0-8])';

// 000-555
re = '([0-9]{1,2}|[1-4][0-9]{2}|5[0-4][0-9]|55[0-5])';

// 001-555
re = '([1-9][0-9]?|[1-4][0-9]{2}|5[0-4][0-9]|55[0-5])';

// 111-555
re = '(11[1-9]|1[2-9][0-9]|[2-4][0-9]{2}|5[0-4][0-9]|55[0-5])';
