/*!
 * to-regex-range <https://github.com/jonschlinkert/to-regex-range>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var repeat = require('repeat-string');
var isNumber = require('is-number');
var cache = {range: {}, rangeToPattern: {}};

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

  var key = min + ':' + max;
  if (cache.range.hasOwnProperty(key)) {
    return cache.range[key];
  }

  var a = min;
  var b = max;

  if (min > 0 && max > 0) {
    a = Math.min(min, max);
    b = Math.max(min, max);
  }

  if (a === b) {
    return a;
  }

  if (a > b) {
    return a + '|' + b;
  }

  a = String(a);
  b = String(b);
  var positives = [];
  var negatives = [];

  if (a < 0) {
    var newMin = 1;
    if (b < 0) {
      newMin = Math.abs(b);
    }

    var newMax = Math.abs(a);
    negatives = splitToPatterns(newMin, newMax);
    a = 0;
  }
  if (b >= 0) {
    positives = splitToPatterns(a, b);
  }

  var res = siftPatterns(negatives, positives);
  cache.range[key] = res;
  return res;
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
  var key = start + ':' + stop;

  if (cache.rangeToPattern.hasOwnProperty(key)) {
    return cache.rangeToPattern[key];
  }

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
      pattern += toCharacterClass(startDigit, stopDigit);

    } else {
      digits += 1;
    }
  }

  if (digits) {
    pattern += '[0-9]';
  }

  if (digits > 1) {
    pattern += limit(digits);
  }

  cache.rangeToPattern[key] = pattern;
  return pattern;
}

/**
 * Zip strings (`for in` can be used on string characters)
 */

function zip(a, b) {
  var arr = [];
  for (var ch in a) arr.push([a[ch], b[ch]]);
  return arr;
}

function splitToPatterns(min, max) {
  var ranges = splitToRanges(min, max);
  var len = ranges.length;
  var idx = -1;

  var start = min;
  var subpatterns = new Array(len);

  while (++idx < len) {
    var range = ranges[idx];
    subpatterns[idx] = rangeToPattern(start, range);
    start = range + 1;
  }
  return subpatterns;
}

function filterPatterns(arr, comparison, prefix, intersection) {
  var len = arr.length, i = -1;
  var intersected = [];
  var res = [];

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

function countNines(num, len) {
  return String(num).slice(0, -len) + repeat('9', len);
}

function countZeros(integer, zeros) {
  return integer - (integer % Math.pow(10, zeros));
}

function limit(str) {
  return '{' + str + '}';
}

function toCharacterClass(a, b) {
  return '[' + a + '-' + b + ']';
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

/**
 * Expose `toRegexRange`
 */

module.exports = toRegexRange;
