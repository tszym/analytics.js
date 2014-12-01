describe('analytics.display', function() {

  analytics.query.queryAPI(getQueryAPI());

  beforeEach(function() {
    analytics.reset();
    d3.select("body").append("div").attr("id", "interface-content");
    $("#test-content").html('<div id="toolbox">'+
      '<div class="pull-right">'+
        '<a id="reset" class="btn btn-default btn-md" href="#"><i class="fa fa-refresh"></i> Reset Filters</a>'+
        '<a id="resize" class="btn btn-default"><i class="fa fa-arrows-v fa-nomargin"></i></a>'+
        '<a href="#modal_analysis" class="btn btn-primary" data-toggle="modal" disabled="disabled">Save Analysis</a>'+
      '</div>'+
      '<div id="fact-selector">&nbsp;</div>'+
    '</div>'+

    '<div id="columns">'+
      '<div class="chart-columns" id="left-pane"></div>'+
      '<div class="chart-columns" id="middle-pane"></div>'+
      '<div class="chart-columns" id="right-pane"></div>'+
    '</div>');

    jasmine.clock().install();
  });

  afterEach(function () {
    analytics.reset();
    d3.selectAll("#interface-content").remove();
    jasmine.clock().uninstall();
  });


  describe('init', function() {
    it('should create charts & init column resizing', function() {
      analytics.display.init();

      expect(analytics.display.charts().length).toBeGreaterThan(0);
      expect(analytics.display._resizableColumns).toBeDefined();
      expect(Object.keys(analytics.display.columnWidths())).toEqual(['left-pane', 'middle-pane', 'right-pane']);
    });
  });

  describe('getColumn', function() {
    it('should return a jQuery object', function() {
      expect(analytics.display.getColumn(0).length).toBe(1);
      expect(analytics.display.getColumn(1).length).toBe(1);
      expect(analytics.display.getColumn(2).length).toBe(1);
      expect(analytics.display.getColumn(3).length).toBe(0);
    });
  });

  describe('getChartsUsingDimension', function() {
    it('should return charts for the geo dimension after init', function() {
      analytics.display.init();
      analytics.state.initMeasure();
      analytics.state.initDimensions();

      var dimension = analytics.state.dimensions()[0];

      expect(analytics.display.getChartsUsingDimension(dimension).length).toBeGreaterThan(0);
    });
  });

  describe('getChartPosition', function() {
    it('should return the good position', function() {
      analytics.display.init();

      var charts = analytics.display.chartsInLayout();

      expect(analytics.display.getChartPosition(charts[1][0]).i).toBe(1);
      expect(analytics.display.getChartPosition(charts[1][0]).j).toBe(0);

      expect(analytics.display.getChartPosition(charts[2][1]).i).toBe(2);
      expect(analytics.display.getChartPosition(charts[2][1]).j).toBe(1);
    });
  });

  describe('replaceChart', function() {
    it('should change a chart by another', function() {
      analytics.display.init();

      analytics.display.replaceChart(analytics.display.chartsInLayout()[1][1], "wordcloud");

      expect(analytics.display.chartsInLayout()[1][1].type()).toEqual("wordcloud");
    });
  });

  describe('emptyChartsColumn', function() {
    it('should remove all charts in a column', function() {
      analytics.display.init();

      expect(analytics.display.chartsInLayout()[1].length).toBeGreaterThan(0);

      analytics.display.emptyChartsColumn(1);

      expect(analytics.display.chartsInLayout()[1].length).toBe(0);
    });
  });

  describe('createWordClouds', function() {
    it('should create 1 wordcloud per dimension in column 0', function() {
      analytics.display.init();

      expect(analytics.display.chartsInLayout()[0].length).toBe(0);

      analytics.state.initMeasure();
      analytics.state.initDimensions(); // calls createWordClouds

      expect(analytics.display.chartsInLayout()[0].length).toBe(analytics.state.dimensions().length);
    });
  });

  describe('updateChart', function() {
    it('should modify a chart', function() {
      analytics.display.init();
      analytics.state.initMeasure();
      analytics.state.initDimensions();
      analytics.data.load();
      analytics.display.render();

      var options = {
        type: "pie",
        dimensions: [analytics.state.dimensions()[2]],
        measures: [],
        sort: "key",
        labels: false,
        playerTimeout: 100
      };

      var chart = analytics.display.chartsInLayout()[2][1];

      analytics.display.updateChart(chart, options);

      var newChart = analytics.display.chartsInLayout()[2][1];

      expect(newChart.type()).toBe(options.type);
      expect(newChart.dimensions()[0].equals(analytics.state.dimensions()[2])).toBe(true);
      expect(newChart.options().sort).toBe(options.sort);
      expect(newChart.options().labels).toBe(options.labels);
    });

  });

});
