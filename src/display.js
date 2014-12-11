/**
## `analytics.display` namespace

This namespace contains functions related to the interface of the analysis and its rendering.
**/
analytics.display = (function() {

  var display = {};

  var _nextChartId = 0;

  var _charts = [[], [], []];

  var _resizableColumns;
  var _savedColumnWidths;

  /**
  ### Simple getters / setters

  A few simple getters/setters are available:

  * *mixed* display.**columnWidths**(*float[]* savedColumnWidths) : return the width of the columns (in percent of screen width)
  * *string* display.**getTip**(*string* tipType, *string* tipName) : return a tip string or an empty string if the tip does not exists
  **/
  display.columnWidths = function (savedColumnWidths) {
    if (!arguments.length) return _resizableColumns.saveColumnWidths();
    _savedColumnWidths = savedColumnWidths;
    return display;
  };


  display.getTip = function (tipType, tipName) {
    if (analytics.csts.tips[tipType] && analytics.csts.tips[tipType][tipName])
      return analytics.csts.tips[tipType][tipName];
    else
      return "";
  };

  /**
  ### Charts principle

  The main role of *display* is to organize and configure charts. The charts are organized in 3 columns, so each
  chart is positioned in a column *i* and at an offet *j*.

  ### Charts' getters

  To handle charts, the following getters are available:

  * *charts.chart[]* display.**charts**() : return a flat list of the charts on the interface
  * *charts.chart[][]* display.**chartsInLayout**() : return a list of columns, each column being a list of the charts in the columns
  * *jQueryObject* display.**getColumn**(*int* i) : return the jQuery object of the column
  * *charts.chart[]* display.**getChartsUsingDimension**(*data.dimension* dimension) : return the list of charts using a dimension
  * *{i: int, j: int}* display.**getChartPosition**(*charts.chart* chart) : return an object describing to column and offset of a chart
  * *data.measure[]* display.**getExtraMeasuresUsed**() : return the list of extra measures used by charts
  **/
  display.charts = function () {
    return Array.prototype.concat.apply([], _charts);
  };

  display.chartsInLayout = function () {
    return _charts;
  };

  function getColumn(i) {
    return $($(analytics.csts.css.columns)[i]);
  }

  display.getChartsUsingDimension = function (dimension) {

    var charts = display.charts();
    var out = [];
    for (var i in charts)
      if (charts[i].useDimension(dimension))
        out.push(charts[i]);

    return out;
  };

  function getChartPosition(chart) {
    for (var i = 0; i < _charts.length; i++)
      for (var j = 0; j < _charts[i].length; j++)
        if (chart.selector() == _charts[i][j].selector())
          return {i : i, j : j};

    return null;
  }

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
  ### Charts' creation

  To create charts, the following functions are available:

  * *charts.chart* display.**insertChart**(*charts.chart* chart, *int* column, *int* offset) : insert a chart on the interface, at the given position
  * display.**addChart**() : add a new chart on the interface
  * display.**deleteChart**(*charts.chart* chart) : remove a chart from the interface
  * display.**replaceChart**(*charts.chart* chart, *string* newType) : replace a chart with a new chart of the given `type`
  * display.**emptyChartsColumn**(*int* i) : remove all charts of the *i*-th column
  * display.**initCharts**() : initialize the charts default layout (1 map, 1 timeline, 1 bar, 1 pie, 1 table)
  * display.**createCharts**(*Object[][]* charts, *Object<string, data.dimension>* dimensionsMap, *Object<string, data.measure>* measuresMap) :
      recreate charts from a given saved layout, using maps of dimensions and measures
  * display.**createWordClouds**(*data.dimension[]* dimensions) : create one wordcloud for each dimension of the dimensions given, and insert it in the first column
  * display.**assignDimensions**(*data.dimension[]* dimensions, *data.dimension* geoDimension, *data.dimension* timeDimension) : assign the dimensions to the charts
  * display.**updateLayout**() : update the stored layout (returned by  `chartsInLayout()`) according to the real layout of the interface
  **/
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

  function addChart() {
    var chart = analytics.charts.wordcloud("#chart-" + _nextChartId++);
    insertChart(chart, 1, 0);
    display._displayParamsForm(chart, true);
  }

  function deleteChart(chart) {
    var pos = getChartPosition(chart);
    var selector = chart.selector();
    $(selector).remove();
    chart.delete();
    _charts[pos.i].splice(pos.j, 1);
    return pos;
  }

  function replaceChart(chart, newType) {
    // get old infos & delete old chart
    var options = chart.options();
    var selector = chart.selector();
    var pos = deleteChart(chart);

    // create new chart and restore options & position
    chart = analytics.charts[newType]("#chart-" + _nextChartId++);
    for (var option in options)
      chart.setOption(option, options[option]);
    insertChart(chart, pos.i, pos.j);

    return chart;
  }

  function emptyChartsColumn(i) {
    _charts[i].forEach(function (chart) {
      var selector = chart.selector();
      chart.delete();
      $(selector).remove();
    });
    _charts[i] = [];
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

  display.createWordClouds = function (dimensions) {
    // remove old wordclouds
    emptyChartsColumn(0);

    for (var i in dimensions) {
      var dimension = dimensions[i];
      insertChart(analytics.charts.wordcloudWithLegend("#chart-" + _nextChartId++, [dimension]), 0, Infinity);
    }
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

  function updateLayout() {
    var chartsMap = {};
    display.charts().forEach(function (chart) {
      chartsMap[chart.selectorName()] = chart;
    });

    _charts = [[], [], []];

    for (var i = 0; i < 3; i++) {
      var chartDivs = getColumn(i).children("div").each(function(j) {
        _charts[i][j] = chartsMap[$(this).attr("id")];
      });
    }
  }

  /**
  ### Charts' update

  To modify the charts, the following functions are available:

  * display.**_displayParamsForm**(*charts.chart* chart) : show the form allowing to change the configuration of the given chart
  * display.**updateChart**(*charts.chart* chart, *Object* options) : modify the given chart with the given options
  * display.**aggregateDimension**(*data.dimension* dimension, *boolean* aggregate) : aggregate (or deaggregate) a dimension and
      update the interface accordingly.
  * display.**_displayDimensionParamsForm**(*data.dimension* dimension) : show the form allowing to change the configuration of the given dimension
  * display.**updateDimension(*data.dimension* dimension, *Object* options) : modify the given dimension with the given options
  * display.**freezeScalesAcross**(*data.dimension* dimension) : freeze charts across a dimension
  * display.**unfreezeScales**() : cancel **freezeScalesAcross**
  **/
  display._displayParamsForm = function (chart, create) {

    var options = chart.options();

    var schema = analytics.state.schema();
    var cube   = analytics.state.cube().id();

    var dimensions = analytics.state.dimensions();
    var measures   = analytics.query.getMesures(schema, cube);
    var geoDimId   = analytics.query.getGeoDimension(schema, cube);

    var dimensionsMap = analytics.utils.createMapFromArray(dimensions);
    var measuresMap = {};
    for (var measureId in measures) {
      measuresMap[measureId] = analytics.data.measure(measureId, measures[measureId].caption);
    }

    var type              = $('#chartparam-type');
    var dimensionsSelects = $('.chartparam-dimension');
    var measuresSelects   = $('.chartparam-measure');
    var labels            = $('#chartparam-labels');
    var sort              = $('#chartparam-sort');
    var topK              = $('#chartparam-topK');
    var topKMeasure       = $('#chartparam-topKMeasure');
    var playerTimeout     = $('#chartparam-playerTimeout');

    // get containers & hide by default
    var dimensionsContainers    = dimensionsSelects.parent().parent().hide();
    var measuresContainers      = measuresSelects  .parent().parent().hide();
    var labelsContainer         = labels           .parent().parent().hide();
    var sortContainer           = sort             .parent().parent().hide();
    var topKContainer           = topK             .parent().parent().hide();
    var topKMeasureContainer    = topKMeasure      .parent().parent().hide();
    var playerTimeoutContainer  = playerTimeout    .parent().parent().hide();

    // add chart types once
    if (!type.children('option').length) {
      for (var chartType in analytics.charts) {
        if (chartType != 'chart' && typeof analytics.charts[chartType].params != 'undefined' && analytics.charts[chartType].params.displayParams === true) {
          var caption = analytics.csts.txts.charts[chartType] ? analytics.csts.txts.charts[chartType] : chartType;
          type.append('<option value="'+chartType+'">'+caption+'</option>');
        }
      }
    }

    // Add dimensions & measures to selects
    dimensionsSelects.empty();
    measuresSelects  .empty().append('<option value=""></option>');

    var dimension, measure;
    dimensions.forEach(function (dimension) {
      dimensionsSelects.append('<option value="'+dimension.id()+'">'+dimension.caption()+'</option>');
    });
    for (measure in measures) {
      measuresSelects.append('<option value="'+measure+'">'+measures[measure].caption+'</option>');
    }

    // autoset infos
    type.val(chart.type());
    sort.val(options.sort);
    playerTimeout.val(options.playerTimeout);
    labels.prop("checked", options.labels === false ? "" : "checked");
    topK.val(options.topK === Infinity ? "0" : options.topK);

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
    topKMeasure.val(options.topKMeasure ? options.topKMeasure.id() : "");

    // update form dynamically depending on type
    function updateForm(chartType, duration) {
      function showOrHide(container, bool) {
        if (bool) container.slideDown(duration);
        else      container.slideUp(duration);
      }

      var nbDims            = analytics.charts[chartType].params.nbDimensionsMax;
      var nbMes             = analytics.charts[chartType].params.nbExtraMeasuresMax;

      // show dimensions & measures
      dimensionsContainers.slice(0, nbDims).slideDown(duration);
      measuresContainers  .slice(0, nbMes) .slideDown(duration);
      dimensionsContainers.slice(nbDims).slideUp(duration);
      measuresContainers  .slice(nbMes) .slideUp(duration);

      // show fields
      showOrHide(playerTimeoutContainer,  analytics.charts[chartType].params.displayPlay);
      showOrHide(sortContainer,           analytics.charts[chartType].options.sort           !== null);
      showOrHide(labelsContainer,         analytics.charts[chartType].options.labels         !== null);
      showOrHide(topKContainer,           analytics.charts[chartType].options.topK           !== null);
      showOrHide(topKMeasureContainer,    analytics.charts[chartType].options.topKMeasure    !== null);

      // disable impossibles dimensions & measures
      dimensionsSelects.children('option').removeAttr('disabled');
      for (dimension in dimensionsMap) {
        if (!analytics.charts[chartType].isPossibleDimension(dimensionsMap[dimension]) || dimensionsMap[dimension].aggregated())
          dimensionsSelects.children('option[value="'+dimensionsMap[dimension].id()+'"]').attr('disabled', 'disabled');
      }
      measuresSelects.children('option').removeAttr('disabled');
      for (measure in measuresMap) {
        if (!analytics.charts[chartType].isPossibleExtraMeasure(measuresMap[measure]))
          measuresSelects.children('option[value="'+measuresMap[measure].id()+'"]').attr('disabled', 'disabled');
      }
    }
    updateForm(type.val(), 0);

    type.change(function() { updateForm($(this).val(), 400); });

    // set callback for save
    $('#chartparams-set').unbind('click').click(function() {
      $('#chartparams').modal('hide');

      var options = {
        dimensions     : [],
        measures       : [],
        sort           : sort.val(),
        type           : type.val(),
        topK           : topK.val(),
        topKMeasure    : measuresMap[topKMeasure.val()],
        labels         : labels.prop("checked"),
        playerTimeout  : playerTimeout.val(),
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

    // adapt form for create / update
    $('#chartparams-cancel, #chartparams-delete').unbind('click').click(function() {
      $('#chartparams').modal('hide');
    });
    if (create) {
      $('#chartparams-cancel').click(function() { deleteChart(chart); });
      $('#chartparams-delete').hide();
    }
    else {
      $('#chartparams-delete').show().click(function() { deleteChart(chart); });
    }

    // show modal
    $('#chartparams').modal('show');
  };

  function updateChart (chart, options) {

    var doFilter = false;
    var doRender = false;
    var doRedraw = false;
    var loadData = false;

    // create dims & measures
    var nbDims = analytics.charts[options.type].params.nbDimensionsMax;
    var nbMes  = analytics.charts[options.type].params.nbExtraMeasuresMax;
    options.dimensions = options.dimensions.slice(0, nbDims).filter(function (d) { return typeof d.id != "undefined"; });
    options.measures   = options.measures  .slice(0, nbMes) .filter(function (d) { return typeof d.id != "undefined"; });

    // check coherence
    if (options.dimensions.filter(function (d) { return d.aggregated(); }).length) {
      new PNotify('You cannot use aggregated dimensions');
      return;
    }
    if (!analytics.charts[options.type].arePossibleDimensions(options.dimensions)) {
      new PNotify('Invalid dimensions selected');
      return;
    }
    if (!analytics.charts[options.type].arePossibleExtraMeasures(options.measures)) {
      new PNotify('Invalid axes selected');
      return;
    }
    if (analytics.charts[options.type].options.topKMeasure !== null &&
        analytics.utils.indexOf(options.measures, options.topKMeasure) < 0) {
      new PNotify('Invalid measure for top k (it is not used on the chart)');
      return;
    }

    // chart type change = new chart
    if (chart.type() != options.type) {
      chart = replaceChart(chart, options.type);
      doRender = true;
    }

    // new dimensions
    if (!analytics.utils.arraysEquals(options.dimensions, chart.dimensions())) {
      chart.dimensions(options.dimensions);
      doRedraw = true;
      doFilter = true;
    }

    // new measures
    if (!analytics.utils.arraysEquals(options.measures, chart.extraMeasures())) {
      chart.extraMeasures(options.measures);
      doRedraw = true;
      loadData = true;
    }

    // set various options
    function setOption(option, doRenderRedraw, regulate, param) {
      if (param && !analytics.charts[options.type].params[param] ||
         !param && analytics.charts[options.type].options[option] === null ||
          chart.options()[option] == options[option])
        return false;
      if (regulate)
        options[option] = regulate(options[option]);
      chart.setOption(option, options[option]);
      if (doRenderRedraw == "render")
        doRender = true;
      else if (doRenderRedraw == "redraw")
        doRedraw = true;
      return true;
    }

    setOption("sort", "redraw");
    setOption("labels", "render");
    setOption("playerTimeout", "", function(d) { d = parseInt(d); return (isNaN(d) || d < 50) ? 50 : d; }, "displayPlay");
    setOption("topK", "redraw", function(d) { d = parseInt(d); return (isNaN(d) || d <= 0) ? Infinity : d; });
    setOption("topKMeasure", "redraw");

    // Update display
    if (loadData) {
      var isLoaded = analytics.data.loadIfNeeded();
      chart.render();
      if (isLoaded)
        analytics.display.redraw();
    }
    else if (doRender) {
      chart.render();
    }
    else if (doRedraw) {
      chart.redraw();
    }
    if (doFilter) {
      chart.element().filterAll();
      filterChartAsDimensionState(chart);
      chart.redraw();
    }
  }

  display.aggregateDimension = function (dimension, aggregate) {
    dimension.aggregated(aggregate);
    display.getChartsUsingDimension(dimension).forEach(function (chart) {
      chart.disabled(aggregate);
    });
    analytics.data.loadIfNeeded();
    display.redraw();
  };

  display._displayDimensionParamsForm = function (dimension) {

    function generateHTML(color) {
      var palette = colorbrewer[color][Object.keys(colorbrewer[color]).pop()];
      var HTML = palette.map(function(color) { return '<span style="background: '+color+'"></span>'; }).reduce(function (a, b) { return a + b; });
      return '<a class="color-palette" title="'+color+'">'+HTML+'</a>';
    }

    function setColor(color) {
      $('#dimparam-color-button').html(generateHTML(color)+' <span class="caret"></span>');
      $('#dimparam-color').val(color);
      var min = Object.keys(colorbrewer[color]).shift();
      var max = Object.keys(colorbrewer[color]).pop();
      $('#dimparam-colors-nb').attr('min', min);
      $('#dimparam-colors-nb').attr('max', max);
      var nb = Math.min(Math.max(min, $('#dimparam-colors-nb').val()), max);
      $('#dimparam-colors-nb').val(nb);
    }

    // init list of available palettes
    if ($('#dimparam-color-dropdown li').length === 0) {
      analytics.csts.palettes.forEach(function(color) {
        $('#dimparam-color-dropdown').append('<li>'+generateHTML(color)+'</li>');
      });

      $('#dimparam-color-dropdown li a').click(function() {
        setColor($(this).attr('title'));
      });
    }

    // preset fields as current dimension value
    setColor(dimension.colorPalette());
    $('#dimparam-colors-nb').val(dimension.nbBins());
    $('#dimparam-scale').val(dimension.scaleType());
    $('#dimparam-hideUnfiltered').prop('checked', dimension.hideUnfiltered() ? 'checked' : '');

    // set callback for save
    $('#dimparams-set').unbind('click').click(function() {
      $('#dimparams').modal('hide');

      var color = $('#dimparam-color').val();
      var min = Object.keys(colorbrewer[color]).shift();
      var max = Object.keys(colorbrewer[color]).pop();
      var nb = Math.min(Math.max(min, $('#dimparam-colors-nb').val()), max);

      var options = {
        palette        : color,
        number         : nb,
        hideUnfiltered : $('#dimparam-hideUnfiltered').prop("checked"),
        scale          : $('#dimparam-scale').val(),
      };
      updateDimension(dimension, options);
    });

    // display modal
    $('#dimparams').modal('show');
  };

  function updateDimension(dimension, options) {
    dimension.colorPalette(options.palette);
    dimension.nbBins(options.number);
    dimension.scaleType(options.scale);

    dimension.hideUnfiltered(options.hideUnfiltered);
    var filterCharts;
    if (options.hideUnfiltered && !dimension.filters().length) {
      dimension.filters(Object.keys(dimension.getLastSlice()));
      filterCharts = true;
    }

    display.getChartsUsingDimension(dimension).forEach(function (chart) {
      if (filterCharts)
        filterChartAsDimensionState(chart);
      chart.setOption('hideUnfiltered', options.hideUnfiltered);
    });

    display.redraw();
  }

  display.freezeScalesAcross = function (dimension) {
    analytics.state.freezeDomainsAcross(dimension);
    display.charts().forEach(function (chart) {
      chart.elasticAxes(false);
    });
    display.render();
  };

  display.unfreezeScales = function () {
    analytics.state.unfreezeDomains();
    display.charts().forEach(function (chart) {
      chart.elasticAxes(true);
    });
    display.render();
  };

  /**
  ### Charts' filters

  To handle chart's filtering, the following functions are available:

  * display.**filterAllChartsUsingDimension**(*data.dimension* dimension) : reset filters on the charts using the given dimension
  * display.**filterChartsAsDimensionsState**() : update the charts filters to match the filters set on the dimensions
  * display.**_updateFilter**(*data.dimension* dimension, *string* element, *boolean* addOrRemove) : update filters on charts
      using the given dimension to match the fact that `element` must be filtered (`addOrRemove = true`) or not (`addOrRemove = false`)
  **/
  display.filterAll = function () {
    analytics.state.dimensions().forEach(function (dimension) {
      dimension.filters([]);
    });
    dc.filterAll();
  };

  display.filterAllChartsUsingDimension = function (dimension) {
    dimension.filters([]);
    var charts = display.getChartsUsingDimension(dimension);
    for (var i in charts) {
      charts[i].element().filterAll();
    }
  };

  function filterChartAsDimensionState (chart) {
    chart.dimensions()[0].filters().forEach(function (filter) {
      if (!chart.element().hasFilter(filter))
        chart.element().filter(filter);
    });
  }

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

    display.charts().forEach(function (chart) { chart.updateTitle(); });
    display.charts().forEach(function (chart) { chart.updateColors(); });
  };

  /**
  ### Initialization

  To initialize display, the following functions are available:

  * display.**initButtons**() : initialize the reset and resize buttons
  * display.**initResize**() : initialize the resize behavior of the interface, to adapt charts when the window is resized
  * display.**init**() : initialize the whole interface (call the functions above)
  **/
  function initButtons () {

    // reset button
    $(analytics.csts.css.reset).click(function() {
        display.filterAll();
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

    // add a chart button
    $(analytics.csts.css.addchart).click(function () {
      addChart();
    });
  }

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

    // init charts drag/drop
    $(analytics.csts.css.columnsSortable).sortable({
      distance: 20,
      connectWith: analytics.csts.css.columnsSortable,
      handle: ".chart-header",
      opacity: 0.6,
      cursor: "move",
      scroll: false,
      update: function() {
        updateLayout();
        display.resize();
      }
    });

    // prevent ctrl + zoom on the page
    d3.select("body")
    .on('mousewheel',     function () { if (d3.event.ctrlKey) { d3.event.preventDefault(); }})
    .on('DOMMouseScroll', function () { if (d3.event.ctrlKey) { d3.event.preventDefault(); }})
    .on('wheel',          function () { if (d3.event.ctrlKey) { d3.event.preventDefault(); }});
  }

  display.init = function () {
    initCharts();
    initButtons();
    initResize();
  };

  /**
  ### Rendering

  For the rendering of the elements of the interface, display has the following functions:

  * display.**showFactSelector**(*Object* cubesAndMeasures, *data.cube* cube, *data.measure* measure, *function* callback)
  * display.**resize**() : resize the charts
  * display.**rebuild**() : rebuild the charts
  * display.**render**() : render the charts
  * display.**redraw**() : redraw the charts
  **/
  display.showFactSelector = function(cubesAndMeasures, cube, measure, callback) {
    analytics.display.factSelector.init(analytics.csts.css.factSelector, analytics.csts.txts.factSelector.cubes, analytics.csts.txts.factSelector.measures);
    analytics.display.factSelector.setMetadata(cubesAndMeasures);
    analytics.display.factSelector.setCallback(callback);
    analytics.display.factSelector.setSelectedCube(cube.id());
    analytics.display.factSelector.setSelectedMeasure(measure.id());
  };

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
    filterChartsAsDimensionsState();
    $('.tooltip').remove();
  }

  display.render = function () {
    rebuild();
    dc.renderAll();
  };

  display.redraw = function () {
    rebuild();
    dc.redrawAll();
  };

  /**
  ### Drill-down / roll-up

  When doing a drill-down / roll-up, the charts will have to call the following functions:

  * display.**drillDown**(*data.dimension* dimension, *string* member, *int* dcChartID, *Object* keys) : do a drill-down
     on the given member of the given dimension, knowning that the drill-down has been sent by the chart `dcChartID`,
     whith the `keys` pressed described like `{ctrl: <boolean>, alt: <boolean>, maj: <boolean>}`. Depending on the keys,
     the behavior can difer.
  * display.**rollUp**(*data.dimension* dimension, *int* dcChartID, [*int* nbLevels=1]) : Roll-up on the given dimension
     `nbLevels` times, knowning that the roll-up has been sent by the chart `dcChartID`.
  **/
  display.drillDown = function (dimension, member, dcChartID, keys) {

    if (dimension.isDrillPossible()) {

      var toZoom, type;
      if (keys.ctrl) {
        toZoom = dimension.filters().length ? dimension.filters() : Object.keys(dimension.getLastSlice());
        type = 'selected';
      }
      else if (keys.shift) {
        toZoom = Object.keys(dimension.getLastSlice());
        type = 'partial';
        new PNotify('After a partial drill-down, you can only roll-up');
      }
      else {
        toZoom = [member];
        type = 'simple';
      }

      // update display
      display.getChartsUsingDimension(dimension).forEach(function (chart) {
        if (chart.element()._onZoomIn !== undefined && chart.element().chartID() !== dcChartID) {
          chart.element()._onZoomIn(toZoom);
        }
      });

      // update state
      analytics.state.drillDown(dimension, member, type);

      // reset filter on charts using this dimension
      display.filterAllChartsUsingDimension(dimension);

      // update interface
      display.redraw();
    }
  };

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
      display.redraw();
    }
  };

  // importTest "display-test-accessors.js"

  return display;
})();
