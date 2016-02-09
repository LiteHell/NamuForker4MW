#!/usr/bin/env node

// require modules
var chalk = require('chalk');
var logger = require("./logger.js");
var forker = require("./forker");
var fs = require('fs');

// write debug
logger.logDebug("\n\n Logging started at " + new Date().toString());

// start
logger.logInfo("만든이 : LiteHell");
logger.logInfo("만든이 이메일 : LiteHell@openmailbox.org");
logger.logInfo("가능하시다면 이메일을 보내실때 GPG로 암호화를 해주세요! keybase에서 litehell로 검색하시거나 키서버에서 이메일로 검색해서 제 인증서를 찾으실 수 있습니다.");
logger.logInfo("미디어위키에서 쉽게 불러올 수 있도록 " + chalk.inverse("특수:내보내기") + "에서 내보낼때 저장되는 XML 파일 형식으로 저장됩니다. 불러올 때는 " + chalk.inverse("특수:Import") + " 특수문서를 이용하세요.");
logger.logInfo(chalk.red("파일 문서는 정상적으로 포크되지 않습니다."))
if(process.argv.indexOf("--bypass-cf-ddos-protection") != -1)
  logger.logInfo(chalk.yellow("CloudFlare DDoS Protection을 우회합니다."));
logger.askQuestions(["포크할 문서를 입력해주세요 :",
  "포크한 문서 파일은 어디에 저장할까요 :"
  /* ,
    "리그베다 시절 기여분은 어떻게 할까요? 닉네임 앞에 특정 문자열을 덧붙이고 싶다면 " + chalk.green("사용자명") + "을, 편집 요약 앞에 특정 문자열을 덧붙이고 싶다면 " + chalk.green("편집 요약") + "을 입력해주세요. 오타가 있으면 안됩니다 :",
    "사용자명 혹은 편집 요약 앞에 덧붙일 문자열은?" */
], function(a) {
  var articleToFork = a[0],
    locationToSave = a[1];
  //rigvedaContributionProcessType = a[2] == "사용자명" ? 2 : a[2] == "편집 요약" ? 1 : null, // 사용자명 : 2, 편집 요약 : 1, 기타 : null,
  //rigvedaContributionString = a[3];

  // Validate inputs
  /* if (rigvedaContributionProcessType == null) {
    logger.logError("리그베다 시절 기여분 처리 방법을 잘못 입력했습니다. " + chalk.red("사용자명") + "이나 " + chalk.red("편집 요약") + " 둘중 하나를 입력해주세요.");
  } else */
  if (articleToFork.length == 0) {
    logger.logError("문사명이 비어있습니다. 제대로 입력해주세요.");
  } else if (locationToSave.length == 0) {
    logger.logError("경로를 제대로 입력하지 않았습니다. 제대로 입력해주세요.")
  }
  forker({
    name: articleToFork
  }, function(err, content) {
    if (err) throw err;
    logger.logInfo("XML 작성 완료");
    fs.writeFile(locationToSave, content, {
      encoding: 'utf8'
    }, function() {
      logger.logInfo("완료!");
      process.exit(0);
    })
  });
})
