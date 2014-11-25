analytics.data.dimension = function (id, caption, type, hierarchy, levels, properties) {

  // returned object
  var _dimension = {};

  var _id         = id;
  var _caption    = caption;
  var _hierarchy  = hierarchy;
  var _type       = type;
  var _levels     = levels;
  var _properties = properties;

  var _membersStack = []; // stack of all slice done on this hierarchy
  var _filters      = []; // list of selected elements on the screen for the last level of the stack

  var _colors = ["#6BBAFF", "#51AEFF", "#36A2FF", "#1E96FF", "#0089FF", "#0061B5"];

  _dimension._crossfilterDimension = null; // crossfilter element for this dimension
  _dimension._crossfilterGroups = {}; // crossfilter element for the group of this dimension

  var _aggregated = false;


  _dimension.id = function() {
    return _id;
  };

  _dimension.caption = function() {
    return _caption;
  };

  _dimension.hierarchy = function() {
    return _hierarchy;
  };

  _dimension.levels = function() {
    return _levels;
  };

  _dimension.type = function() {
    return _type;
  };

  _dimension.properties = function() {
    return _properties;
  };

  _dimension.membersStack = function () {
    return _membersStack;
  };

  _dimension.currentLevel = function() {
    return _membersStack.length - 1;
  };

  _dimension.maxLevel = function() {
    return _levels.length - 1;
  };

  _dimension.getGeoProperty = function () {
    return analytics.query.getGeoProperty(analytics.state.schema(), analytics.state.cube().id(), _dimension.id(), _dimension.hierarchy());
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

  _dimension.getSlice = function (level) {
    return _membersStack[level];
  };

  _dimension.isDrillPossible = function () {
    return (_dimension.currentLevel() < _dimension.maxLevel());
  };

  _dimension.isRollPossible = function () {
    return (_dimension.currentLevel() > 0);
  };

  _dimension.nbRollPossible = function () {
    return _dimension.currentLevel();
  };


  _dimension.filters = function (filters) {
    if (!arguments.length) return _filters;
    _filters = filters;
    return _dimension;
  };

  _dimension.filter = function (element, add) {
    return add ? _dimension.addFilter(element) : _dimension.removeFilter(element);
  };

  _dimension.addFilter = function (element) {
    if (_filters.indexOf(element) < 0)
      _filters.push(element);
    return _dimension;
  };

  _dimension.removeFilter = function (element) {
    if (_filters.indexOf(element) >= 0)
      _filters.push(element);
    return _dimension;
  };


  _dimension.colors = function (colors) {
    if (!arguments.length) return _colors;
    _colors = colors;
    return _dimension;
  };

  _dimension.crossfilterDimension = function () {
    return analytics.data.getCrossfilterDimension(_dimension, _filters);
  };

  _dimension.crossfilterGroup = function (extraMeasures) {
    return analytics.data.getCrossfilterGroup(_dimension, extraMeasures);
  };


  /**
   * Indicate if a dimension is aggregated
   *
   * @param {boolean} aggregate
   */
  _dimension.aggregated = function (aggregate) {
    if (!arguments.length) return _aggregated;
    _aggregated = aggregate;
  };


  _dimension.equals = function (other) {
    return (typeof other.id == "function") && (_id === other.id());
  };


  return _dimension;
};
