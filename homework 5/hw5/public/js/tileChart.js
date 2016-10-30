/**
 * Constructor for the TileChart
 */
function TileChart(){

    var self = this;
    self.init();
};

/**
 * Initializes the svg elements required to lay the tiles
 * and to populate the legend.
 */
TileChart.prototype.init = function(){
    var self = this;

    //Gets access to the div element created for this chart and legend element from HTML
    var divTileChart = d3.select("#tiles").classed("content", true);
    var legend = d3.select("#legend").classed("content",true);
    self.margin = {top: 30, right: 20, bottom: 30, left: 50};

    var svgBounds = divTileChart.node().getBoundingClientRect();
    self.svgWidth = svgBounds.width - self.margin.left - self.margin.right;
    self.svgHeight = self.svgWidth/2;
    var legendHeight = 150;

    self.delta = .015
    self.tileWidth = 1 - self.delta
    self.tileHeight = 1 - self.delta
    
    //creates svg elements within the div
    self.legendSvg = legend.append("svg")
        .attr("width",self.svgWidth)
        .attr("height",legendHeight)
        .attr("transform", "translate(" + self.margin.left + ",0)")

    self.svg = divTileChart.append("svg")
                        .attr("width",self.svgWidth)
                        .attr("height",self.svgHeight)
                        .attr("transform", "translate(" + self.margin.left + ",0)")
                        .style("bgcolor","green")

};

/**
 * Returns the class that needs to be assigned to an element.
 *
 * @param party an ID for the party that is being referred to.
 */
TileChart.prototype.chooseClass = function (party) {
    var self = this;
    if (party == "R"){
        return "republican";
    }
    else if (party== "D"){
        return "democrat";
    }
    else if (party == "I"){
        return "independent";
    }
}

/**
 * Renders the HTML content for tool tip.
 *
 * @param tooltip_data information that needs to be populated in the tool tip
 * @return text HTML content for tool tip
 */
TileChart.prototype.tooltip_render = function (tooltip_data) {
    var self = this;
    var text = "<h2 class ="  + self.chooseClass(tooltip_data.winner) + " >" + tooltip_data.state + "</h2>";
    text +=  "Electoral Votes: " + tooltip_data.electoralVotes;
    text += "<ul>"
    tooltip_data.result.forEach(function(row){
        text += "<li class = " + self.chooseClass(row.party)+ ">" + row.nominee+":\t\t"+row.votecount+"("+row.percentage+"%)" + "</li>"
    });
    text += "</ul>";
    return text;
}

/**
 * Creates tiles and tool tip for each state, legend for encoding the color scale information.
 *
 * @param electionResult election data for the year selected
 * @param colorScale global quantile scale based on the winning margin between republicans and democrats
 */
TileChart.prototype.update = function(electionResult, colorScale){
    var self = this;

    //Calculates the maximum number of columns to be laid out on the svg
    self.maxColumns = d3.max(electionResult,function(d){
                                return parseInt(d["Space"]);
                            });

    //Calculates the maximum number of rows to be laid out on the svg
    self.maxRows = d3.max(electionResult,function(d){
                                return parseInt(d["Row"]);
                        });
    //for reference:https://github.com/Caged/d3-tip
    //Use this tool tip eelectionResultlement to handle any hover over the chart


    tip = d3.tip().attr('class', 'd3-tip')
        .direction('se')
        .offset(function() {
            return [0,0];
        })
        .html(function(d) {
            /* populate data in the following format
             * tooltip_data = {
             * "state": State,
             * "winner":d.State_Winner
             * "electoralVotes" : Total_EV
             * "result":[
             * {"nominee": D_Nominee_prop,"votecount": D_Votes,"percentage": D_Percentage,"party":"D"} ,
             * {"nominee": R_Nominee_prop,"votecount": R_Votes,"percentage": R_Percentage,"party":"R"} ,
             * {"nominee": I_Nominee_prop,"votecount": I_Votes,"percentage": I_Percentage,"party":"I"}
             * ]
             * }
             * pass this as an argument to the tooltip_render function then,
             * return the HTML content returned from that method.
             * */

            // populate data in the following format
            tooltip_data = {
                "state": d.State,
                "winner": d.State_Winner,
                "electoralVotes" : d.Total_EV,
                "result":[
                    {"nominee": d.D_Nominee_prop,"votecount": d.D_Votes,"percentage": d.D_Percentage,"party":"D"},
                    {"nominee": d.R_Nominee_prop,"votecount": d.R_Votes,"percentage": d.R_Percentage,"party":"R"},
                    {"nominee": d.I_Nominee_prop,"votecount": d.I_Votes,"percentage": d.I_Percentage,"party":"I"}
                ]
            }

            // pass this as an argument to the tooltip_render function then,
            // return the HTML content returned from that method.
            html_content = self.tooltip_render(tooltip_data)
            return html_content;
        });

    var numCells = 10

    var legendScale = d3.scaleLinear()
        .range([0, self.svgWidth - self.margin.left])
        .domain([0, numCells])

    //Creates a legend element and assigns a scale that needs to be visualized
    self.legendSvg.append("g")
        .attr("class", "legendQuantile")
        .attr("transform", "translate(50,0)");

    var legendQuantile = d3.legendColor()
        .shapeWidth(legendScale(self.tileWidth))
        .cells(10)
        .orient('horizontal')
        .scale(colorScale)

    self.legendSvg.select(".legendQuantile")
        .call(legendQuantile);

    // ******* TODO: PART IV *******
    //Tansform the legend element to appear in the center and make a call to this element for it to display.

    // self.legendSvg
    //     .call(d3.legend)

    //Lay rectangles corresponding to each state according to the 'row' and 'column' information in the data.

    var maxRow = 8
    var maxColumn = 12

    var rowScale = d3.scaleLinear()
        .range([0, self.svgHeight])
        .domain([0, maxRow])

    var columnScale = d3.scaleLinear()
        .range([0, self.svgWidth - self.margin.left])
        .domain([0, maxColumn])

    var tileChart = d3.select("#tileChart").select('#tiles').select('svg')

    tileChart.selectAll('text')
        .remove()

    var tiles = tileChart.selectAll('rect').data(electionResult)

    tiles
        .enter()
        .append('rect')
        .merge(tiles)
        .attr('y', function (d) {return rowScale(d.Row)})
        .attr('x', function (d) {return self.margin.left + columnScale(d.Space)})
        .attr('fill', function (d) {
            if (d.State_Winner =="I") {return '#45AD6A'}
            else {return colorScale(d.RD_Difference)}
        })
        .attr('width', columnScale(self.tileWidth))
        .attr('height', rowScale(self.tileHeight))
        .classed('tile', true)

    tiles
        .exit()
        .remove()

    //Display the state abbreviation and number of electoral votes on each of these rectangles

    tileChart.selectAll('.stateAbbreviationText').data(electionResult)
        .enter()
        .append('text')
        .text(function (d) {return d.Abbreviation})
        .attr('y', function (d) {return rowScale(+d.Row + self.tileHeight*(3/7))})
        .attr('x', function (d) {return self.margin.left + columnScale(+d.Space + self.tileWidth/2)})
        .attr('width', columnScale(self.tileWidth))
        .attr('height', rowScale(self.tileHeight))
        .classed('tilestext', true)
        .classed('stateAbbreviationText', true)

    tileChart.selectAll('.electoralVotesText').data(electionResult)
        .enter()
        .append('text')
        .text(function (d) {return d.Total_EV})
        .attr('y', function (d) {return rowScale(+d.Row + self.tileHeight*(6/7))})
        .attr('x', function (d) {return self.margin.left + columnScale(+d.Space + self.tileWidth/2)})
        .attr('width', columnScale(self.tileWidth))
        .attr('height', rowScale(self.tileHeight))
        .classed('tilestext', true)
        .classed('electoralVotesText', true)

    tiles
        .call(tip)

    //Use global color scale to color code the tiles.

    //HINT: Use .tile class to style your tiles;
    // .tilestext to style the text corresponding to tiles

    //Call the tool tip on hover over the tiles to display stateName, count of electoral votes
    //then, vote percentage and number of votes won by each party.
    //HINT: Use the .republican, .democrat and .independent classes to style your elements.

    tiles
        .on("mouseover", tip.show)
        .on("mouseout", tip.hide)

};
