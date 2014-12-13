display._nextChartId = function () { return _nextChartId; };
display._charts = function () { return _charts; };
display._resizableColumns = function () { return _resizableColumns; };
display._savedColumnWidths = function () { return _savedColumnWidths; };
display.getColumn = getColumn;
display.getChartPosition = getChartPosition;
display.insertChart = insertChart;
display.replaceChart = replaceChart;
display.emptyChartsColumn = emptyChartsColumn;
display.initCharts = initCharts;
display.updateChart = updateChart;
display.filterChartsAsDimensionsState = filterChartsAsDimensionsState;
display.initButtons = initButtons;
display.initResize = initResize;
display.resize = resize;
display.rebuild = rebuild;

display.reset = function () {
  display.charts().forEach(function(chart) {
    chart.delete();
  });
  _charts = [[],[],[]];
  _nextChartId = 0;
  _resizableColumns = undefined;
  _savedColumnWidths = undefined;
};
