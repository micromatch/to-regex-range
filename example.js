var toRegexRange = require('./');

console.log(toRegexRange('111', '555'));
//=> '11[1-9]|1[2-9]\d|[2-4]\d{2}|5[0-4]\d|55[0-5]'
console.log(toRegexRange('5', '5'));
//=> '5'
console.log(toRegexRange('5', '6'));
//=> '[5-6]'
console.log(toRegexRange('51', '229'));
//=> '5[1-9]|[6-9]\d|1\d{2}|2[0-2]\d'
console.log(toRegexRange('51', '29'));
//=> '51|29'

console.log(toRegexRange('1991', '2015'));
console.log(toRegexRange('1', '10', '2'));
var re = new RegExp(toRegexRange('1', '99'));
console.log(re.test('50'));
// => true

