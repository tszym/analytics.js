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

  /*
   * Getters and setters
   */
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

  /**
   * Callback function to call when changing the cube and measure to display
   *
   * @private
   * @param {string} cube
   * @param {string} measure
   */
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
   * Initialize schema, cube and measure and display the fact selector
   * Selects first schema, cube and measure if not set by setState
   *
   * @throws {Exception} if problem during analytics.query
   * @private
   */
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
      state.cube(analytics.data.cube(cubeId, cubesAndMeasures[cubeId].caption));
    }

    // select first measure if unset of unexistant
    if (_measure === null || cubesAndMeasures[_cube].measures[_measure] === undefined) {
      var measureId = Object.keys(cubesAndMeasures[_cube].measures)[0];
      state.measure(analytics.data.measure(measureId, cubesAndMeasures[_cube].measures[measureId].caption));
    }

    analytics.display.showFactSelector(cubesAndMeasures, state.cube(), state.measure(), setCubeAndMeasureCallback);
  };

  /**
   * Initialize the metadatas according to the selected cube, ie get dimensions (standard and particular ones),
   * hierarchies, assign them to the charts.
   *
   * Slice the dimensions on for the members of the first level
   *
   * @throws {Exception} if problem during analytics.query
   * @private
   */
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

        var dimensionObj = analytics.data.dimension(dimension, dimensions[dimension].caption, dimensions[dimension].type, hierarchy, levels, properties);
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
   * Drill down on the given dimension on a member. Should called inside callback functions.
   * Will update the charts consequently.
   *
   * @private
   * @param {analytics.dimension} dimension id of the dimension on which we want to drill down
   * @param {string} member id of the member on which we want to drill down
   * @param {string} dcChartID id of the dc chart on which the evenement was called
   */
  state.drillDown = function (dimension, member) {

    if (dimension.isDrillPossible()) {
      var newMembers = analytics.query.getMembers(_schema, _cube, dimension.id(), dimension.hierarchy(), dimension.currentLevel(), dimension.properties().length > 0, member);
      dimension.addSlice(newMembers);
      analytics.data.load();
    }
  };

  /**
   * Roll up on the given dimension. Should called inside callback functions.
   * Will update the charts consequently.
   *
   * @private
   * @param {string} dimension id of the dimension on which we want to roll up
   * @param {integer} [nbLevels=1] number of levels to roll up
   */
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
        dimensionObj.filters(dimension.filters);
        dimension.membersStack.forEach(function (members, levelId) {
          dimensionObj.addSlice(analytics.query.getMembersInfos(savedState.schema, savedState.cube, dimension.id, dimension.hierarchy, levelId, members, dimension.properties));
        });

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
