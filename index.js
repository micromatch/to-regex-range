/*!
 * to-regex-range <https://github.com/jonschlinkert/to-regex-range>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

// var padLeft = require('pad-left');
var repeat = require('repeat-string');
var isNumber = require('is-number');
var unique = require('array-unique');

function toRegex(min, max) {
  if (isNumber(min) === false) {
    throw new TypeError('toRegex: first argument is invalid.');
  }

  if (typeof max === 'undefined') {
    return '' + min;
  }

  if (isNumber(max) === false) {
    throw new TypeError('toRegex: second argument is invalid.');
  }

  min = min.toString();
  max = max.toString();

  if (min === max) {
    return min;
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
    // console.log(positives)
  }

  var onlyNegative = filterPatterns(negatives, positives, '-');
  var onlyPositive = filterPatterns(positives, negatives, '');
  var intersected = addPatterns(negatives, positives, '-?');

  var subpatterns = onlyNegative.concat(intersected || []).concat(onlyPositive || []);
  return subpatterns.join('|');
}

function splitToRanges(min, max) {
  var stops = [+max];

  var nines = 1;
  var stop = +countNines(min, nines);
  min = +min;
  max = +max;

  while (min <= stop && stop <= max) {
    stops = add(stops, stop);
    nines += 1;
    stop = +countNines(min, nines);
  }

  var zeros = 1;
  stop = countZeros(max + 1, zeros) - 1;

  while (min < stop && stop <= +max) {
    stops = add(stops, stop);
    zeros += 1;
    stop = countZeros(max + 1, zeros) - 1;
  }

  stops.sort(compare);
  return stops;
}

function compare(a, b) {
  return a - b;
}

function add(arr, ele) {
  if (arr.indexOf(ele) === -1) {
    arr.unshift(ele);
  }
  return arr;
}

function countNines(num, len) {
  return String(num).slice(0, -len) + repeat('9', len);
}

function countZeros(integer, zerosCount) {
  return integer - (integer % Math.pow(10, zerosCount));
}

function toBraces(str) {
  return '{' + str + '}';
}

function range(a, b) {
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
      pattern += range(startDigit, stopDigit);

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

  // var ranges2 = rangeToPattern(start, range);
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

function filterPatterns(arr, comparison, prefix) {
  return arr.reduce(function (acc, ele) {
    if (comparison.indexOf(ele) === -1) {
      acc.push(prefix + ele);
    }
    return acc;
  }, []);
}

function addPatterns(arr, comparison, prefix) {
  return arr.reduce(function (acc, ele) {
    if (comparison.indexOf(ele) !== -1) {
      acc.push(prefix + ele);
    }
    return acc;
  }, []);
}

/**
 * Expose `toRegex`
 */

module.exports = toRegex;
