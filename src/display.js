// TODO check when chart.render/redraw is called and if build is called at the same time

analytics.display = (function() {

  var display = {};

  var _nextChartId = 0;

  var _charts = [[], [], []];

  var _resizableColumns;
  var _savedColumnWidths;

  display.charts = function () {
    return Array.prototype.concat.apply([], _charts);
  };

  display.chartsInLayout = function () {
    return _charts;
  };

  function initButtons () {

    // reset button
    $(analytics.csts.css.reset).click(function() {
        dc.filterAll();
        display.redraw();
      }
    );

    // resize button
    var paddingTopInit = $('body').css('padding-top');
    var headerInitHeight = $(analytics.csts.css.header).height();
    var interfaceInitTop = $(analytics.csts.css.columns).cssUnit('top'); // ex : [100, 'px']

    $(analytics.csts.css.resize).click(function() {
      $(analytics.csts.css.header).toggle();

      if ($(analytics.csts.css.header).is(':hidden')) {
        $(analytics.csts.css.columns).css('top', interfaceInitTop[0] - headerInitHeight + interfaceInitTop[1]);
        $('body').css('padding-top', '0');
      }
      else {
        $(analytics.csts.css.columns).css('top', interfaceInitTop.join(''));
        $('body').css('padding-top', paddingTopInit);
      }

      resize();
    });
  }

  /**
   * Initialize the columns resize behavior
   */
  function initResize () {

    // init column resize
    $(analytics.csts.css.columnsContainer).resizableColumns();
    _resizableColumns = $(analytics.csts.css.columnsContainer).data('resizableColumns');

    // restore columns widths
    if (typeof _savedColumnWidths != 'undefined') {
      _resizableColumns.restoreColumnWidths(_savedColumnWidths);
    }

    // resize charts at end
    var timer = window.setTimeout(function() {}, 0);
    $(window).on('resize', function() {
      window.clearTimeout(timer);
      timer = window.setTimeout(function() {
        $(window).trigger('resizeend');
      }, 350);
    });
    $(window).on('resizeend', resize);
    $(window).on("column:resize:stop", resize);

    //$(analytics.csts.css.columns).sortable({ distance: 20, connectWith: analytics.csts.css.columns });
    //$(analytics.csts.css.columns).disableSelection();
  }

  display.columnWidths = function (savedColumnWidths) {
    if (!arguments.length) return _resizableColumns.saveColumnWidths();
    _savedColumnWidths = savedColumnWidths;
    return display;
  };

  display.init = function () {
    initCharts();
    initButtons();
    initResize();
  };

  /**
   * Resize the charts according to the window size.
   *
   * @private
   */
  function resize () {
    display.charts().forEach(function (chart) {
      chart.resize();
    });
  }

  function rebuild () {
    var charts = display.charts();
    for (var i in charts) {
      charts[i].build();
    }
  }

  display.initRender = function () {
    rebuild();
    filterChartsAsDimensionsState();
    dc.renderAll();
  };

  display.render = function () {
    rebuild();
    dc.renderAll();
  };

  display.redraw = function () {
    rebuild();
    dc.redrawAll();
  };

  function updateFilters() {

    // for each dimension, if there is filters to process
    analytics.state.dimensions().forEach(function (dimension) {
      var filters = dimension.filters();
      var charts = display.getChartsUsingDimension(dimension);

      if (filters.length && charts.length) {
        var chart = charts[0];
        filters.forEach(function (filter) {
          if (!chart.element().hasFilter(filter))
            chart.element().filter(filter);
        });
      }

    });
  }

  display.showFactSelector = function(cubesAndMeasures, cube, measure, callback) {
    analytics.display.factSelector.init(analytics.csts.css.factSelector, analytics.csts.txts.factSelector.cubes, analytics.csts.txts.factSelector.measures);
    analytics.display.factSelector.setMetadata(cubesAndMeasures);
    analytics.display.factSelector.setCallback(callback);
    analytics.display.factSelector.setSelectedCube(cube.id());
    analytics.display.factSelector.setSelectedMeasure(measure.id());
  };

  display.getTip = function (tipType, tipName) {
    if (analytics.csts.tips[tipType] && analytics.csts.tips[tipType][tipName])
      return analytics.csts.tips[tipType][tipName];
    else
      return "";
  };

  function getColumn(i) {
    return $($(analytics.csts.css.columns)[i]);
  }

  function getChartPosition(chart) {
    for (var i in _charts)
      for (var j in _charts[i])
        if (chart.selector() == _charts[i][j].selector())
          return {i : i, j : j};

    return null;
  }

  function emptyChartsColumn(i) {
    _charts[i].forEach(function (chart) {
      var selector = chart.selector();
      chart.delete();
      $(selector).remove();
    });
    _charts[i] = [];
  }

  function replaceChart(chart, newType) {
    var pos = getChartPosition(chart);
    var selector = chart.selector();
    chart.delete();
    chart = analytics.charts[newType](selector);
    _charts[pos.i][pos.j] = chart;
    return chart;
  }

  function insertChart(chart, column, offset) {

    column = Math.max(0, Math.min(_charts.length - 1    , column)); // bound column between 0 and the nb of columns - 1
    offset = Math.max(0, Math.min(_charts[column].length, offset)); // bound column between 0 and the nb of charts

    // save chart object
    if (offset == _charts[column].length)
      _charts[column][offset] = chart;
    else
      _charts[column].splice(offset, 0, chart);

    // create container
    var columnCharts = getColumn(column).children("div");
    var container = '<div id="' + chart.selectorName() + '" class="'+analytics.csts.css.chartsClass+'"></div>';

    // insert as only chart of the column
    if (columnCharts.length === 0)
      getColumn(column).html(container);
    // insert as last chart
    if (columnCharts.length <= offset)
      $(columnCharts[columnCharts.length - 1]).after(container);
    // insert at offset position
    else
      $(columnCharts[offset]).before(container);
  }

  function initCharts () {
    if (display.charts().length === 0) {
      insertChart(analytics.charts.map("#chart-" + _nextChartId++), 1, 0);
      insertChart(analytics.charts.timeline("#chart-" + _nextChartId++), 1, 1);
      insertChart(analytics.charts.table("#chart-" + _nextChartId++), 1, 2);
      insertChart(analytics.charts.pie("#chart-" + _nextChartId++), 2, 0);
      insertChart(analytics.charts.bar("#chart-" + _nextChartId++), 2, 1);
    }
  }

  display.createCharts = function(charts, dimensionsMap, measuresMap) {
    charts.forEach(function (chartsCol, i) {
      chartsCol.forEach(function (chart, j) {
        var chartObj = analytics.charts[chart.type]("#chart-" + _nextChartId++)
          .dimensions   (chart.dimensions   .map(function (d) { return dimensionsMap[d]; }))
          .extraMeasures(chart.extraMeasures.map(function (m) { return measuresMap[m]; }));

        for (var option in chart.options) {
          chartObj.setOption(option, chart.options[option]);
        }

        insertChart(chartObj, i, j);
      });
    });
  };

  display.assignDimensions = function(dimensions, geoDimension, timeDimension) {

    var i;

    // assign dimensions to all charts
    var charts = display.charts();
    for (i in charts) {
      var chart = charts[i];
      if (chart.type() == "timeline")
        chart.dimensions([timeDimension]);
      else
        chart.dimensions([geoDimension]);
    }
  };

  display.createWordClouds = function (dimensions) {
    // remove old wordclouds
    emptyChartsColumn(0);

    for (var i in dimensions) {
      var dimension = dimensions[i];
      insertChart(analytics.charts.wordcloud("#chart-" + _nextChartId++, [dimension]), 0, Infinity);
    }
  };

  /**
   * Get the charts associated to a dimension
   *
   * @private
   * @param {string} dimension
   * @return {Array<string>} charts ID using the input dimension
   */
  display.getChartsUsingDimension = function (dimension) {

    var charts = display.charts();
    var out = [];
    for (var i in charts)
      if (charts[i].useDimension(dimension))
        out.push(charts[i]);

    return out;
  };

  display.getExtraMeasuresUsed = function () {

    var extraMeasuresMap = {};
    display.charts().forEach(function(chart) {
      chart.extraMeasures().forEach(function (measure) {
        extraMeasuresMap[measure.id()] = measure;
      });
    });
    var out = [];
    for (var measureId in extraMeasuresMap) {
      out.push(extraMeasuresMap[measureId]);
    }
    return out;
  };

  /**
   * Filter all elements on the charts associated to a dimension
   *
   * @private
   * @param {string} dimension
   */
  display.filterAllChartsUsingDimension = function (dimension) {
    var charts = display.getChartsUsingDimension(dimension);
    for (var i in charts) {
      charts[i].element().filterAll();
    }
  };

  function filterChartsAsDimensionsState () {

    // for each dimension, if there is filters to process
    analytics.state.dimensions().forEach(function (dimension) {
      var filters = dimension.filters();
      var charts = display.getChartsUsingDimension(dimension);

      if (filters.length && charts.length) {
        var chart = charts[0];
        filters.forEach(function (filter) {
          if (!chart.element().hasFilter(filter)) {
            chart.element().filter(filter);
          }
        });
      }

    });

  }

  /**
   * Drill down on the given dimension on a member. Should called inside callback functions.
   * Will update the charts consequently.
   *
   * @private
   * @param {analytics.dimension} dimension id of the dimension on which we want to drill down
   * @param {string} member id of the member on which we want to drill down
   * @param {string} dcChartID id of the dc chart on which the evenement was called
   */
  display.drillDown = function (dimension, member, dcChartID) {

    if (dimension.isDrillPossible()) {

      // update display
      display.getChartsUsingDimension(dimension).forEach(function (chart) {
        if (chart.element()._onZoomIn !== undefined && chart.element().chartID() !== dcChartID) {
          chart.element()._onZoomIn(member);
        }
      });

      // reset filter on charts using this dimension
      display.filterAllChartsUsingDimension(dimension);

      // update state
      analytics.state.drillDown(dimension, member);

      // update interface
      display.render();
    }
  };

    /**
   * Roll up on the given dimension. Should called inside callback functions.
   * Will update the charts consequently.
   *
   * @private
   * @param {string} dimension id of the dimension on which we want to roll up
   * @param {string} dcChartID id of the dc chart on which the evenement was called
   * @param {integer} [nbLevels=1] number of levels to roll up
   */
  display.rollUp = function (dimension, dcChartID, nbLevels) {
    nbLevels = nbLevels || 1;
    nbLevels = Math.min(nbLevels, dimension.nbRollPossible());

    if (nbLevels > 0) {

      // zoom out on charts
      for (var i = 0; i < nbLevels; i++) {
        display.getChartsUsingDimension(dimension).forEach(function (chart) {
          if (chart.element()._onZoomOut !== undefined && chart.element().chartID() !== dcChartID) {
            chart.element()._onZoomOut();
          }
        });
      }

      // reset filter on charts using this dimension
      display.filterAllChartsUsingDimension(dimension);

      // roll up state
      analytics.state.rollUp(dimension, nbLevels);

      // update interface
      display.render();
    }
  };

  var _frozenColorScales = false;

  display.freezeColorScales = function () {
    _frozenColorScales = true;
  };

  display.unfreezeColorScales = function () {
    _frozenColorScales = false;
  };

  display._updateFilter = function (dimension, element, addOrRemove) {
    // update dimension
    dimension.filter(element, addOrRemove);

    // update charts using dimension
    var charts = display.getChartsUsingDimension(dimension);
    for (var i in charts) {
      if (charts[i].element().hasFilter(element) != addOrRemove) {
        charts[i].element().filter(element);
      }
    }

    if (!_frozenColorScales) {
      display.charts().map(function (chart) { chart.updateColors(); });
    }
  };

  display._displayParamsForm = function (chart) {

    var options = chart.options();

    var schema = analytics.state.schema();
    var cube   = analytics.state.cube().id();

    var dimensions = analytics.state.dimensions();
    var measures   = analytics.query.getMesures(schema, cube);
    var geoDimId   = analytics.query.getGeoDimension(schema, cube);

    // TODO extract creation of dimensionsMap to analytics.utils
    var dimensionsMap = {};
    dimensions.forEach(function (dimension) {
      dimensionsMap[dimension.id()] = dimension;
    });
    var measuresMap = {};
    for (var measureId in measures) {
      measuresMap[measureId] = analytics.data.measure(measureId, measures[measureId].caption);
    }

    var sortSelect             = $('#chartparam-sort');
    var typeSelect             = $('#chartparam-type');
    var playerTimeoutSelect    = $('#chartparam-playerTimeout');
    var dimensionsSelects      = $('.chartparam-dimension');
    var measuresSelects        = $('.chartparam-measure');
    var sortContainer          = sortSelect         .parent().parent();
    var playerTimeoutContainer = playerTimeoutSelect.parent().parent();
    var dimensionsContainers   = dimensionsSelects  .parent().parent();
    var measuresContainers     = measuresSelects    .parent().parent();

    // hide all
    sortContainer         .hide();
    playerTimeoutContainer.hide();
    dimensionsContainers  .hide();
    measuresContainers    .hide();

    // add chart types once
    if (!typeSelect.children('option').length) {
      for (var chartType in analytics.charts) {
        if (typeof analytics.charts[chartType].arePossibleDimensions == 'function' && chartType != 'chart') {
          var caption = analytics.csts.txts.charts[chartType] ? analytics.csts.txts.charts[chartType] : chartType;
          typeSelect.append('<option value="'+chartType+'">'+caption+'</option>');
        }
      }
    }

    // Add dimensions & measures to selects
    dimensionsSelects.empty().append('<option value=""></option>');
    measuresSelects  .empty().append('<option value=""></option>');

    var dimension, measure;
    dimensions.forEach(function (dimension) {
      dimensionsSelects.append('<option value="'+dimension.id()+'">'+dimension.caption()+'</option>');
    });
    for (measure in measures) {
      measuresSelects.append('<option value="'+measure+'">'+measures[measure].caption+'</option>');
    }

    // autoset infos
    typeSelect.val(chart.type());
    sortSelect.val(options.sort);
    playerTimeoutSelect.val(options.playerTimeout);
    dimensionsSelects.each(function(i, el) {
      var dimension = chart.dimensions()[i];
      if (dimension)
        $(el).val(dimension.id());
    });
    measuresSelects.each(function(i, el) {
      var measure = chart.extraMeasures()[i];
      if (measure)
        $(el).val(measure.id());
    });

    // update form dynamically depending on type
    function updateForm(chartType, duration) {
      var nbDims            = analytics.charts[chartType].params.nbDimensionsMax;
      var nbMes             = analytics.charts[chartType].params.nbExtraMeasuresMax;
      var showSort          = analytics.charts[chartType].options.sort !== null;
      var showPlayerTimeout = analytics.charts[chartType].options.displayPlay;

      // show dimensions & measures
      dimensionsContainers.slice(0, nbDims).slideDown(duration);
      measuresContainers  .slice(0, nbMes) .slideDown(duration);
      dimensionsContainers.slice(nbDims).slideUp(duration);
      measuresContainers  .slice(nbMes) .slideUp(duration);

      // show sort container
      if (showSort)
        sortContainer.slideDown(duration);
      else
        sortContainer.slideUp(duration);

      if (showPlayerTimeout)
        playerTimeoutContainer.slideDown(duration);
      else
        playerTimeoutContainer.slideUp(duration);

      // disable impossibles dimensions & measures
      dimensionsSelects.children('option').removeAttr('disabled');
      for (dimension in dimensionsMap) {
        if (!analytics.charts[chartType].isPossibleDimension(dimensionsMap[dimension]))
          dimensionsSelects.children('option[value="'+dimensionsMap[dimension].id()+'"]').attr('disabled', 'disabled');
      }
      measuresSelects.children('option').removeAttr('disabled');
      for (measure in measuresMap) {
        if (!analytics.charts[chartType].isPossibleExtraMeasure(measuresMap[measure]))
          measuresSelects.children('option[value="'+measuresMap[measure].id()+'"]').attr('disabled', 'disabled');
      }
    }
    updateForm(typeSelect.val(), 0);

    typeSelect.change(function() { updateForm($(this).val(), 400); });

    // set callback for save
    $('#chartparams-set').unbind('click').click(function() {
      $('#chartparams').modal('hide');

      var options = {
        dimensions    : [],
        measures      : [],
        sort          : sortSelect.val(),
        type          : typeSelect.val(),
        playerTimeout : playerTimeoutSelect.val(),
      };
      dimensionsSelects.each(function(i, el) {
        var dimension = dimensionsMap[$(el).val()];
        if (dimension)
          options.dimensions[i] = dimension;
      });
      measuresSelects.each(function(i, el) {
        var measure = measuresMap[$(el).val()];
        if (measure)
          options.measures[i] = measure;
      });

      updateChart(chart, options);
    });

    // show modal
    $('#chartparams').modal('show');
  };

  function arraysEquals(array1, array2) {
    if (array1.length != array2.length)
      return false;

    for (var i in array1)
      if (!array1[i].equals(array2[i]))
        return false;

    return true;
  }

  /**
   * Update the configuration of a chart
   * @param  {String} chart   Chart id
   * @param  {Object} options New config
   */
  function updateChart (chart, options) {

    var doRender = false;
    var doRedraw = false;
    var updateData = false;

    // create dims & measures
    var nbDims = analytics.charts[options.type].params.nbDimensionsMax;
    var nbMes  = analytics.charts[options.type].params.nbExtraMeasuresMax;
    options.dimensions = options.dimensions.slice(0, nbDims).filter(function (d) { return typeof d.id != "undefined"; });
    options.measures   = options.measures  .slice(0, nbMes) .filter(function (d) { return typeof d.id != "undefined"; });

    // check coherence
    if (!analytics.charts[options.type].arePossibleDimensions(options.dimensions))
      new PNotify('Invalid dimensions selected');
    if (!analytics.charts[options.type].arePossibleExtraMeasures(options.measures))
      new PNotify('Invalid axes selected');

    // chart type change = new chart
    if (chart.type() != options.type) {
      chart = replaceChart(chart, options.type);
      doRender = true;
    }

    // new dimensions
    if (!arraysEquals(options.dimensions, chart.dimensions())) {
      chart.dimensions(options.dimensions);
      doRedraw = true;
    }

    // new measures
    if (!arraysEquals(options.measures, chart.extraMeasures())) {
      chart.extraMeasures(options.measures);
      doRedraw = true;
      // TODO updateData ?
    }

    // sort order allowed & changed
    if (analytics.charts[options.type].options.sort !== null && chart.options().sort != options.sort) {
      chart.setOption("sort", options.sort);
      doRedraw = true;
    }

    if (analytics.charts[options.type].options.displayPlay && chart.options().playerTimeout != options.playerTimeout) {
      if (options.playerTimeout < 50)
        options.playerTimeout = 50;
      chart.setOption("playerTimeout", options.playerTimeout);
      if (chart.player() !== undefined) {
        chart.player().timeout(options.playerTimeout);
      }
    }

    // Update data
    /*
    if (updateData) {
      analytics.data.get();
      chart.render();
      analytics.display.redraw();
    }*/
    // Update display
    if (doRender)
      chart.render();
    else if (doRedraw)
      chart.redraw();
  }

  return display;
})();
