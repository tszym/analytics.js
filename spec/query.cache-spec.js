describe('analytics.query.cache', function() {
  var idSchema = 'Olap';
  var captionSchema = 'Olap Schema';

  var idCube = 'C';
  var captionCube = 'Le cube';
  var descriptionCube = 'Cube description';

  var idDimension = '[Zone]';
  var captionDimension = 'Zone';
  var descriptionDimension = 'Zone desc';
  var typeDimension = 'Geometry';

  var idHierarchy = 'Z1';
  var captionHierarchy = 'Nuts';
  var descriptionHierarchy = 'Nuts desc';

  var idLevel = 'nuts0';
  var indexLevel = 0;
  var captionLevel = 'Nuts0';
  var descriptionLevel = 'Nuts0 desc';

  beforeEach(function() {
    analytics.query.cache.clearCache();
  });

  // Private functions

  describe('mapWithCaptionToSimpleMap', function () {
    it('should flatten the map', function () {
      var initialMap = {
        'label' : { caption : 'theCaption'},
        'otherLabel' : { caption : 'theOtherCaption'}
      };
      var expectedMap = {
        'label' : 'theCaption',
        'otherLabel' : 'theOtherCaption'
      };

      expect(analytics.query.cache._mapWithCaptionToSimpleMap(initialMap)).toEqual(expectedMap);
    });
  });

  describe('isCubesListEmpty', function () {
    it('should be true when no cube has been cached', function () {
      analytics.query.cache.cacheSchema(idSchema, captionSchema);
      expect(analytics.query.cache._isCubesListEmpty(idSchema)).toBe(true);
    });

    it('should be false when one cube has been cached', function () {
      analytics.query.cache.cacheSchema(idSchema, captionSchema);
      analytics.query.cache.cacheCube(idSchema, idCube, captionCube, descriptionCube);
      expect(analytics.query.cache._isCubesListEmpty(idSchema)).toBe(false);
    });

    it('should throw an error when the given schema is not in the cache', function () {
      expect(function () {analytics.query.cache._isCubesListEmpty('NoSchema');}).toThrow('The schema you tried to use does not exists in the database!');
    });
  });

  describe('isDimensionsListEmpty', function () {
    beforeEach(function() {
      analytics.query.cache.cacheSchema(idSchema, captionSchema);
    });

    it('should be true when no dimension has been cached', function () {
      analytics.query.cache.cacheCube(idSchema, idCube, captionCube, descriptionCube);
      expect(analytics.query.cache._isDimensionsListEmpty(idSchema, idCube)).toBe(true);
    });

    it('should be false when one dimension has been cached', function () {
      analytics.query.cache.cacheCube(idSchema, idCube, captionCube, descriptionCube);
      analytics.query.cache.cacheDimension(idSchema, idCube, idDimension, typeDimension, captionDimension, descriptionDimension);
      expect(analytics.query.cache._isDimensionsListEmpty(idSchema, idCube)).toBe(false);
    });

    it('should throw an error when the given schema is not in the cache', function () {
      expect(function () {analytics.query.cache._isDimensionsListEmpty('NoSchema', 'NoCube');}).toThrow();
    });

    it('should throw an error when the given cube is not in the cache', function () {
      expect(function () {analytics.query.cache._isDimensionsListEmpty(idSchema, 'NoCube');}).toThrow();
    });
  });

  describe('isHierarchiesListEmpty', function () {
    beforeEach(function() {
      analytics.query.cache.cacheSchema(idSchema, captionSchema);
      analytics.query.cache.cacheCube(idSchema, idCube, captionCube, descriptionCube);
    });

    it('should be true when no hierarchy has been cached', function () {
      analytics.query.cache.cacheDimension(idSchema, idCube, idDimension, typeDimension, captionDimension, descriptionDimension);
      expect(analytics.query.cache._isHierarchiesListEmpty(idSchema, idCube, idDimension)).toBe(true);
    });

    it('should be false when one hierarchy has been cached', function () {
      analytics.query.cache.cacheDimension(idSchema, idCube, idDimension, typeDimension, captionDimension, descriptionDimension);
      analytics.query.cache.cacheHierarchy(idSchema, idCube, idDimension, idHierarchy, captionHierarchy, descriptionHierarchy);
      expect(analytics.query.cache._isHierarchiesListEmpty(idSchema, idCube, idDimension)).toBe(false);
    });

    it('should throw an error when the given schema is not in the cache', function () {
      expect(function () {analytics.query.cache._isHierarchiesListEmpty('NoSchema', 'NoCube', 'NoDimension');}).toThrow();
    });

    it('should throw an error when the given cube is not in the cache', function () {
      expect(function () {analytics.query.cache._isHierarchiesListEmpty(idSchema, 'NoCube', 'NoDimension');}).toThrow();
    });

    it('should throw an error when the given dimension is not in the cache', function () {
      expect(function () {analytics.query.cache._isHierarchiesListEmpty(idSchema, idCube, 'NoDimension');}).toThrow();
    });
  });

  describe('isLevelsListEmpty', function () {
    beforeEach(function() {
      analytics.query.cache.cacheSchema(idSchema, captionSchema);
      analytics.query.cache.cacheCube(idSchema, idCube, captionCube, descriptionCube);
      analytics.query.cache.cacheDimension(idSchema, idCube, idDimension, typeDimension, captionDimension, descriptionDimension);
    });

    it('should be true when no level has been cached', function () {
      analytics.query.cache.cacheHierarchy(idSchema, idCube, idDimension, idHierarchy, captionHierarchy, descriptionHierarchy);
      expect(analytics.query.cache._isLevelsListEmpty(idSchema, idCube, idDimension, idHierarchy)).toBe(true);
    });

    it('should be false when one level has been cached', function () {
      analytics.query.cache.cacheHierarchy(idSchema, idCube, idDimension, idHierarchy, captionHierarchy, descriptionHierarchy);
      analytics.query.cache.cacheLevel(idSchema, idCube, idDimension, idHierarchy, idLevel, captionLevel, descriptionLevel);
      expect(analytics.query.cache._isLevelsListEmpty(idSchema, idCube, idDimension, idHierarchy)).toBe(false);
    });

    it('should throw an error when the given schema is not in the cache', function () {
      expect(function () {analytics.query.cache._isLevelsListEmpty('NoSchema', 'NoCube', 'NoDimension', 'NoHierarchy');}).toThrow();
    });

    it('should throw an error when the given cube is not in the cache', function () {
      expect(function () {analytics.query.cache._isLevelsListEmpty(idSchema, 'NoCube', 'NoDimension', 'NoHierarchy');}).toThrow();
    });

    it('should throw an error when the given dimension is not in the cache', function () {
      expect(function () {analytics.query.cache._isLevelsListEmpty(idSchema, idCube, 'NoDimension', 'NoHierarchy');}).toThrow();
    });

    it('should throw an error when the given hierarchy is not in the cache', function () {
      expect(function () {analytics.query.cache._isLevelsListEmpty(idSchema, idCube, idDimension, 'NoHierarchy');}).toThrow();
    });
  });


  // Protected functions

  describe('isCacheEmpty', function () {
    it('should be true after a clearCache', function () {
      expect(analytics.query.cache.isCacheEmpty()).toBe(true);
    });
  });

  describe('cacheSchema', function () {
    it('should cache a schema and retrieve it from there', function () {
      analytics.query.cache.cacheSchema(idSchema, captionSchema);

      expect(analytics.query.cache.isSchemaInCache(idSchema)).toBe(true);
      expect(analytics.query.cache.getSchemasFromCache()).toEqual({'Olap' : captionSchema});
    });

    it('should not override an already cached schema', function () {
      analytics.query.cache.cacheSchema(idSchema, captionSchema);
      analytics.query.cache.cacheSchema(idSchema, 'Olap desc');
      expect(analytics.query.cache.isSchemaInCache(idSchema)).toBe(true);
      expect(analytics.query.cache.getSchemasFromCache().Olap).toBe(captionSchema);
    });

    it('should cache a not already cached schema', function () {
      analytics.query.cache.cacheSchema(idSchema, captionSchema);
      analytics.query.cache.cacheSchema('otherSchema', 'Olap desc');

      var expected = {
        'Olap' : captionSchema,
        'otherSchema' : 'Olap desc'
      };
      expect(analytics.query.cache.getSchemasFromCache()).toEqual(expected);
    });
  });

  describe('getSchemasFromCache', function () {
    it('should give an empty set when asked for shemas with void cache', function () {
      expect(analytics.query.cache.getSchemasFromCache()).toEqual({});
    });
  });

  describe('isSchemaInCache', function () {
    it('can tell wether a schema is cached or not', function () {
      analytics.query.cache.cacheSchema(idSchema, captionSchema);
      expect(analytics.query.cache.isSchemaInCache(idSchema)).toBe(true);
      expect(analytics.query.cache.isSchemaInCache('TheSchema')).toBe(false);
    });
  });

  describe('about cubes', function () {

    beforeEach(function() {
      analytics.query.cache.cacheSchema(idSchema, captionSchema);
    });

    describe('cacheCube', function () {
      it('should cache a cube that can be retrieved from there', function () {
        analytics.query.cache.cacheCube(idSchema, idCube, captionCube, descriptionCube);

        expect(analytics.query.cache.isCubeInCache(idSchema, idCube)).toBe(true);
        expect(analytics.query.cache.getCubesFromCache(idSchema)).toEqual({'C' : captionCube});
      });

      it('should not override an already cached cube', function () {
        analytics.query.cache.cacheCube(idSchema, idCube, captionCube, descriptionCube);
        analytics.query.cache.cacheCube(idSchema, idCube, 'other cube caption', descriptionCube);
        expect(analytics.query.cache.isCubeInCache(idSchema, idCube)).toBe(true);
        expect(analytics.query.cache.getCubesFromCache(idSchema).C).toBe(captionCube);
      });

      it('should cache a not already cached cube', function () {
        analytics.query.cache.cacheCube(idSchema, idCube, captionCube, descriptionCube);
        analytics.query.cache.cacheCube(idSchema, 'CC', 'other cube caption', descriptionCube);

        var expected = {
          'C' : captionCube,
          'CC' : 'other cube caption'
        };
        expect(analytics.query.cache.getCubesFromCache(idSchema)).toEqual(expected);

      });
    });

    describe('getCubesFromCache', function () {
      it('should give an empty set when asked for cubes with void schema', function () {
        expect(analytics.query.cache.getCubesFromCache(idSchema)).toEqual({});
      });
    });

    describe('isCubeInCache', function () {
      it('can tell wether a cube is cached or not', function () {
        analytics.query.cache.cacheCube(idSchema, idCube, captionCube, descriptionCube);
        expect(analytics.query.cache.isCubeInCache(idSchema, idCube)).toBe(true);
        expect(analytics.query.cache.isCubeInCache(idSchema, 'a cube id')).toBe(false);
      });
    });
  });

  describe('about dimensions', function () {
    beforeEach(function() {
      analytics.query.cache.cacheSchema(idSchema, captionSchema);
      analytics.query.cache.cacheCube(idSchema, idCube, captionCube, descriptionCube);
    });

    describe('cacheDimension', function () {

      it('should cache a dimension that can be retrieved from there', function () {
        analytics.query.cache.cacheDimension(idSchema, idCube, idDimension, typeDimension, captionDimension, descriptionDimension);
        expect(analytics.query.cache.isDimensionInCache(idSchema, idCube, idDimension)).toBe(true);

        var expected = {
          '[Zone]' : {caption : captionDimension, type : typeDimension, description : descriptionDimension},
        };
        expect(analytics.query.cache.getDimensionsFromCache(idSchema, idCube)).toEqual(expected);
      });

      it('should not override an already cached dimension', function () {
        analytics.query.cache.cacheDimension(idSchema, idCube, idDimension, typeDimension, captionDimension, descriptionDimension);
        analytics.query.cache.cacheDimension(idSchema, idCube, idDimension, typeDimension, 'Other caption dimension', descriptionDimension);
        expect(analytics.query.cache.isDimensionInCache(idSchema, idCube, idDimension)).toBe(true);
        expect(analytics.query.cache.getDimensionsFromCache(idSchema, idCube)[idDimension].caption).toEqual(captionDimension);
      });

      it('should cache a not already cached dimension', function () {
        analytics.query.cache.cacheDimension(idSchema, idCube, idDimension, typeDimension, captionDimension, descriptionDimension);
        analytics.query.cache.cacheDimension(idSchema, idCube, '[OtherDim]', 'Time', 'Other caption', 'Other dimension desc');

        var expected = {
          '[Zone]' : {caption : captionDimension, type : typeDimension, description : descriptionDimension},
          '[OtherDim]' : {caption : 'Other caption', type : 'Time', description : 'Other dimension desc'}
        };
        expect(analytics.query.cache.getDimensionsFromCache(idSchema, idCube)).toEqual(expected);
      });

      it('should throw an error when the type is illegal', function () {
        expect(function () {
          analytics.query.cache.cacheDimension(idSchema, idCube, idDimension, 'Geo', captionDimension, descriptionDimension);
        }).toThrow();
        expect(function () {
          analytics.query.cache.cacheDimension(idSchema, idCube, idDimension, 'Measure', captionDimension, descriptionDimension);
        }).not.toThrow();
      });

    });

    describe('getDimensionsFromCache', function () {
      it('should give an empty set when asked for dimensions with void cube', function () {
        expect(analytics.query.cache.getDimensionsFromCache(idSchema, idCube)).toEqual({});
      });
    });

    describe('isDimensionInCache', function () {
      it('can tell wether a dimension is cached or not', function () {
        analytics.query.cache.cacheDimension(idSchema, idCube, idDimension, typeDimension, captionDimension, descriptionDimension);
        expect(analytics.query.cache.isDimensionInCache(idSchema, idCube, idDimension)).toBe(true);
        expect(analytics.query.cache.isDimensionInCache(idSchema, idCube, 'a dimension id')).toBe(false);
      });
    });
  });

  describe('about hierarchies', function () {
    beforeEach(function() {
      analytics.query.cache.cacheSchema(idSchema, captionSchema);
      analytics.query.cache.cacheCube(idSchema, idCube, captionCube, descriptionCube);
      analytics.query.cache.cacheDimension(idSchema, idCube, idDimension, typeDimension, captionDimension, descriptionDimension);
    });

    describe('cacheHierarchy', function () {
      it('should cache a hierarchy that can be retrieved from there', function () {
        analytics.query.cache.cacheHierarchy(idSchema, idCube, idDimension, idHierarchy, captionHierarchy, descriptionHierarchy);
        expect(analytics.query.cache.isHierarchyInCache(idSchema, idCube, idDimension, idHierarchy)).toBe(true);

        var expected = {
          'Z1' : captionHierarchy
        };
        expect(analytics.query.cache.getHierarchiesFromCache(idSchema, idCube, idDimension)).toEqual(expected);
      });

      it('should not override an already cached hierarchy', function () {
        analytics.query.cache.cacheHierarchy(idSchema, idCube, idDimension, idHierarchy, captionHierarchy, descriptionHierarchy);
        analytics.query.cache.cacheHierarchy(idSchema, idCube, idDimension, idHierarchy, 'Other caption hierarchy', descriptionHierarchy);
        expect(analytics.query.cache.isHierarchyInCache(idSchema, idCube, idDimension, idHierarchy)).toBe(true);
        expect(analytics.query.cache.getHierarchiesFromCache(idSchema, idCube, idDimension)[idHierarchy]).toEqual(captionHierarchy);
      });

      it('should cache a not already cached hierarchy', function () {
        analytics.query.cache.cacheHierarchy(idSchema, idCube, idDimension, idHierarchy, captionHierarchy, descriptionHierarchy);
        analytics.query.cache.cacheHierarchy(idSchema, idCube, idDimension, 'OtherHiera', 'Other caption', 'Other hiera desc');

        var expected = {
          'Z1' : captionHierarchy,
          'OtherHiera' : 'Other caption'
        };
        expect(analytics.query.cache.getHierarchiesFromCache(idSchema, idCube, idDimension)).toEqual(expected);
      });
    });

    describe('getHierarchiesFromCache', function () {
      it('should give an empty set when asked for hierarchies with void dimension', function () {
        expect(analytics.query.cache.getHierarchiesFromCache(idSchema, idCube, idDimension)).toEqual({});
      });
    });

    describe('isHierarchyInCache', function () {
      it('can tell wether a hierarchy is cached or not', function () {
        analytics.query.cache.cacheHierarchy(idSchema, idCube, idDimension, idHierarchy, captionHierarchy, descriptionHierarchy);
        expect(analytics.query.cache.isHierarchyInCache(idSchema, idCube, idDimension, idHierarchy)).toBe(true);
        expect(analytics.query.cache.isHierarchyInCache(idSchema, idCube, idDimension, 'a hierarchy id')).toBe(false);
      });
    });
  });

  describe('about levels', function () {
    beforeEach(function() {
      analytics.query.cache.cacheSchema(idSchema, captionSchema);
      analytics.query.cache.cacheCube(idSchema, idCube, captionCube, descriptionCube);
      analytics.query.cache.cacheDimension(idSchema, idCube, idDimension, typeDimension, captionDimension, descriptionDimension);
      analytics.query.cache.cacheHierarchy(idSchema, idCube, idDimension, idHierarchy, captionHierarchy, descriptionHierarchy);
    });

    describe('cacheLevel', function () {
      it('should cache a level that can be retrieved from there', function () {
        analytics.query.cache.cacheLevel(idSchema, idCube, idDimension, idHierarchy, idLevel, captionLevel, descriptionLevel);
        expect(analytics.query.cache.isLevelInCache(idSchema, idCube, idDimension, idHierarchy, idLevel)).toBe(true);

        var expected = [captionLevel];
        expect(analytics.query.cache.getLevelsFromCache(idSchema, idCube, idDimension, idHierarchy)).toEqual(expected);
      });

      it('should not override an already cached level', function () {
        analytics.query.cache.cacheLevel(idSchema, idCube, idDimension, idHierarchy, idLevel, captionLevel, descriptionLevel);
        analytics.query.cache.cacheLevel(idSchema, idCube, idDimension, idHierarchy, idLevel, 'Other caption Level', descriptionLevel);
        expect(analytics.query.cache.isLevelInCache(idSchema, idCube, idDimension, idHierarchy, idLevel)).toBe(true);
        expect(analytics.query.cache.getLevelsFromCache(idSchema, idCube, idDimension, idHierarchy)[0]).toEqual(captionLevel);
        expect(analytics.query.cache.getLevelsFromCache(idSchema, idCube, idDimension, idHierarchy)[1]).not.toBeDefined();
      });

      it('should cache a not already cached level', function () {
        analytics.query.cache.cacheLevel(idSchema, idCube, idDimension, idHierarchy, idLevel, captionLevel, descriptionLevel);
        analytics.query.cache.cacheLevel(idSchema, idCube, idDimension, idHierarchy, 'OtherLevel', 'Other caption', 'Other level desc');

        var expected = [captionLevel, 'Other caption'];
        expect(analytics.query.cache.getLevelsFromCache(idSchema, idCube, idDimension, idHierarchy)).toEqual(expected);
      });
    });

    describe('getLevelsFromCache', function () {
      it('should give an empty array when asked for levels with void hierarchy', function () {
        expect(analytics.query.cache.getLevelsFromCache(idSchema, idCube, idDimension, idHierarchy)).toEqual([]);
      });
    });

    describe('isLevelInCache', function () {
      it('can tell wether a level is cached or not with the level id', function () {
        analytics.query.cache.cacheLevel(idSchema, idCube, idDimension, idHierarchy, idLevel, captionLevel, descriptionLevel);
        expect(analytics.query.cache.isLevelInCache(idSchema, idCube, idDimension, idHierarchy, idLevel)).toBe(true);
        expect(analytics.query.cache.isLevelInCache(idSchema, idCube, idDimension, idHierarchy, 'a Level id')).toBe(false);
      });

      it('can tell wether a level is cached or not with the level index', function () {
        analytics.query.cache.cacheLevel(idSchema, idCube, idDimension, idHierarchy, idLevel, captionLevel, descriptionLevel);
        expect(analytics.query.cache.isLevelInCache(idSchema, idCube, idDimension, idHierarchy, 0)).toBe(true);
        expect(analytics.query.cache.isLevelInCache(idSchema, idCube, idDimension, idHierarchy, 1)).toBe(false);
      });
    });

    describe('getLevelIDFromIndex', function () {
      it('should give the ID of the level based on its index', function () {
        analytics.query.cache.cacheLevel(idSchema, idCube, idDimension, idHierarchy, idLevel, captionLevel, descriptionLevel);
        analytics.query.cache.cacheLevel(idSchema, idCube, idDimension, idHierarchy, 'OtherLevel', 'Other caption', 'Other level desc');
        expect(analytics.query.cache.getLevelIDFromIndex(idSchema, idCube, idDimension, idHierarchy, indexLevel)).toBe(idLevel);
        expect(analytics.query.cache.getLevelIDFromIndex(idSchema, idCube, idDimension, idHierarchy, 1)).toBe('OtherLevel');
      });

      it('should throw an error when the level does not exists', function () {
        expect(function () {analytics.query.cache.getLevelIDFromIndex(idSchema, idCube, idDimension, idHierarchy, indexLevel); }).toThrow();
      });
    });
  });

});

