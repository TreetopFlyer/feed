var http = require("http");
var sax = require("sax");
var zlib = require("zlib");
var fs = require("fs");


var Proc = {};

Proc.State = {};
Proc.State.TagName = "";


Proc.StreamJSON = fs.createWriteStream("c:/nodejs/feed/clients/wegmans/data.js");
Proc.StreamSAX = sax.createStream(true, {});
Proc.StreamGUnZip = zlib.createGunzip();

Proc.Job = {};
Proc.Init = function()
{
	Proc.Job = {};
	Proc.Job.Title = "";
	Proc.Job.ID = "";
	Proc.Job.URL = "";
	Proc.Job.Date = "";
	
	Proc.Job.TaxDiv = ["", "", ""];
	Proc.Job.TaxCat = ["", "", ""];
	Proc.Job.TaxLoc = ["", "", ""];
};


Proc.StreamSAX.on("opentag", function (inNode)
{
	Proc.State.TagName = inNode.name;
	if(Proc.State.TagName == "job")
	{
		Proc.StreamJSON.write(JSON.stringify(Proc.Job)+",\n");
		Proc.Init();
	}
});

Proc.StreamSAX.on("text", function(inText)
{
	if(inText == "\n\t\t" || inText === "\n\t")
		return;
		
	switch(Proc.State.TagName)
	{
		case "title":
			Proc.Job.Title += inText;
			break;
		case "jobkey":
			Proc.Job.ID += inText;
			break;
		case "applyurl":
			Proc.Job.URL += inText;
			break;
		case "pubdate":
			Proc.Job.Date += inText;
			break;
		
		case "company":
			Proc.Job.TaxDiv[0] += inText;
			break;
		case "department":
			Proc.Job.TaxDiv[1] += inText;
			break;
		
		case "category":
			Proc.Job.TaxCat[0] += inText;
			break;
		case "specificcategory":
			Proc.Job.TaxCat[1] += inText;
			break;
			
		case "country":
			Proc.Job.TaxLoc[0] += inText;
			break;	
		case "state":
			Proc.Job.TaxLoc[1] += inText;
			break;	
		case "city":
			Proc.Job.TaxLoc[2] += inText;
			break;	
	}
});
Proc.StreamSAX.on("error", function(inError){console.log(inError);});

var options = {};
options.host = "www.linkup.com";
options.path = "/xmlFeed.php?gzip=1&access=t3n89z&company=25135&feed=37bc2f75bf1bcfe8450a1a41c200g304";
http.get(options, function (inResponse)
{  
	var encoding = inResponse.headers['content-encoding'];
	if (encoding == 'gzip')
	{
	  inResponse.pipe(Proc.StreamGUnZip).pipe(Proc.StreamSAX);
	}
	else
	{
	  inResponse.pipe(Proc.StreamSAX);
	}
	inResponse.on('error', function(inError)
	{
		console.log("http error! ", inError);
	});
});




/*
var Feed = {};

Feed.Config = {};
Feed.Config.PathFeed = "feed.txt";
Feed.Config.PathData = "data.js";
Feed.Config.PathDescriptions = "descriptions";

//inPath is a file system directory that contains a feed.txt file and is where data.js and descriptions/ will be created
Feed.Process = function(inPath)
{
	fs.readFile(inPath+"/"+Feed.Config.PathFeed, function(inError, inData)
	{
		if(inError)
			throw inError;
			
		console.log(inData.toString());
	});
};

Feed.Process("c:/nodejs/feed/clients/wegmans");
*/



















