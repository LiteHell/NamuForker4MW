var cheerio = require('cheerio');
//var contributorPattern = /\/contribution\/(author|ip)\/(.+?)\/document/;
var contributorPatterns = {
  LoginUser: new RegExp(`/w/${encodeURIComponent("사용자")}:(.+)`),
  ipUser: new RegExp("/contribution/ip/(.+?)/document")
};
var logger = require('../logger.js');
module.exports = function(options, callback) {
  var encodedName = encodeURIComponent(options.name);
  var delayedRequest = options.delayedRequest;
  var history = [];

  function innerLoop(lastRev) {
    return function() {
      var url = `https://namu.wiki/history/${encodedName}${lastRev != null ? "?rev="+lastRev : ""}`;
      delayedRequest.add({
        url: url
      }, function(err, res, body) {
        if (err) {
          callback(err, null);
          return;
        }
        logger.logProcessing("역사를 가져오는 중. 현재  리버전 " + (lastRev == null ? "(알 수 없음)" : lastRev) +
          "개 남음.");
        var $ = cheerio.load(body);
        var items = $("article ul li");
        var lowestRev = null;
        items.each(function(i, e) {
          var item = $(this);
          // 시간 추출
          var rawTimestampPattern = /^([0-9]{4}\-[0-9]{2}\-[0-9]{2})\s([0-9]{2}:[0-9]{2}:[0-9]{2})/;
          var rawTimestamp = rawTimestampPattern.exec(item.text().trim().replace("\n", ""))[1].replace(rawTimestampPattern, "$1T$2+09:00");
          var timestamp = Date.parse(rawTimestamp);
          // 리버전 번호 추출 (추후 raw 얻는데 쓰임)
          var revNo = item.find('input[type="radio"][name="rev"]').val();
          logger.logDebug("Parsing Rev. " + revNo);
          // 의견 추출
          var comment = item.find('span[style="color: gray"]').text();
          // 되돌린 경우 되돌린 리버전 추출
          var revisionRevertedTo = null;
          var specialComment = "";
          if (item.find('i').length != 0) {
            var unparsed = item.find('i').text();
            specialComment = unparsed;
            var revertPattern = /\(r([0-9]+)으로 되돌림\)/;
            if (revertPattern.test(unparsed)) {
              revisionRevertedTo = revertPattern.exec(unparsed)[1];
              revisionRevertedTo = Number(revisionRevertedTo);
            }
          }
          // 기여자 추출
          var author = null,
            isIP = false,
            isAccount = false;
          var authorAnchor = item.find("strong > a");
          if (authorAnchor.length == 0) authorAnchor = item.find("a").last(); // ip 기여자인 경우
          var hrefAttr = authorAnchor.attr("href");
          logger.logDebug("got href Attribute : " + hrefAttr);
          if (contributorPatterns.LoginUser.test(hrefAttr)) {
            isAccount = true;
            author = contributorPatterns.LoginUser.exec(hrefAttr)[1];
          } else if (contributorPatterns.ipUser.test(hrefAttr)) {
            isIP = true;
            author = contributorPatterns.ipUser.exec(hrefAttr)[1];
          } else {
            throw new Error("IP 기여자/로그인 기여자 여부를 판별할 수 없습니다.")
          }
          // 객체화
          history.push({
            timestamp: timestamp,
            revisionNo: Number(revNo),
            comment: comment,
            revisionRevertedTo: revisionRevertedTo,
            author: author,
            isIP: isIP,
            specialComment: specialComment,
            isAccount: isAccount
          });
          if (lowestRev == null | lowestRev > revNo) lowestRev = revNo;
          if (lowestRev == 1) {
            callback(null, history);
          } else if (i == items.length - 1) {
            setTimeout(innerLoop(lowestRev - 1), 1); // call stack 오류 방지
          }
        })
      })
    }
  };
  innerLoop(null)();
}
