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

    var superInitChartSpecific = _chart._initChartSpecific;
    _chart._initChartSpecific = function () {
      superInitChartSpecific();
      _chart.element().margins({top: 10, right: 10, bottom: 100, left: 40});
    };

    var superUpdateChartSpecific = _chart._updateChartSpecific;
    _chart._updateChartSpecific = function () {
      superUpdateChartSpecific();
      var captions = getCaptions();
      var format = d3.format(".3s");

      _chart.element()
        .title(function (d) {
          var key = d.key ? d.key : d.data.key;
          if (captions[key] === undefined) return (d.value ? format(d.value) : '');
          return captions[key] + "\nValue: " + (d.value ? format(d.value) : 0); // + "[unit]";
        });
      _chart.element().xAxis().tickFormat(function(d) { return captions[d];});
    };

    function getCaptions () {
      var dimension = _chart.dimensions()[0];
      var metadatas = dimension.membersStack();
      var previousLevelCaptions = {};
      var captions = {};

      var i, key, parent;
      for (i = 0; i < metadatas.length; i++) {
        captions = {};
        for (key in metadatas[i]) {
          parent = metadatas[i][key].parent;
          captions[key] = previousLevelCaptions[parent] ? previousLevelCaptions[parent] + " - " : "";
          captions[key] += metadatas[i][key].caption;
        }
        previousLevelCaptions = captions;
      }

      return captions;
    }

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
