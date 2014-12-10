/**
## analytics.charts.**chart** class

This class is an abstract class that is the base class for all charts in analytics.

### *Object* analytics.charts.**chart**(*string* selector, *data.dimension[]* dimensions)

**/
analytics.charts.chart = (function () {

  function charts_chart_nostatic (selector, dimensions) {

    // returned object
    var _chart = {};

    /**
    ### Chart object

    #### public methods
    * *string* charts.chart.**type**()
    * *mixed* charts.chart.**dimensions**([*data.dimension[]* dimensions])
    * *boolean* charts.chart.**useDimension**(*data.dimension[]* dimensions)
    * *mixed* charts.chart.**extraMeasures**(*data.measure[]* extraMeasures)
    * *string* charts.chart.**selector**()
    * *string* charts.chart.**selectorName**()
    * *integer* charts.chart.**width**()
    * *integer* charts.chart.**height**()
    * *object* charts.chart.**element**() : returns the dc.js chart associated with the chart
    * *mixed* charts.chart.**disabled**([*data.boolean* disabled]) : disable the chart (hide the chart)
    * *mixed* charts.chart.**elasticAxes**([*data.boolean* elasticAxes]) : set elasticity of axes
    * *object* charts.chart.**options**() : return the options of the chart
    * *this* charts.chart.**setOption**(*string* key, *mixed* value)
    * *object* charts.chart.**player**() : return the current player object of the chart
    * *this* charts.chart.**build**() : build and update the chart
    * *this* charts.chart.**render**() : render the dc.js chart
    * *this* charts.chart.**redraw**() : update the chart and redraw the dc.js chart
    * *this* charts.chart.**resize**()
    * *this* charts.chart.**updateColors**()
    * charts.chart.**delete**()
    **/

    // data
    var _dimensions    = dimensions ? dimensions : [];
    var _extraMeasures = [];
    var _player;

    // set/get data
    _chart.type = function() {
      return 'chart';
    };

    _chart.dimensions = function(dimensions) {
      if (!arguments.length) return _dimensions;
      _dimensions = dimensions;
      return _chart;
    };

    _chart.useDimension = function(dimension) {
      for (var i in _dimensions) {
        if (_dimensions[i].equals(dimension))
          return true;
      }
      return false;
    };

    _chart.extraMeasures = function(extraMeasures) {
      if (!arguments.length) return _extraMeasures;
      _extraMeasures = extraMeasures;
      return _chart;
    };


    // rendering
    var _selector   = selector;
    _chart._element = null; // dc.js chart object

    // set/get content
    _chart.selector = function() {
      return _selector;
    };

    _chart.selectorName = function() {
      return _selector.replace('#', '');
    };

    _chart.width = function() {
      return $(_selector+' .chart-container').width();
    };

    _chart.height = function() {
      var height = $(_selector).height() - $(_selector+' .chart-header').outerHeight() - $(_selector+' .chart-container').outerHeight() + $(_selector+' .chart-container').height();
      optionsHeight(height);
      return height;
    };

    function optionsHeight (heightPx) {
      if (!arguments.length)
        return getPxFromRefVal(_chart.options().height, _chart.options().heightReference);

      _chart.setOption("height", getRefValFromPx(heightPx, _chart.options().heightReference));
    }

    function getPxFromRefVal(val, ref) {
      return val * getRefCoef(ref);
    }

    function getRefValFromPx(val, ref) {
      return val / getRefCoef(ref);
    }

    function getRefCoef(ref) {
      switch (ref) {
        case "columnWidthRatio":
        return $(_selector).parent().width();

        case "columnHeightRatio":
        return $(_selector).parent().height();

        default:
        return 1;
      }
    }

    _chart.element = function() {
      return _chart._element;
    };

    _chart.params = function() {
      return _chart._params;
    };

    _chart.options = function() {
      return _chart._options;
    };

    _chart.setOption = function(key, value) {
      if (typeof _chart._options[key] != 'undefined' && _chart._options[key] !== null && value !== null)
        _chart._options[key] = value;
      return _chart;
    };

    _chart.player = function () {
      return _player;
    };

    var _disabled = false;

    _chart.disabled = function (disabled) {
      if (!arguments.length) return _disabled;

      // disable
      if (disabled && !_disabled) {
        if (_chart.element())
          dc.deregisterChart(_chart.element());
        $(_selector).addClass('chart-hidden');
      }

      // enable
      else if (!disabled && _disabled) {
        if (_chart.element())
          dc.registerChart(_chart.element());
        $(_selector).removeClass('chart-hidden');
      }

      _disabled = disabled;
      return _chart;
    };

    var _elasticAxes = true;

    _chart.elasticAxes = function(elasticAxes) {
      if (!arguments.length) return _elasticAxes;
      _elasticAxes = elasticAxes;
      return _chart;
    };

    // display main functions
    _chart.build = function () {
      if (!_chart.element()) {
                initContainer();    // jshint ignore:line
                initResize();       // jshint ignore:line
        _chart._initContainerSpecific();
                initHeader();       // jshint ignore:line
        if (!_disabled) {
          _chart._createDcElement();
                  initChartCommon();  // jshint ignore:line
          _chart._initChartSpecific();
        }
      }

      updateHeader();
      _chart._updateHeaderSpecific();
      if (!_disabled) {
        updateChartCommon();
        _chart._updateChartSpecific();
      }
      return _chart;
    };

    _chart.render = function() {
      _chart.build();
      if (!_disabled)
        _chart.element().render();
      return _chart;
    };

    _chart.redraw = function() {
      if (!_chart.element())
        return _chart.render();
      _chart.build();
      if (!_disabled)
        _chart.element().redraw();
      return _chart;
    };

    // display sub-functions
    function initContainer () {
      $(_selector).addClass("chart-"+_chart.type());
      $(_selector).html('<div class="chart-header"></div><div class="chart-text">'+analytics.csts.txts.hiddenChart+'</div><div class="chart-container"></div>');
    }

    function initResize() {
      $(_selector).resizable({ handles: 's' })
        .on('resize', function (e) { e.stopPropagation(); })
        .on('resizestop', function (e) { e.stopPropagation(); _chart.resize(); });
    }

    _chart.resize = function () {
      _chart.element()
        .width(_chart.width())
        .height(_chart.height());
      _chart._resizeSpecific();
      $(_selector).css('height', 'auto');
      return _chart.render();
    };

    _chart.updateColors = function () {
      if (typeof _chart.element().colors == 'function' && !_disabled) {
        _chart.element()
          .colors(_dimensions[0].scale());
      }
      return _chart;
    };

    _chart.delete = function () {
      try {
        dc.deregisterChart(_chart.element());
      } catch (err) {}
      $(_selector).empty();
    };

    /**
    #### abstract methods

    These methods are left for the children classes to implement.

    * charts.chart.**_resizeSpecific**() : called when the chart is resized
    * charts.chart.**_createDcElement**(): called to create the dc.js chart
    * charts.chart.**_initContainerSpecific**() : used to initialize elements aside from the dc.js chart
    * charts.chart.**_initChartSpecific**(): used to initialize the chart
    * charts.chart.**_updateHeaderSpecific**() : called when the chart is created or updated
    * charts.chart.**_updateChartSpecific**() : called when the chart is created or updated
    **/
    _chart._resizeSpecific        = function () {};
    _chart._createDcElement       = function () {};
    _chart._initContainerSpecific = function () {};
    _chart._initChartSpecific     = function () {};
    _chart._updateHeaderSpecific  = function () {};
    _chart._updateChartSpecific   = function () {};

    /**
    #### Internal functions

    * charts.chart.**initHeader**()
    * charts.chart.**initChartCommon**()
    * charts.chart.**updateHeader**()
    * charts.chart.**updateChartCommon**()
    * charts.chart.**displayChartMetaContainer**() : fill the header initialized with `initHeader`
    * charts.chart.**displayTip**() : add a tip icon in the chart's header
    * charts.chart.**displayPlay**(): add the play button in the chart's header
    * charts.chart.**displayCanDrillRoll**(): add an icon indicating if we can drill-down or roll-up on the chart
    * charts.chart.**displayLevels**(): add the display of the current level number as well as the total number of levels in the chart's header
    * charts.chart.**displayTitle**()
    * charts.chart.**displayParams**(): add the button to configure the chart in the chart's header
    * *[integer, integer]* charts.chart.**_niceDomain**(*crossfilter.group* crossfilterGroup, *data.measure* measure) : compute [min, max] values, from a crossfilter group and a measure, to generate the color scales
    **/
    function initHeader() {
      displayChartMetaContainer();
      displayTip();
      displayPlay();
      displayParams();
    }

    function initChartCommon() {
      _chart.element()
        .width(_chart.width())
        .height(optionsHeight())

        .on('filtered', function (chart, filter) { analytics.display._updateFilter(_chart.dimensions()[0], filter, chart.hasFilter(filter)); });

      // zoom callback
      if (typeof _chart.element().callbackZoomIn == 'function') {
        _chart.element()
          .callbackZoomIn(function (el, dcChartID, keys) { analytics.display.drillDown(_chart.dimensions()[0], el, dcChartID, keys); })
          .callbackZoomOut(function (dcChartID, nbLevels) { analytics.display.rollUp(_chart.dimensions()[0], dcChartID, nbLevels); });
      }

      // color chart
      if (typeof _chart.element().colors == 'function') {
        _chart.element()
          .colorCalculator(function (d) { return d.value ? _chart.element().colors()(d.value) : '#ccc'; });
      }
    }


    function updateHeader() {
      displayCanDrillRoll();
      displayLevels();
      displayTitle();
    }

    function updateChartCommon() {

      var dimension = _dimensions[0];
      var metadata  = dimension.getLastSlice();
      var format    = d3.format('.3s');

      _chart.element()
        .dimension(dimension.crossfilterDimension())
        .group    (dimension.crossfilterGroup(_extraMeasures))

        .label(function (d) {
          var key = d.key ? d.key : d.data.key;
          return metadata[key] ? metadata[key].caption : '';
        })
        .title(function (d) {
          var key = d.key ? d.key : d.data.key;
          var valText = analytics.state.measure().caption() + ': ' + (d.value       ? format(d.value)       : 0);
          var keyText = dimension.caption()                 + ': ' + (metadata[key] ? metadata[key].caption : '');
          return keyText + '\n' + valText;
        });

      _chart.updateColors();

      // sort
      switch(_chart.options().sort) {
        case 'valueasc':
        _chart.element().ordering(function (d) { return  d.value !== undefined ? d.value : d.data.value; });
        break;

        case 'valuedesc':
        _chart.element().ordering(function (d) { return d.value !== undefined ? -d.value : -d.data.value; });
        break;

        default: // key
        _chart.element().ordering(function (d) { return  d.key !== undefined ? d.key : d.data.key;   });
        break;
      }

      // labels
      if (_chart.options().labels !== null) {
        _chart.element().renderLabel(_chart.options().labels);
      }
    }

    function displayChartMetaContainer () {
      $(_selector + ' .chart-header').html(
        '<div class="chart-meta">'+
        '<span class="chart-infos"></span><span class="chart-levels-icons"></span><span class="chart-levels"></span><span class="btn-params"></span><span class="chart-play"></span>'+
        '</div>'+
        '<div class="chart-title"></div>');
    }

    function displayTip () {
      if (_chart.params().displayTip) {
        var tip = analytics.display.getTip('charts', _chart.type());
        if (tip) {
          var el = $('<span data-toggle="tooltip" class="chart-infos" data-placement="bottom" title="'+tip+'">'+
            '<i class="fa fa-nomargin fa-info-circle"></i></span>');

          $(_selector+' .chart-meta .chart-infos').replaceWith(el);
          el.tooltip({'container': 'body', 'html': true});
        }
      }
    }

    function displayPlay () {
      if (_chart.params().displayPlay) {
        var el = $('<span class="btn btn-xs btn-default"><i class="fa fa-nomargin fa-play"></i></span>');
        $(_selector+' .chart-meta .chart-play').replaceWith(el);
        el.click(function () {
          // change the button
          el.children().toggleClass('fa-play');
          el.children().toggleClass('fa-pause');

          if (_player === undefined) {
            analytics.display.freezeScalesAcross(_dimensions[0]);
            _player = analytics.charts.player(_chart);
            _player.callback(function () {
              el.children().toggleClass('fa-play');
              el.children().toggleClass('fa-pause');

              analytics.display.unfreezeScales();
              _player = undefined;
            });
            _chart.element().filterAll();
            _player.start();
          } else if (_player.running()) {
             _player.pause();
          } else {
             _player.start();
          }
        });
      }
    }

    function displayCanDrillRoll () {
      if (_chart.params().displayCanDrillRoll) {
        var el = $(_selector + ' .chart-meta .chart-levels-icons');
        if (el.html().length === 0) {
          el.html('<span class="fa fa-nomargin fa-caret-up"></span><span class="fa fa-nomargin fa-caret-down"></span>');
        }

        var caretDown = el.find('.fa-caret-down');
        var caretUp = el.find('.fa-caret-up');

        if (_dimensions[0].isRollPossible())
          caretUp.css('color', 'inherit');
        else
          caretUp.css('color', '#999999');

        if (_dimensions[0].isDrillPossible())
          caretDown.css('color', 'inherit');
        else
          caretDown.css('color', '#999999');
      }
    }

    function displayLevels () {
      if (_chart.params().displayLevels) {
        $(_selector + ' .chart-meta .chart-levels').html((_dimensions[0].currentLevel()+1)+'/'+(_dimensions[0].maxLevel()+1));
      }
    }

    function displayTitle () {
      if (_chart.params().displayTitle) {

        var total = _dimensions[0].getTotal();
        var totalSpan = $('<span class="chart-total" data-toggle="tooltip" data-placement="bottom" title="'+d3.format('.6s  s')(total)+'">'+
          d3.format('.3s')(total) + ' </span>').tooltip({'container': 'body'});

        var measureTitle;
        var measureDescription = analytics.state.measure().description();
        var measureCaption = analytics.state.measure().caption();

        var dimensionTitle;
        var dimensionDescription = _dimensions[0].description();
        var dimensionCaption = _dimensions[0].caption();

        if (typeof measureDescription != 'undefined' && measureDescription != measureCaption) {
          measureTitle = $('<span data-toggle="tooltip" class="chart-infos" data-placement="bottom" title="'+
            measureDescription +
            '">' +
            measureCaption + ' </span>').tooltip({'container': 'body', 'html': true});
        } else {
          measureTitle = measureCaption;
        }

        if (typeof dimensionDescription != 'undefined' && dimensionDescription != dimensionCaption) {
          dimensionTitle = $('<span data-toggle="tooltip" class="chart-infos" data-placement="bottom" title="'+
            dimensionDescription +
            '">' +
            dimensionCaption + ' </span>').tooltip({'container': 'body', 'html': true});
        } else {
          dimensionTitle = dimensionCaption;
        }

        $(_selector + ' .chart-title').empty()
            .append(measureTitle)                                          .append(' &bull; ')
            .append(_dimensions[0].levels()[_dimensions[0].currentLevel()]).append(' &bull; ')
            .append(dimensionTitle)                                        .append(' &bull; ')
            .append(analytics.state.cube().caption())                      .append(' &bull; ')
            .append('Total: ').append(totalSpan);
      }
    }

    _chart.updateTitle = function () {
      if (!_disabled) {
        var total = _dimensions[0].getTotal();
        $(_selector+" .chart-total").attr("title", d3.format(".6s")(total)).html(d3.format(".3s")(total));
      }
    };

    function displayParams () {
      if (_chart.params().displayParams) {
        var el = $('<span class="btn-params btn btn-xs btn-default"><i class="fa fa-nomargin fa-cog"></i></span>');
        $(_selector+' .btn-params').replaceWith(el);
        el.click(function() { analytics.display._displayParamsForm(_chart); });
      }
    }

    _chart._niceDomain = function (crossfilterGroup, measure) {
      function getVal(d) {
        if (typeof measure == 'undefined' || typeof d[measure] == 'undefined')
          return d;
        else
          return d[measure];
      }

      var min = crossfilterGroup.order(function (d) {return -getVal(d);}).top(1)[0];
      var max = crossfilterGroup.order(function (d) {return  getVal(d);}).top(1)[0];

      if (getVal(min.value) !== undefined && getVal(max.value) !== undefined) {
        min = getVal(min.value);
        max = getVal(max.value);
        var nbDigitsMax = Math.floor(Math.log(max)/Math.LN10+1);
        min = Math.floor(min / Math.pow(10, nbDigitsMax - 2))*Math.pow(10, nbDigitsMax - 2);
        max = Math.ceil(max / Math.pow(10, nbDigitsMax - 2))*Math.pow(10, nbDigitsMax - 2);
        return [min, max];
      }

      return [0, 0];
    };

    return _chart;
  }

  /**
  ### Chart configuration and inheritance

  #### Options and parameters

  Each chart is configured by two static objects `params` (static parameters of the chart)  and `options` (dynamic options of the chart):

  ```js
  chart.params = {
    nbDimensionsMin     : 1,
    nbDimensionsMax     : 1,
    nbExtraMeasuresMin  : 0,
    nbExtraMeasuresMax  : 0,
    displayTitle        : true,
    displayParams       : true,
    displayLevels       : true,
    displayCanDrillRoll : true,
    displayTip          : true,
    displayPlay         : false
  };

  chart.options = {
    sort            : null,
    labels          : null,
    playerTimeout   : 300,
    height          : 300,
    heightReference : "px"
  };
  ```

  `options` is meant to contain the default configuration of the chat that you will be able to modify during the life of the chart,
  whereas `params` can't be modified and describe what the chart can do. If an option is set to `null`, it means that it's not
  available for the given chart, and you can't modify it.

  On your chart, you can redefine part of `params` and `options`.

  #### Dimensions and measures

  In addition to `params` object, the following static functions can be defined:

  * charts.chart.**isPossibleDimension**(*data.dimension* dimension) : is the given dimension a good candidate to be used in the chart's dimensions
  * charts.chart.**isPossibleExtraMeasure**(*data.measure* measure) : is the given measure a good candidate to be used in the chart's measures
  * charts.chart.**arePossibleDimensionsSpecific**(*data.dimension[]* dimensions) : is the given list of dimensions possible
  * charts.chart.**arePossibleExtraMeasuresSpecific**(*data.measure[]* measures) : is the given list of measures possible

  These functions will be called by the two following static functions, available on each chart:

  * charts.chart.**arePossibleDimensions**(*data.dimension[]* dimensions)
  * charts.chart.**arePossibleExtraMeasures**(*data.measure[]* measures)

  These functions will check if lists of dimensions and measures are possible, by checking that they match the min/max in `params`, that each
  element match `isPossibleDimension/ExtraMeasure` and the list match `arePossibleDimensions/ExtraMeasuresSpecific`.

  #### Inheritance

  To inherit from the abstract and default `analytics.charts.chart`, you must call the static function
  analytics.charts.chart.**extend**(**function** chartConstructor), with `chartConstructor` being the constructor of your chart.

  For more explainations, see the tutorial [Adding a new chart](https://github.com/loganalysis/analytics/wiki/Adding-a-new-chart).
  **/
  charts_chart_nostatic.params = {
    nbDimensionsMin     : 1,
    nbDimensionsMax     : 1,
    nbExtraMeasuresMin  : 0,
    nbExtraMeasuresMax  : 0,
    displayTitle        : true,
    displayParams       : true,
    displayLevels       : true,
    displayCanDrillRoll : true,
    displayTip          : true,
    displayPlay         : false
  };

  charts_chart_nostatic.options = {
    sort            : null,
    labels          : null,
    playerTimeout   : 1000,
    height          : 300,
    heightReference : "px"
  };

  charts_chart_nostatic.isPossibleDimension = function (dimension) {
    return true;
  };

  charts_chart_nostatic.isPossibleExtraMeasure = function (measure) {
    return true;
  };

  charts_chart_nostatic.arePossibleDimensionsSpecific = function (dimensions) {
    return true;
  };

  charts_chart_nostatic.arePossibleExtraMeasuresSpecific = function (measures) {
    return true;
  };


  function implementStaticAsNonStatic(chartConstructor) {

    var _newChartConstructor = function(selector, dimensions) {
      var _chart = chartConstructor(selector, dimensions);
      // add as non static all static variables & functions
      _chart._params                          = chartConstructor.params;
      _chart._options                         = JSON.parse(JSON.stringify(chartConstructor.options));
      _chart.isPossibleDimension              = _newChartConstructor.isPossibleDimension;
      _chart.isPossibleExtraMeasure           = _newChartConstructor.isPossibleExtraMeasure;
      _chart.arePossibleDimensions            = _newChartConstructor.arePossibleDimensions;
      _chart.arePossibleExtraMeasures         = _newChartConstructor.arePossibleExtraMeasures;
      _chart.arePossibleDimensionsSpecific    = _newChartConstructor.arePossibleDimensionsSpecific;
      _chart.arePossibleExtraMeasuresSpecific = _newChartConstructor.arePossibleExtraMeasuresSpecific;
      return _chart;
    };

    _newChartConstructor.arePossibleDimensions = function (dimensions) {
      for (var i in dimensions)
        if (!_newChartConstructor.isPossibleDimension(dimensions[i]))
          return false;

      return _newChartConstructor.arePossibleDimensionsSpecific(dimensions) &&
        dimensions.length >= _newChartConstructor.params.nbDimensionsMin &&
        dimensions.length <= _newChartConstructor.params.nbDimensionsMax;
    };
    _newChartConstructor.arePossibleExtraMeasures = function (measures) {
      for (var i in measures)
        if (!_newChartConstructor.isPossibleExtraMeasure(measures[i]))
          return false;

      return _newChartConstructor.arePossibleDimensionsSpecific(measures) &&
        measures.length >= _newChartConstructor.params.nbExtraMeasuresMin &&
        measures.length <= _newChartConstructor.params.nbExtraMeasuresMax;
    };

    // expose static functions on the new constructor, either comming from the specific chart or the common chart
    _newChartConstructor.params                           = chartConstructor.params;
    _newChartConstructor.options                          = chartConstructor.options;
    _newChartConstructor.isPossibleDimension              = chartConstructor.isPossibleDimension              || charts_chart_nostatic.isPossibleDimension;
    _newChartConstructor.isPossibleExtraMeasure           = chartConstructor.isPossibleExtraMeasure           || charts_chart_nostatic.isPossibleExtraMeasure;
    _newChartConstructor.arePossibleDimensionsSpecific    = chartConstructor.arePossibleDimensionsSpecific    || charts_chart_nostatic.arePossibleDimensionsSpecific;
    _newChartConstructor.arePossibleExtraMeasuresSpecific = chartConstructor.arePossibleExtraMeasuresSpecific || charts_chart_nostatic.arePossibleExtraMeasuresSpecific;


    return _newChartConstructor;
  }

  var charts_chart = implementStaticAsNonStatic(charts_chart_nostatic);

  charts_chart.extend = function (chartConstructor) {

    // coy static maps options & params that are not overriden
    var key;
    if (typeof chartConstructor.params == 'undefined')
      chartConstructor.params = JSON.parse(JSON.stringify(charts_chart_nostatic.params));
    else
      for (key in charts_chart_nostatic.params)
        if (typeof chartConstructor.params[key] == 'undefined')
          chartConstructor.params[key] = charts_chart_nostatic.params[key];

    if (typeof chartConstructor.options == 'undefined')
      chartConstructor.options = JSON.parse(JSON.stringify(charts_chart_nostatic.options));
    else
      for (key in charts_chart_nostatic.options)
        if (typeof chartConstructor.options[key] == 'undefined')
          chartConstructor.options[key] = charts_chart_nostatic.options[key];

    // embed the constructor in another constructor that will do the inheritance tasks
    var _newChartConstructor = implementStaticAsNonStatic(chartConstructor);

    return _newChartConstructor;
  };

  return charts_chart;
})();
