state._schema = _schema;
state._cube = _cube;
state._measure = _measure;
state._cubeObj = _cubeObj;
state._measureObj = _measureObj;
state._dimensions = _dimensions;
state.setCubeAndMeasureCallback = setCubeAndMeasureCallback;
state.getState = getState;
state.setState = setState;

state.reset = function () {
  _schema     = null;
  _cube       = null;
  _measure    = null;
  _cubeObj    = null;
  _measureObj = null;
  _dimensions = [];
};
