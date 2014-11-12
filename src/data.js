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
      if (dimensions[index].crossfilterGroup !== undefined) {
        dimensions[index].crossfilterGroup.dispose();
        dimensions[index].crossfilterGroup = undefined;
      }
      if (dimensions[index].crossfilter !== undefined) {
        dimensions[index].crossfilter.dispose();
        dimensions[index].crossfilter = undefined;
      }
    }
    if (isClientSideAggrPossible())
      _dataCrossfilter = crossfilter(data);
    else
      _dataCrossfilter = crossfilterServer(data);

    return _dataCrossfilter;
  }

  /**
   * TODO
   */
  function getDataClientAggregates() {
    return {};
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

  /**
   * TODO
   */
  _data.getCrossfilterDimensionAndGroup = function(dimension, measures) {
    return null;
  };

  // importTest "data-test-accessors.js"

  return _data;
})();
