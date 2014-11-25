analytics.charts.wordcloudWithLegend = (function () {
  var wordcloudChart = function (selector, dimensions) {

    var _chart = analytics.charts.chart(selector, dimensions);

    _chart.type = function() {
      return "wordcloudWithLegend";
    };

    _chart._createDcElement = function () {
      _chart._element = dc.wordCloudChart(_chart.selector()+" .chart-container");
    };

    _chart._initChartSpecific = function () {

      $(_chart.selector()).append('<div class="wordcloud">'+
          '<div class="wordcloud-chart" id="'+_chart.selectorName()+'"></div>'+
          '<div class="wordcloud-legend" id="'+_chart.selectorName()+'-legend"></div>'+
        '</div>');

      _chart.element()
        .showLegend(_chart.selector()+'-legend')
        .colorCalculator(function (d) { return d ? _chart.element().colors()(d) : '#ccc'; });
    };

    return _chart;
  };

  wordcloudChart.params = {
    displayParams : false
  };

  return analytics.charts.chart.extend(wordcloudChart);
})();
