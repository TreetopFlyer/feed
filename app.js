var http = require("http");
var sax = require("sax");
var zlib = require("zlib");
var fs = require("fs");




var Feed = {};

Feed.Config = {};
Feed.Config.PathConfig = "config.js";
Feed.Config.PathData = "data.js";
Feed.Config.PathDescriptions = "descriptions";

Feed.Methods = {};
Feed.Methods.BuildFiles = function XMLToJSON(inPathXML, inPathJSON, inPathDescription)
{
	var State = {};
	State.TagName = "";
	State.Job = false;
	State.Desciption = "";
	State.NewJob = function()
	{
		State.Job = {};
		State.Job.Title = "";
		State.Job.ID = "";
		State.Job.URL = "";
		State.Job.Date = "";
		State.Job.TaxDiv = ["", "", ""];
		State.Job.TaxCat = ["", "", ""];
		State.Job.TaxLoc = ["", "", ""];		
	};
	
	var Stream = {};
	Stream.JSON = fs.createWriteStream(inPathJSON);
	Stream.GUnZip = zlib.createGunzip();
	Stream.SAX = sax.createStream(true, {});
	Stream.SAX.on("error", console.log);
	Stream.SAX.on("opentag", function (inNode)
	{
		State.TagName = inNode.name;
		if(State.TagName === "job")
		{
			if(State.Job)
			{
				Stream.JSON.write(JSON.stringify(State.Job)+",\n");
				fs.writeFile(inPathDescription+"/"+State.Job.ID+".html", State.Desciption);
			}
			else
			{
				Stream.JSON.write("var Feed = [");
			}
			
			State.Description = "";
			State.NewJob();
		}
	});
	Stream.SAX.on("end", function()
	{
		Stream.JSON.write("{}];");
		Stream.JSON.end();
		
		
	});
	Stream.SAX.on("text", function(inText)
	{
		if(inText === "\n\t\t" || inText === "\n\t")
			return;
			
		switch(State.TagName)
		{
			case "title":
				State.Job.Title += inText;
				break;
			case "jobkey":
				State.Job.ID += inText;
				break;
			case "applyurl":
				State.Job.URL += inText;
				break;
			case "pubdate":
				State.Job.Date += inText;
				break;
			
			case "company":
				State.Job.TaxDiv[0] += inText;
				break;
			case "department":
				State.Job.TaxDiv[1] += inText;
				break;
			
			case "category":
				State.Job.TaxCat[0] += inText;
				break;
			case "specificcategory":
				State.Job.TaxCat[1] += inText;
				break;
				
			case "country":
				State.Job.TaxLoc[0] += inText;
				break;	
			case "state":
				State.Job.TaxLoc[1] += inText;
				break;	
			case "city":
				State.Job.TaxLoc[2] += inText;
				break;	
				
			case "description":
				State.Desciption += inText;
				break;
		}
	});

	http.get(inPathXML, function (inResponse)
	{  
		inResponse.on('error', console.log);		
		
		var encoding = inResponse.headers['content-encoding'];
		if (encoding == 'gzip')
		  inResponse.pipe(Stream.GUnZip).pipe(Stream.SAX);
		else
		  inResponse.pipe(Stream.SAX);
	});
}

Feed.Methods.Process = function(inPath)
{
	fs.readFile(inPath+"/"+Feed.Config.PathConfig, "utf8", function(inError, inData)
	{
		if(inError)
			throw inError;
			
		var config = JSON.parse(inData);
		
		Feed.Methods.BuildFiles(config.Source, inPath+"/"+Feed.Config.PathData, inPath+"/"+Feed.Config.PathDescriptions);
		
	});
};

Feed.Methods.Process(__dirname+"/clients/wegmans");