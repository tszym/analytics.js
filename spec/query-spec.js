describe('analytics.query', function() {

  beforeEach(function() {
    analytics.query.clearCache();
    analytics.query.queryAPI(generateAPI([c]));
  });

  it('can clear its metadata cache', function () {
    analytics.query.getSchemas();
    expect(analytics.query.isCacheEmpty()).toBe(false);
    analytics.query.clearCache();
    expect(analytics.query.isCacheEmpty()).toBe(true);
  });

  describe('at initialization', function () {
    it('should have an API object', function () {
      expect(analytics.query.queryAPI()).toBeDefined();
      expect(analytics.query.queryAPI()).not.toBeNull();
    });
  });

  describe('Metadatas cache operations at schema level', function () {

    it('should be empty at start', function () {
      expect(analytics.query.isCacheEmpty()).toBe(true);
      expect(analytics.query.isSchemaInCache('Olap')).toBe(false);
    });

    it('should cache a schema', function () {
      expect(analytics.query.isSchemaInCache('Olap')).toBe(false);
      analytics.query.cacheSchema('Olap', 'Olap Schema');
      expect(analytics.query.isSchemaInCache('Olap')).toBe(true);
    });

    it('should not override an already cached schema', function () {
      analytics.query.cacheSchema('Olap', 'Olap Schema');
      analytics.query.cacheSchema('Olap', 'Olap desc');
      expect(analytics.query.isSchemaInCache('Olap')).toBe(true);
      expect(analytics.query.getSchemasFromCache().Olap).toBe('Olap Schema');
    });

    it('can tell wether a schema is cached or not', function () {
      analytics.query.getSchemas();
      expect(analytics.query.isSchemaInCache('Olap')).toBe(true);
      expect(analytics.query.isSchemaInCache('TheSchema')).toBe(false);
    });

    it('should retrieve the same schemas with public method or from cache', function () {
      var schemas = analytics.query.getSchemas();
      expect(analytics.query.getSchemasFromCache()).toEqual(schemas);
    });
  });

  describe('Metadatas cache operations at cube level', function () {

    beforeEach(function() {
      analytics.query.getSchemas();
    });

    it('should cache a cube', function () {
      expect(analytics.query.isCubesListEmpty('Olap')).toBe(true);
      expect(analytics.query.isCubeInCache('Olap', 'C')).toBe(false);
      analytics.query.cacheCube('Olap', 'C', 'Le cube');
      expect(analytics.query.isCubeInCache('Olap', 'C')).toBe(true);
    });

    it('can tell wether a cube is cached or not', function () {
      analytics.query.cacheCube('Olap', 'C', 'Le cube');
      expect(analytics.query.isCubeInCache('Olap', 'C')).toBe(true);
      expect(analytics.query.isCubeInCache('Olap', 'CC')).toBe(false);
    });

    it('should not override an already cached cube', function () {
      analytics.query.cacheCube('Olap', 'C', 'Le cube');
      analytics.query.cacheCube('Olap', 'C', 'The last description');
      expect(analytics.query.isCubeInCache('Olap', 'C')).toBe(true);
      expect(analytics.query.getCubesFromCache('Olap').C).toBe('Le cube');
    });

    it('should retrieve the same cube with public method or from cache', function () {
      var cubes = analytics.query.getCubes('Olap');
      expect(analytics.query.getCubesFromCache('Olap')).toEqual(cubes);
    });
  });

  describe('Metadatas cache operations at dimensions level', function () {

    beforeEach(function() {
      analytics.query.getCubes('Olap');
    });

    it('should cache a dimension', function () {
      expect(analytics.query.isDimensionsListEmpty('Olap', 'C')).toBe(true);
      expect(analytics.query.isDimensionInCache('Olap', 'C', '[Zone]')).toBe(false);
      analytics.query.cacheDimension('Olap', 'C', '[Zone]', 'Geometry', 'La Geometrie', 'Geom desc');
      expect(analytics.query.isDimensionInCache('Olap', 'C', '[Zone]')).toBe(true);
    });

    it('can tell wether a dimension is cached or not', function () {
      analytics.query.cacheDimension('Olap', 'C', '[Zone]', 'Geometry', 'La Geometrie', 'Geom desc');
      expect(analytics.query.isDimensionInCache('Olap', 'C', '[Zone]')).toBe(true);
      expect(analytics.query.isDimensionInCache('Olap', 'C', '[Another]')).toBe(false);
    });

    it('should not override an already cached dimension', function () {
      analytics.query.cacheDimension('Olap', 'C', '[Zone]', 'Geometry', 'La Geometrie', 'Geom desc');
      analytics.query.cacheDimension('Olap', 'C', '[Zone]', 'Time', 'La Geometrie', 'Geom desc');
      expect(analytics.query.isDimensionInCache('Olap', 'C', '[Zone]')).toBe(true);
      expect(analytics.query.getDimensionsFromCache('Olap', 'C')['[Zone]'].type).toBe('Geometry');
    });

    it('should retrieve the measure dimension from cache but not by the public method', function () {
      expect(analytics.query.getDimensions('Olap', 'C')._measures).not.toBeDefined();
      expect(analytics.query.getDimensionsFromCache('Olap', 'C')._measures).toBeDefined();
    });

    it('should cache dimensions when retrieving', function () {
      analytics.query.getDimensions('Olap', 'C');
      expect(analytics.query.isDimensionsListEmpty('Olap', 'C')).toBe(false);
    });
  });

  describe('Metadatas cache operations at hierarchies level', function () {

    beforeEach(function() {
      analytics.query.getDimensions('Olap', 'C');
    });

    it('should cache a hierarchy', function () {
      expect(analytics.query.isHierarchiesListEmpty('Olap', 'C', '[Zone]')).toBe(true);
      expect(analytics.query.isHierarchyInCache('Olap', 'C', '[Zone]', 'Z1')).toBe(false);
      analytics.query.cacheHierarchy('Olap', 'C', '[Zone]', 'Z1', 'Nuts', 'Nuts desc');
      expect(analytics.query.isHierarchyInCache('Olap', 'C', '[Zone]', 'Z1')).toBe(true);
    });

    it('can tell wether a hierarchy is cached or not', function () {
      analytics.query.cacheHierarchy('Olap', 'C', '[Zone]', 'Z1', 'Nuts', 'Nuts desc');
      expect(analytics.query.isHierarchyInCache('Olap', 'C', '[Zone]', 'Z1')).toBe(true);
      expect(analytics.query.isHierarchyInCache('Olap', 'C', '[Zone]', 'Z2')).toBe(false);
    });

    it('should not override an already cached hierarchy', function () {
      analytics.query.cacheHierarchy('Olap', 'C', '[Zone]', 'Z1', 'Nuts', 'Nuts desc');
      analytics.query.cacheHierarchy('Olap', 'C', '[Zone]', 'Z1', 'Other Nuts', 'Other Nuts desc');
      expect(analytics.query.isHierarchyInCache('Olap', 'C', '[Zone]', 'Z1')).toBe(true);
      expect(analytics.query.getHierarchiesFromCache('Olap', 'C', '[Zone]').Z1).toBe('Nuts');
    });

    it('should retrieve the same hierarchies with public method or from cache', function () {
      var hierarchies = analytics.query.getHierarchies('Olap', 'C', '[Zone]');
      expect(analytics.query.getHierarchiesFromCache('Olap', 'C', '[Zone]')).toEqual(hierarchies);
    });

    it('should cache hierarchies when retrieving', function () {
      analytics.query.getHierarchies('Olap', 'C', '[Zone]');
      expect(analytics.query.isHierarchiesListEmpty('Olap', 'C', '[Zone]')).toBe(false);
    });
  });

  describe('Exceptions for misuse of operations at cubes level', function () {
    it('should warn that the schema does not exists', function () {
      var schemaError = new analytics.query.SchemaNotInDatabaseError();
      expect(function () {analytics.query.isCubeInCache('NoSchema', 'C');}).toThrow();
      expect(function () {analytics.query.isCubesListEmpty('NoSchema');}).toThrow();
      expect(function () {analytics.query.getCubesFromCache('NoSchema');}).toThrow();
      expect(function () {analytics.query.getCubes('NoSchema');}).toThrow();
    });

  });

  describe('public functions', function () {
    describe('getSchemas', function () {
      var expected = {
        'Olap' : 'Olap Schema'
      };

      it('should return the expected map', function () {
        expect(analytics.query.getSchemas()).toEqual(expected);
      });
    });

    describe('getCubes', function () {
      var expected = {
        'C' : 'Le cube'
      };

      it('should return the expected map with the cube', function () {
        expect(analytics.query.getCubes('Olap')).toEqual(expected);
      });
    });

    describe('getMesures', function () {
      var expected = {
        'E' : {
          caption : 'Export',
          description : 'Export desc'
        },
        'I' : {
          caption : 'Import',
          description : 'Import desc'
        }
      };

      it('should return the expected map of measures', function () {
        expect(analytics.query.getMesures('Olap', 'C')).toEqual(expected);
      });
    });

    describe('getCubesAndMeasures', function () {
      var expected = {
        'C' : {
          caption : 'Le cube',
          measures : {
            'E' : {
              caption : 'Export',
              description : 'Export desc'
            },
            'I' : {
              caption : 'Import',
              description : 'Import desc'
            }
          }
        }
      };

      it('should return the expected map of cubes with the measures inside', function () {
        expect(analytics.query.getCubesAndMeasures('Olap')).toEqual(expected);
      });
    });


    describe('getDimensions', function () {
      var expected = {
        '[Zone]' : {
          'caption' : 'Zone',
          'type' : 'Geometry',
          'description' : 'Zone desc'
        },
        '[Time]' : {
          'caption' : 'Temps',
          'type' : 'Time',
          'description' : 'T desc'
        },
        '[Product]' : {
          'caption' : 'Product',
          'type' : 'Standard',
          'description' : 'Prod desc'
        }
      };

      it('should return the expected map', function () {
        expect(analytics.query.getDimensions('Olap', 'C')).toEqual(expected);
      });
    });

    describe('getGeoDimension', function () {
      var expected = '[Zone]';

      it('should return the expected id', function () {
        expect(analytics.query.getGeoDimension('Olap', 'C')).toEqual(expected);
      });
    });

    describe('getTimeDimension', function () {
      var expected = '[Time]';

      it('should return the expected id', function () {
        expect(analytics.query.getTimeDimension('Olap', 'C')).toEqual(expected);
      });
    });

    describe('getMeasureDimension', function () {
      var expected = '_measures';

      it('should return the expected id of dimension', function () {
        expect(analytics.query.getMeasureDimension('Olap', 'C')).toEqual(expected);
      });
    });

    describe('getHierarchies', function () {
      var expected = {
        'Z1' : 'Nuts'
      };

      it('should return the expected map', function () {
        expect(analytics.query.getHierarchies('Olap', 'C', '[Zone]')).toEqual(expected);
      });
    });

    describe('getLevels', function () {
      var expected = ['Nuts0', 'Nuts1'];

      it('should return the expected array', function () {
        expect(analytics.query.getLevels('Olap', 'C', '[Zone]', 'Z1')).toEqual(expected);
      });
    });

    describe('getProperties', function () {
      var expected = {
        'Geom' : {
          'caption' : 'La Geometrie',
          'description' : 'Geom desc',
          'type' : 'Geometry'
        }
      };

      it('should return the expected map', function () {
        expect(analytics.query.getProperties('Olap', 'C', '[Zone]', 'Z1', 0)).toEqual(expected);
      });
    });

    describe('getGeoProperty', function () {
      var expected = 'Geom';

      it('should return the expected id', function () {
        expect(analytics.query.getGeoProperty('Olap', 'C', '[Zone]', 'Z1')).toEqual(expected);
      });
    });

    describe('getMembers', function () {
      var expectedIds = ['BE', 'DE', 'NL', 'LU', 'UK'];

      describe('with optional parameters as default', function () {
        it('should return the expected ids of members', function () {
          var members = analytics.query.getMembers('Olap', 'C', '[Zone]', 'Z1', 0);
          expect(Object.keys(members)).toEqual(expectedIds);
        });

        it('should return the expected members as objects', function () {
          var members = analytics.query.getMembers('Olap', 'C', '[Zone]', 'Z1', 0);
          expect(typeof members).toEqual('object');
          for (var key in members) {
            expect(typeof members[key].Geom).toEqual('string');
            expect(typeof members[key].caption).toEqual('string');
            expect(typeof members[key].description).toEqual('string');
          }
        });
      });

      describe('with properties', function () {
        it('should return the expected ids of members', function () {
          var members = analytics.query.getMembers('Olap', 'C', '[Zone]', 'Z1', 0, true);
          expect(Object.keys(members)).toEqual(expectedIds);
        });

        it('should return the expected members as objects', function () {
          var members = analytics.query.getMembers('Olap', 'C', '[Zone]', 'Z1', 0, true);
          expect(typeof members).toEqual('object');
          for (var key in members) {
            expect(typeof members[key].Geom).toEqual('object');
            expect(typeof members[key].caption).toEqual('string');
            expect(typeof members[key].description).toEqual('string');
          }
        });
      });

      describe('childrens of a parent member', function () {
        it('should return the expected ids of children members', function () {
          var membersBE = analytics.query.getMembers('Olap', 'C', '[Zone]', 'Z1', 0, true, 'BE');
          var childrenIDsBE = ['BE1', 'BE2', 'BE3'];
          expect(Object.keys(membersBE)).toEqual(childrenIDsBE);

          var membersDE = analytics.query.getMembers('Olap', 'C', '[Zone]', 'Z1', 0, true, 'DE');
          var childrenIDsDE = ['DE7', 'DEC', 'DE9', 'DEB', 'DE3', 'DEG', 'DEF',
            'DE8', 'DE4', 'DEA', 'DEE', 'DE1', 'DE2', 'DE6', 'DE5', 'DED'];
          expect(Object.keys(membersDE)).toEqual(childrenIDsDE);
        });

        it('should return the expected members as objects', function () {
          var members = analytics.query.getMembers('Olap', 'C', '[Zone]', 'Z1', 0, true, 'BE');
          expect(typeof members).toEqual('object');
          for (var key in members) {
            expect(typeof members[key].Geom).toEqual('object');
            expect(typeof members[key].caption).toEqual('string');
            expect(typeof members[key].description).toEqual('string');
          }
        });
      });
    });

  });

});

