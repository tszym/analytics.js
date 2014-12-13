analytics.utils = (function() {

  var utils = {};

  utils.createMapFromArray = function (array) {
    var map = {};
    array.forEach(function (el) {
      map[el.id()] = el;
    });
    return map;
  };

  utils.indexOf = function (array, el) {
    for (var i = 0; i < array.length; i++)
      if (array[i].equals(el))
        return i;
    return -1;
  };

  utils.arraysEquals = function (array1, array2) {
    if (array1.length != array2.length)
      return false;

    for (var i in array1)
      if (!array1[i].equals(array2[i]))
        return false;

    return true;
  };

  utils.cloneObject = function (object) {
    var out = {};
    for (var key in object)
      out[key] = object[key];
    return out;
  };

  return utils;
})();

