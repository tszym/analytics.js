analytics.state = {};

var state = analytics.state;

var _schema = null;
var _cube = null;
var _measure = null;
var _dimensions = [];


state.schema = function(schema) {
  if (!arguments.length) return _schema;
  _schema = schema;
};

state.cube = function(cube) {
  if (!arguments.length) return _cube;
  _cube = cube;
};

state.measure = function(measure) {
  if (!arguments.length) return _measure;
  _measure = measure;
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
 * @todo
 */
function setCubeAndMeasureCallback(cube, measure) {

  // changing cube = reset all
  if (cube != _cube) {
    _cube = cube;
    _measure = measure;
    _dimensions = [];
    analytics.display.reset();
    initMetadata();
    analytics.data.load();
    analytics.display.render();
  }
  else {
    _measure = measure;
    analytics.data.load();
    analytics.display.redraw();
  }
}


/**
 * Initialise schema, cube and measure and display the fact selector
 * Selects first schema, cube and measure if not set by setState
 *
 * @throws {Exception} if problem during Query
 * @private
 */
function initMeasure() {
  // select first schema if unset of unexistant
  var schemas = Query.getSchemas();
  if (_schema === null || schemas[_schema] === undefined)
    _schema = Object.keys(schemas)[0];

  // get measures by cubes
  var cubesAndMeasures = Query.getCubesAndMeasures(_schema);

  // select first cube if unset of unexistant
  if (_cube === null || cubesAndMeasures[_cube] === undefined)
    _cube = Object.keys(cubesAndMeasures)[0];

  // select first measure if unset of unexistant
  if (_measure === null || cubesAndMeasures[_cube].measures[_measure] === undefined)
    _measure = Object.keys(cubesAndMeasures[_cube].measures)[0];
}

/**
 * Initialize the metadatas according to the selected cube, ie get dimensions (standard and particular ones),
 * hierarchies, assign them to the charts.
 *
 * Slice the dimensions on for the members of the first level
 *
 * @throws {Exception} if problem during Query
 * @private
 */
function initMetadata() {

  if (analytics.display.initNecessary()) {

    // get specific infos
    var geoDimension  = Query.getGeoDimension(_schema, _cube);
    // var timeDimension = Query.getTimeDimension(_schema, _cube);
    // var geoHierarchy = Object.keys(Query.getHierarchies(_schema, _cube, geoDimension))[0];

    // slice all dimensions by default
    var dimensions = Query.getDimensions(_schema, _cube);
    for (var dimension in dimensions) {
      var hierarchy  = Object.keys(Query.getHierarchies(_schema, _cube, dimension))[0];
      var properties = dimension == geoDimension;
      var members    = Query.getMembers(_schema, _cube, dimension, hierarchy, 0, properties);

      var dimensionObj = analytics.dimension(dimension, dimensions[dimension].caption, hierarchy);
      dimensionObj.addSlice(members);
      _dimensions.push(dimensionObj);
    }

    // TODO add good parameters
    analytics.display.initCharts();
  }
}

/**
 * Drill down on the given dimension on a member. Should called inside callback functions.
 * Will update the charts consequently.
 *
 * @private
 * @param {analytics.dimension} dimension id of the dimension on which we want to drill down
 * @param {string} member id of the member on which we want to drill down
 * @param {string} dcChartID id of the dc chart on which the evenement was called
 */
function drillDown (dimension, member, dcChartID) {
  try {
    var hierarchy = this.getDimensionHierarchy(dimension);
    var oldLevel  = this.getDimensionCurrentLevel(dimension);

    if (dimension.isDrillPossible()) {

      // zoom on charts using the dimensions
      analytics.display.getChartsUsingDimension(dimension).forEach(function (chart) {
        if (chart.element()._onZoomIn !== undefined && chart.element().chartID() !== dcChartID) {
          chart.element()._onZoomIn(member);
        }
      });

      // add slice to stack
      var newMembers = Query.getMembers(_schema, _cube, dimension.id(), dimension.hierarchy(), dimension.currentLevel(), true, member);
      dimension.addSlice(newMembers);

      // reset filter on charts using this dimension
      analytics.display.filterAllChartsUsingDimension(dimension);
      analytics.data.load();
      analytics.display.render();
    }
  }
  catch(err) {
    new PNotify({
      title: 'An error occured',
      type: 'error',
      text: err.message
    });
  }
}

/**
 * Roll up on the given dimension. Should called inside callback functions.
 * Will update the charts consequently.
 *
 * @private
 * @param {string} dimension id of the dimension on which we want to roll up
 * @param {string} dcChartID id of the dc chart on which the evenement was called
 * @param {integer} [nbLevels=1] number of levels to roll up
 */
function rollUp (dimension, dcChartID, nbLevels) {
  nbLevels = nbLevels || 1;

  try {
    // do not allow full projection of a dimension
    if (dimension.isRollPossible()) {

      var zoomOut = function (chart) {
        if (chart.element()._onZoomOut !== undefined && chart.element().chartID() !== dcChartID) {
          chart.element()._onZoomOut();
        }
      };

      // roll up nbLevels times
      for (var i = 1; i <= nbLevels; i++) {
        // zoom out on charts
        analytics.display.getChartsUsingDimension(dimension).forEach(zoomOut);

        // remove last slice
        dimension.removeLastSlice();
      }

      // reset filter on charts using this dimension
      analytics.display.filterAllChartsUsingDimension(dimension);

      // regenerate all
      analytics.data.load();
      analytics.display.render();
    }
  }
  catch(err) {
    new PNotify({
      title: 'An error occured',
      type: 'error',
      text: err.message
    });
  }
}
