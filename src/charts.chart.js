analytics.charts.chart = (function () {

  function charts_chart_nostatic (selector, dimensions) {

    // returned object
    var _chart = {};

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
      return $(_selector).width();
    };

    _chart.height = function() {
      var height = $(_selector).height() - $(_selector+' .chart-header').height();
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
      if (typeof _chart._options[key] != 'undefined' && _chart._options[key] !== null)
        _chart._options[key] = value;
      return _chart;
    };

    _chart.player = function () {
      return _player;
    };

    // display main functions
    _chart.build = function () {
      if (!_chart.element()) {
                initContainer();    // jshint ignore:line
                initResize();       // jshint ignore:line
        _chart._initContainerSpecific();
                initHeader();       // jshint ignore:line
        _chart._createDcElement();
                initChartCommon();  // jshint ignore:line
        _chart._initChartSpecific();
      }

      updateHeader();
      updateChartCommon();
      _chart._updateChartSpecific();
      return _chart;
    };

    _chart.render = function() {
      _chart.build().element().render();
      return _chart;
    };

    _chart.redraw = function() {
      if (!_chart.element())
        return _chart.render();
      _chart.build().element().redraw();
      return _chart;
    };

    // TODO
    _chart.delete = function () {
      dc.deregisterChart(_chart.element());
      $(_selector).empty();
    };

    // display sub-functions
    function initContainer () {
      $(_selector).html('<div class="chart-header"></div><div class="chart-container"></div>');
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
      _chart.render();
    };

    _chart._resizeSpecific        = function () {};
    _chart._createDcElement       = function () {};
    _chart._initContainerSpecific = function () {};
    _chart._initChartSpecific     = function () {};
    _chart._updateChartSpecific   = function () {};

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
          .callbackZoomIn(function (el, dcChartID) { analytics.display.drillDown(_chart.dimensions()[0], el, dcChartID); })
          .callbackZoomOut(function (dcChartID) { analytics.display.rollUp(_chart.dimensions()[0], dcChartID); });
      }

      // color chart
      if (typeof _chart.element().colors == 'function') {
        _chart.element()
          .colorCalculator(function (d) { return d.value ? _chart.element().colors()(d.value) : '#ccc'; });
      }
    }

    _chart.updateColors = function () {
      if (typeof _chart.element().colorDomain == 'function') {
        _chart.element()
          .colors(d3.scale.quantize().range(_dimensions[0].colors()))
          .colorDomain(niceDomain(_dimensions[0].crossfilterGroup(_extraMeasures)), analytics.state.measure().id());
      }
    };

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
        case 'key':
        _chart.element().ordering(function (d) { return  d.key;   });
        break;

        case 'valueasc':
        _chart.element().ordering(function (d) { return  d.value; });
        break;

        case 'valuedesc':
        _chart.element().ordering(function (d) { return -d.value; });
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
        var tip = analytics.display.getTip('chartType', _chart.type());
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
            _player = analytics.charts.player(_chart);
            _player.callback(function () {
              el.children().toggleClass('fa-play');
              el.children().toggleClass('fa-pause');

              _player = undefined;
            });
            _player.start();
          } else if (_player.running()) {
             _player.pause();
          } else {
             _player.start();
          }
        });
      }
    }

    /**
     * Display an icon whether we can drill-down or roll-up on the chart
     * @param {string} chart Chart id
     */
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

    /**
     * Display the number of levels and the current level
     * @param {string} chart Chart id
     */
    function displayLevels () {
      if (_chart.params().displayLevels) {
        $(_selector + ' .chart-meta .chart-levels').html((_dimensions[0].currentLevel()+1)+'/'+(_dimensions[0].maxLevel()+1));
      }
    }

    function displayTitle () {
      if (_chart.params().displayTitle) {
        $(_selector + ' .chart-title').html(
          analytics.state.cube().caption() + ' &bull; ' +
          _dimensions[0].caption() + ' &bull; ' +
          _dimensions[0].levels()[_dimensions[0].currentLevel()] + ' &bull; ' +
          analytics.state.measure().caption());
      }
    }

    /**
     * Display and configure the params tool
     * @param  {String} chart id of the chart of which we want to display params tool
     * @private
     * @todo Update the content of the modal form to put real values in the fields and preselect current values
     */
    function displayParams () {
      if (_chart.params().displayParams) {
        var el = $('<span class="btn-params btn btn-xs btn-default"><i class="fa fa-nomargin fa-cog"></i></span>');
        $(_selector+' .btn-params').replaceWith(el);
        el.click(function() { analytics.display._displayParamsForm(_chart); });
      }
    }

   /**
     * Get a crossfilter's group domain with nice values (rounded)
     *
     * @private
     * @param {Object} crossfilterGroup - group of which you want a nice domain
     * @param {String} [measure] - name of the nested value accessor in `d.value`. Needed for group with more than 1 aggregated measure.
     * @return {Array} [min, max] rounded
     */
    function niceDomain (crossfilterGroup, measure) {
      function getVal(d) {
        if (typeof measure == 'undefined')
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
    }

    return _chart;
  }

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
    playerTimeout   : 300,
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
