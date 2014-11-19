analytics.charts.bar = (function () {
  var barChart = function (selector, dimensions) {

    var _chart = analytics.charts.chart(selector, dimensions);

    _chart.type = function() {
      return "bar";
    };

    _chart._createDcElement = function () {
      _chart._element = dc.barChart(_chart.selector()+" .chart-container");
    };

    _chart._initChartSpecific = function () {
      _chart.element()
        .margins({top: 10, right: 10, bottom: 125, left: 40})
        .renderlet(function (chart) {
                    chart.selectAll("g.x text")
                      .attr('dx', '-50')
                      .attr('transform', "translate(-20,0)")
                      .attr('transform', "rotate(-50)");
                })
        .transitionDuration(500)
        .centerBar(false)
        .gap(1)
        .elasticY(true)
        .elasticX(true);
    };

    _chart._updateChartSpecific = function () {
      var metadata = _chart.dimensions()[0].getLastSlice();

      var format = d3.format(".3s");
      _chart.element()
        .x(d3.scale.ordinal().domain(d3.keys(metadata)))
        .xUnits(dc.units.ordinal)
        .title(function (d) {
          var key = d.key ? d.key : d.data.key;
          if (metadata[key] === undefined) return (d.value ? format(d.value) : '');
          return metadata[key].caption + "\nValue: " + (d.value ? format(d.value) : 0); // + "[unit]";
        });
      _chart.element().xAxis().tickFormat(function(d) {return metadata[d].caption;});
      _chart.element().yAxis().tickFormat(function(d) { return format(d);});
    };

    return _chart;
  };

  barChart.options = {
    sort : "valueasc"
  };

  return analytics.charts.chart.extend(barChart);
})();
