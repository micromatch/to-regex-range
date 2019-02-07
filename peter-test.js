const toRegexRange = require('./');
var source = toRegexRange('-128', '127', {capture: true, antlr: true});
console.log("-128 -> 127 = "+source);

