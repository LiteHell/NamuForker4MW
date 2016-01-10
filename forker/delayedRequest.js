var logger = require("../logger.js");
var requestDebug = require("request-debug");
function debugRequestHandler(type, data, r) {
  //return; // comment this line if you want to debug request
  logger.logDebug(type);
  logger.logDebug(JSON.stringify(data));
}
module.exports = function(delay) {
  if (isNaN(delay))
    throw new Error("delay must be Number");

  // require module
  var request = require('request');
  requestDebug(request, debugRequestHandler);
  // define private variables
  var queue = []; // request to be processed

  // define private functions
  function recursiveLoop() {
    if (queue.length < 1)
      setTimeout(recursiveLoop, 1);
    else {
      var item = queue.pop();
      request(item.options, function(a, b, c) {
        item.callback(a, b, c);
        setTimeout(recursiveLoop, delay);
      })
    }
  }

  this.setDefaultOptions = function(options, callback) {
    request.stopDebugging();
    request = request.defaults(options);
    requestDebug(request, debugRequestHandler);
  }
  this.add = function(options, callback) {
    queue.push({
      options: options,
      callback: callback
    });
  }
  recursiveLoop();
}
