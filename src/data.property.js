/**
## data.**property**(*string* id, *string* caption, *string* type)

This object describes an OLAP property. It has the following functions:

* *mixed* data.property.**id**([*string* id])
* *mixed* data.property.**caption**([*string* caption])
* *mixed* data.property.**type**([*string* type])
* *boolean* data.property.**equals**(*data.property* other)

`id`, `caption` and `type` are getters/setters.
**/
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
