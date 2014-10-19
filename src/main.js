/*!
 *  analytics %VERSION%
 *  https://github.com/loganalysis/analytics-js
 *  Copyright (c) 2014 LogAnalysis
 *
 * This program is released under the terms of the of the MIT licence.
 *
 * For the full copyright and licence information, please view the LICENCE
 * file that was distributed wih this source code.
 */

(function() {
  function _analytics(dc) {
    'use strict';

    ////////////////////////////////////////
    // import "analytics.js"
    ////////////////////////////////////////

    return analytics;
  }

  if(typeof define === "function" && define.amd) {
    define(["dc"], _analytics);
  } else if(typeof module === "object" && module.exports) {
    module.exports = _analytics(dc);
  } else {
    this.analytics = _analytics(dc);
  }
}
)();
