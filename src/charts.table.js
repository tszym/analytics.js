analytics.charts.table = (function () {
  var table = function (selector, dimensions) {

    var _chart = analytics.charts.chart(selector, dimensions);

    _chart.type = function() {
      return "table";
    };

    _chart._initContainerSpecific = function () {
      $(_chart.selector() + ' .chart-container').addClass('chart dc-chart');
      $(_chart.selector() + ' .chart-container').html('<table><thead><tr><th>Element</th><th>Value</th></tr></thead></table>');
    };

    _chart._createDcElement = function () {
      _chart._element = dc.dataTable(_chart.selector()+" table");
    };

    _chart._initChartSpecific = function () {
      var dimension = _chart.dimensions()[0];
      var members = dimension.getLastSlice();
      var format = d3.format(".3s");

      _chart.element()
        .size(Infinity)
        .columns([
          function(d){
            var key = d.key ? d.key : d.data.key;
            if (members[key] === undefined) {
              return key;
            }
            return members[key].caption;
          },
          function(d){ return (d.value ? format(d.value) : 0); }
         ]);
    };

    _chart._updateChartSpecific = function () {
      var dimension = _chart.dimensions()[0];

      $(_chart.selector() + " table th:first").html(dimension.caption());
      $(_chart.selector() + " table th:last").html(analytics.state.measure().caption());

      _chart.element()
        .dimension(dimension.crossfilterGroup())
        .group(function(d){return "";});

      sortRows(_chart.options().sort);
    };

    function sortRows (method) {
      switch(method) {
          case "key":
            _chart.element()
              .order(d3.ascending)
              .sortBy(function(d) {return d.key; });
          break;

          case "valueasc":
            _chart.element()
              .order(d3.descending)
              .sortBy(function(d) { return -d.value; });
          break;

          default: // valuedesc
            _chart.element()
              .order(d3.descending)
              .sortBy(function(d) { return d.value; });
            _chart.setOption("sort", "valuedesc");
          break;
      }
    }

    return _chart;
  };

  table.options = {
    sort : "valuedesc"
  };

  return analytics.charts.chart.extend(table);
})();
