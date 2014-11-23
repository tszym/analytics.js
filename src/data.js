analytics.data = (function(dataCrossfilter) {

  var _data = {};

  var _measuresLoaded = [];
  var _dataCrossfilter = dataCrossfilter;


  /**
   * Get the number of crossed members that is to say the number of possible combinations of members
   *
   * @private
   * @return {int} number of combinations
   *
   * TODO TEST
   */
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
   * Indicate if we should use client or server side aggregates.
   *
   * @private
   * @return {boolean} true if client side, false if server side
   *
   * TODO
   */
  function isClientSideAggrPossible() {
    return numberOfCrossedMembers() < 20000;
  }

  /**
   * Set the crossfilter dataset and dispose of all previous dimensions and groups because they are linked to old data.
   *
   * @private
   * @param {string} JSON data
   * @return {crossfilter} crosfilter dataset
   */
  function setCrossfilterData(data) {
    var dimensions = analytics.state.dimensions();

    for (var index in dimensions) {
      if (dimensions[index]._cfDim !== null) {
        dimensions[index]._cfDim.dispose();
        dimensions[index]._cfDim = null;
      }
      if (dimensions[index]._cfGrp !== null) {
        dimensions[index]._cfGrp.dispose();
        dimensions[index]._cfGrp = null;
      }
    }
    if (isClientSideAggrPossible())
      _dataCrossfilter = crossfilter(data);
    else
      _dataCrossfilter = crossfilterServer(data);

    return _dataCrossfilter;
  }

  /**
   * Get the data for client side agregates
   *
   * @private
   * @return {Object} crossfilter dataset
   */
  function getDataClientAggregates() {
    Query.clear();

    // set cube
    Query.drill(analytics.state.cube().id());

    // set dimensions to get
    var dimensions = analytics.state.dimensions();
    var hierachiesList = [];

    for (var index in dimensions) {
      var dimension = dimensions[index];

      if (!dimension.aggregated()) {
        var members = dimension.getLastSlice();
        var hierarchy = dimension.hierarchy();
        hierachiesList.push(hierarchy);
        Query.slice(hierarchy, Object.keys(members));
      } else {
        while(dimension.currentLevel() > 0) {
          dimension.removeLastSlice();
        }
      }
    }
    Query.dice(hierachiesList);

    _measuresLoaded = analytics.display.getExtraMeasuresUsed();
    _measuresLoaded.push(analytics.state.measure().id());
    for (var i in _measuresLoaded) {
      Query.push(_measuresLoaded[i]);
    }
    // get data
    var data = Query.execute();

    return setCrossfilterData(data);
  }

  /**
   * TODO
   */
  function getDataServerAggregates() {
    return {};
  }

  /**
   * Get the data from the cube according to the last slices and run them through CrossFilter
   * Formerly getData()
   *
   * @return {Object} crossfilter dataset
   *
   * TODO add a try/catch around this
   */
  _data.load = function() {
    if (isClientSideAggrPossible()) {
      return getDataClientAggregates();
    } else {
      return getDataServerAggregates();
    }
  };

  _data.getCrossfilterDimension = function(dimension) {

    if (dimension._crossfilterDimension === null) {
      dimension._crossfilterDimension = _dataCrossfilter.dimension(function(d) { return d[dimension.id()]; });
    }

    return dimension._crossfilterDimension;
  };

  _data.getCrossfilterGroup = function(dimension, measures) {

    // simple grouping
    if (measures === null) {
      if (dimension._crossfilterGroups.default === undefined) {
        dimension._crossfilterGroups.default = dimension
          .crossfilterDimension()
          .group()
          .reduceSum(function(d) { return d[that.measure]; });
      }
      return dimension._crossfilterGroups.default;
    }

    // if we have a custom list of measures, we compute the group
    else {
      measuresToGroup = [analytics.state.measure.id()];
      for (var i in measures)
        if (measuresToGroup.indexOf(measures[i].id()) < 0)
          measuresToGroup.push(measures[i].id());
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
