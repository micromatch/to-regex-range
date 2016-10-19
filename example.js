var toRegexRange = require('./');
var utils = require('./test/support');

console.log("console.log(toRegexRange('111', '555'));");
console.log('//=> ' + toRegexRange('111', '555'));
//=> '11[1-9]|1[2-9]\d|[2-4]\d{2}|5[0-4]\d|55[0-5]'

console.log("console.log(toRegexRange('5', '5'));");
console.log('//=> ' + toRegexRange('5', '5'));
//=> '5'

console.log("console.log(toRegexRange('5', '6'));");
console.log('//=> ' + toRegexRange('5', '6'));
//=> '[5-6]'

console.log("console.log(toRegexRange('51', '229'));");
console.log('//=> ' + toRegexRange('51', '229'));
//=> '5[1-9]|[6-9]\d|1\d{2}|2[0-2]\d'

console.log("console.log(toRegexRange('29', '51'));");
console.log('//=> ' + toRegexRange('29', '51'));
//=> '29|[3-4][0-9]|5[0-1]'

console.log("console.log(toRegexRange('1', '100000'));");
console.log('//=> ' + toRegexRange('1', '100000'));
//=> '29|[3-4][0-9]|5[0-1]'
