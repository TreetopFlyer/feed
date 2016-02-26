var Tabular = {};
Tabular.Generators = {};
Tabular.Generators.Basic = {
	
	Title:function(inRow){return inRow.Title;},
	Category:function(inRow){return inRow.TaxDiv[1];},
	Location:function(inRow){return inRow.TaxLoc[2]+", "+inRow.TaxLoc[1];}
};

Tabular.CSS = {};
Tabular.CSS.ClassSort = "Sort";
Tabular.CSS.ClassSortAscending = "Ascending";
Tabular.CSS.ClassSortDescending = "Descending";

Tabular.Template = {};
Tabular.Template.Basic = {
	Title:{
		Header:function(inRow){return $("<th><span><i class=\"fa fa-sort-up\"></i><i class=\"fa fa-sort-down\"></i></span><span>Title</span></th>");},
		Column:function(inRow){return $("<td><a target=\"_blank\" href=\""+inRow.URL+"\">"+inRow.Title+"</a></td>");},
		Sort:function(inRow){return inRow.Title;}
	},
	Category:{
		Header:function(inRow){return $("<th><span><i class=\"fa fa-sort-up\"></i><i class=\"fa fa-sort-down\"></i></span><span>Category</span></th>");},
		Column:function(inRow){return $("<td>"+inRow.TaxCat[0]+"</td>");},
		Sort:function(inRow){return inRow.TaxCat[0];}
	},
	Location:{
		Header:function(inRow){return $("<th><span><i class=\"fa fa-sort-up\"></i><i class=\"fa fa-sort-down\"></i></span><span>Location</span></th>");},
		Column:function(inRow){return $("<td>"+inRow.TaxLoc[2]+",&nbsp;"+inRow.TaxLoc[1]+"</td>");},
		Sort:function(inRow){return inRow.TaxLoc[1];}
	}
}

Tabular.Create = function(inJQTable, inJSONArray, inGenerator)
{
	var obj = {};
	
	obj.JQ = {};
	obj.JQ.Table = inJQTable;
	obj.JQ.Header = $("<thead></thead>");
	obj.JQ.HeaderButtons = $();
	obj.JQ.ActiveSort = $();
	
	obj.Data = inJSONArray;
	obj.Generator = inGenerator;
	
	
	obj.MakeHeader = function(inField)
	{
		var context = {};
		context.JQ = $(inField.Header(null));
		context.JQ.addClass(Tabular.CSS.ClassSortNone);
		context.Sort = inField.Sort;
		context.SortRoutine = function(inA, inB)
		{
			inA = context.Sort(inA);
			inB = context.Sort(inB);
			
			if(inA > inB)
				return 1;
			
			if(inA < inB)
				return -1;
				
			return 0;
		};
		context.JQ.click(function()
		{
			if(context.JQ.hasClass(Tabular.CSS.ClassSort))
			{
				if(context.JQ.hasClass(Tabular.CSS.ClassSortAscending))
				{
					context.JQ.removeClass(Tabular.CSS.ClassSortAscending);
					context.JQ.addClass(Tabular.CSS.ClassSortDescending);
				}
				else
				{
					context.JQ.removeClass(Tabular.CSS.ClassSortDescending);
					context.JQ.addClass(Tabular.CSS.ClassSortAscending);
				}
				obj.Data.reverse();
				Tabular.Clear(obj);
				Tabular.Draw(obj);
			}
			else
			{
				obj.JQ.ActiveSort.removeClass(Tabular.CSS.ClassSort);
				obj.JQ.ActiveSort.removeClass(Tabular.CSS.ClassSortAscending);
				obj.JQ.ActiveSort.removeClass(Tabular.CSS.ClassSortDescending);
				
				obj.JQ.ActiveSort = context.JQ;
				
				obj.JQ.ActiveSort.addClass(Tabular.CSS.ClassSort);
				obj.JQ.ActiveSort.addClass(Tabular.CSS.ClassSortAscending);
				
				obj.Data.sort(context.SortRoutine);
				Tabular.Clear(obj);
				Tabular.Draw(obj);
			}
			
		});
		return context.JQ;
	};
	for(var Key in obj.Generator)
	{
		obj.JQ.HeaderButtons = obj.JQ.HeaderButtons.add(obj.MakeHeader(obj.Generator[Key]));
	}
	
	var tr = $("<tr></tr>");
	tr.append(obj.JQ.HeaderButtons);
	obj.JQ.Header.append(tr);
	obj.JQ.Table.append(obj.JQ.Header);
	
	Tabular.Draw(obj);
	
	return obj;
};
Tabular.Draw = function(inTabular)
{
	var page = $("<tbody></tbody>");
	var row;
	var cell;
	var i;
	for(i=0; i<inTabular.Data.length; i++)
	{
		row = $("<tr></tr>");
		for(var Key in inTabular.Generator)
		{
			row.append(inTabular.Generator[Key].Column(inTabular.Data[i]));
		}
		page.append(row);
	}
	inTabular.JQ.Table.append(page);
};
Tabular.Clear = function(inTabular)
{
	inTabular.JQ.Table.children("tbody").remove();
};
/*
var table = Tabular.Create($("table").eq(0), Feed, Tabular.Template.Basic);
*/

/*
function Iterate(inFunction)
{
	var i;
	var current;
	var output = [];
	for(i=0; i<Feed.length; i++)
	{
		current = Feed[i];
		if(inFunction(current))
		{
			output.push(current);
		}
	}
	return output;
}
function Category(inName)
{
	var name = inName.toLowerCase();
	return Iterate(function(inRow){
		return (inRow.TaxDiv[1].toLowerCase() === name);
	});
}
function Uniques()
{
	var matches = {};
	Iterate(function(inRow){
		
		var cat = inRow.TaxCat[0].toLowerCase();
		console.log(cat, matches[cat]);
		if(matches[cat] === undefined)
		{
			matches[cat] = [];
		}
		matches[cat].push(inRow);
	});
	return matches;
}
*/