describe('analytics.state', function() {

  // before all
  analytics.reset();
  analytics.query.queryAPI(generateAPI([c]));

  describe('initMeasure', function() {
    it('should load a schema, cube and measure', function() {
      analytics.state.initMeasure();
      expect(analytics.state.schema()).toEqual("Olap");
      expect(analytics.state.cube().id()).toEqual("C");
      expect(analytics.state.cube().caption()).toEqual("Le cube");
      expect(analytics.state.measure().id()).toEqual("E");
      expect(analytics.state.measure().caption()).toEqual("Export");
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
      expect(dimensions[0].properties()[0].id()).toEqual("Geom");
      expect(Object.keys(dimensions[0].getLastSlice())).toEqual(["BE", "DE", "NL", "LU", "UK"]);
    });
  });

  describe('drillDown simple', function() {
    it('should add a slice to the dimension', function() {

      var dimension = analytics.state.dimensions()[0];

      analytics.state.drillDown(dimension, Object.keys(dimension.getLastSlice())[0], "simple");

      expect(dimension.currentLevel()).toBe(1);
      expect(Object.keys(dimension.getLastSlice())).toEqual(["BE1", "BE2", "BE3"]);
    });

    it('should not be able to drill when at last level', function() {

      var dimension = analytics.state.dimensions()[0];

      analytics.state.drillDown(dimension, Object.keys(dimension.getLastSlice())[0], "simple");

      expect(dimension.currentLevel()).toBe(1);
      expect(Object.keys(dimension.getLastSlice())).toEqual(["BE1", "BE2", "BE3"]);
    });
  });

  describe('rollUp', function() {
    it('should come 1 level back', function() {

      var dimension = analytics.state.dimensions()[0];

      analytics.state.rollUp(dimension);

      expect(dimension.currentLevel()).toBe(0);
      expect(Object.keys(dimension.getLastSlice())).toEqual(["BE", "DE", "NL", "LU", "UK"]);
    });

    it('should not be able to roll when at first level', function() {

      var dimension = analytics.state.dimensions()[0];

      analytics.state.rollUp(dimension);

      expect(dimension.currentLevel()).toBe(0);
      expect(Object.keys(dimension.getLastSlice())).toEqual(["BE", "DE", "NL", "LU", "UK"]);
    });
  });

  describe('drillDown selected', function() {

    it('should drill down on all members if nothing selected', function() {

      var dimension = analytics.state.dimensions()[0];

      analytics.state.drillDown(dimension, Object.keys(dimension.getLastSlice())[0], "selected");

      expect(dimension.currentLevel()).toBe(1);
      expect(Object.keys(dimension.getLastSlice())).toEqual(['BE1', 'BE2', 'BE3', 'DE7', 'DEC', 'DE9', 'DEB', 'DE3', 'DEG', 'DEF', 'DE8', 'DE4', 'DEA', 'DEE', 'DE1', 'DE2', 'DE6', 'DE5', 'DED', 'NL4', 'NL3', 'NL1', 'NL2', 'LU0', 'UKI', 'UKC', 'UKM', 'UKG', 'UKD', 'UKF', 'UKH', 'UKL', 'UKN', 'UKJ', 'UKK', 'UKE']);
    });

    it('should drill down on the selected members if some selected', function() {

      var dimension = analytics.state.dimensions()[0];
      analytics.state.rollUp(dimension);

      dimension.filters(["BE", "UK"]);
      analytics.state.drillDown(dimension, Object.keys(dimension.getLastSlice())[0], "selected");

      expect(dimension.currentLevel()).toBe(1);
      expect(Object.keys(dimension.getLastSlice())).toEqual([ 'BE1', 'BE2', 'BE3', 'UKI', 'UKC', 'UKM', 'UKG', 'UKD', 'UKF', 'UKH', 'UKL', 'UKN', 'UKJ', 'UKK', 'UKE' ]);
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
