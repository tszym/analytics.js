/**
## analytics.**state** namespace

This namespace contains functions related to the state of the analysis of the OLAP cube.

### *Object* analytics.**state**([*Object*])

`analytics.state()` is not only a namespace but also a function which is a getter/setter of
the state. It therefore allows you to get the state of the analysis and restore it later.
**/
analytics.state = (function() {

  var state = function (state) {
    if (!arguments.length) return getState();
    setState(state);
  };

  var _schema     = null;
  var _cube       = null;
  var _measure    = null;
  var _cubeObj    = null;
  var _measureObj = null;
  var _dimensions = [];

  /**
  ### OLAP state

  This namespace has the following simple getters / setters regarding the state of the analysis:

  * *mixed* state.**schema**([*string* schema])
  * *mixed* state.**cube**([*data.cube* cube])
  * *mixed* state.**measure**([*data.measure* measure])
  * *data.dimension[]* state.**dimensions**()
  * **setCubeAndMeasureCallback**(*data.cube* cube, *data.measure* measure)

  The function you should call to change the cube and / or measure of the state is `setCubeAndMeasureCallback`
  which will process the change and update the interface. The other getters/setters won't do anything with
  the new value except saving it.
  **/
  state.schema = function(schema) {
    if (!arguments.length) return _schema;
    _schema = schema;
  };

  state.cube = function(cube) {
    if (!arguments.length) return _cubeObj;
    _cubeObj = cube;
    _cube = cube.id();
  };

  state.measure = function(measure) {
    if (!arguments.length) return _measureObj;
    _measureObj = measure;
    _measure = measure.id();
  };

  state.dimensions = function() {
    return _dimensions;
  };

  function setCubeAndMeasureCallback(cube, measure) {

    // changing cube = reset all
    if (!state.cube().equals(cube)) {
      state.cube(cube);
      state.measure(measure);

      _dimensions = [];
      state.initDimensions();
      analytics.data.load();
      analytics.display.render();
    }
    else {
      state.measure(measure);

      analytics.data.load();
      analytics.display.redraw();
    }
  }

  /**
  ### Initialization

  To initialize the state, two functions are available:

  #### state.**initMeasure**()

  This function will initialize the schema, cube and measure of the state. If those values where
  set from a saved state, we will check that those are possible values.

  This function also renders the factSelector.
  **/
  state.initMeasure = function () {

    // select first schema if unset of unexistant
    var schemas = analytics.query.getSchemas();
    if (_schema === null || schemas[_schema] === undefined)
      _schema = Object.keys(schemas)[0];

    // get measures by cubes
    var cubesAndMeasures = analytics.query.getCubesAndMeasures(_schema);

    // select first cube if unset of unexistant
    if (_cube === null || cubesAndMeasures[_cube] === undefined) {
      var cubeId = Object.keys(cubesAndMeasures)[0];
      state.cube(analytics.data.cube(cubeId, cubesAndMeasures[cubeId].caption, cubesAndMeasures[cubeId].description));
    }

    // select first measure if unset of unexistant
    if (_measure === null || cubesAndMeasures[_cube].measures[_measure] === undefined) {
      var measureId = Object.keys(cubesAndMeasures[_cube].measures)[0];
      state.measure(analytics.data.measure(measureId, cubesAndMeasures[_cube].measures[measureId].caption, cubesAndMeasures[_cube].measures[measureId].description));
    }

    analytics.display.showFactSelector(cubesAndMeasures, state.cube(), state.measure(), setCubeAndMeasureCallback);
  };

  /**
  #### state.**initDimensions**()

  Load and prepare the dimensions of the current selected cube, if those are not already loaded from a saved state.
  Each dimension will be sliced on all the members of the first level.

  This function will also assign these dimensions to the charts by calling `analytics.display.assignDimensions()`,
  and will create the wordclouds by calling `analytics.display.createWordClouds()`
  **/
  state.initDimensions = function () {
    // TODO shouldn't creating dimension objects be done by analytics.query?

    if (!_dimensions.length) {
      // get specific infos
      var geoDimension  = analytics.query.getGeoDimension(_schema, _cube);
      var timeDimension = analytics.query.getTimeDimension(_schema, _cube);
      var geoDimensionObj, timeDimensionObj;

      // slice all dimensions by default
      var dimensions = analytics.query.getDimensions(_schema, _cube);
      for (var dimension in dimensions) {
        var hierarchy  = Object.keys(analytics.query.getHierarchies(_schema, _cube, dimension))[0];
        var properties = [];
        if (dimension == geoDimension) {
          var propertiesMap = analytics.query.getProperties(_schema, _cube, dimension, hierarchy, 0);
          var propertyId = analytics.query.getGeoProperty(_schema, _cube, dimension, hierarchy);
          properties.push(analytics.data.property(propertyId, propertiesMap[propertyId].caption, propertiesMap[propertyId].type));
        }
        var levels     = analytics.query.getLevels(_schema, _cube, dimension, hierarchy);
        var members    = analytics.query.getMembers(_schema, _cube, dimension, hierarchy, 0, properties.length > 0);

        var dimensionObj = analytics.data.dimension(dimension, dimensions[dimension].caption, dimensions[dimension].description, dimensions[dimension].type, hierarchy, levels, properties);
        dimensionObj.addSlice(members);
        _dimensions.push(dimensionObj);

        // save import dims
        if (dimensionObj.type() == "Geometry")
          geoDimensionObj = dimensionObj;
        else if (dimensionObj.type() == "Time")
          timeDimensionObj = dimensionObj;
      }

      // asign those dimensions to charts
      analytics.display.assignDimensions(_dimensions, geoDimensionObj, timeDimensionObj);
    }

    // create wordclouds
    analytics.display.createWordClouds(_dimensions);
  };

  /**
  ### Drill-down / roll-up

  Two functions are available to handle drill-down and roll-up of the current state.

  #### state.**drillDown**(*data.dimension* dimension, *string* member, *string* type)

  Drill down on a given member of the given dimension and reload data.

  You can choose the type of drill-down with the `type` parameter, which can be:

  * `simple`: Drill down on the given member, ie show the chidren of the given member (go from NUTS0 to Germany's NUTS1)
  * `selected`: Drill down on all the selected members, ie show the children of all these members at the same time (go from NUTS0 to Germany & France's NUTS1)
  * `partial`: Drill down on the given member and keep the current displayed members except the drilled one (go from NUTS0 to NUTS0 except Germany + Germany's NUTS1)

  `partial` drill-down is not implemented yet.
  **/
  state.drillDown = function (dimension, member, type) {

    if (dimension.isDrillPossible()) {
      var newMembers;

      switch (type) {
        case 'selected':
        var toDrill = dimension.filters().length ? dimension.filters() : Object.keys(dimension.getLastSlice());
        newMembers = {};
        toDrill.forEach(function (member) {
          var newMembersTemp = analytics.query.getMembers(_schema, _cube, dimension.id(), dimension.hierarchy(), dimension.currentLevel(), dimension.properties().length > 0, member);
          for (var newMember in newMembersTemp)
            newMembers[newMember] = newMembersTemp[newMember];
        });
        break;

        default:
        newMembers = analytics.query.getMembers(_schema, _cube, dimension.id(), dimension.hierarchy(), dimension.currentLevel(), dimension.properties().length > 0, member);
        break;
      }

      dimension.addSlice(newMembers);
      analytics.data.load();
    }
  };

  /**
  ### state.**rollUp**(*data.dimension* dimension, [*int* nbLevels=1])

  Roll up on the given dimension, optionally `nbLevels` times, and reload data.
  **/
  state.rollUp = function (dimension, nbLevels) {
    nbLevels = nbLevels || 1;
    nbLevels = Math.min(nbLevels, dimension.nbRollPossible());

    if (nbLevels > 0) {

      // remove last slice nbLevels times
      for (var i = 0; i < nbLevels; i++)
        dimension.removeLastSlice();

      // reload data
      analytics.data.load();
    }
  };

  function getState() {
    // init output
    var out = {
      "schema"       : analytics.state.schema(),
      "cube"         : analytics.state.cube().id(),
      "measure"      : analytics.state.measure().id(),
      "columnWidths" : analytics.display.columnWidths()
    };

    // list dimensions
    out.dimensions = analytics.state.dimensions().map(function (dimension) {
      return {
        id           : dimension.id(),
        hierarchy    : dimension.hierarchy(),
        filters      : dimension.filters(),
        properties   : dimension.properties().map(function (property) { return property.id(); }),
        membersStack : dimension.membersStack().map(function (members) { return Object.keys(members); })
      };
    });

    // list charts
    out.charts = analytics.display.chartsInLayout().map(function (chartsCol, i) {
      if (i > 0) { // do not save wordclouds
        return chartsCol.map(function (chart) {
          return {
            type          : chart.type(),
            options       : chart.options(),
            dimensions    : chart.dimensions()   .map(function (dimension) { return dimension.id(); }),
            extraMeasures : chart.extraMeasures().map(function (measure)   { return measure  .id(); })
          };
        });
      }
      else {
        return [];
      }
    });

    return out;
  }

  function setState(savedState) {

    try {

      // schema
      state.schema(savedState.schema);

      // cube
      var cubes = analytics.query.getCubes(savedState.schema);
      state.cube(analytics.data.cube(savedState.cube, cubes[savedState.cube]));

      // measure
      var measuresMap = {};
      var measures = analytics.query.getMesures(savedState.schema, savedState.cube);
      for (var measure in measures) {
        measuresMap[measure] = analytics.data.measure(measure, measures[measure].caption);
      }
      state.measure(measuresMap[savedState.measure]);

      // columns
      analytics.display.columnWidths(savedState.columnWidths);

      // dimensions
      var dimensionsMap = {};
      var dimensions = analytics.query.getDimensions(savedState.schema, savedState.cube);
      savedState.dimensions.forEach(function (dimension) {
        var levels = analytics.query.getLevels(savedState.schema, savedState.cube, dimension.id, dimension.hierarchy);
        var propertiesMap = analytics.query.getProperties(savedState.schema, savedState.cube, dimension.id, dimension.hierarchy, 0);

        var properties = dimension.properties.map(function (property) {
          return analytics.data.property(property, propertiesMap[property].caption, propertiesMap[property].type);
        });

        var dimensionObj = analytics.data.dimension(dimension.id, dimensions[dimension.id].caption, dimensions[dimension.id].type, dimension.hierarchy, levels, properties);
        dimension.membersStack.forEach(function (members, levelId) {
          dimensionObj.addSlice(analytics.query.getMembersInfos(savedState.schema, savedState.cube, dimension.id, dimension.hierarchy, levelId, members, dimension.properties));
        });
        dimensionObj.filters(dimension.filters);

        _dimensions.push(dimensionObj);
        dimensionsMap[dimensionObj.id()] = dimensionObj;
      });

      // charts
      analytics.display.createCharts(savedState.charts, dimensionsMap, measuresMap);
    }
    catch(err) {
      new PNotify({
        title: 'Data for this analysis is unavailable',
        type: 'error'
      });
    }
  }

  return state;

})();
