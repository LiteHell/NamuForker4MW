var logger = require('../logger.js');
var getHistory = require('./getHistory.js');
var getRAW = require('./getRAW.js');
var toXMLConverter = require('./toXML.js')
var doesBypassCFDDosProtection = process.argv.indexOf("--bypass-cf-ddos-protection") != -1;

function ifArticleExists(callback, errCallback) {
  return function(err, res, body) {
    if (err) {
      errCallback(err, null);
      return;
    }
    switch (res.statusCode) {
      case 200:
      case 304:
        callback();
        break;
      case 404:
        errCallback(new Error("Article not found"));
        break;
      case 500:
        errCallback(new Error("Server returned 500 error. Server internal Error or database maintaince? I dunno."));
        break;
      case 403:
        errCallback(new Error("Server returned 403 error, occured when essential header is mssing. Please contact Developer."))
        break;
      default:
        errCallback(new Error("Unexcepted status code " + res.statusCode));
        break;
    }
  };
}
module.exports = function(options, callback) {
  // callback argument : Error, response
  // Essential option properties : name

  var delayedRequestClass = require('./delayedRequest.js');
  var delayedRequest = new delayedRequestClass(1500);
  var encodedName = encodeURIComponent(options.name);
  var forkerVersion = require("../package.json").version;
  logger.logDebug("forker Version loaded : " + forkerVersion);
  // set Default Headers
  delayedRequest.setDefaultOptions({
    headers: {
      "User-Agent": `Mozilla 5.0 (compatible; NamuForker4MW ${forkerVersion})`,
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "ko-KR,ko;q=0.8,en-US;q=0.5,en;q=0.3",
      "Accept-Encoding": "utf-8",
      "host": "namu.wiki"
    },
    forever: true
  });

  delayedRequest.add({
    uri: "https://namu.wiki/raw/" + encodedName
  }, ifArticleExists(function() {
    logger.logProcessing("문서 존재함.");
    getHistory({
      name: options.name,
      delayedRequest: delayedRequest
    }, function(err, history) {
      if (err) throw err;
      logger.logProcessing("역사 포크 완료");
      getRAW({
        name: options.name,
        revisions: history,
        delayedRequest: delayedRequest
      }, function(err, raws) {
        logger.logProcessing("RAW 포크 완료");
        logger.logDebug(JSON.stringify(raws));
        toXMLConverter({
          revisions: raws,
          name: options.name
        }, function(err, xml) {
          if (err)
            callback(err, null)
          else
            callback(null, xml);
        })
      })
    })
  }, function(err) {
    callback(err, null);
  }));
}
