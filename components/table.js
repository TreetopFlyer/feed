angular.module("Tabular", [])
.config(function($sceDelegateProvider) {
    $sceDelegateProvider.resourceUrlWhitelist([
        'http://localhost/**'
    ]);
})
.factory("Download", ["$http", function($http)
{
    return function(inURL, inDone)
    {
        var data = {
            Header: undefined,
            Rows: [],
            Uniques: [],
        };
        data.Pivot = function(inIndex)
        {
            var i;
            var output;
            var row;
            var cell;
            var match;

            output = [];

            for(i=0; i<data.Rows.length; i++)
            {
                row = data.Rows[i]
                cell = row[inIndex];
                match = false;

                for(j=0; j<output.length; j++)
                {
                    if(cell == LUT[j].Value)
                    {
                        match = true;
                        LUT[j].Rows.push(row);
                        break;
                    }
                }
                if(!match)
                {
                    LUT.push({
                        Value: cell,
                        Rows: [row]
                    });
                }
            }
        };
        var config = {
            step: function(inRow)
            {
                var i, j, k;
                var cell;
                var row;
                var match;
                var LUT;

                row = inRow.data[0];

                if(data.Header === undefined)
                {
                    data.Header = row;
                    for(i=0; i<row.length; i++)
                    {
                        data.Uniques[i] = {
                            Title:row[i],
                            Uniques:[]
                        }
                    }
                }
                else
                {
                    data.Rows.push(row);
                    for(i=0; i<row.length; i++)
                    {
                        cell = row[i];
                        match = false;
                        LUT = data.Uniques[i].Uniques;
                        for(j=0; j<LUT.length; j++)
                        {
                            if(cell == LUT[j].Value)
                            {
                                match = true;
                                LUT[j].Rows.push(row);
                                break;
                            }
                        }
                        if(!match)
                        {
                            LUT.push({
                                Value: cell,
                                Rows: [row]
                            });
                        }
                    }
                }
            },
            complete: function(){
                inDone(data);
            }
        };
        $http.get(inURL).then(function(inResponse)
        {
            Papa.parse(inResponse.data, config);
        });
    };
}])
.factory("Table", ["$http", function($http)
{
    var obj = {};
    obj.Create = function(inURL)
    {
        var Table = {};
        Table.Header = undefined;
        Table.Rows = [];
        Table.Visible = [];

        Table.Column = -1;
        Table.ColumnDirection = 1;

        Table.PagingOptions = [20, 50, 100, 200];
        Table.PageRadius = 1;

        Table.PerPage = Table.PagingOptions[0];
        Table.Pages = [];
        Table.Page = 0;
        Table.PageMin = 0;
        Table.PageMax = 0;

        // re-cut the data into pages of size Table.PerPage
        Table.UpdatePagination = function()
        {
            Table.Pages = [];
            Table.Page = 0;
            for(var i=0; i<Math.ceil(Table.Rows.length / Table.PerPage)-1; i++)
            {
                Table.Pages.push({
                    index: i,
                    min: i*Table.PerPage,
                    max: (i+1)*Table.PerPage,
                    active: false
                });
            }
            Table.Pages.push({
                index: i,
                min: i*Table.PerPage,
                max: Table.Rows.length,
                active: false
            });
            Table.SetPage(0);
        };
        Table.SetPage = function(inIndex)
        {
            Table.Page.active = false;
            Table.Page = Table.Pages[inIndex];
            Table.Page.active = true;
            Table.Visible = [];
            for(var i=Table.Page.min; i<Table.Page.max; i++)
            {
                Table.Visible.push(Table.Rows[i]);
            }

            Table.PageMin = Table.Page.index - Table.PageRadius;
            if(Table.PageMin < 0)
            {
                Table.PageMin = 0;
            }
            Table.PageMax = Table.Page.index + Table.PageRadius;
            if(Table.PageMin >= Table.Pages.length-1)
            {
                Table.PageMax = Table.Pages.length-1;
            }
        };
        Table.InRange = function(inIndex)
        {
            if(inIndex >= Table.PageMin && inIndex <= Table.PageMax)
            {
                return true;
            }
            return false;
        };
        Table.SetSort = function(inIndex)
        {
            if(Table.Column == inIndex)
            {
                Table.ColumnDirection *= -1;
            }
            else
            {
                Table.Column = inIndex;
                Table.ColumnDirection = 1;
            }
            
            Table.Rows.sort(function(a, b)
            {
                var aProp = a[inIndex].toUpperCase();
                var bProp = b[inIndex].toUpperCase();
                return (aProp === bProp ? 0 : (aProp < bProp ? -Table.ColumnDirection : Table.ColumnDirection));
            });
            Table.UpdatePagination();
        }


        Table.Populate = function(inArrayHeader, inArrayRows)
        {
            Table.Header = inArrayHeader;
            Table.Rows = inArrayRows;
            Table.UpdatePagination();
        };

        return Table;
    };
    return obj;
}]);