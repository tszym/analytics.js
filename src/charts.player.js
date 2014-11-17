/**
 * Class to create play objects from a chart.
 * Play objects are timers that select successively all members
 * of the chart from which they are created
 *
 * @param chart
 *  The chart on which play the data
 */
analytics.charts.player = function (chart) {

  var _dimension = chart.dimensions()[0];
  var _members = Object.keys(_dimension.getLastSlice()).sort();
  var _currentMember = 0;
  var _timeout = chart.options().playerTimeout;
  var _running = true;
  var _callback = function () { };
  var _chart = chart;

  var _step = function() {
    if (_currentMember > _members.length - 1) {
      _callback();
      return;
    }

    if (!_running) {
      return;
    }

    analytics.display.updateFilters(_dimension, _members[_currentMember]);
    _chart.element().filter(_members[_currentMember]);
    if (_currentMember - 1  >= 0) {
      analytics.display.updateFilters(_dimension, _members[_currentMember - 1]);
      _chart.element().filter(_members[_currentMember - 1]);
    }
    dc.redrawAll();

    _currentMember++;

    setTimeout(_step, _timeout);
  };

  var _play = {};

  /**
   * Return a boolean whether or not the player is running
   */
  _play.running = function () {
    return _running;
  };

  /**
   * Get or set the timeout. This timeout is the time between the selection
   * of two successive members
   *
   * @param {int} timeout in milliseconds
   */
  _play.timeout = function(timeout) {
    if (!arguments.length) return _timeout;
    _timeout = _timeout;
    return _play;
  };

  /**
   * Get or set the callback function called when the play ends
   *
   * @param {Object} cb
   */
  _play.callback = function(cb) {
    if (!arguments.length) return _callback;
    _callback = cb;
    return _play;
  };

  /**
   * Start or resume the play
   */
  _play.start = function() {
    _running = true;
    setTimeout(_step, _timeout);
    return _play;
  };

  /**
   * Pause the play
   */
  _play.pause = function() {
    _running = false;
    return _play;
  };

  return _play;
};
