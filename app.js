var     http = require("http");
var      sax = require("sax");
var     zlib = require("zlib");
var       fs = require("fs-extra");
var  express = require("express");
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
				if(State.Count != 0)
				{
					Stream.JSON.write(inConfig.Delimiter);
				}
				Stream.JSON.write(template(inConfig.Row, State.Fields));

				fs.writeFile(inPathDescription+"/"+State.Fields[inConfig.Description.NameWith]+".html", State.Fields[inConfig.Description.PullFrom]);
				State.Count++;
			}
			else
			{
				Stream.JSON.write(inConfig.Header);
			}
			State.Fields = {};
		}
	});
	Stream.SAX.on("end", function()
	{
		Stream.JSON.write(inConfig.Footer);
		Stream.JSON.end();
		console.log("done parsing", State.Count, "rows.");
	});
	Stream.SAX.on("text", function(inText)
	{
		if(inText === "\n\t\t" || inText === "\n\t")
			return;
			
		State.Fields[State.TagName] = inText;
	});

	// clear out the job descriptions folder
	fs.emptyDir(inPathDescription, function(inError)
	{
		if(!inError)
		{
			// setup 
			// then build the new data
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
Server.use("/clients/:client", function(inReq, inRes, inNext)
{
	inRes.header('Cache-Control', 'public, max-age=7200');
    inRes.header('Access-Control-Allow-Origin', '*');
    inRes.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    inRes.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    if(inReq.method == 'OPTIONS'){
        inRes.sendStatus(200);
    }else{
        inNext();
    }
});
Server.use("/components", express.static(__dirname+"/components"));
Server.use("/clients", express.static(__dirname+"/clients"));
Server.get("/clients/:client/update", function(inReq, inRes, inNext)
{
	Feed.Methods.ExecuteConfig(__dirname + "/" + Feed.Config.PathClients + "/" + inReq.params.client);
	inRes.status(200).send("updating "+inReq.params.client);
});
Server.get("/clients/:client/create", function(inReq, inRes, inNext)
{
	fs.copy(__dirname + "/" + Feed.Config.PathClients + "/_template", __dirname + "/" + Feed.Config.PathClients + "/" + inReq.params.client);
	inRes.status(200).send("creating "+inReq.params.client);
});
Server.get("/", function(inReq, inRes, inNext)
{
	inRes.status(200).send("feed running");
});
Server.listen(80);