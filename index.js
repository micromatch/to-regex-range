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

  var a = Math.min(min, max);
  var b = Math.max(min, max);

  if (a === b) return String(a);

  var key = min + ':' + max;
  if (cache.range.hasOwnProperty(key)) {
    return cache.range[key];
  }

  var positives = [];
  var negatives = [];

  if (a < 0) {
    var newMin = b < 0 ? Math.abs(b) : 1;
    var newMax = Math.abs(a);
    negatives = splitToPatterns(newMin, newMax);
    a = 0;
  }

  if (b >= 0) {
    positives = splitToPatterns(a, b);
  }

  var str = siftPatterns(negatives, positives);
  cache.range[key] = str;
  return str;
}

function siftPatterns(negatives, positives) {
  var onlyNegative = filterPatterns(negatives, positives, '-');
  var onlyPositive = filterPatterns(positives, negatives, '');
  var intersected = filterPatterns(negatives, positives, '-?', true);
  var subpatterns = onlyNegative.concat(intersected || []).concat(onlyPositive || []);
  return subpatterns.join('|');
}

function splitToRanges(min, max) {
  min = Number(min);
  max = Number(max);

  var nines = 1;
  var stops = [max];
  var stop = +countNines(min, nines);

  while (min <= stop && stop <= max) {
    stops = push(stops, stop);
    nines += 1;
    stop = +countNines(min, nines);
  }

  var zeros = 1;
  stop = countZeros(max + 1, zeros) - 1;

  while (min < stop && stop <= max) {
    stops = push(stops, stop);
    zeros += 1;
    stop = countZeros(max + 1, zeros) - 1;
  }

  stops.sort(compare);
  return stops;
}

/**
 * Convert a range to a regex pattern
 * @param {Number} `start`
 * @param {Number} `stop`
 * @return {String}
 */

function rangeToPattern(start, stop) {
  if (start === stop) {
    return {pattern: String(start), digits: []};
  }

  var key = start + ':' + stop;
  if (cache.rangeToPattern.hasOwnProperty(key)) {
    return cache.rangeToPattern[key];
  }

  var zipped = zip(String(start), String(stop));
  var len = zipped.length, i = -1;

  var pattern = '';
  var digits = 0;

  while (++i < len) {
    var range = zipped[i];
    var startDigit = range[0];
    var stopDigit = range[1];

    if (startDigit === stopDigit) {
      pattern += startDigit;

    } else if (startDigit !== '0' || stopDigit !== '9') {
      pattern += toRange(startDigit, stopDigit);

    } else {
      digits += 1;
    }
  }

  if (digits) {
    pattern += '[0-9]';
  }

  return { pattern: pattern, digits: [digits] };
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
  var tokens = [];
  var prev;

  while (++idx < len) {
    var range = ranges[idx];
    var tok = rangeToPattern(start, range);

    if (prev && prev.pattern === tok.pattern) {
      if (prev.digits.length > 1) {
        prev.digits.pop();
      }
      prev.digits.push(tok.digits[0]);
      prev.string = prev.pattern + toQuantifier(prev.digits);
      start = range + 1;
      continue;
    }

    tok.string = tok.pattern + toQuantifier(tok.digits);
    tokens.push(tok);
    start = range + 1;
    prev = tok;
  }

  return tokens;
}

function filterPatterns(arr, comparison, prefix, intersection) {
  var len = arr.length, i = -1;
  var intersected = [];
  var res = [];

  comparison = comparison.map(function(tok) {
    return tok.string;
  });

  while (++i < len) {
    var tok = arr[i];
    var ele = tok.string;

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

function toQuantifier(digits) {
  var start = digits[0];
  var stop = digits[1] ? (',' + digits[1]) : '';
  if (!stop && (!start || start === 1)) {
    return '';
  }
  return '{' + start + stop + '}';
}

function toRange(a, b) {
  return '[' + a + '-' + b + ']';
}

function compare(a, b) {
  return a > b ? 1 : b > a ? -1 : 0;
}

function push(arr, ele) {
  if (arr.indexOf(ele) === -1) arr.push(ele);
  return arr;
}

/**
 * Expose `toRegexRange`
 */

module.exports = toRegexRange;
