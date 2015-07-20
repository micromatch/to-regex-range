
var utils = module.exports;

// TODO: publish as lib
utils.toRange = function toRange(start, stop, step) {
  step = step || 1;
  var arr = new Array((stop - start) / step);
  var num = 0;

  for (var i = start; i <= stop; i += step) {
    arr[num++] = i;
  }
  return arr;
};
