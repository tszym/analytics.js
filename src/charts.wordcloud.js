analytics.charts.wordcloud = (function () {
  var wordcloudChart = function (selector, dimensions) {

    var _chart = analytics.charts.chart(selector, dimensions);

    _chart.type = function() {
      return "wordcloud";
    };

    _chart._createDcElement = function () {
      _chart._element = dc.wordCloudChart(_chart.selector()+" .chart-container");
    };

    _chart._initChartSpecific = function () {
      _chart.element()
        .colorCalculator(function (d) { return d ? _chart.element().colors()(d) : '#ccc'; });
    };

    return _chart;
  };

  return analytics.charts.chart.extend(wordcloudChart);
})();
