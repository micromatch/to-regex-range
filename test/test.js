'use strict';

require('mocha');
var assert = require('assert');
var utils = require('./support');
var toRange = require('..');
var count = 0;

function toRegex(min, max) {
  return new RegExp('^(' + toRange(min, max) + ')$');
}

function match(min, max) {
  var regex = toRegex(min, max);
  return function(num) {
    return regex.test(String(num));
  };
}

function matchRange(min, max, expected, match, notMatch) {
  if (max - min >= 100000) {
    throw new Error('range is too large');
  }

  var actual = toRange(min, max);
  var msg = actual + ' => ' + expected;

  // test expected string
  assert.strictEqual(actual, expected, msg);

  var re = new RegExp('^(' + actual + ')$');
  for (var i = 0; i < match.length; i++) {
    assert(re.test(match[i]), 'should match ' + msg);
    count++;
  }

  if (!notMatch) return;
  for (var j = 0; j < notMatch.length; j++) {
    assert(!re.test(notMatch[j]), 'should not match ' + msg);
    count++;
  }
}

function verifyRange(min, max, from, to) {
  var isMatch = match(min, max);
  var range = utils.expandRange(from, to);
  var len = range.length, i = -1;

  while (++i < len) {
    var num = range[i];
    if (min <= num && num <= max) {
      assert(isMatch(num));
    } else {
      assert(!isMatch(num));
    }
    count++;
  }
}

describe('to-regex-range', function() {
  describe('range', function() {
    it('should throw an error when the first arg is invalid:', function() {
      assert.throws(function() {
        toRange();
      }, /toRegexRange: first argument is invalid/);
    });

    it('should throw an error when the second arg is invalid:', function() {
      assert.throws(function() {
        toRange(1, {});
      }, /toRegexRange: second argument is invalid/);
    });
  });

  describe('minimum / maximum', function() {
    it('should reverse `min/max` when the min is larger than the max:', function() {
      assert.strictEqual(toRange(55, 10), '1[0-9]|[2-4][0-9]|5[0-5]');
    });
  });

  describe('ranges', function() {
    it('should return the number when only one argument is passed:', function() {
      assert.strictEqual(toRange(5), '5');
    });

    it('should not return a range when both numbers are the same:', function() {
      assert.strictEqual(toRange(5, 5), '5');
    });

    it('should support ranges than 10:', function() {
      assert.strictEqual(toRange(1, 5), '[1-5]');
    });

    it('should support strings:', function() {
      assert.strictEqual(toRange('1', '5'), '[1-5]');
      assert.strictEqual(toRange('10', '50'), '1[0-9]|[2-4][0-9]|50');
    });

    it('should generate regex strings for negative patterns', function() {
      assert.strictEqual(toRange(-1, 0), '-1|0');
      assert.strictEqual(toRange(-1, 1), '-1|[0-1]');
      assert.strictEqual(toRange(-4, -2), '-[2-4]');
      assert.strictEqual(toRange(-3, 1), '-[1-3]|[0-1]');
      assert.strictEqual(toRange(-2, 0), '-[1-2]|0');
      assert.strictEqual(toRange(-1, 3), '-1|[0-3]');
      matchRange(-1, -1, '-1', [-1], [-2, 0, 1]);
      matchRange(-1, -10, '-[1-9]|-10', [-1, -5, -10], [-11, 0]);
      matchRange(-1, 3, '-1|[0-3]', [-1, 0, 1, 2, 3], [-2, 4]);
    });

    it('should generate regex strings for positive patterns', function() {
      assert.strictEqual(toRange(1, 1), '1');
      assert.strictEqual(toRange(0, 1), '[0-1]');
      assert.strictEqual(toRange(0, 2), '[0-2]');
      assert.strictEqual(toRange(65666, 65667), '6566[6-7]');
      assert.strictEqual(toRange(12, 3456), '1[2-9]|[2-9][0-9]|[1-9][0-9]{2}|[1-2][0-9]{3}|3[0-3][0-9]{2}|34[0-4][0-9]|345[0-6]');
      assert.strictEqual(toRange(1, 3456), '[1-9]|[1-9][0-9]{1,2}|[1-2][0-9]{3}|3[0-3][0-9]{2}|34[0-4][0-9]|345[0-6]');
      assert.strictEqual(toRange(1, 10), '[1-9]|10');
      assert.strictEqual(toRange(1, 19), '[1-9]|1[0-9]');
      assert.strictEqual(toRange(1, 99), '[1-9]|[1-9][0-9]');
      assert.strictEqual(toRange(1, 100), '[1-9]|[1-9][0-9]|100');
      assert.strictEqual(toRange(1, 1000), '[1-9]|[1-9][0-9]{1,2}|1000');
      assert.strictEqual(toRange(1, 10000), '[1-9]|[1-9][0-9]{1,3}|10000');
      assert.strictEqual(toRange(1, 100000), '[1-9]|[1-9][0-9]{1,4}|100000');
      assert.strictEqual(toRange(1, 9999999), '[1-9]|[1-9][0-9]{1,6}');
      assert.strictEqual(toRange(99, 100000), '99|[1-9][0-9]{2,4}|100000');

      matchRange(99, 100000, '99|[1-9][0-9]{2,4}|100000', [99, 999, 989, 100, 9999, 9899, 10009, 10999, 100000], [0, 9, 100001, 100009]);
    });

    it('should optimize regexes', function() {
      assert.strictEqual(toRange(-9, 9), '-[1-9]|[0-9]');
      assert.strictEqual(toRange(-19, 19), '-[1-9]|-?1[0-9]|[0-9]');
      assert.strictEqual(toRange(-29, 29), '-[1-9]|-?[1-2][0-9]|[0-9]');
      assert.strictEqual(toRange(-99, 99), '-[1-9]|-?[1-9][0-9]|[0-9]');
      assert.strictEqual(toRange(-999, 999), '-[1-9]|-?[1-9][0-9]{1,2}|[0-9]');
      assert.strictEqual(toRange(-9999, 9999), '-[1-9]|-?[1-9][0-9]{1,3}|[0-9]');
      assert.strictEqual(toRange(-99999, 99999), '-[1-9]|-?[1-9][0-9]{1,4}|[0-9]');
    });
  });

  describe('validate ranges', function() {
    after(function() {
      var num = (+(+(count).toFixed(2))).toLocaleString();
      console.log();
      console.log('   ', num, 'values tested');
    });

    it('should support negative numbers:', function() {
      verifyRange(-9, 9, -100, 100);
      verifyRange(-99, 99, -1000, 1000);
      verifyRange(-999, 999, -1000, 1000);
      verifyRange(-9999, 9999, -10000, 10000);
      verifyRange(-99999, 99999, -100999, 100999);
    });

    it('should support equal numbers:', function() {
      verifyRange(1, 1, 0, 100);
      verifyRange(65443, 65443, 65000, 66000);
      verifyRange(192, 192, 0, 1000);
    });

    it('should support large numbers:', function() {
      verifyRange(100019999300000, 100020000300000, 100019999999999, 100020000100000);
    });

    it('should support large ranges:', function() {
      verifyRange(1, 100000, 1, 1000);
      verifyRange(1, 100000, 10000, 11000);
      verifyRange(1, 100000, 99000, 100000);
      verifyRange(1, 100000, 1000, 2000);
      verifyRange(1, 100000, 10000, 12000);
      verifyRange(1, 100000, 50000, 60000);
      verifyRange(1, 100000, 99999, 101000);
    });

    it('should support repeated digits:', function() {
      verifyRange(10331, 20381, 0, 99999);
      verifyRange(0, 111, -99, 999);
      verifyRange(0, 222, -99, 999);
      verifyRange(0, 333, -99, 999);
      verifyRange(0, 444, -99, 999);
      verifyRange(0, 555, -99, 999);
      verifyRange(0, 666, -99, 999);
      verifyRange(0, 777, -99, 999);
      verifyRange(0, 888, -99, 999);
      verifyRange(0, 999, -99, 999);
      verifyRange(111, 222, 0, 999);
      verifyRange(111, 333, 0, 999);
      verifyRange(111, 444, 0, 999);
      verifyRange(111, 555, 0, 999);
      verifyRange(111, 666, 0, 999);
      verifyRange(111, 777, 0, 999);
      verifyRange(111, 888, 0, 999);
      verifyRange(111, 999, 0, 999);
    });

    it('should support repeated zeros:', function() {
      verifyRange(10031, 20081, 0, 59999);
      verifyRange(10000, 20000, 0, 59999);
    });

    it('should support zero one:', function() {
      verifyRange(10301, 20101, 0, 99999);
    });

    it('should support repeated ones:', function() {
      verifyRange(102, 111, 0, 1000);
    });

    it('should support small diffs:', function() {
      verifyRange(102, 103, 0, 1000);
      verifyRange(102, 110, 0, 1000);
      verifyRange(102, 130, 0, 1000);
    });

    it('should support random ranges:', function() {
      verifyRange(4173, 7981, 0, 99999);
    });

    it('should support one digit numbers:', function() {
      verifyRange(3, 7, 0, 99);
    });

    it('should support one digit at bounds:', function() {
      verifyRange(1, 9, 0, 1000);
    });

    it('should support power of ten:', function() {
      verifyRange(1000, 8632, 0, 99999);
    });

    it('should work with numbers of varying lengths:', function() {
      verifyRange(1030, 20101, 0, 99999);
      verifyRange(13, 8632, 0, 10000);
    });

    it('should support small ranges:', function() {
      verifyRange(9, 11, 0, 100);
      verifyRange(19, 21, 0, 100);
    });

    it('should support big ranges:', function() {
      verifyRange(90, 98009, 0, 98999);
      verifyRange(999, 10000, 1, 20000);
    });
  });
});
