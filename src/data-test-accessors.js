_data._data = function() { return _data; };
_data._measuresLoaded = function() { return _measuresLoaded; };
_data._dataCrossfilter = function() { return _dataCrossfilter; };
_data.numberOfCrossedMembers = numberOfCrossedMembers;
_data.isClientSideAggrPossible = isClientSideAggrPossible;
_data.setCrossfilterData = setCrossfilterData;
_data.getDataClientAggregates = getDataClientAggregates;
_data.getDataServerAggregates = getDataServerAggregates;
_data.getValues2DClient = getValues2DClient;
_data.getValues2DServer = getValues2DServer;

_data.reset = function () {
  _data = {};
  _measuresLoaded = [];
  _dataCrossfilter = undefined;
};
