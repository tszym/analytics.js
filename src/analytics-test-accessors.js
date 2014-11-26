analytics.reset = function() {
  analytics.data.reset();
  analytics.state.reset();
  analytics.display.reset();
  dc.deregisterAllCharts();
  dc.renderlet(null);
};
