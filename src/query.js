/**
## analytics.**query** namespace

This namespace helps query the OLAP cube by specifying the API provided to it in order to perform the queries.

### getSchemas

Get schemas list

### getCubes

Get cubes of a schema

### getMesures

Get mesures of a cube and a schema

Measures are members of the only level of the only hierarchy of the dimension with type `Measure`

```js
"idMeasure" : {
    "caption" : "theMeasure",
    "unit" : "theUnit"
}
```

### getCubesAndMeasures

Get a list of cubes and for each the measures of this cube

### getDimensions

Get dimensions of a cube in a given schema

This wil return a map of id : dimensionMap as the following example

```js
"idDimension" : {
    "caption" : "theCaption",
    "type" : "theType"
}
```

### getGeoDimension

Get the id of the geographic dimension

### getTimeDimension

Get the id of the time dimension

### getXXDimension

Get the id of the XXXX dimension

### getGeoProperty

Return the geographical property of a dimension

### getHierarchies

Get the list of hierarchies of a dimension

### getLevels

Get the list of levels of a hierachy. Note that Query hide the real level ID. For Query users, a level is identified by its position in the list.

```js
[
  "Countries", //caption of the level at 0 position
  "Regions"    //caption of the level at 1 position
]
```

### getMembers

Get the list of members

If parentMember parameter is not set, returns the map of all members of the specified level with or without the properties values depending on the properties parameter.

If parentMember parameter is set (parentMember being a member of the level idLevel), returns the map of all members descending from this member from the level idlevel + descendingLevel.

Note that Query hide the real level ID. For Query users, a level is identified by its position in the list.

```js
{
 "FR" : // member key
   {
     "caption" : "France",
     "geometry" : {<geoJSONofFrance>}, // property area value
     "area" : 123.5 // property area value
   },
 "BE" :
   {
     "caption" : "Belgium",
     "geometry" : {<geoJSONofBelgium>},
     "area" : 254.1
   },
   ...
}
```

### getMembersInfos

Get the list of member objects from their IDs

Note that Query hide the real level ID. For Query users, a level is identified by its position in the list.

```js
{
 "FR" : // member key
   {
     "caption" : "France",
     "geometry" : {<geoJSONofFrance>}, // property area value
     "area" : 123.5 // property area value
   },
 "BE" :
   {
     "caption" : "Belgium",
     "geometry" : {<geoJSONofBelgium>},
     "area" : 254.1
   },
   ...
}
```

### getProperties

Get the list of properties of a level

```js
{
  "geom" : {
    "caption" : "Geom",
    "type" : "Geometry"
  },
  "surf" : {
    "caption" : "Surface",
    "type" : "Standard"
  }
}
```

### drill

Select a cube

### push

Add a measure to the list of measures you want to get values of.

### pull

Remove a measure from the list.

### slice

Select a list of members from an hierarchy.

### project

Remove the slice set on an hierarchy.

### filter

Apply a filter rule on the members of an hierarchy.

### rank

Rank the results.

### execute

Execute the query.

### clear

Clear the query.

### checkAPIResponse

Checks the given response from the QueryAPI component

Throws exception is the given response from the QueryAPI is malformed or contains an error code

### isAllowedDimensionType

Determines if the given type is a legal type of dimension

### clearCache

Clear the metadatas cache and the schemas poperty

```js
>>>this.isCacheEmpty();
false
>>>this.clearCache();
>>>this.isCacheEmpty();
true
```

### getLevelIDFromIndex

Get the level’s ID from its index

### mapWithCaptionToSimpleMap

Transform a deep map\<id:map\<caption\>\> with a caption attribute into a flat map\<id:caption\>

**/
analytics.query = (function() {

  var _queryAPI = null;

  /**
   * Transform a deep map<id:map<caption>> with a caption attribute into a flat map<id:caption>
   *
   * @private
   * @param {Object.<string, Object.<string, string>>} map - the deep map
   * @return {Object.<string, string>} the flat map
   */
  function mapWithCaptionToSimpleMap (map) {
    var out = {};
    for (var key in map) {
      out[key] = map[key].caption;
    }

    return out;
  }

  /**
  ### *boolean* **getLevelIDFromIndex**(*string* idSchema, *string* idCube, *string* idDimension, *string* idHierarchy, *integer* indexLevel)

  Get the level's ID from its index
  It throws an error when no schema, cube, dimension, hierarchy or level
  are found in the database with the given identifiers.
  **/
  function getLevelIDFromIndex (idSchema, idCube, idDimension, idHierarchy, indexLevel) {
    var levels = Query.getLevels(idSchema, idCube, idDimension, idHierarchy);
    if (typeof levels[indexLevel] == 'undefined')
      throw 'The level you tried to use does not exists in the database!';

    return levels[indexLevel];
  }


  var Query = {

    queryAPI : function (queryAPI) {
      if (arguments.length) {
        _queryAPI = queryAPI;
        return this;
      }
      else if (_queryAPI === null)
        throw new this.QueryAPINotProvidedError();
      else
        return _queryAPI;
    },

    //---------------------
    //---- METADATA -------
    //---------------------

    /**
     * Get schemas list
     *
     * @public
     * @return {Object.<string, string>} a key-value map with one row by schema. {id: caption}
     *
     * @throws {Query.QueryAPINotProvidedError} The queryAPI is not provided to Query
     * @throws {Query.QueryAPIBadRequestError}
     * @throws {Query.QueryAPINotSupportedError}
     * @throws {Query.IllegalAPIResponseError}
     */
    getSchemas : function () {

      if (this.cache.isCacheEmpty()) {
        var replySchemas = this.queryAPI().explore([]);
        this.checkAPIResponse(replySchemas);

        var flatSchemasMap = mapWithCaptionToSimpleMap(replySchemas.data);
        for (var key in flatSchemasMap) {
          this.cache.cacheSchema(key, flatSchemasMap[key]);
        }

        return flatSchemasMap;
      } else {
        return this.cache.getSchemasFromCache();
      }
    },

    /**
     * Get cubes of a schema
     *
     * @public
     * @param {string} idSchema
     * @return {Object.<string, string>} a key-value map with one row by schema. {id: caption}
     *
     * @throws {Query.QueryAPINotProvidedError}
     * @throws {Query.QueryAPIBadRequestError}
     * @throws {Query.QueryAPINotSupportedError}
     * @throws {Query.IllegalAPIResponseError}
     * @throws {string} if no schema is found in the database
     */
    getCubes : function(idSchema) {

      if (!this.cache.isSchemaInCache(idSchema))
        this.getSchemas();

      if (Object.keys(this.cache.getCubesFromCache(idSchema)).length === 0) {
        var replyCubes = this.queryAPI().explore(new Array(idSchema));
        this.checkAPIResponse(replyCubes);
        var flatCubesMap = mapWithCaptionToSimpleMap(replyCubes.data);

        for (var key in flatCubesMap) {
          this.cache.cacheCube(idSchema, key, flatCubesMap[key]);
        }

        return flatCubesMap;
      } else {
        return this.cache.getCubesFromCache(idSchema);
      }
    },

    /**
     * Get mesures of a cube and a schema
     *
     * Measures are members of the only level of the only hierarchy of the dimension
     * with type Measure
     * @summary Get mesures of a cube and a schema
     *
     * @example
     * {
     *   'idMeasure1' : {
     *       'caption' : 'theMeasureOne',
     *       'description' : 'the description'
     *   },
     *   'idMeasure2' : {
     *       'caption' : 'theMeasureTwo',
     *       'description' : 'the description'
     *   }
     * }
     *
     * @public
     * @param {string} idSchema
     * @param {string} idCube
     * @return {Object.<string, Object>} the map
     *
     * @throws {Query.QueryAPINotProvidedError}
     * @throws {Query.QueryAPIBadRequestError}
     * @throws {Query.QueryAPINotSupportedError}
     * @throws {string} if no schema, cube, dimension, hierarchy or level is found in the database
     */
    getMesures : function (idSchema, idCube) {

      if (!this.cache.isSchemaInCache(idSchema))
        this.getSchemas();

      if (!this.cache.isCubeInCache(idSchema, idCube))
        this.getCubes(idSchema);

      if (Object.keys(this.cache.getDimensionsFromCache(idSchema, idCube)).length === 0)
        this.getDimensions(idSchema, idCube);

      var idDimension = this.getMeasureDimension(idSchema, idCube);
      var idHierarchy;

      var hierarchies = this.getHierarchies(idSchema, idCube, idDimension);
      for(var key in hierarchies) {
          idHierarchy = key;
      }

      // We need to load the levels
      this.getLevels(idSchema, idCube, idDimension, idHierarchy);
      if (this.cache.getLevelsFromCache(idSchema, idCube, idDimension, idHierarchy).length === 0)
        throw "No level in Measure's hierarchy";

      return this.getMembers(idSchema, idCube, idDimension, idHierarchy, 0);
    },

    /**
     * Get a list of cubes and for each the measures of this cube
     *
     * @todo test this
     *
     * @param {string} idSchema
     * @return {Object<Object>}
     *
     * @throws {Query.QueryAPINotProvidedError}
     * @throws {Query.QueryAPIBadRequestError}
     * @throws {Query.QueryAPINotSupportedError}
     * @throws {Query.IllegalAPIResponseError}
     * @throws {Query.DimensionNotInDatabaseError}
     * @throws {Query.CubeNotInDatabaseError} The given cube doesn't exists
     * @throws {Query.SchemaNotInDatabaseError} The given schema doesn't exists
     */
    getCubesAndMeasures : function (idSchema) {
      var out = {};
      var cubes = this.getCubes(idSchema);

      for (var key in cubes) {
        out[key] = { "caption" : cubes[key] , "measures" : {}};
        var measures = this.getMesures(idSchema, key);
        for (var idMeasure in measures) {
          out[key].measures[idMeasure] = measures[idMeasure];
        }
      }

      return out;
    },

    /**
     * Get dimensions of a cube in a given schema
     *
     * This wil return a map of id : dimensionMap as the following example
     * @summary Get dimensions of a cube in a given schema
     *
     * @example
     * 'idDimension' : {
     *     'caption' : 'theCaption',
     *     'type' : 'theType'
     * }
     *
     * @public
     * @param {string} idSchema
     * @param {string} idCube
     * @return {Object.<string, Object>} the map or {} if the dimensions list of the given cube is empty
     * @throws {Query.QueryAPINotProvidedError}
     * @throws {Query.IllegalDimensionTypeError}
     * @throws {string} if no schema or cube is found in the database
     */
    getDimensions : function getDimensions(idSchema, idCube) {

      if (!this.cache.isSchemaInCache(idSchema))
        this.getSchemas();

      if (!this.cache.isCubeInCache(idSchema, idCube))
        this.getCubes(idSchema);

      var dimensions;
      var dimensionsReturn = {};

      if (Object.keys(this.cache.getDimensionsFromCache(idSchema, idCube)).length === 0) {
        var replyDimensions = this.queryAPI().explore(new Array(idSchema, idCube));
        this.checkAPIResponse(replyDimensions);

        for (var key in replyDimensions.data) {
          var dim = replyDimensions.data[key];
          this.cache.cacheDimension(idSchema, idCube, key, dim.type, dim.caption, dim.description);
        }

        dimensions = replyDimensions.data;
      } else {
        dimensions = this.cache.getDimensionsFromCache(idSchema, idCube);
      }

      for (var idDim in dimensions) {
        if (dimensions[idDim].type != 'Measure') {
          dimensionsReturn[idDim] = dimensions[idDim];
        }
      }
      return dimensionsReturn;
    },

    /**
     * Get the id of the geographic dimension
     *
     * @public
     * @param {string} idSchema
     * @param {string} idCube
     * @return {string} id of the geographic dimension
     *
     * @throws {Query.QueryAPINotProvidedError}
     * @throws {Query.CubeNotInDatabaseError} The given cube doesn't exists
     * @throws {Query.SchemaNotInDatabaseError} The given schema doesn't exists
     * @throws {Query.IllegalDimensionTypeError}
     */
    getGeoDimension : function (idSchema, idCube) {

      return this.getXXDimension(idSchema, idCube, "Geometry");

    },

    /**
     * Get the id of the time dimension
     *
     * @public
     * @param {string} idSchema
     * @param {string} idCube
     * @return {string} id of the time dimension
     *
     * @throws {Query.QueryAPINotProvidedError}
     * @throws {Query.CubeNotInDatabaseError} The given cube doesn't exists
     * @throws {Query.SchemaNotInDatabaseError} The given schema doesn't exists
     * @throws {Query.IllegalDimensionTypeError}
     */
    getTimeDimension : function (idSchema, idCube) {

      return this.getXXDimension(idSchema, idCube, "Time");

    },

    /**
     * Get the id of the measure dimension
     *
     * @private
     * @param {string} idSchema
     * @param {string} idCube
     * @return {string} id of the measure dimension
     *
     * @throws {Query.QueryAPINotProvidedError}
     * @throws {Query.CubeNotInDatabaseError} The given cube doesn't exists
     * @throws {Query.SchemaNotInDatabaseError} The given schema doesn't exists
     * @throws {Query.IllegalDimensionTypeError}
     */
    getMeasureDimension : function (idSchema, idCube) {

      return this.getXXDimension(idSchema, idCube, "Measure");

    },

    /**
     * Get the id of the XXXX dimension
     *
     * @private
     * @param {string} idSchema
     * @param {string} idCube
     * @param {string} type that we want to match
     * @return {string} id of the XXXX dimension
     *
     * @throws {Query.QueryAPINotProvidedError}
     * @throws {Query.DimensionNotInDatabaseError}
     * @throws {Query.CubeNotInDatabaseError} The given cube doesn't exists
     * @throws {Query.SchemaNotInDatabaseError} The given schema doesn't exists
     * @throws {Query.IllegalDimensionTypeError} The given dimension type is not allowed
     */
    getXXDimension : function (idSchema, idCube, type) {
      if (!this.isAllowedDimensionType(type))
        throw new Query.IllegalDimensionTypeError();

      // Retrieve all dimensions to get it in cache
      this.getDimensions(idSchema, idCube);
      // Get from cache to have all dimensions, with the Measure one
      var dimensions = this.cache.getDimensionsFromCache(idSchema, idCube);
      for (var key in dimensions) {
        if (dimensions[key].type == type)
          return key;
      }
      throw "There's no dimension of type "+type+" in cube "+idCube+" of schema "+idSchema;
    },

    /**
     * Get the id of the geographical propery of a dimension
     *
     * @public
     * @param {string} idSchema
     * @param {string} idCube
     * @param {string} idDimension
     * @param {string} idHierarchy
     * @return {string} id of the geographical property or {null} if none found
     *
     * @throws {Query.QueryAPINotProvidedError}
     */
    getGeoProperty : function (idSchema, idCube, idDimension, idHierarchy) {

      var levels = this.getLevels(idSchema, idCube, idDimension, idHierarchy);

      for (var i=0; i< levels.length; i++) {
        var properties = this.getProperties(idSchema, idCube, idDimension, idHierarchy, i);

        for (var property in properties) {
          if (properties[property].type == 'Geometry')
              return property;
        }
      }
      return null;
    },

    /**
     *
     * Get the list of hierarchies of a dimension
     *
     * @param {string} idSchema
     * @param {string} idCube
     * @param {string} idDimension
     *
     * @return {Object<string, string>} map of dimensions associating id with caption.
     *
     * @throws {Query.QueryAPINotProvidedError}
     * @throws {Query.QueryAPIBadRequestError}
     * @throws {Query.QueryAPINotSupportedError}
     * @throws {Query.IllegalAPIResponseError}
     * @throws {string} if no schema, cube or dimension is found in the database
     *
     */
    getHierarchies : function (idSchema, idCube, idDimension) {

      if (!this.cache.isSchemaInCache(idSchema))
        this.getSchemas();

      if (!this.cache.isCubeInCache(idSchema, idCube))
        this.getCubes(idSchema);

      if (!this.cache.isDimensionInCache(idSchema, idCube, idDimension))
        this.getDimensions(idSchema, idCube);

      if (Object.keys(this.cache.getHierarchiesFromCache(idSchema, idCube, idDimension)).length === 0) {
        var replyHierarchies = this.queryAPI().explore(new Array(idSchema, idCube, idDimension));
        this.checkAPIResponse(replyHierarchies);
        var flatHierarchiesMap = mapWithCaptionToSimpleMap(replyHierarchies.data);

        for (var key in flatHierarchiesMap) {
          this.cache.cacheHierarchy(idSchema, idCube, idDimension, key, flatHierarchiesMap[key]);
        }

        return flatHierarchiesMap;
      } else {
        return this.cache.getHierarchiesFromCache(idSchema, idCube, idDimension);
      }
    },

    /**
     *
     * Get the list of levels of a hierarchy. Note that Query hide the real level ID.
     * For Query users, a level is identified by its position in the list.
     * @summary Get the list of levels of a hierarchy
     *
     * @example
     * [
     *   'Countries', //caption of the level at 0 position
     *   'Regions'    //caption of the level at 1 position
     * ]
     *
     * @param {string} idSchema
     * @param {string} idCube
     * @param {string} idDimension
     * @param {string} idHierarchy
     *
     * @return {Array<string>} list of level captions
     *
     * @throws {Query.QueryAPINotProvidedError}
     * @throws {Query.QueryAPIBadRequestError}
     * @throws {Query.QueryAPINotSupportedError}
     * @throws {Query.IllegalAPIResponseError}
     * @throws {string} if no schema, cube, dimension or hierarchy is found in the database
     */
    getLevels : function (idSchema, idCube, idDimension, idHierarchy) {

      if (!this.cache.isSchemaInCache(idSchema))
        this.getSchemas();

      if (!this.cache.isCubeInCache(idSchema, idCube))
        this.getCubes(idSchema);

      if (!this.cache.isDimensionInCache(idSchema, idCube, idDimension))
        this.getDimensions(idSchema, idCube);

      if (!this.cache.isHierarchyInCache(idSchema, idCube, idDimension, idHierarchy))
        this.getHierarchies(idSchema, idCube, idDimension);

      if (this.cache.getLevelsFromCache(idSchema, idCube, idDimension, idHierarchy).length === 0) {
        var reply = this.queryAPI().explore(new Array(idSchema, idCube, idDimension, idHierarchy), true);
        this.checkAPIResponse(reply);

        var out = [];
        for (var index=0; index < reply.data.length; index++) {
          this.cache.cacheLevel(idSchema, idCube, idDimension, idHierarchy, reply.data[index].id, reply.data[index].caption, reply.data[index].description);
          out.push(reply.data[index].caption);

          // Cache properties into the current level
          for(var key in reply.data[index]['list-properties']) {
            this.cache.cacheProperty(idSchema, idCube, idDimension, idHierarchy, index, key, reply.data[index]['list-properties'][key].caption, reply.data[index]['list-properties'][key].description, reply.data[index]['list-properties'][key].type);
          }
        }

        return out;
      } else {
        return this.cache.getLevelsFromCache(idSchema, idCube, idDimension, idHierarchy);
      }
    },

    /**
     * Get the list of members
     *
     * If parentMember parameter is not set, returns the map of all members of the specified level with or
     * without the properties values depending on the properties parameter.
     *
     * If parentMember parameter is set (parentMember being a member of the level idLevel), returns the map
     * of all members descending from this member from the level idlevel + descendingLevel.
     *
     * Note that Query hide the real level ID. For Query users, a level is identified by its position in the list.
     * @summary Get the list of members
     *
     * @todo cache
     *
     * @example
     * {
     *  "FR" : // member key
     *    {
     *      "caption" : "France",
     *      "geometry" : {<geoJSONofFrance>}, // property area value
     *      "area" : 123.5 // property area value
     *    },
     *  "BE" :
     *    {
     *      "caption" : "Belgium",
     *      "geometry" : {<geoJSONofBelgium>},
     *      "area" : 254.1
     *    },
     *    ...
     * }
     *
     * @param {string} idSchema
     * @param {string} idCube
     * @param {string} idDimension
     * @param {string} idHierarchy
     * @param {integer} indexLevel
     * @param {boolean} [withProperties=false] Return the properties values of the members
     * @param {string} [parentMember=] ID of the parent from which we want the childrens
     * @param {integer} [descendingLevel=1] Number of descending levels if parentMember is specified
     * @return {Object} list of level captions
     *
     * @throws {Query.QueryAPINotProvidedError}
     * @throws {Query.QueryAPIBadRequestError}
     * @throws {Query.QueryAPINotSupportedError}
     * @throws {Query.IllegalAPIResponseError}
     * @throws {string} if no schema, cube, dimension, hierarchy or level is found in the database
     */
    getMembers : function (idSchema, idCube, idDimension, idHierarchy, indexLevel, withProperties, parentMember, descendingLevel) {

      if (!this.cache.isSchemaInCache(idSchema))
        this.getSchemas();

      if (!this.cache.isCubeInCache(idSchema, idCube))
        this.getCubes(idSchema);

      if (!this.cache.isDimensionInCache(idSchema, idCube, idDimension))
        this.getDimensions(idSchema, idCube);

      if (!this.cache.isHierarchyInCache(idSchema, idCube, idDimension, idHierarchy))
        this.getHierarchies(idSchema, idCube, idDimension);

      if (!this.cache.isLevelInCache(idSchema, idCube, idDimension, idHierarchy, indexLevel)) {
        this.getLevels(idSchema, idCube, idDimension, idHierarchy);
        if (!this.cache.isLevelInCache(idSchema, idCube, idDimension, idHierarchy, indexLevel))
          throw 'The level you tried to use does not exists in the database!';
      }

      // Default values for parameters
      withProperties = typeof withProperties !== 'undefined' ? withProperties : false;
      if (typeof parentMember !== 'undefined')
        descendingLevel = typeof descendingLevel !== 'undefined' ? descendingLevel : 1;

      var idLevel = this.cache.getLevelIDFromIndex(idSchema, idCube, idDimension, idHierarchy, indexLevel);
      var reply;

      if (typeof parentMember === 'undefined') {
        reply = this.queryAPI().explore(new Array(idSchema, idCube, idDimension, idHierarchy, idLevel), withProperties);
      } else {
        reply = this.queryAPI().explore(new Array(idSchema, idCube, idDimension, idHierarchy, idLevel, parentMember), withProperties, descendingLevel);
      }

      this.checkAPIResponse(reply);

      if (withProperties === true && reply.data != {}) {

        //Get the GeoProperty of this dimension
        var geoProperty = this.getGeoProperty(idSchema, idCube, idDimension, idHierarchy);

        // Every member got his geoProperty converted from WKT to GeoJson
        if (geoProperty !== undefined && geoProperty !== null) {
          var wkt = new Wkt.Wkt();
          for (var memberKey in reply.data) {
            // But he needs a geo attribute
            if (reply.data[memberKey][geoProperty] !== undefined) {
              wkt.read(reply.data[memberKey][geoProperty]);
              reply.data[memberKey][geoProperty] = wkt.toJson();
            }
          }
        }
      }

      return reply.data;
    },

    /**
     * Get the list of member objects from their IDs
     *
     * Note that Query hide the real level ID. For Query users, a level is identified by its position in the list.
     * @summary Get the list of member objects from their IDs
     *
     * @todo cache
     *
     * @example
     * {
     *  "FR" : // member key
     *    {
     *      "caption" : "France",
     *      "geometry" : {<geoJSONofFrance>}, // property area value
     *      "area" : 123.5 // property area value
     *    },
     *  "BE" :
     *    {
     *      "caption" : "Belgium",
     *      "geometry" : {<geoJSONofBelgium>},
     *      "area" : 254.1
     *    },
     *    ...
     * }
     *
     * @param {string} idSchema
     * @param {string} idCube
     * @param {string} idDimension
     * @param {string} idHierarchy
     * @param {integer} indexLevel
     * @param {Array.<string>} membersIds the IDs of the members
     * @param {boolean} [withProperties=false] Return the properties values of the members
     * @return {Object} list of level captions
     *
     * @throws {Query.QueryAPINotProvidedError}
     * @throws {Query.LevelNotInDatabaseError}
     * @throws {Query.HierarchyNotInDatabaseError}
     * @throws {Query.DimensionNotInDatabaseError}
     * @throws {Query.CubeNotInDatabaseError}
     * @throws {Query.SchemaNotInDatabaseError}
     * @throws {Query.QueryAPIBadRequestError}
     * @throws {Query.QueryAPINotSupportedError}
     * @throws {Query.IllegalAPIResponseError}
     */
    getMembersInfos : function (idSchema, idCube, idDimension, idHierarchy, indexLevel, membersIds, withProperties) {

      if(typeof membersIds != "object")
        throw new Error("You provided an illegal parameter. Array expected");

      if (!this.isLevelInCache(idSchema, idCube, idDimension, idHierarchy, indexLevel)) {
        this.getLevels(idSchema, idCube, idDimension, idHierarchy);
        if (!this.isLevelInCache(idSchema, idCube, idDimension, idHierarchy, indexLevel))
          throw new Query.LevelNotInDatabaseError();
      }

      // Default values for parameters
      withProperties = typeof withProperties !== "undefined" ? withProperties : false;

      var idLevel = this.getLevelIDFromIndex(idSchema, idCube, idDimension, idHierarchy, indexLevel);

      var reply = this.queryAPI().explore(new Array(idSchema, idCube, idDimension, idHierarchy, idLevel, membersIds), withProperties, 0);
      this.checkAPIResponse(reply);

      if (withProperties === true && reply.data != {}) {

        //Get the GeoProperty of this dimension
        var geoProperty = this.getGeoProperty(idSchema, idCube, idDimension, idHierarchy);

        // Every member got his geoProperty converted from WKT to GeoJson
        if (geoProperty !== undefined && geoProperty !== null) {
          var wkt = new Wkt.Wkt();
          for (var memberKey in reply.data) {
            // But he needs a geo attribute
            if (reply.data[memberKey][geoProperty] !== undefined) {
              wkt.read(reply.data[memberKey][geoProperty]);
              reply.data[memberKey][geoProperty] = wkt.toJson();
            }
          }
        }
      }

      return reply.data;
    },

    /**
     * Get the list of properties of a level
     *
     * @example
     * {
     *   "geom" : {
     *     "caption" : "Geom",
     *     "type" : "Geometry"
     *   },
     *   "surf" : {
     *     "caption" : "Surface",
     *     "type" : "Standard"
     *   }
     * }
     *
     * @param {string} idSchema
     * @param {string} idCube
     * @param {string} idDimension
     * @param {string} idHierarchy
     * @param {integer} indexLevel the index of the level in the array of hierarchy
     *
     * @return {Object<string, Object<string, string>>} list of properties
     *
     * @throws {Query.QueryAPINotProvidedError}
     * @throws {Query.LevelNotInDatabaseError}
     * @throws {Query.HierarchyNotInDatabaseError}
     * @throws {Query.DimensionNotInDatabaseError}
     * @throws {Query.CubeNotInDatabaseError}
     * @throws {Query.SchemaNotInDatabaseError}
     * @throws {Query.QueryAPIBadRequestError}
     * @throws {Query.QueryAPINotSupportedError}
     * @throws {Query.IllegalAPIResponseError}
     */
    getProperties : function (idSchema, idCube, idDimension, idHierarchy, indexLevel) {

      if (!this.cache.isSchemaInCache(idSchema))
        this.getSchemas();

      if (!this.cache.isCubeInCache(idSchema, idCube))
        this.getCubes(idSchema);

      if (!this.cache.isDimensionInCache(idSchema, idCube, idDimension))
        this.getDimensions(idSchema, idCube);

      if (!this.cache.isHierarchyInCache(idSchema, idCube, idDimension, idHierarchy))
        this.getHierarchies(idSchema, idCube, idDimension);

      if (!this.cache.isLevelInCache(idSchema, idCube, idDimension, idHierarchy, indexLevel))
        this.getLevels(idSchema, idCube, idDimension, idHierarchy);

      //As we fetch properties with their level, we just have to load it from the cache
      return this.cache.getPropertiesFromCache(idSchema, idCube, idDimension, idHierarchy, indexLevel);
    },

    //------------
    //--- DATA ---
    //------------

    /**
     * Specify the wube you want to work on
     *
     * @public
     * @param {string} idCube
     */
    drill : function(idCube) {
      this.queryAPI().drill(idCube);
    },

    /**
     * Add the given measure to the set of measures you want to work on
     *
     * @public
     * @param {string} idMeasure
     */
    push : function(idMeasure) {
      this.queryAPI().push(idMeasure);
    },

    /**
     * Remove the given measure to the set of measures you want to work on
     *
     * @public
     * @param {string} idMeasure
     */
    pull : function(idMeasure) {
      this.queryAPI().pull(idMeasure);
    },

    /**
     * Add the given hierarchy to the list of agregates and filter on the given members
     *
     * @public
     * @param {string} idHierarchy
     * @param {Array<string>} [members] the IDs of the members you want to aggregate. All members of the hierarchy if undefined
     * @param {boolean} [range=false] if you want all the members between only bound values you give in member's array
     */
    slice : function(idHierarchy, members, range) {
      this.queryAPI().slice(idHierarchy, members, range);
    },

    /**
     * Add dice behavior to a list of hierarchies, that is to say those hierarchies
     * won't be completely aggregated.
     *
     * @public
     * @param {Array<String>} hierarchies
     */
    dice : function (hierarchies) {
      this.queryAPI().dice(hierarchies);
    },

    /**
     * Remove the given hierarchy of the selected agregates
     *
     * @public
     * @param {string} idHierarchy
     */
    project : function(idHierarchy) {
      this.queryAPI().project(idHierarchy);
    },

    /**
     * Filter
     *
     * @public
     * @param {string} idHierarchy
     * @param {Array<string>} [members] the IDs of the members. All members of the hierarchy if undefined
     * @param {boolean} [range=false] if you want all the members between only bound values you give in member's array
     */
    filter : function(idHierarchy, members, range) {
      this.queryAPI().filter(idHierarchy, members, range);
    },

    /**
     * Executes the request. This is a synchronous operation
     *
     * @return {Object} the structured reply
     */
    execute : function() {

      var response = this.queryAPI().execute();

      this.checkAPIResponse(response);
      return response.data;
    },

    /**
     * Flush all the request
     */
    clear : function() {
      this.queryAPI().clear();
    },

    /**
     * Checks the given response from the QueryAPI component
     *
     * Throws exception is the given response from the QueryAPI is malformed
     * or contains an error code
     * @summary Checks the given response from the QueryAPI component
     *
     * @private
     * @param {Object} response the response from QueryAPI
     * @return {boolean} true for a regular response format
     *
     * @throws {Query.QueryAPIBadRequestError}
     * @throws {Query.QueryAPINotSupportedError}
     * @throws {Query.IllegalAPIResponseError}
     */
    checkAPIResponse : function(response) {
      if (response.error === 'BAD_REQUEST')
        throw new Query.QueryAPIBadRequestError();
      if (response.error === 'NOT_SUPPORTED')
        throw new Query.QueryAPINotSupportedError();
      if (response.error === 'SERVER_ERROR')
        throw new Query.QueryAPIServerError();
      if (response.error === undefined || response.data === undefined || response === {})
        throw new Query.IllegalAPIResponseError();

      return (true);
    },

    /**
     * Determines if the given type is a legal type of dimension
     *
     * @private
     * @param {string} type
     * @return {boolean} true for a legal dimension type
     */
    isAllowedDimensionType : function(type) {
      return ( (type === "Time") || (type == "Measure") || (type == "Standard") || (type == "Geometry") );
    },

    //---------------
    //EXCEPTIONS
    //---------------

    /**
     * @class
     */
    QueryAPINotProvidedError : function (message) {
      this.name = "QueryAPINotProvidedError";
      this.message = message || "Query have no queryAPI provided!";
    },

    /**
     * @class
     */
    QueryAPIServerError : function (message) {
      this.name = "QueryAPIServerError";
      this.message = message || "Query API indicates a Server error!";
    },

    /**
     * @class
     */
    QueryAPIBadRequestError : function (message) {
      this.name = "QueryAPIBadRequestError";
      this.message = message || "QueryAPI indicates a Bad Request error!";
    },

    /**
     * @class
     */
    QueryAPINotSupportedError : function (message) {
      this.name = "QueryAPINotSupportedError";
      this.message = message || "QueryAPI indicates a call to a not supported function!";
    },

    /**
     * @class
     */
    IllegalAPIResponseError : function (message) {
      this.name = "IllegalAPIResponseError";
      this.message = message || "QueryAPI has returned a response with wrong format!";
    },

    /**
     * @class
     */
    IllegalDimensionTypeError : function (message) {
      this.name = "IllegalDimensionTypeError";
      this.message = message || "You tried to use an illegal dimension type!";
    }
  };

  // Exceptions properties initialization
  Query.QueryAPIServerError.prototype = new Error();
  Query.QueryAPIServerError.prototype.constructor = Query.QueryAPIServerError;

  Query.QueryAPINotProvidedError.prototype = new Error();
  Query.QueryAPINotProvidedError.prototype.constructor = Query.QueryAPINotProvidedError;

  Query.QueryAPIBadRequestError.prototype = new Error();
  Query.QueryAPIBadRequestError.prototype.constructor = Query.QueryAPIBadRequestError;

  Query.QueryAPINotSupportedError.prototype = new Error();
  Query.QueryAPINotSupportedError.prototype.constructor = Query.QueryAPINotSupportedError;

  Query.IllegalAPIResponseError.prototype = new Error();
  Query.IllegalAPIResponseError.prototype.constructor = Query.IllegalAPIResponseError;

  Query.IllegalDimensionTypeError.prototype = new Error();
  Query.IllegalDimensionTypeError.prototype.constructor = Query.IllegalDimensionTypeError;

  return Query;

})();
