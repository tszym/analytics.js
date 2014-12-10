describe('analytics.state', function() {

  // before all
  analytics.reset();
  analytics.query.queryAPI(getQueryAPI());

  describe('initMeasure', function() {
    it('should load a schema, cube and measure', function() {
      analytics.state.initMeasure();
      expect(analytics.state.schema()).toEqual(getTestsResults().schema);
      expect(analytics.state.cube().id()).toEqual(getTestsResults().cube.id);
      expect(analytics.state.cube().caption()).toEqual(getTestsResults().cube.caption);
      expect(analytics.state.measure().id()).toEqual(getTestsResults().measure.id);
      expect(analytics.state.measure().caption()).toEqual(getTestsResults().measure.caption);
    });
  });

  describe('initDimensions', function() {
    it('should load dimensions and slice those dimensions', function() {
      analytics.state.initDimensions();

      var dimensions = analytics.state.dimensions();

      expect(dimensions.length).toBe(3);
      expect(dimensions[0].id()).toEqual("[Zone]");
      expect(dimensions[0].currentLevel()).toBe(0);
      expect(dimensions[0].type()).toEqual("Geometry");
      expect(dimensions[0].properties().length).toBe(1);
      expect(dimensions[0].properties()[0].id()).toEqual(getTestsResults().dimension0.geoProp);
      expect(Object.keys(dimensions[0].getLastSlice())).toEqual(getTestsResults().dimension0.members);
    });
  });

  describe('drillDown simple', function() {
    it('should add a slice to the dimension', function() {

      var dimension = analytics.state.dimensions()[0];

      analytics.state.drillDown(dimension, getTestsResults().dimension0.toDrill, "simple");

      expect(dimension.currentLevel()).toBe(1);
      expect(Object.keys(dimension.getLastSlice())).toEqual(getTestsResults().dimension0.members1);
    });

    it('should not be able to drill when at last level', function() {

      var dimension = analytics.state.dimensions()[0];
      dimension._levels([dimension._levels()[0], dimension._levels()[1]]); // limit virtually to 2 levels

      analytics.state.drillDown(dimension, getTestsResults().dimension0.toDrill, "simple");

      expect(dimension.currentLevel()).toBe(1);
      expect(Object.keys(dimension.getLastSlice())).toEqual(getTestsResults().dimension0.members1);
    });
  });

  describe('rollUp', function() {
    it('should come 1 level back', function() {

      var dimension = analytics.state.dimensions()[0];

      analytics.state.rollUp(dimension);

      expect(dimension.currentLevel()).toBe(0);
      expect(Object.keys(dimension.getLastSlice())).toEqual(getTestsResults().dimension0.members);
    });

    it('should not be able to roll when at first level', function() {

      var dimension = analytics.state.dimensions()[0];

      analytics.state.rollUp(dimension);

      expect(dimension.currentLevel()).toBe(0);
      expect(Object.keys(dimension.getLastSlice())).toEqual(getTestsResults().dimension0.members);
    });
  });

  describe('drillDown selected', function() {

    it('should drill down on all members if nothing selected', function() {

      var dimension = analytics.state.dimensions()[0];

      analytics.state.drillDown(dimension, getTestsResults().dimension0.toDrill, "selected");

      expect(dimension.currentLevel()).toBe(1);
      expect(Object.keys(dimension.getLastSlice())).toEqual(getTestsResults().dimension0.members1All);
    });

    it('should drill down on the selected members if some selected', function() {

      var dimension = analytics.state.dimensions()[0];
      analytics.state.rollUp(dimension);

      dimension.filters(getTestsResults().dimension0.toDrillMulti);
      analytics.state.drillDown(dimension, getTestsResults().dimension0.toDrill, "selected");

      expect(dimension.currentLevel()).toBe(1);
      expect(Object.keys(dimension.getLastSlice())).toEqual(getTestsResults().dimension0.members1Multi);
    });
  });

  // after all
  analytics.reset();

  /*
  describe('getState', function() {

    it('should return an object describing the state', function() {

      analytics.display.initResize();

      var state = analytics.state();
      console.log(state);

      //expect(Object.keys(dimension.getLastSlice())).toEqual([ 'BE1', 'BE2', 'BE3', 'UKI', 'UKC', 'UKM', 'UKG', 'UKD', 'UKF', 'UKH', 'UKL', 'UKN', 'UKJ', 'UKK', 'UKE' ]);
    });
  });
  */

});
