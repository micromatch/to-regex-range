

function isSame(str) {
  return typeof str === 'string'
    && /^(.)\1+$/.test(str);
}

function areSimilar(a, b) {
  return isSame(a) && isSame(b)
    && a.length === b.length;
}

function chars(str) {
  return '[' + str + ']'
}

function notChars(str) {
  return '[^' + str + ']'
}

function range(a, b) {
  return chars(a + '-' + b);
}

function notRange(a, b) {
  return notChars(a + '-' + b);
}

function toBraces(str) {
  return '{' + str + '}';
}
