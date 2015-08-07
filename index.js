/*!
 * to-regex-range <https://github.com/jonschlinkert/to-regex-range>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var repeat = require('repeat-string');
var isNumber = require('is-number');
var cache = {};

function toRegexRange(min, max) {
  if (isNumber(min) === false) {
    throw new RangeError('toRegexRange: first argument is invalid.');
  }

  if (typeof max === 'undefined') {
    return '' + min;
  }

  if (isNumber(max) === false) {
    throw new RangeError('toRegexRange: second argument is invalid.');
  }

  var key = min + '-' + max;
  if (cache.hasOwnProperty(key)) {
    return cache[key];
  }

  var a = +min;
  var b = +max;

  if (a === b) {
    return a;
  }

  if (a > b) {
    return a + '|' + b;
  }

  min = min.toString();
  max = max.toString();
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

  var res = siftPatterns(negatives, positives);
  return (cache[key] = res);
}

function siftPatterns(negatives, positives) {
  var onlyNegative = filterPatterns(negatives, positives, '-');
  var onlyPositive = filterPatterns(positives, negatives, '');
  var intersected = filterPatterns(negatives, positives, '-?', true);
  var subpatterns = onlyNegative.concat(intersected || []).concat(onlyPositive || []);
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
    pattern += '[0-9]';
  }

  if (digits > 1) {
    pattern += toBraces(digits);
  }

  return pattern;
}

function zip(a, b) {
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

function toBrackets(str) {
  return '[' + str + ']';
}

function rangify(a, b) {
  return toBrackets(a + '-' + b);
}

/**
 * Expose `toRegexRange`
 */

module.exports = toRegexRange;
