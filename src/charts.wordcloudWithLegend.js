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
        .showLegend(_chart.selector()+' .wordcloud-legend')
        .colorCalculator(function (d) { return d ? _chart.element().colors()(d) : '#ccc'; });

      $(_chart.selector()+' .chart-header').css('cursor', 'pointer');
      $(_chart.selector()+' .chart-header').click(function () {
        var dimension = _chart.dimensions()[0];
        analytics.display.aggregateDimension(dimension, !dimension.aggregated());
      });
    };

    _chart._initContainerSpecific = function () {
      $(_chart.selector()).append('<div class="wordcloud-hidden-info"></div><div class="wordcloud-legend"></div><div class="btn-dimparams-container"><span class="btn-dimparams btn btn-xs btn-default"><i class="fa fa-nomargin fa-cog"></i></span></div>');

      $(_chart.selector() + ' .btn-dimparams').click(function() {
        analytics.display._displayDimensionParamsForm(_chart.dimensions()[0]);
      });
    };

    _chart._updateHeaderSpecific = function () {
      if (_chart.dimensions()[0].aggregated())
        $(_chart.selector() + ' .chart-title').prepend('<i class="fa fa-chevron-right"></i>');
      else
        $(_chart.selector() + ' .chart-title').prepend('<i class="fa fa-chevron-down"></i>');

      if (_chart.dimensions()[0].hideUnfiltered())
        $(_chart.selector() + ' .wordcloud-hidden-info').addClass('alert alert-warning').html('<i class="fa fa-warning"></i>' + analytics.csts.txts.hideUnfilteredWarning);
      else
        $(_chart.selector() + ' .wordcloud-hidden-info').removeClass('alert alert-warning').empty();
    };

    return _chart;
  };

  wordcloudChart.params = {
    displayParams : false
  };

  wordcloudChart.options = {
    hideUnfiltered : null
  };

  return analytics.charts.chart.extend(wordcloudChart);
})();
