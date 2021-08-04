// a => a && typeof a === "object" && a.constructor === Array, // alt for no ES5
const isArray = (a) => Array.isArray(a);
const isObject = (o) => o && typeof o === 'object' && o.constructor === Object;
const isDictionary = (d) => isObject(d) && !isArray(d);

function deepExtend(...extend) {
  let end = {};
  for (const val of extend) {
    if (isDictionary(val)) {
      // contains dictionary
      if (!isObject(end)) end = {}; // change end to {} if end is not object
      for (const k in val) end[k] = deepExtend(end[k], val[k]); // loops through all nested objects
    } else end = val;
  }
  return end;
}

module.exports = {
  isArray, isObject, isDictionary, deepExtend,
};
