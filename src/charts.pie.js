/**
## analytics.charts.**pie** class

This class represents a pie chart and inherits from analytics.charts.**chart**.

**/
analytics.charts.pie = (function () {
  var pieChart = function (selector, dimensions) {

    var _chart = analytics.charts.chart(selector, dimensions);

    _chart.type = function() {
      return "pie";
    };

    _chart._createDcElement = function () {
      _chart._element = dc.pieChart(_chart.selector()+" .chart-container");
    };

    _chart._initChartSpecific = function () {
      _chart.element()
        .minAngleForLabel(0.3)
        .ordering(function (d) { return d.value; });
    };

    _chart._resizeSpecific = function () {
      _chart.element()
        .radius(0); // force computation of pie size, useful when resizing
    };

    return _chart;
  };

  pieChart.options = {
    sort   : "valueasc",
    labels : true,
  };

  return analytics.charts.chart.extend(pieChart);
})();
