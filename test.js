'use strict';

/* deps: mocha */
var assert = require('assert');
var should = require('should');
var toRegex = require('./');

describe('toRegex', function () {
  it('should throw an error when the first arg is invalid:', function () {
    (function () {
      toRegex();
    }).should.throw('toRegex: first argument is invalid.');
  });

  it('should throw an error when the second arg is invalid:', function () {
    (function () {
      toRegex(1, {});
    }).should.throw('toRegex: second argument is invalid.');
  });
});

describe('toRegex', function () {
  it('should return the number when only one argument is passed:', function () {
    assert.equal(toRegex(5), '5');
  });

  it('should not return a range when both numbers are the same:', function () {
    assert.equal(toRegex(5, 5), '5');
  });

  it('should support ranges than 10:', function () {
    assert.equal(toRegex(1, 5), '[1-5]');
  });

  it('should generate regular expressions from the given pattern', function () {
    assert.equal(toRegex(1, 1), '1');
    assert.equal(toRegex(0, 1), '[0-1]');
    assert.equal(toRegex(-1, -1), '-1');
    assert.equal(toRegex(-1, 0), '-1|0');
    assert.equal(toRegex(-1, 1), '-1|[0-1]');
    assert.equal(toRegex(-4, -2), '-[2-4]');
    assert.equal(toRegex(-3, 1), '-[1-3]|[0-1]');
    assert.equal(toRegex(-2, 0), '-[1-2]|0');
    assert.equal(toRegex(0, 2), '[0-2]');
    assert.equal(toRegex(-1, 3), '-1|[0-3]');
    assert.equal(toRegex(65666, 65667), '6566[6-7]');
    assert.equal(toRegex(12, 3456), '1[2-9]|[2-9]\\d|[1-9]\\d{2}|[1-2]\\d{3}|3[0-3]\\d{2}|34[0-4]\\d|345[0-6]');
    assert.equal(toRegex(1, 3456), '[1-9]|[1-9]\\d|[1-9]\\d{2}|[1-2]\\d{3}|3[0-3]\\d{2}|34[0-4]\\d|345[0-6]');
    assert.equal(toRegex(1, 10), '[1-9]|10');
    assert.equal(toRegex(1, 19), '[1-9]|1\\d');
    assert.equal(toRegex(1, 99), '[1-9]|[1-9]\\d');
  });

  it('should optimize regexes', function () {
    assert.equal(toRegex(-9, 9), '-[1-9]|\\d');
    assert.equal(toRegex(-19, 19), '-[1-9]|-?1\\d|\\d');
    assert.equal(toRegex(-29, 29), '-[1-9]|-?[1-2]\\d|\\d');
    assert.equal(toRegex(-99, 99), '-[1-9]|-?[1-9]\\d|\\d');
    assert.equal(toRegex(-999, 999), '-[1-9]|-?[1-9]\\d|-?[1-9]\\d{2}|\\d');
    assert.equal(toRegex(-9999, 9999), '-[1-9]|-?[1-9]\\d|-?[1-9]\\d{2}|-?[1-9]\\d{3}|\\d');
  });
});
