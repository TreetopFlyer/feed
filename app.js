var http = require("http");
var sax = require("sax");
var zlib = require("zlib");
var fs = require("fs");
var express = require("express");
var template = require("string-template");


var Feed = {};

Feed.Config = {};
Feed.Config.PathConfig = "config.json";
Feed.Config.PathData = "data.js";
Feed.Config.PathDescriptions = "descriptions";
Feed.Config.PathClients = "clients";

Feed.Methods = {};
Feed.Methods.BuildFiles = function(inConfig, inPathJSON, inPathDescription)
{
	var State = {};
	State.TagName = "";
    State.Count = 0;
	State.Fields = false;
	
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
			if(State.Fields)
			{
				Stream.JSON.write(template(JSON.stringify(inConfig.Template), State.Fields)+",\n");
				fs.writeFile(inPathDescription+"/"+State.Fields[inConfig.Description.NameWith]+".html", State.Fields[inConfig.Description.PullFrom]);
			}
			else
			{
				Stream.JSON.write("var Feed = [");
			}
			State.Fields = {};
		}
	});
	Stream.SAX.on("end", function()
	{
		Stream.JSON.write("{}];");
		Stream.JSON.end();
		console.log("done parsing");
	});
	Stream.SAX.on("text", function(inText)
	{
		if(inText === "\n\t\t" || inText === "\n\t")
			return;
			
		State.Fields[State.TagName] = inText;
	});

	http.get(inConfig.Source, function (inResponse)
	{  
		inResponse.on('error', console.log);		
		var encoding = inResponse.headers['content-encoding'];
		if (encoding == 'gzip')
		  inResponse.pipe(Stream.GUnZip).pipe(Stream.SAX);
		else
		  inResponse.pipe(Stream.SAX);
	});
}

Feed.Methods.ExecuteConfig = function(inClientFolder)
{
	fs.readFile(inClientFolder+"/"+Feed.Config.PathConfig, "utf8", function(inError, inData)
	{
		if(inError)
			throw inError;

		Feed.Methods.BuildFiles(
			JSON.parse(inData),
			inClientFolder+"/"+Feed.Config.PathData, // write overview json to this file
			inClientFolder+"/"+Feed.Config.PathDescriptions); // write descriptions to this folder
	});
};


var Server = express();
Server.use("/components", express.static(__dirname+"/components"));
Server.use("/clients", express.static(__dirname+"/clients"));
Server.get("/clients/:client/update", function(inReq, inRes, inNext)
{
	inRes.status(200).send("updating "+inReq.params.client);
	Feed.Methods.ExecuteConfig(__dirname + "/" + Feed.Config.PathClients + "/" + inReq.params.client);
});
Server.get("/", function(inReq, inRes, inNext)
{
	inRes.status(200).send("feed running");
});
Server.listen(80);