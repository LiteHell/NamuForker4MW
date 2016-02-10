#!/usr/bin/env node

// require modules
var chalk = require('chalk');
var logger = require("./logger.js");
var forker = require("./forker");
var fs = require('fs');

// write debug
logger.logDebug("\n\n Logging started at " + new Date().toString());

// private variables
var articleToFork = "",
  locationToSave = "";

// start
logger.logInfo("만든이 : LiteHell");
logger.logInfo("만든이 이메일 : LiteHell@openmailbox.org");
logger.logInfo("가능하시다면 이메일을 보내실때 GPG로 암호화를 해주세요! keybase에서 litehell로 검색하시거나 키서버에서 이메일로 검색해서 제 인증서를 찾으실 수 있습니다.");
logger.logInfo("미디어위키에서 쉽게 불러올 수 있도록 " + chalk.inverse("특수:내보내기") + "에서 내보낼때 저장되는 XML 파일 형식으로 저장됩니다. 불러올 때는 " + chalk.inverse("특수:Import") + " 특수문서를 이용하세요.");
logger.logInfo(chalk.red("파일 문서는 정상적으로 포크되지 않습니다."))
for(var i of process.argv) {
  if(i == "--bypass-cf-ddos-protection")
    logger.logInfo(cyan.yellow("CloudFlare DDoS Protection을 우회합니다."));
  else if(i.startsWith("--articleName="))
    articleToFork = i.substring("--articleName=".length);
  else if(i.startsWith("--saveTo="))
    locationToSave = i.substring("--saveTo=".length);
}

if (articleToFork.length == 0) {
  logger.logError("문사명이 비어있거나 지정하지 않았습니다. 제대로 입력해주세요. e.g. --articleName=\"나무위키\"");
} else if (locationToSave.length == 0) {
  logger.logError("경로를 제대로 입력하지 않았거나 지정하지 않았습니다. 제대로 입력해주세요. e.g. --saveTo=\"namuwiki.xml\"")
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
