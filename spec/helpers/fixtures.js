var baseUrl = "/spec/helpers/";

var c = cube("C", "Le cube")
  .measure("E", "Export", "Export desc", function (index) { return Math.abs(Math.sin(Math.PI/(index+1))); })
  .measure("I", "Import", "Import desc", function (index) { return Math.sqrt(index); })
  .dimension("[Zone]", "Zone", "Zone desc", "Geometry")
    .hierarchy("Z1", "Nuts", "Nuts desc")
      .level("nuts0", "Nuts0", "Nuts0 desc")
        .property("Geom", "La Geometrie", "Geom desc", "Geometry")
        .member("BE", "Belgium", "BE desc", {"Geom": fileContent(baseUrl+"geoData/BE")}, ["BE1","BE2","BE3"])
        .member("DE", "Germany", "DE desc", {"Geom": fileContent(baseUrl+"geoData/DE")}, ["DE7","DEC","DE9","DEB","DE3","DEG","DEF","DE8","DE4","DEA","DEE","DE1","DE2","DE6","DE5","DED"])
        .member("NL", "Netherlands", "NL desc", {"Geom": fileContent(baseUrl+"geoData/NL")}, ["NL4","NL3","NL1","NL2"])
        .member("LU", "Luxembourg", "LU desc", {"Geom": fileContent(baseUrl+"geoData/LU")}, ["LU0"])
        .member("UK", "United Kingdom", "UK desc", {"Geom": fileContent(baseUrl+"geoData/UK")}, ["UKI","UKC","UKM","UKG","UKD","UKF","UKH","UKL","UKN","UKJ","UKK","UKE"])
      .level("nuts1", "Nuts1", "Nuts1 desc")
        .property("Geom", "La Geometrie", "Geom desc", "Geometry")
        .member("BE3", "RÉGION WALLONNE", "BE3 desc", {"Geom": fileContent(baseUrl+"geoData/BE3")}, [])
        .member("BE2", "VLAAMS GEWEST", "BE2 desc", {"Geom": fileContent(baseUrl+"geoData/BE2")}, [])
        .member("BE1", "RÉGION DE BRUXELLES-CAPITALE / BRUSSELS HOOFDSTEDELIJK GEWEST", "BE1 desc", {"Geom": fileContent(baseUrl+"geoData/BE1")}, [])
        .member("DE7", "HESSEN", "DE7 desc", {"Geom": fileContent(baseUrl+"geoData/DE7")}, [])
        .member("DEC", "SAARLAND", "DEC desc", {"Geom": fileContent(baseUrl+"geoData/DEC")}, [])
        .member("DE9", "NIEDERSACHSEN", "DE9 desc", {"Geom": fileContent(baseUrl+"geoData/DE9")}, [])
        .member("DEB", "RHEINLAND-PFALZ", "DEB desc", {"Geom": fileContent(baseUrl+"geoData/DEB")}, [])
        .member("DE3", "BERLIN", "DE3 desc", {"Geom": fileContent(baseUrl+"geoData/DE3")}, [])
        .member("DEG", "THÜRINGEN", "DEG desc", {"Geom": fileContent(baseUrl+"geoData/DEG")}, [])
        .member("DEF", "SCHLESWIG-HOLSTEIN", "DEF desc", {"Geom": fileContent(baseUrl+"geoData/DEF")}, [])
        .member("DE8", "MECKLENBURG-VORPOMMERN", "DE8 desc", {"Geom": fileContent(baseUrl+"geoData/DE8")}, [])
        .member("DE4", "BRANDENBURG", "DE4 desc", {"Geom": fileContent(baseUrl+"geoData/DE4")}, [])
        .member("DEA", "NORDRHEIN-WESTFALEN", "DEA desc", {"Geom": fileContent(baseUrl+"geoData/DEA")}, [])
        .member("DEE", "SACHSEN-ANHALT", "DEE desc", {"Geom": fileContent(baseUrl+"geoData/DEE")}, [])
        .member("DE1", "BADEN-WÜRTTEMBERG", "DE1 desc", {"Geom": fileContent(baseUrl+"geoData/DE1")}, [])
        .member("DE2", "BAYERN", "DE2 desc", {"Geom": fileContent(baseUrl+"geoData/DE2")}, [])
        .member("DE6", "HAMBURG", "DE6 desc", {"Geom": fileContent(baseUrl+"geoData/DE6")}, [])
        .member("DE5", "BREMEN", "DE5 desc", {"Geom": fileContent(baseUrl+"geoData/DE5")}, [])
        .member("DED", "SACHSEN", "DED desc", {"Geom": fileContent(baseUrl+"geoData/DED")}, [])
        .member("LU0", "LUXEMBOURG", "LU0 desc", {"Geom": fileContent(baseUrl+"geoData/LU0")}, [])
        .member("NL4", "ZUID-NEDERLAND", "NL4 desc", {"Geom": fileContent(baseUrl+"geoData/NL4")}, [])
        .member("NL3", "WEST-NEDERLAND", "NL3 desc", {"Geom": fileContent(baseUrl+"geoData/NL3")}, [])
        .member("NL1", "NOORD-NEDERLAND", "NL1 desc", {"Geom": fileContent(baseUrl+"geoData/NL1")}, [])
        .member("NL2", "OOST-NEDERLAND", "NL2 desc", {"Geom": fileContent(baseUrl+"geoData/NL2")}, [])
        .member("UKI", "LONDON", "UKI desc", {"Geom": fileContent(baseUrl+"geoData/UKI")}, [])
        .member("UKC", "NORTH EAST (ENGLAND)", "UKC desc", {"Geom": fileContent(baseUrl+"geoData/UKC")}, [])
        .member("UKM", "SCOTLAND", "UKM desc", {"Geom": fileContent(baseUrl+"geoData/UKM")}, [])
        .member("UKG", "WEST MIDLANDS (ENGLAND)", "UKG desc", {"Geom": fileContent(baseUrl+"geoData/UKG")}, [])
        .member("UKD", "NORTH WEST (ENGLAND)", "UKD desc", {"Geom": fileContent(baseUrl+"geoData/UKD")}, [])
        .member("UKF", "EAST MIDLANDS (ENGLAND)", "UKF desc", {"Geom": fileContent(baseUrl+"geoData/UKF")}, [])
        .member("UKH", "EAST OF ENGLAND", "UKH desc", {"Geom": fileContent(baseUrl+"geoData/UKH")}, [])
        .member("UKL", "WALES", "UKL desc", {"Geom": fileContent(baseUrl+"geoData/UKL")}, [])
        .member("UKN", "NORTHERN IRELAND", "UKN desc", {"Geom": fileContent(baseUrl+"geoData/UKN")}, [])
        .member("UKJ", "SOUTH EAST (ENGLAND)", "UKJ desc", {"Geom": fileContent(baseUrl+"geoData/UKJ")}, [])
        .member("UKK", "SOUTH WEST (ENGLAND)", "UKK desc", {"Geom": fileContent(baseUrl+"geoData/UKK")}, [])
        .member("UKE", "YORKSHIRE AND THE HUMBER", "UKE desc", {"Geom": fileContent(baseUrl+"geoData/UKE")}, [])
  .dimension("[Time]", "Temps", "T desc", "Time")
    .hierarchy("T1", "Years-Semesters", "semesters desc")
      .level("Level0", "Years")
        .member("2010", "2010", "2010 desc", {}, ["2010-S1", "2010-S2"])
        .member("2011", "2011", "2011 desc", {}, ["2011-S1", "2011-S2"])
        .member("2012", "2012", "2012 desc", {}, ["2012-S1", "2012-S2"])
        .member("2013", "2013", "2013 desc", {}, ["2013-S1", "2013-S2"])
      .level("Level1", "Semester")
        .member("2010-S1", "2010-S1", "2010-S1 desc")
        .member("2010-S2", "2010-S2", "2010-S2 desc")
        .member("2011-S1", "2011-S1", "2011-S1 desc")
        .member("2011-S2", "2011-S2", "2011-S2 desc")
        .member("2012-S1", "2012-S1", "2012-S1 desc")
        .member("2012-S2", "2012-S2", "2012-S2 desc")
        .member("2013-S1", "2013-S1", "2013-S1 desc")
        .member("2013-S2", "2013-S2", "2013-S2 desc")
        .member("2014-S1", "2014-S1", "2014-S1 desc")
        .member("2014-S2", "2014-S2", "2014-S2 desc")
  .dimension("[Product]", "Product", "Prod desc", "Standard")
    .hierarchy("P1", "Custom type", "P1 desc")
      .level("Level0", "type", "Level0 desc")
        .member("F", "Food", "Food desc", {}, ["BG","P","S"])
        .member("NC", "Non-consumable", "Non-consumable desc", {}, ["H","F"])
      .level("Level1", "Semester", "Semester desc")
        .member("BG", "Backing Goods", "Backing Goods desc")
        .member("P", "Produce", "Produce desc")
        .member("S", "Snack Goods", "Snack Goods desc")
        .member("H", "Hammer", "Hammer desc")
        .member("F", "Fork", "Fork desc");

function getQueryAPI() {
  return generateAPI([c]);
}

function getTestsResults() {
  return {
    'nbCrossedMembers' : 40,
    'groupContriesAll' : [ { key: 'BE', value: 1.4347258900241457 }, { key: 'DE', value: 2.3176831192402343 }, { key: 'LU', value: 1.8476225875732857 }, { key: 'NL', value: 2.087439192080086 }, { key: 'UK', value: 1.6591085039886473 } ],
    'schema' : 'Olap',
    'cube' : {id : 'C', caption : 'Le cube'},
    'measure' : {id : 'E', caption: 'Export'},
    'dimension0' : {
      geoProp : "Geom",
      members : ["BE", "DE", "NL", "LU", "UK"],
      toDrill : "BE",
      toDrillAll : ["BE", "DE", "NL", "LU", "UK"],
      toDrillMulti : ["BE", "UK"],
      members1 : ["BE1", "BE2", "BE3"],
      members1All : [ 'BE1', 'BE2', 'BE3', 'DE7', 'DEC', 'DE9', 'DEB', 'DE3', 'DEG', 'DEF', 'DE8', 'DE4', 'DEA', 'DEE', 'DE1', 'DE2', 'DE6', 'DE5', 'DED', 'NL4', 'NL3', 'NL1', 'NL2', 'LU0', 'UKI', 'UKC', 'UKM', 'UKG', 'UKD', 'UKF', 'UKH', 'UKL', 'UKN', 'UKJ', 'UKK', 'UKE' ],
      members1Multi : [ 'BE1', 'BE2', 'BE3', 'UKI', 'UKC', 'UKM', 'UKG', 'UKD', 'UKF', 'UKH', 'UKL', 'UKN', 'UKJ', 'UKK', 'UKE' ]
    }
  };
}
