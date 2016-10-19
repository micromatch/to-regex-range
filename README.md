# to-regex-range [![NPM version](https://img.shields.io/npm/v/to-regex-range.svg?style=flat)](https://www.npmjs.com/package/to-regex-range) [![NPM monthly downloads](https://img.shields.io/npm/dm/to-regex-range.svg?style=flat)](https://npmjs.org/package/to-regex-range)  [![NPM total downloads](https://img.shields.io/npm/dt/to-regex-range.svg?style=flat)](https://npmjs.org/package/to-regex-range) [![Linux Build Status](https://img.shields.io/travis/jonschlinkert/to-regex-range.svg?style=flat&label=Travis)](https://travis-ci.org/jonschlinkert/to-regex-range)

> Returns a regex-compatible range from two numbers, min and max. Validated against more than 1.1 million generated unit tests that run in less than 400ms! Useful for creating regular expressions to validate numbers, ranges, years, etc.

## Install

Install with [npm](https://www.npmjs.com/):

```sh
$ npm install --save to-regex-range
```

## Notes

Validated against [1,117,543 generated unit tests](./test/test.js), to provide brute-force verification that the generated regex-ranges are correct.

## Usage

```js
var toRegexRange = require('to-regex-range');

var re = new RegExp(toRegexRange('1', '99'));
re.test('50');
//=> true
```

**Examples**

```js
console.log(toRegexRange('111', '555'));
//=> 11[1-9]|1[2-9][0-9]|[2-4][0-9]{2}|5[0-4][0-9]|55[0-5]

console.log(toRegexRange('5', '5'));
//=> 5

console.log(toRegexRange('5', '6'));
//=> [5-6]

console.log(toRegexRange('51', '229'));
//=> 5[1-9]|[6-9][0-9]|1[0-9]{2}|2[0-2][0-9]

console.log(toRegexRange('29', '51'));
//=> 29|[3-4][0-9]|5[0-1]

console.log(toRegexRange('1', '100000'));
//=> [1-9]|[1-9][0-9]{1,4}|100000
```

When the `min` is larger than the `max`, values will be flipped to create a valid range:

```js
toRegexRange('51', '29');
//=> 29|[3-4][0-9]|5[0-1]
```

**Heads up!**

This library does not support steps (increments) or zero-padding.

## History

### v1.0

More optimizations! As of v1.0, repeating ranges are now grouped using quantifiers. Processing time is roughly the same, but the generated regex is much smaller, which should result in faster matching.

**Key**

_(for the before/after comparison tables)_

* `range`: the generated range, e.g. `toRegexRange(1, 10000000)`
* `stats`: size of the generated string, and processing time
* `result`: generated string

#### Before

Patterns generated before v1.0 changes:

**Range**     | **Stats**           | **Result**
---           | ---                 | ---
`1..10000000` | `99 B` (11ms 666μs) | `([1-9]|[1-9][0-9]|[1-9][0-9]{2}|[1-9][0-9]{3}|[1-9][0-9]{4}|[1-9][0-9]{5}|[1-9][0-9]{6}|10000000)`
`1..1000000`  | `84 B` (2ms 96μs)   | `([1-9]|[1-9][0-9]|[1-9][0-9]{2}|[1-9][0-9]{3}|[1-9][0-9]{4}|[1-9][0-9]{5}|1000000)`
`1..100000`   | `69 B` (1ms 674μs)  | `([1-9]|[1-9][0-9]|[1-9][0-9]{2}|[1-9][0-9]{3}|[1-9][0-9]{4}|100000)`
`1..10000`    | `54 B` (2ms 40μs)   | `([1-9]|[1-9][0-9]|[1-9][0-9]{2}|[1-9][0-9]{3}|10000)`
`1..1000`     | `39 B` (1ms 263μs)  | `([1-9]|[1-9][0-9]|[1-9][0-9]{2}|1000)`
`1..100`      | `24 B` (1ms 905μs)  | `([1-9]|[1-9][0-9]|100)`
`1..10`       | `12 B` (383μs)      | `([1-9]|10)`
`1..3`        | `9 B` (260μs)       | `([1-3])`

#### After

With v1.0 optimizations.

**Range**     | **Stats**           | **Result**
---           | ---                 | ---
`1..10000000` | `34 B` (11ms 702μs) | `([1-9]|[1-9][0-9]{1,6}|10000000)`
`1..1000000`  | `33 B` (1ms 274μs)  | `([1-9]|[1-9][0-9]{1,5}|1000000)`
`1..100000`   | `32 B` (726μs)      | `([1-9]|[1-9][0-9]{1,4}|100000)`
`1..10000`    | `31 B` (2ms 432μs)  | `([1-9]|[1-9][0-9]{1,3}|10000)`
`1..1000`     | `30 B` (507μs)      | `([1-9]|[1-9][0-9]{1,2}|1000)`
`1..100`      | `24 B` (267μs)      | `([1-9]|[1-9][0-9]|100)`
`1..10`       | `12 B` (240μs)      | `([1-9]|10)`
`1..3`        | `9 B` (665μs)       | `([1-3])`

## Attribution

Inspired by the python lib [range-regex](https://github.com/dimka665/range-regex).

## About

### Related projects

* [expand-range](https://www.npmjs.com/package/expand-range): Fast, bash-like range expansion. Expand a range of numbers or letters, uppercase or lowercase. See… [more](https://github.com/jonschlinkert/expand-range) | [homepage](https://github.com/jonschlinkert/expand-range "Fast, bash-like range expansion. Expand a range of numbers or letters, uppercase or lowercase. See the benchmarks. Used by micromatch.")
* [fill-range](https://www.npmjs.com/package/fill-range): Fill in a range of numbers or letters, optionally passing an increment or `step` to… [more](https://github.com/jonschlinkert/fill-range) | [homepage](https://github.com/jonschlinkert/fill-range "Fill in a range of numbers or letters, optionally passing an increment or `step` to use, or create a regex-compatible range with `options.toRegex`")
* [micromatch](https://www.npmjs.com/package/micromatch): Glob matching for javascript/node.js. A drop-in replacement and faster alternative to minimatch and multimatch. | [homepage](https://github.com/jonschlinkert/micromatch "Glob matching for javascript/node.js. A drop-in replacement and faster alternative to minimatch and multimatch.")
* [repeat-element](https://www.npmjs.com/package/repeat-element): Create an array by repeating the given value n times. | [homepage](https://github.com/jonschlinkert/repeat-element "Create an array by repeating the given value n times.")
* [repeat-string](https://www.npmjs.com/package/repeat-string): Repeat the given string n times. Fastest implementation for repeating a string. | [homepage](https://github.com/jonschlinkert/repeat-string "Repeat the given string n times. Fastest implementation for repeating a string.")

### Contributing

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](../../issues/new).

### Building docs

_(This document was generated by [verb-generate-readme](https://github.com/verbose/verb-generate-readme) (a [verb](https://github.com/verbose/verb) generator), please don't edit the readme directly. Any changes to the readme must be made in [.verb.md](.verb.md).)_

To generate the readme and API documentation with [verb](https://github.com/verbose/verb):

```sh
$ npm install -g verb verb-generate-readme && verb
```

### Running tests

Install dev dependencies:

```sh
$ npm install -d && npm test
```

### Author

**Jon Schlinkert**

* [github/jonschlinkert](https://github.com/jonschlinkert)
* [twitter/jonschlinkert](http://twitter.com/jonschlinkert)

### License

Copyright © 2016, [Jon Schlinkert](https://github.com/jonschlinkert).
Released under the [MIT license](https://github.com/jonschlinkert/to-regex-range/blob/master/LICENSE).

***

_This file was generated by [verb-generate-readme](https://github.com/verbose/verb-generate-readme), v0.2.0, on October 19, 2016._