describe('charts.pie', function () {

  describe('generation', function () {
    var pie;
    var div;

    beforeEach(function () {
      div = appendChartID("pie");
      analytics.query.queryAPI(getQueryAPI());
      analytics.state.initMeasure();
      analytics.state.initDimensions();
      analytics.data.load();
      pie = analytics.charts.pie("#pie");
      pie.dimensions([analytics.state.dimensions()[0]]);
      pie.render();
    });

    it('Should have the "pie" type', function () {
      expect(pie.type()).toBe('pie');
    });

    it('Should generate some html', function () {
      expect(div.html()).not.toBe('');
    });
  });
});

