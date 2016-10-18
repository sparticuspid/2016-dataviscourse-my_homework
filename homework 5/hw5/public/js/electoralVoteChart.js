
/**
 * Constructor for the ElectoralVoteChart
 *
 * @param shiftChart an instance of the ShiftChart class
 */
function ElectoralVoteChart(shiftChart){

    var self = this;
    self.shiftChart = shiftChart;

    self.init();
};

/**
 * Initializes the svg elements required for this chart
 */
ElectoralVoteChart.prototype.init = function(){
    var self = this;
    self.margin = {top: 30, right: 20, bottom: 30, left: 50};

    //Gets access to the div element created for this chart from HTML
    var divelectoralVotes = d3.select("#electoral-vote").classed("content", true);
    self.svgBounds = divelectoralVotes.node().getBoundingClientRect();
    self.svgWidth = self.svgBounds.width - self.margin.left - self.margin.right;
    self.svgHeight = 150;
    self.textPostion = 40;
    self.chartPosition = 50;

    //creates svg element within the div
    self.svg = divelectoralVotes.append("svg")
        .attr("width",self.svgWidth)
        .attr("height",self.svgHeight)
};

/**
 * Returns the class that needs to be assigned to an element.
 *
 * @param party an ID for the party that is being referred to.
 */
ElectoralVoteChart.prototype.chooseClass = function (party) {
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
 * Creates the stacked bar chart, text content and tool tips for electoral vote chart
 *
 * @param electionResult election data for the year selected
 * @param colorScale global quantile scale based on the winning margin between republicans and democrats
 */

ElectoralVoteChart.prototype.update = function(electionResult, colorScale){
    var self = this;

    var electoralScale = d3.scaleLinear()
        .range([50, 1000])//.range([self.margin.left, self.svgWidth])
        .domain([0, d3.sum(electionResult, function (d) {return d.Total_EV})])

    console.log(colorScale)
    // ******* TODO: PART II *******

    //Group the states based on the winning party for the state;
    //then sort them based on the margin of victory

    var electionResult = electionResult.sort(function (a,b) { 
        return d3.ascending(a.State_Winner, b.State_Winner) || d3.descending(a.RD_Difference, b.RD_Difference)
    })

    console.log(electionResult)
    //Create the stacked bar chart.
    //Use the global color scale to color code the rectangles.
    //HINT: Use .electoralVotes class to style your bars.

    var electoralVote = d3.select('#electoral-vote').select('svg')

    electoralVote.selectAll('rect')
        .remove()

    electoralVote.selectAll('text')
        .remove()

    var bars = electoralVote.selectAll('rect').data(electionResult)
        .enter()
        .append('rect')
        .attr('width', function (d) {return electoralScale(d.Total_EV)})
        .attr('x', function (d,i) {return electoralScale(d3.sum(electionResult.slice(0,i), function (d) {return d.Total_EV}))})
        .attr('y', 50)
        .attr('height', 25)
        //.attr('fill', function (d) {return colorScale(d.RD_Difference)})
        .classed('electoralVotes', true)


    //Display total count of electoral votes won by the Democrat and Republican party
    //on top of the corresponding groups of bars.
    //HINT: Use the .electoralVoteText class to style your text elements;  Use this in combination with
    // chooseClass to get a color based on the party wherever necessary

    electoralVote.append('text')
        .text(d3.max(electionResult, function (d) {return d.D_EV_Total}))
        .attr('x', electoralScale(d3.max(electionResult, function (d) {
            if (d.I_EV_Total == '') {return 0}
            else {return d.I_EV_Total}
        })))
        .attr('y', 40)//self.textPostion)
        .attr('width', 200)
        .attr('class', ElectoralVoteChart.prototype.chooseClass('D'))
        .classed('electoralVoteText', true)

    electoralVote.append('text')
        .text(d3.max(electionResult, function (d) {return d.R_EV_Total}))
        .attr('x', 1000)
        .attr('y', 40)//self.textPostion)
        .attr('width', 200)
        .attr('class', ElectoralVoteChart.prototype.chooseClass('R'))
        .classed('electoralVoteText', true)

    electoralVote.append('text')
        .text(d3.max(electionResult, function (d) {return d.I_EV_Total}))
        .attr('x', 50)
        .attr('y', 40)//self.textPostion)
        .attr('width', 200)
        .attr('class', ElectoralVoteChart.prototype.chooseClass('I'))
        .classed('electoralVoteText', true)

    //Display a bar with minimal width in the center of the bar chart to indicate the 50% mark
    //HINT: Use .middlePoint class to style this bar.

    electoralVote.append('line')
        .attr("x1", 500)//self.svgWidth/2)
        .attr("y1", 25)
        .attr("x2", 500)//self.svgWidth/2)
        .attr("y2", 60)
        .classed('middlePoint', true)

    // electoralVote.append('text')
    //Just above this, display the text mentioning the total number of electoral votes required
    // to win the elections throughout the country
    //HINT: Use .electoralVotesNote class to style this text element

    electoralVote.append('text')
        .text('Electoral Vote (270 needed to win)')
        .classed('electoralVotesNote', true)
        .attr('x', 500)//self.svgWidth/2)
        .attr('y', 40)//self.textPostion)
        .attr('width', 200)

    //HINT: Use the chooseClass method to style your elements based on party wherever necessary.

    //******* TODO: PART V *******
    //Implement brush on the bar chart created above.
    //Implement a call back method to handle the brush end event.
    //Call the update method of shiftChart and pass the data corresponding to brush selection.
    //HINT: Use the .brush class to style the brush.

};
