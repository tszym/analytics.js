/**
## analytics.charts.**wordcloudWithLegend** class

This class represents a timeline and inherits from analytics.charts.**chart**.

The wordcloudWithLegend is a wordcloud chart which:

* Has a color legend
* Can't be configured

This chart is intended to be used in a dimension list.

**/
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
      _chart.element()
        .showLegend(_chart.selector()+'-legend')
        .colorCalculator(function (d) { return d ? _chart.element().colors()(d) : '#ccc'; });

      $(_chart.selector()+' .chart-header').css('cursor', 'pointer');
      $(_chart.selector()+' .chart-header').click(function () {
        var dimension = _chart.dimensions()[0];
        analytics.display.aggregateDimension(dimension, !dimension.aggregated());
      });
    };

    _chart._initContainerSpecific = function () {
      $(_chart.selector()).append('<div class="wordcloud">'+
          '<div class="wordcloud-chart" id="'+_chart.selectorName()+'"></div>'+
          '<div class="wordcloud-legend" id="'+_chart.selectorName()+'-legend"></div>'+
        '</div>');
    };

    return _chart;
  };

  wordcloudChart.params = {
    displayParams : false
  };

  return analytics.charts.chart.extend(wordcloudChart);
})();
