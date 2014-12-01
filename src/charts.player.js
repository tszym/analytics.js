/**
## analytics.charts.**player** class

This class represent an object that handles playing the data displayed on a chart.

### *Object* analytics.charts.**player**([*Object*])

Creates a player object for the given chart.
**/
analytics.charts.player = function (chart) {

  var _dimension = chart.dimensions()[0];
  var _members = chart.element().hasFilter() ? chart.element().filters() : Object.keys(_dimension.getLastSlice());
  _members.sort();

  var _currentMember = 0;
  var _timeout = chart.options().playerTimeout;
  var _running = true;
  var _callback = function () { };
  var _chart = chart;

  var _play = {};

  var _step = function() {
    if (_currentMember > _members.length - 1) {
      _callback();
      _chart.element().filterAll();
      _members.forEach(function (member) {
        _chart.element().filter(member);
      });
      dc.redrawAll();
      return;
    }

    if (!_running) {
      return;
    }

    _chart.element().filter(_members[_currentMember]);
    if (_currentMember - 1  >= 0) {
      _chart.element().filter(_members[_currentMember - 1]);
    }
    dc.redrawAll();

    _currentMember++;

    setTimeout(_step, _play.timeout());
  };

  /**
  ### Player object

  * *boolean* charts.player.**running**()
  * *mixed* charts.player.**timeout**([*integer* timeout])
  * *mixed* charts.player.**callback**([*function* cb])
  * *this* charts.player.**start**()
  * *this* charts.player.**pause**()

  The optional `callback` is called at the end of the play.
  The timeout is the time to wait between two members.

  **/

  _play.running = function () {
    return _running;
  };

  _play.timeout = function(timeout) {
    if (!arguments.length) return _timeout;
    _timeout = timeout;
    return _play;
  };

  _play.callback = function(cb) {
    if (!arguments.length) return _callback;
    _callback = cb;
    return _play;
  };

  _play.start = function() {
    _running = true;
    setTimeout(_step, _timeout);
    return _play;
  };

  _play.pause = function() {
    _running = false;
    return _play;
  };

  return _play;
};
