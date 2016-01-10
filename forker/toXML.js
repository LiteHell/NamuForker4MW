var builder = require('xmlbuilder');
module.exports = function(options, callback) {
  // options properties : revisions, name
  var rootAttrs = {
    version: '0.10',
    encoding: 'UTF-8',
    "xml:lang": "ko",
    "xmlns": "http://www.mediawiki.org/xml/export-0.10/",
    "xmlns:nsi": "http://www.w3.org/2001/XMLSchema-instance",
    "xsi:schemaLocation": "http://www.mediawiki.org/xml/export-0.10/ http://www.mediawiki.org/xml/export-0.10.xsd"
  };
  // create xml root and set attributes
  var xml = builder.create('mediawiki');
  for (var i in rootAttrs) {
    xml.att(i, rootAttrs[i])
  }
  // create siteinfo
  var siteinfo = xml.ele('siteinfo');
  siteinfo.ele('sitename').text('리브레위키');
  siteinfo.ele('dbname').text('wiki');
  siteinfo.ele('base').text('https://namu.wiki/w/%EB%82%98%EB%AC%B4%EC%9C%84%ED%82%A4:%EB%8C%80%EB%AC%B8');
  siteinfo.ele('generator').text('NamuForker4MW 1.0');
  siteinfo.ele('case').text('case-sensitive');

  var namespaceMap = [{
    "key": 6,
    "text": "파일"
  }, {
    "key": 4,
    "text": "나무위키"
  }, {
    "key": 14,
    "text": "분류"
  }, {
    "key": 10,
    "text": "틀"
  }];
  var namespaces = siteinfo.ele("namespace");
  namespaces.ele("namespace").att("key", "0");
  for (var i of namespaceMap) {
    namespaces.ele("namespace").att("key", i.key).text(i.text);
  }

  // JSON, 휴지통은 용도가 불분명하니 제외

  // 네임스페이스 판별
  var ns = 0;
  for (var i of namespaceMap) {
    if (options.name.startsWith(i.text + ":"))
      ns = i.key;
  }

  // create page
  var page = xml.ele('page');
  page.ele('title').text(options.name);
  page.ele('ns').text(ns);

  // create revisions
  for (var i = 0; i < options.revisions.length; i++) {
    var element = page.ele('revision');
    var revision = options.revisions[i];
    // id, parentid
    element.ele('id').text(revision.revisionNo)
    if (i != 0)
      element.ele('parentid').text(options.revisions[i - 1].revisionNo);
    // timestamp
    element.ele('timestamp').text(revision.timestamp);
    // contributor
    var contributor = element.ele('contributor')
    if (revision.isIP)
      contributor.ele('ip').text(revision.author);
    else if (revision.isAccount)
      contributor.ele('username').text(revision.author);
    // model, format
    element.ele('model').text('wikitext');
    element.ele('format').text('text/x-wiki');
    // text
    if (revision.deleted)
      element.ele('text').att('deleted', 'deleted');
    else
      element.ele('text').text(revision.content);
    // comment
    if (revision.specialComment.length != 0) {
      element.ele('comment').text(revision.specialComment + ": " + revision.comment)
    } else if (revision.comment.length != 0) {
      element.ele('comment').text(revision.comment);
    }
  }

  // end this
  callback(null, xml.end({
    pretty: true
  }));
}
