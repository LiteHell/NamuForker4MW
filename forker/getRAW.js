var logger = require('../logger.js');
module.exports = function(options, callback) {
  // options properties : name, revisions, delayedRequest
  var revisions = JSON.parse(JSON.stringify(options.revisions)) // deep clone
  var delayedRequest = options.delayedRequest;
  var encodedName = encodeURIComponent(options.name);
  var result = [];

  function recursiveLoop() {
    if (revisions.length < 1) {
      // finished.
      callback(null, result);
      return;
    }
    var revision = revisions.pop();
    delayedRequest.add({
      url: `https://namu.wiki/raw/${encodedName}?rev=${revision.revisionNo}`
    }, function(err, res, body) {
      if (err) {
        callback(err, null);
        return;
      }
      if (res.statusCode == 403) {
        logger.logDebug("getting raw, secret revision " + revision.revisionNo);
        // secret revision
        revision.deleted = true;
        result.push(revision);
      } else if (res.statusCode == 200 || res.statusCode == 304) {
        logger.logDebug("gettting raw, rev " + revision.revisionNo);
        logger.logDebug(body);
        revision.content = body;
        result.push(revision)
      } else {
        callback(new Error("Unexcepted Status Code " + res.statusCode), null);
        return;
      }
      setTimeout(recursiveLoop, 1);
    })
  }
  recursiveLoop();
}
