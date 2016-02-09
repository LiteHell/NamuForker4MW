var logger = require("../logger.js");
var requestDebug = require("request-debug");
var doesBypassCFDDosProtection = process.argv.indexOf("--bypass-cf-ddos-protection") != -1;
if (doesBypassCFDDosProtection) {
  var extend = require('extend');
  module.exports = function(delay) {
    if (isNaN(delay))
      throw new Error("delay must be Number");

    // require module
    var scraper = require('cloudscraper');
    // define private variables
    var queue = []; // request to be processed
    var defaultOptions = {
      method: "GET"
    };

    // define private functions
    function recursiveLoop() {
      if (queue.length < 1)
        return setTimeout(recursiveLoop, 1);
      else {
        var item = queue.pop();
        var options = extend(true, item.options, defaultOptions);
        if (typeof options.url === "undefined" && typeof options.uri !== "undefined") {
          options.url = options.uri;
          delete options.uri;
        }
        scraper.request(options, function(a, b, c) {
          if (a != null) {
            switch (a.errorType) {
              case 0:
                item.callback(a.error, b, c);
                break;
              case 1:
                item.callback(new Error("Fucking reCAPTCHA, Nothing to do. bad luck."), b, c);
                break;
              case 2:
                item.callback(new Error(`CloudFlare returned inner error ${a.error}`), b, c);
                break;
              case 3:
                item.callback(new Error(`failed to bypass CloudFlare Protection, Details : ${a.error}`), b, c);
                break;
              default:
                item.callback(a, b, c); // what the fuck is this?
            }
          } else {
            item.callback(a, b, c);
          }
          setTimeout(recursiveLoop, delay);
        });
      }
    }

    this.setDefaultOptions = function(options, callback) {
      defaultOptions = extend(true, defaultOptions, options);
    }
    this.add = function(options, callback) {
      queue.push({
        options: options,
        callback: callback
      });
    }
    recursiveLoop();
  }
} else {
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
}
