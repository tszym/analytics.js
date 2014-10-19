analytics.data.measure = function (id, caption) {

  var _id = id;
  var _caption = caption;

  // returned object
  var _measure = {};

  _measure.id = function(id) {
    if (!arguments.length) return _id;
    _id = id;
    return _measure;
  };

  _measure.caption = function(caption) {
    if (!arguments.length) return _caption;
    _caption = caption;
    return _measure;
  };

  _measure.equals = function (other) {
    return (typeof other.id == "function") && (_id === other.id());
  };

  return _measure;
};
