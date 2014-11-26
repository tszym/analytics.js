describe('analytics.data', function() {

  analytics.query.queryAPI(generateAPI([c]));
  analytics.state.initMeasure();
  analytics.state.initDimensions();
  var geoDim = analytics.state.dimensions()[0];
  var timeDim = analytics.state.dimensions()[1];

  describe('numberOfCrossedMembers', function() {
    it('should return the good number', function() {
      expect(analytics.data.numberOfCrossedMembers()).toBe(40);
    });
  });

  describe('getDataClientAggregates + getCrossfilterDimension & getCrossfilterGroup', function() {
    it('should load data', function() {
      var cfData = analytics.data.getDataClientAggregates();
      expect(cfData.size()).toBe(analytics.data.numberOfCrossedMembers());
    });

    it('should allow you to get a crossfilter dimension', function() {
      var cfDim = analytics.data.getCrossfilterDimension(geoDim);
      expect(cfDim.groupAll().value()).toBe(40);
    });

    it('should allow you to get a crossfilter group', function() {
      var cfGrp = analytics.data.getCrossfilterGroup(geoDim);
      expect(cfGrp.all()).toEqual([ { key: 'BE', value: 1.4347258900241457 }, { key: 'DE', value: 2.3176831192402343 }, { key: 'LU', value: 1.8476225875732857 }, { key: 'NL', value: 2.087439192080086 }, { key: 'UK', value: 1.6591085039886473 } ]);
    });
  });
});
