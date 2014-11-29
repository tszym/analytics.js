/**
## data.**dimension**(*string* id, *string* caption, *string* type, *string* hierarchy, *string[]* levels, [*data.property[]* properties])

This object describes an OLAP dimension. It is also used to store lots of informations about how the dimension is
analysed, by storing lots of things linked to the dimension, such as drill-down / roll-up and filters information.
**/
analytics.data.dimension = function (id, caption, description, type, hierarchy, levels, properties) {

  // returned object
  var _dimension = {};

  var _id          = id;
  var _caption     = caption;
  var _description = description;
  var _hierarchy   = hierarchy;
  var _type        = type;
  var _levels      = levels;
  var _properties  = properties;

  var _stack = []; // stack of all slice done on this hierarchy

  var _scaleType    = 'quantile';
  var _colorPalette = analytics.csts.palettes[analytics.data.dimension.nextI++ % analytics.csts.palettes.length];
  var _nbBins       = 4;

  _dimension._crossfilterDimension = null; // crossfilter element for this dimension
  _dimension._crossfilterGroups = {}; // crossfilter element for the group of this dimension

  var _aggregated = false;

  /**
  This object has the following getters/setters:

  ### Simple getters

  This object have some simple getters:

  * *string* data.dimension.**id**()
  * *string* data.dimension.**caption**()
  * *string* data.dimension.**hierarchy**()
  * *string[]* data.dimension.**levels**() : captions of the levels of the dimension
  * *string* data.dimension.**type**()
  * *data.property[]* data.dimension.**properties**() : list of properties to load with members
  * *data.property* data.dimension.**getGeoProperty**() : return null or the geometrical property
  * *mixed* data.dimension.**aggregated**(*boolean* aggregate) : getter / setter indicating if we need to aggregate the dimension or not
  * *boolean* data.dimension.**equals**(*data.dimension* other)
  **/
  _dimension.id = function() {
    return _id;
  };

  _dimension.caption = function() {
    return _caption;
  };

  _dimension.description = function() {
    return _description;
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

  _dimension.currentLevel = function() {
    if (!_aggregated)
      return _stack.length - 1;
    else
      return 0;
  };

  _dimension.maxLevel = function() {
    return _levels.length - 1;
  };

  _dimension.getGeoProperty = function () {
    for (var i in _properties) {
      if (_properties[i].type() == "Geometry")
        return _properties[i];
    }
    return null;
  };

  _dimension.aggregated = function (aggregate) {
    if (!arguments.length) return _aggregated;
    _aggregated = aggregate;

    if (_aggregated) {
      _dimension.crossfilterDimension().filterAll();
    }
    else {
      var filters = _dimension.filters();
      if (filters.length > 0) {
        _dimension.crossfilterDimension().filterFunction(function (d) {
          for(var i = 0; i < filters.length; i++) {
            if (filters[i] == d)
              return true;
          }
          return false;
        });
      }
      else {
        _dimension.crossfilterDimension().filterAll();
      }
    }

    return _dimension;
  };


  /**
  ### Drill-down / roll-up

  To handle drill-down / roll-up, the object stores a stack of the members shown
  for each level displayed. For example, at the beggining the stack will contain
  Europe's NUTS0. Then if you drill on Germany, we add Germany's NUTS1 to the stack.

  Note that members are always stored in an Object that associate the id of each member to
  and object containing the caption of the member and the property value if available.
  Here is an example of what members looks like:

  ```js
  {
  "FR" : // member key
    {
      "caption" : "France",
      "geometry" : {<geoJSONofFrance>}, // value of property "geometry"
      "area" : 123.5 // value of property "area"
    },
  "BE" :
    {
      "caption" : "Belgium",
      "geometry" : {<geoJSONofBelgium>},
      "area" : 254.1
    },
    ...
  }
  ```

  To handle this stack and the drill-down / roll-up functionnality, the following
  functions are available:

  * *Object[]* data.dimension.**membersStack**()
  * *this* data.dimension.**addSlice**(*Object* members)
  * *this* data.dimension.**removeLastSlice**()
  * *Object* data.dimension.**getLastSlice**()
  * *Object* data.dimension.**getSlice**(*int* level)
  * *int* data.dimension.**currentLevel**() : index of the current level displayed
  * *int* data.dimension.**maxLevel**() : index of the maximum level available
  * *boolean* data.dimension.**isDrillPossible**()
  * *boolean* data.dimension.**isRollPossible**()
  * *int* data.dimension.**nbRollPossible**() : number of roll we can do
  **/

  _dimension.membersStack = function () {
    return _stack.map(function (level) { return level.members; });
  };

  _dimension.filtersStack = function () {
    return _stack.map(function (level) { return level.filters; });
  };

  _dimension.equals = function (other) {
    return (typeof other.id == "function") && (_id === other.id());
  };

  _dimension.addSlice = function (members) {
    _stack.push({members : members, filters: []});
    return _dimension;
  };

  _dimension.removeLastSlice = function () {
    _stack = _stack.slice(0, -1);
    return _dimension;
  };

  _dimension.getLastSlice = function () {
    return _dimension.getSlice(_stack.length - 1);
  };

  _dimension.getLastFilters = function () {
    return _dimension.getFilters(_stack.length - 1);
  };

  _dimension.getSlice = function (level) {
    return _stack[level].members;
  };

  _dimension.getFilters = function (level) {
    return _stack[level].filters;
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

  /**
  ### Filters

  Filters on the dimensions are handled by the following functions:

  * *mixed* data.dimension.**filters**([*string[]* filters]) : get of set filtered members (identified by their ids)
  * *this* data.dimension.**filter**(*string* element, *boolean* add) : add (`add = true`) or remove (`add = false`) an element from the filters
  * *this* data.dimension.**addFilter**(*string* element)
  * *this* data.dimension.**removeFilter**(*string* element)
  **/
  _dimension.filters = function (filters) {
    if (!arguments.length) return _dimension.getLastFilters();
    _stack[_stack.length - 1].filters = filters;
    return _dimension;
  };

  _dimension.filter = function (element, add) {
    return add ? _dimension.addFilter(element) : _dimension.removeFilter(element);
  };

  _dimension.addFilter = function (element) {
    var _filters = _dimension.getLastFilters();
    if (_filters.indexOf(element) < 0)
      _filters.push(element);
    return _dimension;
  };

  _dimension.removeFilter = function (element) {
    var _filters = _dimension.getLastFilters();
    if (_filters.indexOf(element) >= 0)
      _filters.splice(_filters.indexOf(element));
    return _dimension;
  };

  /**
  ### Scale

  To handle the color scale of the dimension, the following functions are available:

  * *string[]* data.dimension.**colors**() : get the list of color of the bins (CSS HEX code in string) for this dimension
  * *mixed* data.dimension.**scaleType**(*string* type) : get or set the type of scale (`quantize` for a linear quantization,
      `quantile` for quantiles, `natural` for Jenks Natural Breaks).
  * *mixed* data.dimension.**colorPalette**(*string* colorPalette) : get or set the name of the [colorbewer](colorbrewer2.org)
      palette to use for this dimension.
  * *nbBins* data.dimension.**nbbins**(*int* nb) : get or set the number of bins of the color scale.
  * *d3.scale* data.dimension.**scale**() : get the d3 scale of the dimension
  **/
  _dimension.colors = function () {
    return colorbrewer[_colorPalette][_nbBins];
  };

  _dimension.scaleType = function (scaleType) {
    if (!arguments.length) return _scaleType;
    _scaleType = scaleType;
    return _dimension;
  };

  _dimension.colorPalette = function (colorPalette) {
    if (!arguments.length) return _colorPalette;
    _colorPalette = colorPalette;
    return _dimension;
  };

  _dimension.nbBins = function (nbBins) {
    if (!arguments.length) return _nbBins;
    _nbBins = nbBins;
    return _dimension;
  };

  _dimension.scale = function () {

    // Jenks natural breaks will fail if we have equal or less data than classes
    if (_scaleType == 'natural' && _dimension.crossfilterGroup().all().length <= _nbBins)
      _scaleType = 'quantize';

    switch (_scaleType) {

      case 'natural':
      return d3.scale.threshold()
        .domain(ss.jenks(_dimension.crossfilterGroup().all().map(function(d) { return d.value; }), _nbBins).splice(1, _nbBins - 1))
        .range(_dimension.colors());

      case 'quantize':

      var min = _dimension.crossfilterGroup().order(function (d) { return -d; }).top(1)[0].value;
      var max = _dimension.crossfilterGroup().order(function (d) { return  d; }).top(1)[0].value;

      return d3.scale.quantize()
        .domain([min, max])
        .range(_dimension.colors());

      case 'quantile':

      return d3.scale.quantile()
        .domain(_dimension.crossfilterGroup().all().map(function(d) { return d.value; }))
        .range(_dimension.colors());
    }
  };

  /**
  ### Data & crossfilter objects

  You can get data & crossfilter objects related to this dimension using the following getters:

  * *crossfilter.dimension* data.dimension.**crossfilterDimension**()
  * *crossfilter.group* data.dimension.**crossfilterGroup**([*data.measure[]* extraMeasures]) :
    get a crossfilter group, optionally with extra measures (see data.getCrossfilterGroup for more details)
  * *float* data.dimension.**getTotal**() : returns the total for the selected members of the dimension
  **/
  _dimension.crossfilterDimension = function () {
    return analytics.data.getCrossfilterDimension(_dimension, _dimension.getLastFilters());
  };

  _dimension.crossfilterGroup = function (extraMeasures) {
    return analytics.data.getCrossfilterGroup(_dimension, extraMeasures);
  };

  _dimension.getTotal = function () {
    function hasFilter(el) {
      return (_dimension.filters().length === 0 || _dimension.filters().indexOf(el) >= 0);
    }

    return _dimension.crossfilterGroup().all()
          .filter(function (d) { return hasFilter(d.key); })
          .map   (function (d) { return d.value; })
          .reduce(function (a, b) { return a + b; }, 0.0);
  };

  return _dimension;
};

analytics.data.dimension.nextI = 0;
