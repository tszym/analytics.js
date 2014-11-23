analytics.data.property = function (id, caption, type) {

  var _id = id;
  var _caption = caption;
  var _type = type;

  // returned object
  var _property = {};

  _property.id = function(id) {
    if (!arguments.length) return _id;
    _id = id;
    return _property;
  };

  _property.caption = function(caption) {
    if (!arguments.length) return _caption;
    _caption = caption;
    return _property;
  };

  _property.type = function(type) {
    if (!arguments.length) return _type;
    _type = type;
    return _property;
  };

  _property.equals = function (other) {
    return (typeof other.id == "function") && (_id === other.id());
  };

  return _property;
};
