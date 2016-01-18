var http = require("http");
var sax = require("sax");
var zlib = require("zlib");
var fs = require("fs");

var Proc = {};
Proc.Job = {};

Proc.WriteJSON = fs.createWriteStream("myOutput.txt");


Proc.Init = function()
{
	Proc.Job = {};
	Proc.Job.Title = "";
	Proc.Job.ID = "";
	Proc.Job.URL = "";
	Proc.Job.Date = "";
	
	Proc.Job.Taxonomy = {};
	Proc.Job.Taxonomy.Division = {
		company:"",
		department:""
	};
	Proc.Job.Taxonomy.Category = {
		family:"",
		category:""
	};
	Proc.Job.Taxonomy.Location = {
		country:"",
		state:"",
		city:""
	};
};



var State = {};
State.TagName = "";
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
saxStream.on("error", function(inError)
{
	console.log(inError);
});


var options = {
	host:"www.linkup.com",
	path:"/xmlFeed.php?gzip=1&access=t3n89z&company=25135&feed=37bc2f75bf1bcfe8450a1a41c200g304"	
};
http.get(options, function (inResponse)
{  
	var encoding = inResponse.headers['content-encoding'];
	if (encoding == 'gzip')
	{
	  inResponse.pipe(zlib.createGunzip()).pipe(saxStream);
	}
	else
	{
	  inResponse.pipe(saxStream);
	}
	inResponse.on('error', console.error);
});