
var toRegexRange = require('./');

function toRange(str) {
  var m = str.match(/(\d+)-(\d+)/);
  return toRegexRange(m[1], m[2]);
}

console.log(toRange('111-555'));
