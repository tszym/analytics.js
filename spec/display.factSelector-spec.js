describe('analytics.factSelector', function() {

  var selector = '#fact-selector';
  var cubesIntro = 'Cubes available:';
  var measuresIntro = 'Measures available:';

  var data = {
    '12' : {
      'caption' : 'cubeCaption12',
      'measures' : {
        'measureID' : {'caption' : 'measureCaption'},
        'measureID2' : {'caption' : 'measureCaption2'},
      }
    },
    '13' : {
      'caption' : 'cubeCaption13',
      'measures' : {
        'measureID' : {'caption' : 'measureCaption'},
        'measureID2' : {'caption' : 'measureCaption2'},
        'measureID3' : {'caption' : 'measureCaption3'},
      }
    }
  };

  describe('at initialization', function() {

    beforeEach(function() {
      analytics.display.factSelector.init(selector, cubesIntro, measuresIntro);
    });

    it('should use the right text to introduce avaliable cubes', function() {
      expect(analytics.display.factSelector.cubes.intro).toEqual(cubesIntro);
    });

    it('should use the right text to introduce avaliable measures', function() {
      expect(analytics.display.factSelector.measures.intro).toEqual(measuresIntro);
    });
  });

  describe('Div containing cubes and measures', function() {
    var div;

    beforeEach(function() {
      div = appendChartID('fact-selector');
      analytics.display.factSelector.init(selector, cubesIntro, measuresIntro);
      analytics.display.factSelector.setMetadata(data);
    });

    it('should be a div containing all the cubes in the data', function () {
      expect($('#fact-selector div:first li').length).toBe(2);
    });

    it('should contain a div that contains the div of cube 12 that contains the 2 measures', function () {
      analytics.display.factSelector.setSelectedCube('12');
      expect($('#fact-selector div:last li').length).toBe(2);
    });

    it('should contain a div that contains the div of cube 13 that contains the 3 measures', function () {
      analytics.display.factSelector.setSelectedCube('13');
      expect($('#fact-selector div:last li').length).toBe(3);
    });
  });

});
