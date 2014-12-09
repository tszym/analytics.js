/**
## analytics.**query.cache** namespace

This namespace contains functions related to the caching of metadata.

It is used in `analytics.query` only.
It has the following functions:

* ### *Object* analytics.**query.cache**()
**/
analytics.query.cache = (function () {

  var _metadata = {};
  var _cache = {};

  /**
  ### query.cache.**clearCache**()

  Clear the metadata cache. This method should be considered protected and must not
  be called outside of the `analytics.query` namespace.

  ```
  > analytics.query.cache.isCacheEmpty();
  false
  > analytics.query.cache.clearCache();
  > analytics.query.cache.isCacheEmpty();
  true
  ```
  **/
  _cache.clearCache = function() {
    if(!this.isCacheEmpty())
      delete _metadata.schemas;
  };

  /**
  ### Search functions

  The following functions define if an element is stored in the cache.
  They must be considered as protected, and should not be called
  outside of the `analytics.query` namespace.

  * *boolean* query.cache.**isCacheEmpty**()
  * *boolean* query.cache.**isSchemaInCache**(*string* id)
  * *boolean* query.cache.**isCubeInCache**(*string* idSchema, *string* idCube)
  * *boolean* query.cache.**isDimensionInCache**(*string* idSchema, *string* idCube, *string* idDimension)
  * *boolean* query.cache.**isHierarchyInCache**(*string* idSchema, *string* idCube, *string* idDimension, *string* idHierarchy)
  * *boolean* query.cache.**isLevelInCache**(*string* idSchema, *string* idCube, *string* idDimension, *string* idHierarchy, (*integer* indexLevel | *string* idLevel))
  **/

  _cache.isCacheEmpty = function() {
    return ( (Object.keys(_metadata).length === 0) && (_metadata.schemas === undefined) );
  };

  _cache.isSchemaInCache = function(id) {
    if (this.isCacheEmpty())
      return false;
    for (var key in _metadata.schemas) {
      if(key == id)
        return true;
    }
    return false;
  };

  _cache.isCubeInCache = function (idSchema, idCube) {
    if (isCubesListEmpty(idSchema))
      return false;

    for (var key in _metadata.schemas[idSchema].cubes) {
      if(key == idCube)
        return true;
    }
    return false;
  };

  _cache.isDimensionInCache = function (idSchema, idCube, idDimension) {
    if (isDimensionsListEmpty(idSchema, idCube))
      return false;

    for (var key in _metadata.schemas[idSchema].cubes[idCube].dimensions) {
      if(key == idDimension)
        return true;
    }
    return false;
  };

  _cache.isHierarchyInCache = function (idSchema, idCube, idDimension, idHierarchy) {
    if (isHierarchiesListEmpty(idSchema, idCube, idDimension))
      return false;

    for (var key in _metadata.schemas[idSchema].cubes[idCube].dimensions[idDimension].hierarchies) {
      if(key == idHierarchy)
        return true;
    }
    return false;
  };

  _cache.isLevelInCache = function (idSchema, idCube, idDimension, idHierarchy, indexLevel) {
    var levels = _metadata.schemas[idSchema].cubes[idCube].dimensions[idDimension].hierarchies[idHierarchy].levels;

    if (isLevelsListEmpty(idSchema, idCube, idDimension, idHierarchy)) {
      return false;
    }

    if (typeof indexLevel === 'string') {
      for (var level in levels) {
        if (levels[level].id === indexLevel) {
          return true;
        }
      }
    } else {
      return levels[indexLevel] !== undefined;
    }
    return false;
  };

  /**
  ### Retrieve functions

  The following functions retrieve elements stored in the cache.
  They must be considered as protected, and should not be called
  outside of the `analytics.query` namespace.
  **/

  /**
  #### *Object* query.cache.**getSchemasFromCache**()

  Retrieve the list of schemas from the cache as a flat map of strings idSchema : caption
  or {} if the cache is empty.

  ```js
  {
    'idSchemaA' : 'captionSchemaA',
    'idSchemaB' : 'captionSchemaB'
  }
  ```
  **/
  _cache.getSchemasFromCache = function () {
    if (this.isCacheEmpty())
      return {};
    else
      return mapWithCaptionToSimpleMap(_metadata.schemas);
  };

  /**
  #### *Object* query.cache.**getCubesFromCache**(*string* idSchema)

  Retrieve the list of cubes from the cache as a flat map of strings idCube : caption
  or {} if the cache is empty.
  It propagates an error when no schema is found in the cache with the given id.

  ```js
  {
    'idCubeA' : 'captionCubeA',
    'idCubeB' : 'captionCubeB'
  }
  ```
  **/
  _cache.getCubesFromCache = function (idSchema) {
    if (isCubesListEmpty(idSchema))
      return {};
    else
      return mapWithCaptionToSimpleMap(_metadata.schemas[idSchema].cubes);
  };

  /**
  #### *Object* query.cache.**getDimensionsFromCache**(*string* idSchema, *string* idCube)

  Retrieve the list of dimensions from the cache as a map of strings
  or {} if the cache is empty.
  It propagates an error when no schema or cube is found in the cache with the given id.

  ```js
  {
    'idDimension' : {
      caption : 'theCaption',
      description : 'the description',
      type : 'theType'
    },
    'idDimension2' : {
      caption : 'otherCaption',
      description : 'the other description',
      type : 'otherType'
    }
  }
  ```
  **/
  _cache.getDimensionsFromCache = function (idSchema, idCube) {
    if (isDimensionsListEmpty(idSchema, idCube))
      return {};
    else
      return _metadata.schemas[idSchema].cubes[idCube].dimensions;
  };

  /**
  #### *Object* query.cache.**getHierarchiesFromCache**(*string* idSchema, *string* idCube, *string* idDimension)

  Retrieve the list of hierarchies from the cache as a map of strings
  or {} if the cache is empty.
  It propagates an error when no schema or cube or dimension is found
  in the cache with the given id.

  ```js
  {
    'idHierarchyA' : 'captionHierarchyA',
    'idHierarchyB' : 'captionHierarchyB'
  }
  ```
  **/
  _cache.getHierarchiesFromCache = function(idSchema, idCube, idDimension) {
    if (isHierarchiesListEmpty(idSchema, idCube, idDimension))
      return {};
    else {
      return mapWithCaptionToSimpleMap(_metadata.schemas[idSchema].cubes[idCube].dimensions[idDimension].hierarchies);
    }
  };

  /**
  #### *Array<string>* query.cache.**getLevelsFromCache**(*string* idSchema, *string* idCube, *string* idDimension, *string* idHierarchy)

  Retrieve the list of levels from the cache as an array of strings
  or [] if the cache is empty.
  It propagates an error when no schema, cube, dimension or hierarchy is found
  in the cache with the given id.

  ```js
  [
    'captionLevelA',
    'captionLevelB'
  ]
  ```
  **/
  _cache.getLevelsFromCache = function(idSchema, idCube, idDimension, idHierarchy) {
    if (isLevelsListEmpty(idSchema, idCube, idDimension, idHierarchy))
      return [];
    else {
      var out = [];
      var levels = _metadata.schemas[idSchema].cubes[idCube].dimensions[idDimension].hierarchies[idHierarchy].levels;
      for (var index=0; index < levels.length; index++) {
        out[index] = levels[index].caption;
      }
      return out;
    }
  };

  /**
  ### Storage functions

  The following functions insert elements in the cache.
  They must be considered as protected, and should not be called
  outside of the `analytics.query` namespace.

  * query.cache.**cacheSchema**(*string* id, *string* caption)
  * query.cache.**cacheCube**(*string* idSchema, *string* idCube, *string* caption, *string* description)
  * query.cache.**cacheDimension**(*string* idSchema, *string* idCube, *string* idDimension, *string* type, *string* caption, *string* description)
  * query.cache.**cacheHierarchy**(*string* idSchema, *string* idCube, *string* idDimension, *string* idHierarchy, *string* caption, *string* description)
  * query.cache.**cacheLevel**(*string* idSchema, *string* idCube, *string* idDimension, *string* idHierarchy, *string* idLevel, *string* caption, *string* description)
  * *boolean* query.cache.**getLevelIDFromIndex**(*string* idSchema, *string* idCube, *string* idDimension, *string* idHierarchy, *integer* indexLevel)
  **/

  _cache.cacheSchema = function(id, caption) {
    if( !this.isSchemaInCache(id) ) {
      if( this.isCacheEmpty() )
        _metadata.schemas = {};

      _metadata.schemas[id] = { 'caption' : caption };
    }
  };

  _cache.cacheCube = function(idSchema, idCube, caption, description) {
    if (!this.isCubeInCache(idSchema, idCube)) {
      if (_metadata.schemas[idSchema].cubes === undefined)
        _metadata.schemas[idSchema].cubes = {};

        _metadata.schemas[idSchema].cubes[idCube] = {'caption' : caption, 'description' : description};
    }
  };

  _cache.cacheDimension = function(idSchema, idCube, idDimension, type, caption, description) {
    if (!isAllowedDimensionType(type))
      throw 'Cannot cache the dimension '+idDimension+': '+type+' is not a valid dimension type!';

    if (!this.isDimensionInCache(idSchema, idCube, idDimension)) {
      if (_metadata.schemas[idSchema].cubes[idCube].dimensions === undefined)
        _metadata.schemas[idSchema].cubes[idCube].dimensions = {};

      var record = {'type' : type, 'caption' : caption, 'description' : description};
      _metadata.schemas[idSchema].cubes[idCube].dimensions[idDimension] = record;
    }
  };

  _cache.cacheHierarchy = function(idSchema, idCube, idDimension, idHierarchy, caption, description) {
    if (!this.isHierarchyInCache(idSchema, idCube, idDimension, idHierarchy)) {
      var dimension = _metadata.schemas[idSchema].cubes[idCube].dimensions[idDimension];
      if (dimension.hierarchies === undefined)
        dimension.hierarchies = {};

      dimension.hierarchies[idHierarchy] = {'caption' : caption, 'description' : description};
    }
  };

  _cache.cacheLevel = function(idSchema, idCube, idDimension, idHierarchy, idLevel, caption, description) {
    if (!_cache.isLevelInCache(idSchema, idCube, idDimension, idHierarchy, idLevel)) {
      var hierarchy = _metadata.schemas[idSchema].cubes[idCube].dimensions[idDimension].hierarchies[idHierarchy];
      if (hierarchy.levels === undefined) {
        hierarchy.levels = [];
      }

      hierarchy.levels.push({'id' : idLevel, 'caption' : caption, 'description': description});
    }
  };

  /**
  ### *boolean* query.cache.**getLevelIDFromIndex**(*string* idSchema, *string* idCube, *string* idDimension, *string* idHierarchy, *integer* indexLevel)

  Get the level's ID from its index
  It throws an error when no schema, cube, dimension, hierarchy or level
  are found in the cache with the given identifiers.
  **/
  _cache.getLevelIDFromIndex = function (idSchema, idCube, idDimension, idHierarchy, indexLevel) {
    if (!_cache.isLevelInCache(idSchema, idCube, idDimension, idHierarchy, indexLevel))
      throw 'The level you tried to use does not exists in the database!';

    return _metadata.schemas[idSchema].cubes[idCube].dimensions[idDimension].hierarchies[idHierarchy].levels[indexLevel].id;
  };


  /**
  ### Private functions

  The following functions are all private functions.
  They must not be used outside of the `analytics.qyery.cache` namespace.
  **/

  /**
  ### *Object* **mapWithCaptionToSimpleMap**(*Object* map)

  Transform a deep map `<id:map<caption>>` with a `caption` attribute into
  a flat map `<id:caption>`. This function is private.
  **/
  function mapWithCaptionToSimpleMap (map) {
    var out = {};
    for (var key in map) {
      out[key] = map[key].caption;
    }

    return out;
  }

  /**
  ### *boolean* **isAllowedDimensionType**(*string* type)

  Defines if the given type is a legal type of dimension
  **/
  function isAllowedDimensionType (type) {
    return (type === 'Time') || (type == 'Measure') || (type == 'Standard') || (type == 'Geometry');
  }

  /**
  ### *boolean* **isCubesListEmpty**(*string* idSchema)

  Defines if the given cached schema contains cubes.
  It throws an error when no schema is found in the cache with the given id.
  **/
  function isCubesListEmpty (idSchema) {
    if (!_cache.isSchemaInCache(idSchema))
      throw 'The schema you tried to use does not exists in the database!';

    var schema = _metadata.schemas[idSchema];
    return (schema.cubes === undefined) || (Object.keys(schema.cubes).length === 0);
  }

  /**
  ### *boolean* **isDimensionListEmpty**(*string* idSchema, *string* idCube)

  Defines if the given cached cube contains dimensions.
  It throws an error when no schema or cube are found in the cache with
  the given id.
  **/
  function isDimensionsListEmpty (idSchema, idCube) {
    if (!_cache.isCubeInCache(idSchema, idCube)) {
      throw 'The cube you tried to use does not exists in the database!';
    }

    var cube = _metadata.schemas[idSchema].cubes[idCube];
    return (cube.dimensions === undefined) || (Object.keys(cube.dimensions).length === 0);
  }

  /**
  ### *boolean* **isHierarchiesListEmpty**(*string* idSchema, *string* idCube, *string* idDimension)

  Defines if the given cached dimension contains hierarchies.
  It throws an error when no schema or cube or dimension are found in the cache
  with the given id.
  **/
  function isHierarchiesListEmpty (idSchema, idCube, idDimension) {
    if (!_cache.isDimensionInCache(idSchema, idCube, idDimension)) {
      throw 'The dimension you tried to use does not exists in the database!';
    }

    var dimension = _metadata.schemas[idSchema].cubes[idCube].dimensions[idDimension];
    return (dimension.hierarchies === undefined) || (Object.keys(dimension.hierarchies).length === 0);
  }

  /**
  ### *boolean* **isLevelsListEmpty**(*string* idSchema, *string* idCube, *string* idDimension, *string* idHierarchy)

  Defines if the given cached hierarchy contains levels.
  It throws an error when no schema, cube, dimension or hierarchy are found in
  the cache with the given id.
  **/
  function isLevelsListEmpty (idSchema, idCube, idDimension, idHierarchy) {
    if (!_cache.isHierarchyInCache(idSchema, idCube, idDimension, idHierarchy)) {
      throw 'The hierarchy you tried to use does not exists in the database!';
    }

    var hierarchy = _metadata.schemas[idSchema].cubes[idCube].dimensions[idDimension].hierarchies[idHierarchy];
    return (hierarchy.levels === undefined) || (hierarchy.levels.length === 0);
  }

  // importTest "query.cache-test-accessors.js"

  return _cache;
})();
