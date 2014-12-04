/**
## General notes about *analytics.js*

Most of the objects in _analytics.js_ use the principle of having one function that can be both used as a getter and a setter.
If you pass a parameter to the function, it is a setter, it will save the given value and return the object itself for chaining.
If you don't pass a parameter, it will behave as a getter and return the saved value.

## **analytics** namespace

### analytics.**csts**

`analytics.csts` is a deep map containing various constants used by _analytics.js_. It contains mostly CSS selectors and texts (for internationalization).

The structure is as follows:

```js
analytics.csts = {
  resizeDelay : 350,
  css : { .. }, // CSS selectors
  txts : {
    charts : { // name of the charts
      chartId : 'Chart name',
      ...
    },
    factSelector : { ... } // titles used in the fact selector
  },
  tips : { // tips to show on the interface
    charts : {} // tips for the charts
  }
}
```
**/
var analytics = {
  version: '%VERSION%',
  csts : {
    crossfilterClientVsServerThreshold : 20000,
    resizeDelay : 350,
    css : {
      header           : '.navbar',
      columnsContainer : '#columns',
      columns          : '.chart-columns',
      columnsSortable  : '.chart-columns-sortable',
      charts           : '.chart',
      chartsClass      : 'chart',
      factSelector     : '#fact-selector',
      reset            : '#reset',
      resize           : '#resize',
      addchart         : '#addchart',
      zoom             : 'zoom'
    },
    palettes : ["YlGn", "GnBu", "BuPu", "RdPu", "PuRd", "OrRd", "YlOrRd", "YlOrBr", "PuOr", "BrBG", "PRGn", "PiYG", "RdBu", "RdGy", "RdYlBu", "RdYlGn"],
    scaleType : 'quantile',
    nbBins : 6,
    txts : {
      charts : {
        map : 'Choropleth map',
        bar : 'Bar chart',
        pie : 'Pie chart',
        timeline : 'Timeline',
        bubble : 'Bubble chart',
        table : 'Table',
        wordcloud : 'Word cloud chart'
      },
      factSelector : {
        cubes    : 'Cubes available:',
        measures : 'Measures available:'
      },
      hiddenChart : 'This chart is hidden because the dimension shown is aggregated',
      changeCube : 'You are changing the cube beeing studied. If you continue, your current analysis of this cube will be lost. Do you want to continue?'
    },
    tips : {
      charts : {}
    }
  }
};

/**
### analytics.**init**(*Object* queryAPI, [*Object* state])

This function will initialize the whole component thanks to a given`queryAPI` to query the OLAP database, and optionally
with a given state. Prior to it, you can set some constants.

For a standard user of the package, it is the only function you should call.
**/
analytics.init = function (queryAPI, state) {
  analytics.query.queryAPI(queryAPI);
  if (state)
    analytics.state(state);

  analytics.query.queryAPI(queryAPI);
  analytics.display.init();
  analytics.state.initMeasure();
  analytics.state.initDimensions();
  analytics.data.load();
  analytics.display.render();
};

analytics.setCsts = function (csts) {
  function setCstsRec (cstsObject, toAdd) {
    for (var cstKey in toAdd) {
      var typeOld = Array.isArray(cstsObject[cstKey]) ? 'array' : typeof cstsObject[cstKey];
      var typeNew = Array.isArray(toAdd[cstKey]) ? 'array' : typeof toAdd[cstKey];

      if (typeOld == 'object' && typeNew == 'object') {
        setCstsRec(cstsObject[cstKey], toAdd[cstKey]);
      }
      else if (typeof typeOld != 'undefined' && typeof typeOld != 'object' && typeNew != 'undefined' && typeNew != 'object') {
        cstsObject[cstKey] = toAdd[cstKey];
      }
    }
  }

  setCstsRec (analytics.csts, csts);
};

// importTest "analytics-test-accessors.js"

// import "query.js"
// import "data.js"
// import "data.cube.js"
// import "data.measure.js"
// import "data.property.js"
// import "data.dimension.js"
// import "state.js"
// import "display.js"
// import "display.factSelector.js"
// import "charts.js"
// import "charts.player.js"
// import "charts.chart.js"
// import "charts.map.js"
// import "charts.pie.js"
// import "charts.bar.js"
// import "charts.timeline.js"
// import "charts.table.js"
// import "charts.wordcloud.js"
// import "charts.wordcloudWithLegend.js"
// import "charts.bubble.js"
