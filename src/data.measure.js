/**
## data.**measure**(*string* id, *string* caption)

This object describes an OLAP measure. It has the following functions:

* *mixed* data.measure.**id**([*string* id])
* *mixed* data.measure.**caption**([*string* caption])
* *boolean* data.measure.**equals**(*data.measure* other)

`id` and `caption` are getters/setters.
**/
analytics.data.measure = function (id, caption, description) {

  var _id = id;
  var _caption = caption;
  var _description = description;

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

  _measure.description = function(description) {
    if (!arguments.length) return _description;
    _description = description;
    return _measure;
  };

  _measure.equals = function (other) {
    return (typeof other.id == "function") && (_id === other.id());
  };

  return _measure;
};
