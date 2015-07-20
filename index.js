/*!
 * to-regex-range <https://github.com/jonschlinkert/to-regex-range>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var repeat = require('repeat-string');
var isNumber = require('is-number');

function toRegexRange(min, max) {
  if (isNumber(min) === false) {
    throw new TypeError('toRegexRange: first argument is invalid.');
  }

  if (typeof max === 'undefined') {
    return '' + min;
  }

  if (isNumber(max) === false) {
    throw new TypeError('toRegexRange: second argument is invalid.');
  }

  if (min === max) {
    return min;
  }

  min = min.toString();
  max = max.toString();
  var aPad, bPad;

  var zeros = 0;
  if (min.length > 1 && (zeros = /^0+/.exec(min))) {
    aPad = zeros[0].length;
    min = min.slice(aPad);
  }

  if (max.length > 1 && (zeros = /^0+/.exec(max))) {
    bPad = zeros[0].length;
    max = max.slice(bPad);
  }

  var positives = [];
  var negatives = [];

  if (min < 0) {
    var newMin = 1;
    if (max < 0) {
      newMin = Math.abs(max);
    }

    var newMax = Math.abs(min);
    negatives = splitToPatterns(newMin, newMax);
    min = 0;
  }

  if (max >= 0) {
    positives = splitToPatterns(min, max);
  }

  var onlyNegative = filterPatterns(negatives, positives, '-');
  var onlyPositive = filterPatterns(positives, negatives, '');
  var intersected = filterPatterns(negatives, positives, '-?', true);
  var subpatterns = onlyNegative.concat(intersected || []).concat(onlyPositive || []);
  var pad, res;

  if (pad = ((aPad || bPad) ? (aPad > bPad ? aPad : bPad) : null)) {
    var padding = repeat('0', pad);
    res = subpatterns.join('|' + padding);
    return padding + '(?:' + res + ')';
  }
  return subpatterns.join('|');
}

function splitToRanges(min, max) {
  min = +min;
  max = +max;

  var nines = 1;
  var stops = [max];
  var stop = +countNines(min, nines);

  while (min <= stop && stop <= max) {
    stops = add(stops, stop);
    nines += 1;
    stop = +countNines(min, nines);
  }

  var zeros = 1;
  stop = countZeros(max + 1, zeros) - 1;

  while (min < stop && stop <= max) {
    stops = add(stops, stop);
    zeros += 1;
    stop = countZeros(max + 1, zeros) - 1;
  }

  stops.sort(compare);
  return stops;
}

function rangeToPattern(start, stop) {
  var zipped = zip(String(start), String(stop));
  var len = zipped.length, i = -1;

  var pattern = '';
  var digits = 0;

  while (++i < len) {
    var current = zipped[i];
    var startDigit = current[0];
    var stopDigit = current[1];

    if (startDigit === stopDigit) {
      pattern += startDigit;

    } else if (startDigit !== '0' || stopDigit !== '9') {
      pattern += rangify(startDigit, stopDigit);

    } else {
      digits += 1;
    }
  }

  if (digits) {
    pattern += '\\d';
  }

  if (digits > 1) {
    pattern += toBraces(digits);
  }
  return pattern;
}


function zip(a, b) {
  // var alen = a.length;
  // var blen = b.length;
  // var diff;

  // if ((diff = (alen - blen)) > 0) {
  //   b = padLeft(b, diff, '0');

  // } else if ((diff = (blen - alen)) > 0) {
  //   a = padLeft(a, diff, '0');
  // }

  var arrA = a.split('');
  var arrB = b.split('');
  var len = arrA.length;
  var i = -1;
  var res = [];

  while (++i < len) {
    res.push([arrA[i], arrB[i]]);
  }
  return res;
}

function splitToPatterns(min, max) {
  var ranges = splitToRanges(min, max);
  var len = ranges.length, i = -1;

  var start = min;
  var subpatterns = [];

  while (++i < len) {
    var range = ranges[i];
    subpatterns.push(rangeToPattern(start, range));
    start = range + 1;
  }
  return subpatterns;
}

function filterPatterns(arr, comparison, prefix, intersection) {
  var len = arr.length, i = -1;
  var res = [], intersected = [];

  while (++i < len) {
    var ele = arr[i];
    if (!intersection && comparison.indexOf(ele) === -1) {
      res.push(prefix + ele);
    }

    if (intersection && comparison.indexOf(ele) !== -1) {
      intersected.push(prefix + ele);
    }
  }
  return intersection ? intersected : res;
}

function compare(a, b) {
  return a - b;
}

function add(arr, ele) {
  if (arr.indexOf(ele) === -1) {
    arr.push(ele);
  }
  return arr;
}

function countNines(num, len) {
  return String(num).slice(0, -len) + repeat('9', len);
}

function countZeros(integer, zeros) {
  return integer - (integer % Math.pow(10, zeros));
}

function toBraces(str) {
  return '{' + str + '}';
}

function rangify(a, b) {
  return chars(a + '-' + b);
}

function chars(str) {
  return '[' + str + ']';
}

function isSame(str) {
  if (str.charAt(0) === '-') {
    str = str.slice(1);
  }
  return /^(.)\1+$/.test(str);
}

function areSimilar(a, b) {
  return isSame(a) && isSame(b)
    && a.length === b.length;
}

/**
 * Expose `toRegexRange`
 */

module.exports = toRegexRange;
