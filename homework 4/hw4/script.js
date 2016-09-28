/** Global var to store all match data for the 2014 Fifa cup */
var teamData;

/** Global var for list of all elements that will populate the table.*/
var tableElements;

/* Global variables for sorting */
var currSort = '';
var ascInd = false;

/** Variables to be used when sizing the svgs in the table cells.*/
var cellWidth = 70,
    cellHeight = 20,
    cellBuffer = 15,
    barHeight = 20;

/**Set variables for commonly accessed data columns*/
var goalsMadeHeader = 'Goals Made',
    goalsConcededHeader = 'Goals Conceded';

/** Setup the scales*/
var goalScale = d3.scaleLinear()
    .range([cellBuffer, 2 * cellWidth - cellBuffer])

/**Used for games/wins/losses*/
var gameScale = d3.scaleLinear()
    .range([0, cellWidth - cellBuffer]);

/**Color scales*/
/**For aggregate columns*/
var aggregateColorScale = d3.scaleLinear()
    .range(['#ece2f0', '#016450']);

/**For goal Column*/
var goalColorScale = d3.scaleQuantize()
    .domain([-1, 1])
    .range(['#cb181d', '#034e7b']);

/**json Object to convert between rounds/results and ranking value*/
var rank = {
    "Winner": 7,
    "Runner-Up": 6,
    'Third Place': 5,
    'Fourth Place': 4,
    'Semi Finals': 3,
    'Quarter Finals': 2,
    'Round of Sixteen': 1,
    'Group': 0
};

var rev_rank = {
    7: "Winner",
    6: "Runner-Up",
    5: 'Third Place',
    4: 'Fourth Place',
    3: 'Semi Finals',
    2: 'Quarter Finals',
    1: 'Round of Sixteen',
    0: 'Group'
};

//For the HACKER version, comment out this call to d3.json and implement the commented out
// d3.csv call below.

// d3.json('data/fifa-matches.json',function(error,data){
//     teamData = data;
//     createTable();
//     updateTable();
// })


// // ********************** HACKER VERSION ***************************
// /**
//  * Loads in fifa-matches.csv file, aggregates the data into the correct format,
//  * then calls the appropriate functions to create and populate the table.
//  *
//  */

d3.csv("data/fifa-matches.csv", function (error, csvData) {

   // ******* TODO: PART I *******
    teamData = d3.nest()
    .key(function (d) {
        return d.Team;
    })
    .rollup(function (leaves) {
        return {
            "Wins": d3.sum(leaves,function(d){return d.Wins}),
            "Losses": d3.sum(leaves,function(d){return d.Losses}),
            "Goals Made": d3.sum(leaves,function(d){return d[goalsMadeHeader]}),
            "Goals Conceded": d3.sum(leaves,function(d){return d[goalsConcededHeader]}),
            "Delta Goals": d3.sum(leaves,function(d){return d["Delta Goals"]}),
            "TotalGames": leaves.length,
            "Result":  {
                "label": rev_rank[d3.max(leaves,function(d){return rank[d.Result]})],
                "ranking": d3.max(leaves,function(d){return rank[d.Result]})
            }, 
            "type": "aggregate",
            "games": 
                d3.nest()
                    .key(function (games) {
                        return games.Opponent;
                    })
                    .rollup(function(games) {
                        return {
                            "Wins": [], //d3.sum(games,function(d){return d.Wins}),
                            "Losses": [], //d3.sum(games,function(d){return d.Losses}),
                            "TotalGames": [],
                            "Goals Made": d3.sum(games,function(d){return d[goalsMadeHeader]}),
                            "Goals Conceded": d3.sum(games,function(d){return d[goalsConcededHeader]}),
                            "Delta Goals": d3.sum(games,function(d){return d["Delta Goals"]}),
                            "Result":  {
                                "label": rev_rank[d3.max(games,function(d){return rank[d.Result]})],
                                "ranking": d3.max(games,function(d){return rank[d.Result]})
                            }, 
                            "type": "game",
                            "Opponent": d3.max(games,function(d){return d.Team}),
                        }
                    })
                    .entries(leaves)
        }
    })
    .entries(csvData);

    console.log(teamData)
    createTable();
    updateTable();
});

// // ********************** END HACKER VERSION ***************************

/**
 * Loads in the tree information from fifa-tree.csv and calls createTree(csvData) to render the tree.
 *
 */
d3.csv("data/fifa-tree.csv", function (error, csvData) {

    //Create a unique "id" field for each game
    csvData.forEach(function (d, i) {
        d.id = d.Team + d.Opponent + i;
    });

    createTree(csvData);
});

/**
 * Creates a table skeleton including headers that when clicked allow you to sort the table by the chosen attribute.
 * Also calculates aggregate values of goals, wins, losses and total games as a function of country.
 *
 */
function createTable() {

    // ******* TODO: PART II *******

    // ********* Add x-axis to Goals Column header **************

    var tickCount = d3.max(teamData, function (d, i) {    
                return d.value["Goals Made"]})/2;

    goalScale
        .domain([0, d3.max(teamData, function (d, i) {    
            return d.value["Goals Made"];
        })])

    var goalAxis = d3.select("#goalHeader")
        .append("svg")
        .attr("id", "goal-Axis")
        .attr("width", cellWidth * 2)
        .attr("height", cellHeight + cellBuffer)

    var goalAxisGroup = d3.select("#goalHeader").select('#goal-Axis')
        .append("g")
        .attr("transform", "translate(0,20)")


    // create a new axis that has the ticks and labels on the top
    var goalAxis = d3.axisTop()
    // assign the scale to the axis
        .scale(goalScale)
        .ticks(tickCount)

    goalAxisGroup
        .call(goalAxis)


    // ********* Create list to populate table **************

    tableElements = teamData;   

    // ******* TODO: PART V *******

    header = d3.select("#matchTable").select("thead").selectAll("tr").selectAll("td")
        .on("click", sort)

    teamHeader = d3.select("#matchTable").select("thead").selectAll("tr").selectAll("th")
        .on("click", sort)
}

function sort() {

    collapseList()
    header = d3.select(this).text()

    if (header == 'Team') {
        if ((currSort == header) && (ascInd == true)) {
            tableElements = tableElements.sort(function (a,b) {return d3.descending(a.key, b.key)})
            ascInd = false
        }
        else {  
            tableElements = tableElements.sort(function (a,b) {return d3.ascending(a.key, b.key)})
            ascInd = true
        }
    }   
    if (header == ' Goals ') {
        if ((currSort == header) && (ascInd == false))   {
            tableElements = tableElements.sort(function (a,b) {return d3.ascending(a.value["Delta Goals"], b.value["Delta Goals"])})
            ascInd = true
        }
        else {
            tableElements = tableElements.sort(function (a,b) {return d3.descending(a.value["Delta Goals"], b.value["Delta Goals"])})
            ascInd = false
        }
    }
    if (header == 'Round/Result') {
        if ((currSort == header) && (ascInd == false))   {
            tableElements = tableElements.sort(function (a,b) {return d3.ascending(a.value.Result.ranking, b.value.Result.ranking)})
            ascInd = true
        }
        else {
            tableElements = tableElements.sort(function (a,b) {return d3.descending(a.value.Result.ranking, b.value.Result.ranking)})
            ascInd = false
        }
    }
    if (header == 'Wins') {
        if ((currSort == header) && (ascInd == false))   {
            tableElements = tableElements.sort(function (a,b) {return d3.ascending(a.value.Wins, b.value.Wins)})
            ascInd = true
        }
        else {
            tableElements = tableElements.sort(function (a,b) {return d3.descending(a.value.Wins, b.value.Wins)})
            ascInd = false
        }
    }
    if (header == 'Losses') {
        if ((currSort == header) && (ascInd == false))   {
            tableElements = tableElements.sort(function (a,b) {return d3.ascending(a.value.Losses, b.value.Losses)})
            ascInd = true
        }
        else {
            tableElements = tableElements.sort(function (a,b) {return d3.descending(a.value.Losses, b.value.Losses)})
            ascInd = false
        }
    }
    if (header == 'Total Games') {
        if ((currSort == header) && (ascInd == false))   {
            tableElements = tableElements.sort(function (a,b) {return d3.ascending(a.value.TotalGames, b.value.TotalGames)})
            ascInd = true 
        }
        else {
            tableElements = tableElements.sort(function (a,b) {return d3.descending(a.value.TotalGames, b.value.TotalGames)})
            ascInd = false
        }   
    }
    currSort = header
    updateTable()
}
/**
 * Updates the table contents with a row for each element in the global variable tableElements.
 *
 */
function updateTable() {

    // ******* TODO: PART III *******

    goalScale
        .domain([0, d3.max(teamData, function (d, i) {    
            return d.value["Goals Made"];
        })])

    gameScale
        .domain([0, d3.max(teamData, function (d, i) {    
            return d.value["TotalGames"];
        })])

    d3.select("#matchTable").select("tbody").selectAll("tr")
        .remove()

    tr = d3.select("#matchTable").select("tbody").selectAll("tr").data(tableElements)  
        .enter()
        .append('tr')

    var td = tr.selectAll("td")
        .data( function (d) {
        return [{"type": d.value["type"], "vis": "team", "value": d.key},
                {"type": d.value["type"], "vis": "goals", "value": {
                    "Goals Made": d.value["Goals Made"],
                    "Goals Conceded": d.value["Goals Conceded"],
                    "Delta Goals": d.value["Delta Goals"]}
                },
                {"type": d.value["type"], "vis": "result", "value": d.value.Result["label"]},
                {"type": d.value["type"], "vis": "bars", "value": d.value["Wins"]},
                {"type": d.value["type"], "vis": "bars", "value": d.value["Losses"]},
                {"type": d.value["type"], "vis": "bars", "value": d.value["TotalGames"]}]

        })  

    td
        .enter()
        .append("td")
        .style("padding-left", 0)

    aggregateColorScale
        .domain([0, d3.max(teamData, function (d, i) {    
            return d.value["TotalGames"];
        })])

    td_bars = d3.select("#matchTable").select("tbody").selectAll("td")
        .filter(function (d) {
            return d.vis == 'bars'
        })
        .append("svg")
            .attr("width", cellWidth + cellBuffer)
            .attr("height", cellHeight)
            .append("g")

    td_bars_rect = td_bars
        .append("rect")
        .attr("width", function (d) {
            return gameScale(d.value)
        })
        .attr("height", barHeight)
        .attr('fill', function (d) {
            return aggregateColorScale(d.value);
        })

    td_bars_text = td_bars
        .append("text")
        .attr("width", function (d) {
            return gameScale(d.value)
        })
        .attr("x", function (d) {
            return Math.max(0,gameScale(d.value) - 10)
        })
        .attr("y", cellBuffer)
        .attr("fill", "white")
        .text(function (d) {
            return d.value
        })

    td_team = d3.select("#matchTable").select("tbody").selectAll("td")
        .filter(function (d) {
            return d.vis == 'team'
        })
        .attr("width", cellWidth*5)
        .attr("class", function (d) {return d.type + "TeamName"})
        .text(function (d) {
            if (d.type == "game") {return "x" + d.value}
            else {return d.value}
        })

    td_result = d3.select("#matchTable").select("tbody").selectAll("td")
        .filter(function (d) {
            return d.vis == 'result'
        })
        .append("svg")
            .attr("width", cellWidth*2)
            .attr("height", cellHeight)
            .append("text")
            .text(function (d) {
                return d.value
            })
            .attr("y", cellBuffer)
            .attr("x", 5)

    td_goals = d3.select("#matchTable").select("tbody").selectAll("td")
        .filter(function (d) {
            return d.vis == 'goals'
        })
        .append("svg")
            .attr("width", 2 * cellWidth)
            .attr("height", cellHeight)

    td_delta_goals = td_goals     
        .append("rect")
        .classed("goalBar", true)
        .attr("fill", function (d) {
            if (d.value["Delta Goals"] > 0) {return "#6594b0"}
            else {return "#e27375"}                
        })
        .attr("x", function (d) {
            if (d.value["Goals Conceded"] < d.value["Goals Made"]) {
                return goalScale(d.value["Goals Conceded"])
            }
            else {return goalScale(d.value["Goals Made"])}
        })
        .attr("width", function (d) {
            if (d.value["Goals Conceded"] > d.value["Goals Made"]) {
                return goalScale(d.value["Goals Conceded"]) - goalScale(d.value["Goals Made"])
            }
            else {return goalScale(d.value["Goals Made"]) - goalScale(d.value["Goals Conceded"])}    
        })
        .attr("height", function (d) {
            if (d.type == "aggregate") {return 10}
            else {return 5} 
        })
        .attr("y", function (d) {
            if (d.type == "aggregate") {return 5}
            else {return 8} 
        })

    td_goals_made = td_goals
        .filter(function (d) {
            return d.value["Delta Goals"] != 0
        })
        .append("circle")
        .attr("class", function (d) {return d.type + "GoalsMade"})
        .classed("goalCircle", true)
        .attr("cx", function (d) {
            return goalScale(d.value["Goals Made"])
        })
        .attr("cy", 10)

    td_goals_conceded = td_goals
        .filter(function (d) {
            return d.value["Delta Goals"] != 0
        })
        .append("circle")
        .attr("class", function (d) {return d.type + "GoalsConceded"})
        .classed("goalCircle", true)
        .attr("cx", function (d) {
            return goalScale(d.value["Goals Conceded"])
        })
        .attr("cy", 10)

    td_goals_equal = td_goals
        .filter(function (d) {
            return d.value["Delta Goals"] == 0
        })
        .append("circle")
        .attr("class", function (d) {return d.type + "GoalsEqual"})
        .classed("goalCircle", true)
        .attr("cx", function (d) {
            return goalScale(d.value["Goals Conceded"])
        })
        .attr("cy", 10)

    tr.on("click", updateList)

    logo = d3.select("#logo")

    logo.on("click", collapseList)
};


/**
 * Collapses all expanded countries, leaving only rows for aggregate values per country.
 *
 */
function collapseList() {

    // ******* TODO: PART IV *******
    var i = 0
    while (i < tableElements.length) {
        if (tableElements[i].value.type == "game") {tableElements.splice(i, 1)}
        else {i++}
    }
    updateTable()
}

/**
 * Updates the global tableElements variable, with a row for each row to be rendered in the table.
 *
 */
function updateList(d,i) {

    // ******* TODO: PART IV *******

    if (d.value.type == "aggregate") {
        if ((i < tableElements.length - 1) && (tableElements[i + 1].value.type == "game")) {
            while ((i < tableElements.length - 1) && (tableElements[i + 1].value.type == "game")) {
                tableElements.splice(i + 1, 1)
            }
        }
        else {
            for (game in d.value.games) {
                tableElements.splice(i+1, 0, d.value.games[game])
            }
        }
    }
    updateTable()

}

/**
 * Creates a node/edge structure and renders a tree layout based on the input data
 *
 * @param treeData an array of objects that contain parent/child information.
 */
function createTree(treeData) {

    // ******* TODO: PART VI *******


};

/**
 * Updates the highlighting in the tree based on the selected team.
 * Highlights the appropriate team nodes and labels.
 *
 * @param team a string specifying which team was selected in the table.
 */
function updateTree(row) {

    // ******* TODO: PART VII *******


}

/**
 * Removes all highlighting from the tree.
 */
function clearTree() {

    // ******* TODO: PART VII *******
    

}



