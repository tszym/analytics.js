/**
## analytics.charts.**timeline** class

This class represents a timeline and inherits from analytics.charts.**bar**.

The timeline is a bar chart which:

* Is limited to the Time dimension
* Has play capabilities enabled

**/
analytics.charts.timeline = (function () {
  var timelineChart = function (selector, dimensions) {

    var _chart = analytics.charts.bar(selector, dimensions);

    _chart.type = function() {
      return "timeline";
    };

    return _chart;
  };

  timelineChart.options = {
    sort            : null,
    height          : 0.3,
    heightReference : 'columnHeightRatio'
  };

  timelineChart.params = {
    displayPlay : true
  };

  timelineChart.isPossibleDimension = function (dimension) {
    return dimension.type() == "Time";
  };

  return analytics.charts.chart.extend(timelineChart);
})();
