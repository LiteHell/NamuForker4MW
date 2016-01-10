// require modules
var readline = require('readline');
var chalk = require('chalk');

// create readline interface
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// function to ask questions
exports.askQuestions = function(questions, callback) {
  var header = chalk.cyan("[질문]"),
    answers = [],
    index = 0;

  function innerRecursiveLoop() {
    if (index == questions.length || index > questions.length) {
      callback(answers);
      return;
    }
    rl.question(header + " " + questions[index++] + " ", function(answer) {
      answers.push(answer);
      innerRecursiveLoop();
    })
  }
  innerRecursiveLoop();
};

// functions to log
exports.logInfo = function(message) {
  console.log(chalk.green("[정보]") + " " + message);
}
exports.logProcessing = function(message) {
  console.log(chalk.magenta("[진행]") + " " + message);
};
exports.logError = function(message) {
  var doExit = arguments.length > 1 ? argument[1] : true;
  console.log(chalk.red("[오류]") + " " + message);
  if (doExit) process.exit(-1);
}
exports.logDebug = function(message) {
  var header = chalk.bgWhite.black("[디버그]")
  console.log(header + " " + message);
}
exports.logWarn = function(message) {
  console.log(chalk.yellow("[경고]") + " " + message);
}
