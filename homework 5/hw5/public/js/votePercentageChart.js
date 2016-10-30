/**
 * Constructor for the Vote Percentage Chart
 */
function VotePercentageChart(){

    var self = this;
    self.init();
};

/**
 * Initializes the svg elements required for this chart
 */
VotePercentageChart.prototype.init = function(){
    var self = this;

    self.margin = {top: 30, right: 20, bottom: 30, left: 50};
    var divvotesPercentage = d3.select("#votes-percentage").classed("content", true);

    //Gets access to the div element created for this chart from HTML
    self.svgBounds = divvotesPercentage.node().getBoundingClientRect();
    self.svgWidth = self.svgBounds.width - self.margin.left - self.margin.right;
    self.svgHeight = 200;

    self.percentageTextPosition = 50;
    self.nomineeTextPosition = 20;
    self.textWidth = 200;
    self.nomineeTextWidth = 200;

    self.chartPosition = 60;
    self.chartHeight = 35;

    //creates svg element within the div
    self.svg = divvotesPercentage.append("svg")
        .attr("width",self.svgWidth)
        .attr("height",self.svgHeight)
};

/**
 * Returns the class that needs to be assigned to an element.
 *
 * @param party an ID for the party that is being referred to.
 */
VotePercentageChart.prototype.chooseClass = function (party) {
    var self = this;
    if (party == "R"){
        return "republican";
    }
    else if (party == "D"){
        return "democrat";
    }
    else if (party == "I"){
        return "independent";
    }
}

/**
 * Renders the HTML content for tool tip
 *
 * @param tooltip_data information that needs to be populated in the tool tip
 * @return text HTML content for toop tip
 */
VotePercentageChart.prototype.tooltip_render = function (tooltip_data) {
    var self = this;
    var text = "<ul>";
    tooltip_data.result.forEach(function(row){
        text += "<li class = " + self.chooseClass(row.party)+ ">" + row.nominee+":\t\t"+row.votecount+"("+row.percentage+"%)" + "</li>"
    });

    return text;
}

/**
 * Creates the stacked bar chart, text content and tool tips for Vote Percentage chart
 *
 * @param electionResult election data for the year selected
 */
VotePercentageChart.prototype.update = function(electionResult){
    var self = this;

    //for reference:https://github.com/Caged/d3-tip
    //Use this tool tip element to handle any hover over the chart
    tip = d3.tip().attr('class', 'd3-tip')
        .direction('s')
        .offset(function() {
            return [0,0];
        })
        .html(function(d) {
            /* populate data in the following format
             * tooltip_data = {
             * "result":[
             * {"nominee": D_Nominee_prop,"votecount": D_Votes_Total,"percentage": D_PopularPercentage,"party":"D"} ,
             * {"nominee": R_Nominee_prop,"votecount": R_Votes_Total,"percentage": R_PopularPercentage,"party":"R"} ,
             * {"nominee": I_Nominee_prop,"votecount": I_Votes_Total,"percentage": I_PopularPercentage,"party":"I"}
             * ]
             * }
             * pass this as an argument to the tooltip_render function then,
             * return the HTML content returned from that method.
             * */
            return ;
        });


    // ******* TODO: PART III *******

    //Create the stacked bar chart.
    //Use the global color scale to color code the rectangles.
    //HINT: Use .votesPercentage class to style your bars.

    var votePercentage = d3.select('#votes-percentage').select('svg')

    votePercentage.selectAll('.votesPercentage')
        .remove()

    votePercentage.selectAll('text')
        .remove()

    oneElectionResult = electionResult[0]

    votePercentageData = [{"nominee": oneElectionResult.I_Nominee_prop,
                        "votecount": oneElectionResult.I_Votes_Total,
                        "percentage": oneElectionResult.I_PopularPercentage.slice(0,oneElectionResult.I_PopularPercentage.length - 1),
                        "percentage_str": oneElectionResult.I_PopularPercentage,
                        "party":"I"},
                        {"nominee": oneElectionResult.D_Nominee_prop,
                        "votecount": oneElectionResult.D_Votes_Total,
                        "percentage": oneElectionResult.D_PopularPercentage.slice(0,oneElectionResult.D_PopularPercentage.length - 1),
                        "percentage_str": oneElectionResult.D_PopularPercentage,
                        "party":"D"},
                        {"nominee": oneElectionResult.R_Nominee_prop,
                        "votecount": oneElectionResult.R_Votes_Total,
                        "percentage": oneElectionResult.R_PopularPercentage.slice(0,oneElectionResult.R_PopularPercentage.length - 1),
                        "percentage_str": oneElectionResult.R_PopularPercentage,
                        "party":"R"}]

    var popularVoteScale = d3.scaleLinear()
        .range([0, self.svgWidth - self.margin.left])
        .domain([0, d3.sum(votePercentageData, function (d) {return d.percentage})])

    var bars = votePercentage.selectAll('.votesPercentage').data(votePercentageData)
        .enter()
        .append('rect')
        .attr('x', function (d, i) {return self.margin.left + popularVoteScale(d3.sum(votePercentageData.slice(0,i), function (d) {return d.percentage}))})
        .attr('y', self.chartPosition)
        .attr('height', self.chartHeight)
        .attr('width', function (d) {return popularVoteScale(d.percentage)})
        .attr('class', function (d) {return VotePercentageChart.prototype.chooseClass(d.party)})
        .classed('votesPercentage', true)

    //Display the total percentage of votes won by each party
    //on top of the corresponding groups of bars.
    //HINT: Use the .votesPercentageText class to style your text elements;  Use this in combination with
    // chooseClass to get a color based on the party wherever necessary

    votePercentage.selectAll('.votesPercentageText').data(votePercentageData)
        .enter()
        .append('text')
        .text(function (d) {return d.percentage_str})
        .attr('x', function (d, i) {
            if (d.party == 'I') {return self.margin.left}
            else if (d.party == 'D') {
                if (votePercentageData[0].percentage == '') {return self.margin.left}
                else {return 30 + self.margin.left + Math.max(popularVoteScale(votePercentageData[0].percentage),self.textWidth)}
            }
            else if (d.party == 'R') {return self.margin.left + popularVoteScale(d3.sum(votePercentageData, function (d) {return d.percentage}))}
        })
        .attr('y', self.percentageTextPosition)
        .attr('width', self.textWidth)
        .attr('class', function (d) {return VotePercentageChart.prototype.chooseClass(d.party)})
        .classed('votesPercentageText', true)

    votePercentage.selectAll('.nomineeText').data(votePercentageData)
        .enter()
        .append('text')
        .text(function (d) {return d.nominee})
        .attr('x', function (d, i) {
            if (d.party == 'I') {return self.margin.left}
            else if (d.party == 'D') {
                if (votePercentageData[0].percentage == '') {return self.margin.left}
                else {return self.margin.left + Math.max(popularVoteScale(votePercentageData[0].percentage),self.nomineeTextWidth)}
            }
            else if (d.party == 'R') {return self.margin.left + popularVoteScale(d3.sum(votePercentageData, function (d) {return d.percentage}))}
        })
        .attr('y', self.nomineeTextPosition)
        .attr('width', self.nomineeTextWidth)
        .attr('class', function (d) {return VotePercentageChart.prototype.chooseClass(d.party)})
        .classed('nomineeText', true)

    //Display a bar with minimal width in the center of the bar chart to indicate the 50% mark
    //HINT: Use .middlePoint class to style this bar.

    votePercentage.append('rect')
        .attr("width", 2)
        .attr("height", self.chartHeight + 10)
        .attr("x", (self.margin.left + self.svgWidth)/2)
        .attr("y", 55)
        .classed('middlePoint', true)

    //Just above this, display the text mentioning details about this mark on top of this bar
    //HINT: Use .votesPercentageNote class to style this text element

    votePercentage.append('text')    
        .text('Popular Vote (50%)')
        .classed('votesPercentageNote', true)
        .attr('x', (self.margin.left + self.svgWidth)/2)
        .attr('y', self.percentageTextPosition - 5)
        .attr('width', self.textWidth)

    //Call the tool tip on hover over the bars to display stateName, count of electoral votes.
    //then, vote percentage and number of votes won by each party.

    //HINT: Use the chooseClass method to style your elements based on party wherever necessary.

};
