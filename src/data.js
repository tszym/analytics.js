/**
## analytics.**data** namespace

This namespace contains functions related to the retrial of OLAP data.
**/
analytics.data = (function() {

  // dataset returned by analytics.query
  var _data = {};

  // *analytics.data.measure[]* list of measures loaded
  var _measuresLoaded = [];

  // *crossfilter* crossfilter object containing the dataset
  var _dataCrossfilter;


  /**
  ### *int* data.**numberOfCrossedMembers**()

  Get the number of crossed members that is to say the number of possible combinations of members
  **/
  function numberOfCrossedMembers() {
    var nb = 1;
    var dimensions = analytics.state.dimensions();
    for (var i in dimensions) {
      if (!dimensions[i].aggregated()) {
        var members = dimensions[i].getLastSlice();
        nb *= Object.keys(members).length;
      }
    }
    return nb;
  }

  /**
  ### *boolean* data.**isClientSideAggrPossible**()

  Indicate if we should use client or server side aggregates.
  **/
  function isClientSideAggrPossible() {
    return numberOfCrossedMembers() < 20000;
  }

  /**
  ### *crossfilter* data.**setCrossfilterData**(*Object* data)

  Takes a dataset following [crossfilter's input requirements](https://github.com/square/crossfilter/wiki/API-Reference#crossfilter)
  and create a crossfilter dataset with it.

  It also disposes of all previous dimensions and groups because they are linked to old data.
  **/
  function setCrossfilterData(data) {
    var dimensions = analytics.state.dimensions();

    for (var i in dimensions) {
      // remove cf dimensions
      if (dimensions[i]._crossfilterDimension !== null)
        dimensions[i]._crossfilterDimension.dispose();
      dimensions[i]._crossfilterDimension = null;

      // remove cf groups
      for (var j in dimensions[i]._crossfilterGroups)
        dimensions[i]._crossfilterGroups[j].dispose();
      dimensions[i]._crossfilterGroups = [];
    }

    // create cf object
    if (isClientSideAggrPossible())
      _dataCrossfilter = crossfilter(data);
    else
      _dataCrossfilter = crossfilterServer(data);

    return _dataCrossfilter;
  }

  /**
  ### *Object* data.**getDataClientAggregates**()

  Get the data using client side agregates and returns a dataset matching *crossfilter's input requirements*
  **/
  function getDataClientAggregates() {
    analytics.query.clear();

    // set cube
    analytics.query.drill(analytics.state.cube().id());

    // set dimensions to get
    var dimensions = analytics.state.dimensions();
    var hierachiesList = [];

    for (var index in dimensions) {
      var dimension = dimensions[index];

      if (!dimension.aggregated()) {
        var members = dimension.getLastSlice();
        var hierarchy = dimension.hierarchy();
        hierachiesList.push(hierarchy);
        analytics.query.slice(hierarchy, Object.keys(members));
      }
    }
    analytics.query.dice(hierachiesList);

    _measuresLoaded = analytics.display.getExtraMeasuresUsed();
    _measuresLoaded.push(analytics.state.measure());
    for (var i in _measuresLoaded) {
      analytics.query.push(_measuresLoaded[i].id());
    }

    // get data
    var data = analytics.query.execute();

    return setCrossfilterData(data);
  }

  /**
  ### *Object* data.**getDataServerAggregates**()

  Get the data using server side agregates and returns a dataset matching *crossfilter's input requirements*
  **/
  function getDataServerAggregates() {
    var metadata = {
      "api" : analytics.query,
      "schema" : analytics.state.schema(),
      "cube" : analytics.state.cube().id(),
      "measures" : [],
      "dimensions" : {}
    };

    var i;

    // set dimensions to get
    var dimensions = analytics.state.dimensions();
    for (i in dimensions) {
      var dimension = dimensions[i];
      metadata.dimensions[dimension.id()] = {
        "hierarchy" : dimension.hierarchy(),
        "level" : dimension.currentLevel(),
        "members" : Object.keys(dimension.getLastSlice())
      };
    }

    // set measures
    _measuresLoaded = analytics.display.getExtraMeasuresUsed();
    _measuresLoaded.push(analytics.state.measure());
    for (i in _measuresLoaded) {
      metadata.measures.push(_measuresLoaded[i].id());
    }

    return setCrossfilterData(metadata);
  }

  /**
  ### *crossfilter* data.**load**()

  Load data from the cube according to the last slices & dices and creates a crossfitler dataset with it.
  **/
  // TODO add a try/catch around this
  _data.load = function() {
    if (isClientSideAggrPossible()) {
      return getDataClientAggregates();
    } else {
      return getDataServerAggregates();
    }
  };

  /**
  ### *crossfilter* data.**loadIfNeeded**()

  Calls `data.load()` if extra measures used in charts are not already loaded. Should be called if you changed
  extra measures used by charts.
  **/
  _data.loadIfNeeded = function() {
    var measuresLoadedIds = _measuresLoaded.map(function (m) { return m.id(); });
    var measuresToLoad = analytics.display.getExtraMeasuresUsed();

    for (var i in measuresToLoad) {
      // if we need to reload, do it and exit
      if (measuresLoadedIds.indexOf(measuresToLoad[i].id()) < 0) {
        _data.load();
        return true;
      }
    }

    return false;
  };

  /**
  ### *crossfilter.dimension* data.**getCrossfilterDimension**(*data.dimension* dimension, [*string[]* filters])

  Return the *crossfilter.dimension* object related to the current *crossfilter* dataset for the given `dimension`.
  Also preset filters on the dimension according to the given list of members in `filters` parameter (optional).
  **/
  _data.getCrossfilterDimension = function(dimension, filters) {

    if (dimension._crossfilterDimension === null) {
      dimension._crossfilterDimension = _dataCrossfilter.dimension(function(d) { return d[dimension.id()]; });
      if (filters.length) {
        dimension._crossfilterDimension.filterFunction(function (d) {
          for(var i = 0; i < filters.length; i++) {
            if (filters[i] == d)
              return true;
          }
          return false;
        });
      }
    }

    return dimension._crossfilterDimension;
  };

  /**
  ### *crossfilter.group* data.**getCrossfilterGroup**(*data.dimension* dimension, [*data.measure[]* extraMeasures])

  Return the *crossfilter.group* object related to the current *crossfilter* dataset for the given `dimension`.
  This group aggregates data by summing them.

  If a given list of extra measures is passed as `extraMeasures`, the group will contain multiple values for
  each key, one per i.e. for the current state measure and for each extra measure passed. In that case, each datum
  of the group will therefore be:

  ```js
  { key : "memberKey", value : {stateMeasureId : val1, extraMeasure1Id : val2, ...}}
  ```

  [See an example using the same principle in dc.js documentation](http://dc-js.github.io/dc.js/docs/stock.html#section-11)
  **/
  _data.getCrossfilterGroup = function(dimension, extraMeasures) {

    // simple grouping
    if (!Array.isArray(extraMeasures) || extraMeasures.length === 0) {
      if (dimension._crossfilterGroups.default === undefined) {
        dimension._crossfilterGroups.default = dimension
          .crossfilterDimension()
          .group()
          .reduceSum(function(d) { return d[analytics.state.measure().id()]; });
      }
      return dimension._crossfilterGroups.default;
    }

    // if we have a custom list of measures, we compute the group
    else {
      var measuresToGroup = [analytics.state.measure().id()];
      for (var i in extraMeasures)
        if (measuresToGroup.indexOf(extraMeasures[i].id()) < 0)
          measuresToGroup.push(extraMeasures[i].id());
      var key = measuresToGroup.sort().join(',');

      if (dimension._crossfilterGroups[key] === undefined) {
        dimension._crossfilterGroups[key] = dimension
          .crossfilterDimension()
          .group()
          .reduce(
            function (p, v) {
              for (var i in measuresToGroup)
                p[measuresToGroup[i]] += v[measuresToGroup[i]];
              return p;
            },
            function (p, v) {
              for (var i in measuresToGroup)
                p[measuresToGroup[i]] -= v[measuresToGroup[i]];
              return p;
            },
            function () {
              var p = {};
              for (var i in measuresToGroup)
                p[measuresToGroup[i]] = 0;
              return p;
            }
          );
      }
      return dimension._crossfilterGroups[key];
    }
  };

  // importTest "data-test-accessors.js"

  return _data;
})();
