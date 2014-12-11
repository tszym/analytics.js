describe('analytics.query', function() {

  beforeEach(function() {
    analytics.query.cache.clearCache();
    analytics.query.queryAPI(generateAPI([c]));
  });

  describe('at initialization', function () {
    it('should have an API object', function () {
      expect(analytics.query.queryAPI()).toBeDefined();
      expect(analytics.query.queryAPI()).not.toBeNull();
    });
  });

  describe('getXXDimension', function () {
    it('should return the expected id for geometry', function () {
      expect(analytics.query.getXXDimension('Olap', 'C', 'Geometry')).toEqual('[Zone]');
    });

    it('should return the expected id for time', function () {
      expect(analytics.query.getXXDimension('Olap', 'C', 'Time')).toEqual('[Time]');
    });

    it('should return the expected id for Standard', function () {
      expect(analytics.query.getXXDimension('Olap', 'C', 'Standard')).toEqual('[Product]');
    });

    it('should return the expected id for Measure', function () {
      expect(analytics.query.getXXDimension('Olap', 'C', 'Measure')).toEqual('_measures');
    });
  });

  describe('public functions on multiple calls', function () {
    describe('getSchemas', function () {
      var expected = {
        'Olap' : 'Olap Schema'
      };

      it('should return the expected map', function () {
        expect(analytics.query.getSchemas()).toEqual(expected);
        expect(analytics.query.getSchemas()).toEqual(expected);
      });
    });

    describe('getCubes', function () {
      var expected = {
        'C' : 'Le cube'
      };

      it('should return the expected map with the cube', function () {
        expect(analytics.query.getCubes('Olap')).toEqual(expected);
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
        expect(analytics.query.getDimensions('Olap', 'C')).toEqual(expected);
      });
    });

    describe('getGeoDimension', function () {
      var expected = '[Zone]';

      it('should return the expected id', function () {
        expect(analytics.query.getGeoDimension('Olap', 'C')).toEqual(expected);
        expect(analytics.query.getGeoDimension('Olap', 'C')).toEqual(expected);
      });
    });

    describe('getTimeDimension', function () {
      var expected = '[Time]';

      it('should return the expected id', function () {
        expect(analytics.query.getTimeDimension('Olap', 'C')).toEqual(expected);
        expect(analytics.query.getTimeDimension('Olap', 'C')).toEqual(expected);
      });
    });

    describe('getMeasureDimension', function () {
      var expected = '_measures';

      it('should return the expected id of dimension', function () {
        expect(analytics.query.getMeasureDimension('Olap', 'C')).toEqual(expected);
        expect(analytics.query.getMeasureDimension('Olap', 'C')).toEqual(expected);
      });
    });

    describe('getHierarchies', function () {
      var expected = {
        'Z1' : 'Nuts'
      };

      it('should return the expected map', function () {
        expect(analytics.query.getHierarchies('Olap', 'C', '[Zone]')).toEqual(expected);
        expect(analytics.query.getHierarchies('Olap', 'C', '[Zone]')).toEqual(expected);
      });
    });

    describe('getLevels', function () {
      var expected = ['Nuts0', 'Nuts1'];

      it('should return the expected array', function () {
        expect(analytics.query.getLevels('Olap', 'C', '[Zone]', 'Z1')).toEqual(expected);
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
        expect(analytics.query.getProperties('Olap', 'C', '[Zone]', 'Z1', 0)).toEqual(expected);
      });
    });

    describe('getGeoProperty', function () {
      var expected = 'Geom';

      it('should return the expected id', function () {
        expect(analytics.query.getGeoProperty('Olap', 'C', '[Zone]', 'Z1')).toEqual(expected);
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

