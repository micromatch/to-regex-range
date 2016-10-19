
var utils = module.exports;

// TODO: publish as lib
utils.expandRange = function(min, max, step) {
  step = step ? Math.abs(step) : 1;
  min = +min;
  max = +max;

  var arr = new Array(Math.floor((max - min) / step));
  var num = 0;

  for (var i = min; i <= max; i += step) {
    arr[num++] = i;
  }
  return arr;
};
