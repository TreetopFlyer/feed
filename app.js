var http = require("http");
var sax = require("sax");

var Proc = {};
Proc.Job = {};
Proc.Init = function()
{
	Proc.Job = {};
};

var State = {};
State.TagName = "";

parser = sax.parser(true);
parser.onerror = function (inError) {};
parser.ontext = function (inText)
{
  if(State.TagName == "title")
  {
	console.log(inText);
  }
};
parser.onopentag = function (inNode)
{
	State.TagName = inNode.name;
};
parser.onend = function () {};

var options = {
	host:"www.linkup.com",
	path:"/xmlFeed.php?gzip=0&access=t3n89z&company=25135&feed=37bc2f75bf1bcfe8450a1a41c200g304"	
};
http.get(options, function (response)
{  
  response.setEncoding('utf8');
  response.on('data', function(inChunk)
  {
	parser.write(inChunk);
  });
  response.on('end', function()
  {
	parser.close();
  });
  response.on('error', console.error);
  
});