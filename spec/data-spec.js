describe('analytics.data', function() {

  analytics.query.queryAPI(getQueryAPI());
  analytics.state.initMeasure();
  analytics.state.initDimensions();
  var geoDim = analytics.state.dimensions()[0];
  var timeDim = analytics.state.dimensions()[1];

  describe('numberOfCrossedMembers', function() {
    it('should return the good number', function() {
      expect(analytics.data.numberOfCrossedMembers()).toBe(getTestsResults().nbCrossedMembers);
    });
  });

  describe('getDataClientAggregates + getCrossfilterDimension & getCrossfilterGroup', function() {
    it('should load data', function() {
      var cfData = analytics.data.getDataClientAggregates();
      expect(cfData.size()).toBe(analytics.data.numberOfCrossedMembers());
    });

    it('should allow you to get a crossfilter dimension', function() {
      var cfDim = analytics.data.getCrossfilterDimension(geoDim);
      expect(cfDim.groupAll().value()).toBe(getTestsResults().nbCrossedMembers);
    });

    it('should allow you to get a crossfilter group', function() {
      var cfGrp = analytics.data.getCrossfilterGroup(geoDim);
      expect(cfGrp.all()).toEqual(getTestsResults().groupContriesAll);
    });
  });
});
