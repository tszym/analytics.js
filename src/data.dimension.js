analytics.data.dimension = function (id, caption, hierarchy) {

  var _id = id;
  var _caption = caption;
  var _hierarchy = hierarchy;
  var _membersStack = []; // stack of all slice done on this hierarchy
  var _membersSelected = []; // list of selected elements on the screen for the last level of the stack
  // _properties = false; // do we need to get the properties for this dimension ? TODO do not use this
  // _crossfilter = undefined; // crossfilter element for this dimension
  // _crossfilterGroup = undefined; // crossfilter element for the group of this dimension

  // returned object
  var _dimension = {};

  _dimension.id = function(id) {
    if (!arguments.length) return _id;
    _id = id;
    return _dimension;
  };

  _dimension.caption = function(caption) {
    if (!arguments.length) return _caption;
    _caption = caption;
    return _dimension;
  };

  _dimension.hierarchy = function(hierarchy) {
    if (!arguments.length) return _hierarchy;
    _hierarchy = hierarchy;
    return _dimension;
  };

  _dimension.currentLevel = function() {
    return _membersStack.length - 1;
  };

  // TODO
  _dimension.maxLevel = function() {
    // Query.getLevels(this.schema, this.cube, _dimension.id(), _dimension.hierarchy())).length
    return 3;
  };

  _dimension.getGeoProperty = function (argument) {
    // TODO
    return "geom";
  };

  _dimension.addSlice = function (members) {
    _membersStack.push(members);
    return _dimension;
  };

  _dimension.removeLastSlice = function () {
    _membersStack = _membersStack.slice(0, -1);
    return _dimension;
  };

  _dimension.getLastSlice = function () {
    return _membersStack[_membersStack.length - 1];
  };

  _dimension.isDrillPossible = function () {
    return (_dimension.currentLevel() < _dimension.maxLevel());
  };

  _dimension.isRollPossible = function () {
    return (_dimension.currentLevel() > 0);
  };

  _dimension.equals = function (other) {
    return (typeof other.id == "function") && (_id === other.id());
  };

  return _dimension;
};
