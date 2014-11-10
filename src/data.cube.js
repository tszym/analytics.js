analytics.data.cube = function (id, caption) {

  var _id = id;
  var _caption = caption;

  // returned object
  var _cube = {};

  _cube.id = function(id) {
    if (!arguments.length) return _id;
    _id = id;
    return _cube;
  };

  _cube.caption = function(caption) {
    if (!arguments.length) return _caption;
    _caption = caption;
    return _cube;
  };

  _cube.equals = function (other) {
    return (typeof other.id == "function") && (_id === other.id());
  };

  return _cube;
};
