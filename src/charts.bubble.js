/**
## analytics.charts.**bubble** class

This class represents a bubble chart and inherits from analytics.charts.**chart**.

**/
analytics.charts.bubble = (function () {
  var bubbleChart = function (selector, dimensions) {

    var _chart = analytics.charts.chart(selector, dimensions);

    _chart.type = function() {
      return "bubble";
    };

    _chart._createDcElement = function () {
      _chart._element = dc.bubbleChart(_chart.selector()+" .chart-container");
    };

    _chart._initChartSpecific = function () {

      var format = d3.format('.3s');

      _chart.element()
        .colorCalculator(function (d) {
          var measureId = analytics.state.measure().id();
          return isNaN(d.value[measureId]) ? '#ccc' : _chart.element().colors()(d.value[measureId]);
        })

        .margins({top: 0, right: 0, bottom: 30, left: 45})

        .renderHorizontalGridLines(true)
        .renderVerticalGridLines(true)

        .maxBubbleRelativeSize(0.075);

      _chart.element().yAxis().tickFormat(function (s) { return format(s); });
      _chart.element().xAxis().tickFormat(function (s) { return format(s); });
    };

    _chart._updateChartSpecific = function () {

      var extraMeasures = _chart.extraMeasures(); // [x, y]
      var measures = [extraMeasures[0], extraMeasures[1], analytics.state.measure()]; // [x, y, r]
      var dimension = _chart.dimensions()[0];
      var metadata  = dimension.getLastSlice();
      var cfGroup = dimension.crossfilterGroup(extraMeasures);
      var format = d3.format(".3s");

      _chart.element()
        .keyAccessor(function (p)         { return p.value[measures[0].id()]; })
        .valueAccessor(function (p)       { return p.value[measures[1].id()]; })
        .radiusValueAccessor(function (p) { return p.value[measures[2].id()]; })

        .x(d3.scale.linear().domain(dimension.domainWithPadding(0.20, extraMeasures, measures[0]))).xAxisPadding('20%')
        .y(d3.scale.linear().domain(dimension.domainWithPadding(0.15, extraMeasures, measures[1]))).yAxisPadding('15%')
        .r(d3.scale.linear().domain(dimension.domain           (      extraMeasures, measures[2])))

        .xAxisLabel(measures[0].caption())
        .yAxisLabel(measures[1].caption())

        .minRadiusWithLabel(14)

        .title(function (d) {
          var key = d.key ? d.key : d.data.key;
          if (metadata[key] === undefined) return (d.value ? format(d.value) : '');
          var out = dimension.caption() + ': ' + (metadata[key] ? metadata[key].caption : '') + "\n" +
                    measures[0].caption() + ': ' + (d.value[measures[0].id()] ? format(d.value[measures[0].id()]) : 0) + '\n';
          if (!measures[1].equals(measures[0]))
            out +=  measures[1].caption() + ': ' + (d.value[measures[1].id()] ? format(d.value[measures[1].id()]) : 0) + '\n';
          if (!measures[2].equals(measures[0]) && !measures[2].equals(measures[1]))
            out +=  measures[2].caption() + ': ' + (d.value[measures[2].id()] ? format(d.value[measures[2].id()]) : 0) + '\n';
          return out;
        });

      if (_chart.elasticAxes()) {
        _chart.element().elasticX(true).elasticY(true).elasticRadius(true);
      }
      else {
        _chart.element().elasticX(false).elasticY(false).elasticRadius(false);
      }
    };

    return _chart;
  };

  bubbleChart.options = {
    labels : true,
    height : 500
  };

  bubbleChart.params = {
    nbExtraMeasuresMin  : 2,
    nbExtraMeasuresMax  : 2
  };

  return analytics.charts.chart.extend(bubbleChart);
})();
