var http = require("http");
var sax = require("sax");
var zlib = require("zlib");

var Proc = {};
Proc.Job = {};
Proc.Init = function()
{
	Proc.Job = {};
};

var State = {};
State.TagName = "";

var options = {
	host:"www.linkup.com",
	path:"/xmlFeed.php?gzip=1&access=t3n89z&company=25135&feed=37bc2f75bf1bcfe8450a1a41c200g304"	
};

var saxStream = sax.createStream(true, {});
saxStream.on("opentag", function (inNode) {
  State.TagName = inNode.name;
})
saxStream.on("text", function(inText)
{
	if(State.TagName == "title")
	{
		console.log(inText);
	}
});


http.get(options, function (inResponse)
{  
  inResponse.setEncoding('utf8');
  
  inResponse.pipe(zlib.createGunzip()).pipe(saxStream);
  
  inResponse.on('error', console.error);
  
});