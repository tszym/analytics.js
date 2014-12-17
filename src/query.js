/**
## analytics.**query** namespace

This namespace helps query the OLAP cube by specifying the API provided to it in order to perform the queries.
**/
analytics.query = (function() {

  var _queryAPI = null;

  /**
  ### Private functions

  The following functions are all private functions.
  They must not be used outside of the `analytics.qyery.cache` namespace.
  **/

  /**
  ### *Object* **mapWithCaptionToSimpleMap**(*Object* map)

  Transform a deep map\<id:map\<caption\>\> with a caption attribute into a flat map\<id:caption\>
  **/
  function mapWithCaptionToSimpleMap (map) {
    var out = {};
    for (var key in map) {
      out[key] = map[key].caption;
    }

    return out;
  }

  /**
  ### *string* **getMeasureDimension**(*string* idSchema, *string* idCube)

  Get the id of the measure dimension.
  It can  throw an error is the schema or the cube is not found in
  the database.
  **/
  function getMeasureDimension (idSchema, idCube) {
    return getXXDimension(idSchema, idCube, 'Measure');
  }

  /**
  ### *string* **getXXDimension**(*string* idSchema, *string* idCube, *string* type)

  Get the id of the dimension with type XX.
  It can  throw an error is the schema, the cube or no dimension with the
  given type is not found in the database.
  **/
  function getXXDimension (idSchema, idCube, type) {
    if (!isAllowedDimensionType(type))
      throw new Query.IllegalDimensionTypeError();

    // Retrieve all dimensions to get it in cache
    Query.getDimensions(idSchema, idCube);
    // Get from cache to have all dimensions, with the Measure one
    var dimensions = Query.cache.getDimensionsFromCache(idSchema, idCube);
    for (var key in dimensions) {
      if (dimensions[key].type == type)
        return key;
    }
    throw "There's no dimension of type "+type+" in cube "+idCube+" of schema "+idSchema;
  }

  /**
  ### *boolean* **checkAPIResponse**(*Object* response)

  Check the given response from the QueryAPI component.

  Throws exception is the given response from the QueryAPI is malformed
  or contains an error code.
  **/
  function checkAPIResponse (response) {
    if (response.error === 'BAD_REQUEST')
      throw new Query.QueryAPIBadRequestError();
    if (response.error === 'NOT_SUPPORTED')
      throw new Query.QueryAPINotSupportedError();
    if (response.error === 'SERVER_ERROR')
      throw new Query.QueryAPIServerError();
    if (response.error === undefined || response.data === undefined || response === {})
      throw new Query.IllegalAPIResponseError();

    return true;
  }

  /**
  ### *boolean* **isAllowedDimensionType**(*string* type)

  Determines if the given type is a legal type of dimension
  **/
  function isAllowedDimensionType (type) {
    return ( (type === 'Time') || (type == 'Measure') || (type == 'Standard') || (type == 'Geometry') );
  }

  /**
  ### **loadToDimensions**(*string* idSchema, *string* idCube, *string* idDimension)

  Load metadata to the dimensions of the given cube.
  It throws errors if the schema or the cube are not found in the database.
  **/
  function loadToDimensions (idSchema, idCube, idDimension) {
    if (!Query.cache.isSchemaInCache(idSchema))
      Query.getSchemas();

    if (!Query.cache.isCubeInCache(idSchema, idCube))
      Query.getCubes(idSchema);

    if (!Query.cache.isDimensionInCache(idSchema, idCube, idDimension))
      Query.getDimensions(idSchema, idCube);
  }


  /**
  ### Public functions

  All the *getXX* functions could throw the following:

  * QueryAPINotProvidedError: the *queryAPI is not provided ;
  * QueryAPIBadRequestError ;
  * QueryAPINotSupportedError ;
  * IllegalAPIResponseError ;
  **/

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

    /**
    ### *Object* query.**getSchemas**()

    Get schemas list as a key-value map with one row by schema. `{id: caption}`
    **/
    getSchemas : function () {

      if (this.cache.isCacheEmpty()) {
        var replySchemas = this.queryAPI().explore([]);
        checkAPIResponse(replySchemas);

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
    ### *Object* query.**getCubes**(*string* idSchema)

    Get cubes list of a schema as a key-value map with one row by cube. `{id: caption}`.
    It can throw an error is the schema is not found in the database.
    **/
    getCubes : function(idSchema) {

      if (!this.cache.isSchemaInCache(idSchema))
        this.getSchemas();

      if (Object.keys(this.cache.getCubesFromCache(idSchema)).length === 0) {
        var replyCubes = this.queryAPI().explore(new Array(idSchema));
        checkAPIResponse(replyCubes);
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
    ### *Object* query.**getMesures**(*string* idSchema, *string* idCube)

    Get mesures of a cube and a schema.
    Measures are members of the only level of the only hierarchy of the dimension
    with type Measure.
    It can throw an error is the schema or the cube is not found in the database.

    ```js
    {
      'idMeasure1' : {
        'caption' : 'theMeasureOne',
        'description' : 'the description'
      },
      'idMeasure2' : {
        'caption' : 'theMeasureTwo',
        'description' : 'the description'
      }
    }
    ```
    **/
    getMesures : function (idSchema, idCube) {

      if (!this.cache.isSchemaInCache(idSchema))
        this.getSchemas();

      if (!this.cache.isCubeInCache(idSchema, idCube))
        this.getCubes(idSchema);

      if (Object.keys(this.cache.getDimensionsFromCache(idSchema, idCube)).length === 0)
        this.getDimensions(idSchema, idCube);

      var idDimension = getMeasureDimension(idSchema, idCube);
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
    ### *Object* query.**getCubesAndMesures**(*string* idSchema)

    Get a list of cubes and for each the measures of this cube.
    It can throw an error is the schema, the cube or the *Measure* dimension
    is not found in the database.

    ```js
    {
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
    }
    ```
    **/
    getCubesAndMeasures : function (idSchema) {
      var out = {};
      var cubes = this.getCubes(idSchema);

      for (var key in cubes) {
        out[key] = { 'caption' : cubes[key] , 'measures' : {}};
        var measures = this.getMesures(idSchema, key);
        for (var idMeasure in measures) {
          out[key].measures[idMeasure] = measures[idMeasure];
        }
      }

      return out;
    },

    /**
    ### *Object* query.**getDimensions**(*string* idSchema, *string* idCube)

    Get dimensions of a cube in a given schema or `{}` if the dimensions list
    of the given cube is empty.
    It can throw an error is the schema or the cube is not found in
    the database.

    ```js
    'idDimension' : {
      caption : 'theCaption',
      type : 'theType',
      description : 'the desc'
    }
    ```
    **/
    getDimensions : function getDimensions(idSchema, idCube) {

      if (!this.cache.isSchemaInCache(idSchema))
        this.getSchemas();

      if (!this.cache.isCubeInCache(idSchema, idCube))
        this.getCubes(idSchema);

      var dimensions;
      var dimensionsReturn = {};

      if (Object.keys(this.cache.getDimensionsFromCache(idSchema, idCube)).length === 0) {
        var replyDimensions = this.queryAPI().explore(new Array(idSchema, idCube));
        checkAPIResponse(replyDimensions);

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
    ### *string* query.**getGeoDimension**(*string* idSchema, *string* idCube)

    Get the id of the geographic dimension.
    It can throw an error is the schema or the cube is not found in
    the database.
    **/
    getGeoDimension : function (idSchema, idCube) {
      return getXXDimension(idSchema, idCube, 'Geometry');
    },

    /**
    ### *string* query.**getTimeDimension**(*string* idSchema, *string* idCube)

    Get the id of the time dimension.
    It can throw an error is the schema or the cube is not found in
    the database.
    **/
    getTimeDimension : function (idSchema, idCube) {
      return getXXDimension(idSchema, idCube, 'Time');
    },

    /**
    ### *string* query.**getGeoProperty**(*string* idSchema, *string* idCube, *string* idDimension, *string* idHierarchy)

    Get the id of the geographical propery of a dimension or null if none found.
    **/
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
    ### *Object* query.**getHierarchies**(*string* idSchema, *string* idCube, *string* idDimension)

    Get the list of hierarchies of a dimension.
    It can throw an error is the schema, the cube or the dimension is not found
    in the database.

    ```js
    {
      'idHierarchy1' : 'captionHierarchy1',
      'idHierarchy2' : 'captionHierarchy2'
    }
    ```
    **/
    getHierarchies : function (idSchema, idCube, idDimension) {

      loadToDimensions(idSchema, idCube, idDimension);

      if (Object.keys(this.cache.getHierarchiesFromCache(idSchema, idCube, idDimension)).length === 0) {
        var replyHierarchies = this.queryAPI().explore(new Array(idSchema, idCube, idDimension));
        checkAPIResponse(replyHierarchies);
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
    ### *Array\<string\>* query.**getLevels**(*string* idSchema, *string* idCube, *string* idDimension, *string* idHierarchy)

    Get the list of levels of a hierarchy. This hides the real level ID.
    For *analytics.query* users, a level is identified by its position in the list.
    It can throw an error is the schema, the cube, the dimension or the hierarchy
    is not found in the database.

    ```js
    [
      'Countries', //caption of the level at 0 position
      'Regions'    //caption of the level at 1 position
    ]
    ```
    **/
    getLevels : function (idSchema, idCube, idDimension, idHierarchy) {

      loadToDimensions(idSchema, idCube, idDimension);

      if (!this.cache.isHierarchyInCache(idSchema, idCube, idDimension, idHierarchy))
        this.getHierarchies(idSchema, idCube, idDimension);

      if (this.cache.getLevelsFromCache(idSchema, idCube, idDimension, idHierarchy).length === 0) {
        var reply = this.queryAPI().explore(new Array(idSchema, idCube, idDimension, idHierarchy), true);
        checkAPIResponse(reply);

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
    ### *Object* query.**getMembers**(*string* idSchema, *string* idCube,
     *string* idDimension, *string* idHierarchy, *integer* indexLevel
     [, *boolean* withProperties=false [, *string* parentMember
     [, *integer* descendingLevel=1]]])

    Get the list of members.

    If `parentMember` parameter is not set, returns the map of all members of the
    specified level with or without the properties values depending on the
    properties parameter.

    If `parentMember` parameter is set (`parentMember` being a member of the
    level `idLevel`), returns the map of all members descending from this member
    from the level `idlevel + descendingLevel`.

    Note that this hides the real level ID. For *analytics.query* users, a level
    is identified by its position in the list.

    This can throw an error is the schema, the cube, the dimension, the hierarchy
    or the level is not found in the database.

    ```js
    {
     'FR' : // member key
       {
         caption : 'France',
         description : 'France description',
         Geom : '<geoJSONofFrance>', // property geometry value (string|object)
       },
     'BE' :
       {
         caption : 'Belgium',
         description : 'Belgium description',
         Geom : '<geoJSONofBelgium>'
       },
       ...
    }
    ```
    **/
    getMembers : function (idSchema, idCube, idDimension, idHierarchy, indexLevel, withProperties, parentMember, descendingLevel) {
      loadToDimensions(idSchema, idCube, idDimension);

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

      checkAPIResponse(reply);

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
    ### *Object* query.**getMembersInfos**(*string* idSchema, *string* idCube,
     *string* idDimension, *string* idHierarchy, *integer* indexLevel,
     *Array* membersIds [, *boolean* withProperties=false])

    Get the list of member objects from their IDs.

    Note that this hides the real level ID. For *analytics.query* users, a level
    is identified by its position in the list.

    This can throw an error is the schema, the cube, the dimension, the hierarchy
    or the level is not found in the database.

    ```js
    {
     'FR' : // member key
       {
         caption : 'France',
         description : 'France description',
         Geom : {<geoJSONofFrance>} // property geometry value
       },
     'BE' :
       {
         caption : 'Belgium',
         description : 'Belgium description',
         Geom : {<geoJSONofBelgium>}
       },
       ...
    }
    ```
    **/
    getMembersInfos : function (idSchema, idCube, idDimension, idHierarchy, indexLevel, membersIds, withProperties) {

      if(typeof membersIds != 'object')
        throw new Error("You provided an illegal parameter. Array expected");

      loadToDimensions(idSchema, idCube, idDimension);

      if (!this.cache.isHierarchyInCache(idSchema, idCube, idDimension, idHierarchy))
        this.getHierarchies(idSchema, idCube, idDimension);

      if (!this.cache.isLevelInCache(idSchema, idCube, idDimension, idHierarchy, indexLevel)) {
        this.getLevels(idSchema, idCube, idDimension, idHierarchy);
        if (!this.cache.isLevelInCache(idSchema, idCube, idDimension, idHierarchy, indexLevel))
          throw new Query.LevelNotInDatabaseError();
      }

      // Default values for parameters
      withProperties = typeof withProperties !== 'undefined' ? withProperties : false;

      var idLevel = this.cache.getLevelIDFromIndex(idSchema, idCube, idDimension, idHierarchy, indexLevel);

      var reply = this.queryAPI().explore(new Array(idSchema, idCube, idDimension, idHierarchy, idLevel, membersIds), withProperties, 0);
      checkAPIResponse(reply);

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
    ### *Object* query.**getProperties**(*string* idSchema, *string* idCube,
     *string* idDimension, *string* idHierarchy, *integer* indexLevel)

    Get the list of properties of a level.

    This can throw an error is the schema, the cube, the dimension, the hierarchy
    or the level is not found in the database.

    ```js
    {
      'Geom' : {
        caption : 'Geom',
        description : 'Geom desc',
        type : 'Geometry'
      },
      'surf' : {
        caption : 'Surface',
        description : 'Geom desc',
        type : 'Standard'
      }
    }
    ```
    **/
    getProperties : function (idSchema, idCube, idDimension, idHierarchy, indexLevel) {

      loadToDimensions(idSchema, idCube, idDimension);

      if (!this.cache.isHierarchyInCache(idSchema, idCube, idDimension, idHierarchy))
        this.getHierarchies(idSchema, idCube, idDimension);

      if (!this.cache.isLevelInCache(idSchema, idCube, idDimension, idHierarchy, indexLevel))
        this.getLevels(idSchema, idCube, idDimension, idHierarchy);

      //As we fetch properties with their level, we just have to load it from the cache
      return this.cache.getPropertiesFromCache(idSchema, idCube, idDimension, idHierarchy, indexLevel);
    },

    /**
    ### query.**drill**(*string* idCube)

    Specifies the cube to work on.
    **/
    drill : function(idCube) {
      this.queryAPI().drill(idCube);
    },

    /**
    ### query.**push**(*string* idMeasure)

    Add the given measure to the set of measures to work on.
    **/
    push : function(idMeasure) {
      this.queryAPI().push(idMeasure);
    },

    /**
    ### query.**pull**(*string* idMeasure)

    Remove the given measure to the set of measures to work on.
    **/
    pull : function(idMeasure) {
      this.queryAPI().pull(idMeasure);
    },

    /**
    ### query.**slice**(*string* idHierarchy [, *Array\<string\>* members [, *boolean* range=false]])

    Add the given hierarchy to the list of agregates and filter on the given members.

    The user can specify the IDs of the members to aggregate; all members of the hierarchy if undefined.
    The user can also indicate if *analytics.query* should filter on all the members between
    bound values given in the `members` array with `range=true`.
    **/
    slice : function(idHierarchy, members, range) {
      this.queryAPI().slice(idHierarchy, members, range);
    },

    /**
    ### query.**dice**(*Array\<string\>* hierarchies)

    Add dice behavior to a list of hierarchies, that is to say those hierarchies
    won't be completely aggregated.
    **/
    dice : function (hierarchies) {
      this.queryAPI().dice(hierarchies);
    },

    /**
    ### query.**project**(*string* idHierarchy)

    Remove the given hierarchy of the selected agregates.
    **/
    project : function(idHierarchy) {
      this.queryAPI().project(idHierarchy);
    },

    /**
    ### query.**filter**(*string* idHierarchy [, *Array\<string\>* members [, *boolean* range=false]])

    Filter
    **/
    filter : function(idHierarchy, members, range) {
      this.queryAPI().filter(idHierarchy, members, range);
    },

    /**
    ### *Object* query.**execute**()

    Execute the request.

    This is a synchronous operation. This returns the structured reply.
    **/
    execute : function() {
      var response = this.queryAPI().execute();

      checkAPIResponse(response);
      return response.data;
    },

    /**
    ### query.**clear**()

    Flush all the request.
    **/
    clear : function() {
      this.queryAPI().clear();
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

  // importTest "query-test-accessors.js"

  return Query;

})();
