// Global var for FIFA world cup data
var allWorldCupData;
var selectedCountry;
var barClickData;

/**
 * Render and update the bar chart based on the selection of the data type in the drop-down box
 *
 * @param selectedDimension a string specifying which dimension to render in the bar chart
 */
function updateBarChart(selectedDimension) {

    var svgBounds = d3.select("#barChart").node().getBoundingClientRect(),
        xAxisWidth = 100,
        yAxisHeight = 70;

    // ******* TODO: PART I *******

    // Create the x and y scales; make
    // sure to leave room for the axes

    var padding = 25;
    var height = 400;
    var width = 500;
    var textWidth = 50;
    var epsilom = 1;

    var xScale = d3.scaleBand()
        .domain(allWorldCupData.map(function (d) {
            return d.year; 
    }))
        .range([width - padding*2 - textWidth - epsilom, 0]).padding(.1)

    var yScale = d3.scaleLinear()
        .domain([0, d3.max(allWorldCupData, function (d) {
            return d[selectedDimension];
        })])
        .range([height - textWidth - padding*2, 0]);

    // Create colorScale

    var colorScale = d3.scaleLinear()
        .domain([d3.min(allWorldCupData, function (d) {
            return d[selectedDimension];
        }), 0, d3.max(allWorldCupData, function (d) {
            return d[selectedDimension];
        })])
        .range(["darkred", "lightgray", "steelblue"]);

    // Create the axes (hint: use #xAxis and #yAxis)

    var xAxisGroup = d3.select('#xAxis')
        .attr("transform", "translate("  + (textWidth + padding) + ", " + (height - padding - textWidth) +")")

    // create a new axis that has the ticks and labels on the bottom
    var xAxis = d3.axisBottom()
    // assign the scale to the axis
        .scale(xScale)

    xAxisGroup
        .call(xAxis)

    xAxisGroup.selectAll("text")  
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", "-.3em")
        .attr("transform", "rotate(-90)" );

    var yAxisGroup = d3.select('#yAxis')
        .attr("transform", "translate(" + (padding + textWidth) + "," + padding + ")")

    var yAxis = d3.axisLeft();

    // assign the scale to the axis
    yAxis.scale(yScale);
    yAxisGroup.call(yAxis);

    // Create the bars (hint: use #bars)

    var bars = d3.select('#bars').selectAll('rect').data(allWorldCupData);

    //Exit old elements
    bars.exit().remove();

    bars = bars.enter().append('rect')
        .merge(bars)

    bars
        .attr('height', function (d) {
            return yScale(0) - yScale(d[selectedDimension]);
        })
        .attr('width', xScale.bandwidth())
        .attr('x', function (d, i) {
             return xScale(d.year);
         })
        .attr('fill', function (d) {
            return colorScale(d[selectedDimension]);
        })
        .attr("transform", "translate(" + (padding + textWidth + epsilom) + "," + (height - padding - textWidth) + ") scale(1, -1)")
        .attr("id",function (d) { 
            return d.YEAR;
        })

    // ******* TODO: PART II *******

    // Implement how the bars respond to click events
    // Color the selected bar to indicate is has been selected.
    // Make sure only the selected bar has this new color.

    // Call the necessary update functions for when a user clicks on a bar.
    // Note: think about what you want to update when a different bar is selected.

    bars.on("click", barClickEvent)

}

function barClickEvent(d) { 

    barClickData = d;
    updateInfo(d);
    updateMap(d);

    d3.select("#bars").selectAll("rect")
        .classed("selected", false);

    d3.select(this)
        .classed("selected", true);

}

function countryClickEvent(d) { 

    selectedCountry = this.id

    updateProfile(d)
    if (barClickData == null) {}
    else {updateMap(barClickData);}

    d3.select("#map").selectAll("path")
        .classed("selected", false)
        .classed("countries", true);

    d3.select(this)
        .classed("countries", false)
        .classed("selected", true);

}

/**
 *  Check the drop-down box for the currently selected data type and update the bar chart accordingly.
 *
 *  There are 4 attributes that can be selected:
 *  goals, matches, attendance and teams.
 */
function chooseData() {

    // ******* TODO: PART I *******

    //Changed the selected data when a user selects a different
    // menu item from the drop down.

    var selectedWorldCupData = document.getElementById('dataset').value
    updateBarChart(selectedWorldCupData);

}

/**
 * Update the info panel to show info about the currently selected world cup
 *
 * @param oneWorldCup the currently selected world cup
 */
function updateInfo(oneWorldCup) {

    // ******* TODO: PART III *******

    // Update the text elements in the infoBox to reflect:
    // World Cup Title, host, winner, runner_up, and all participating teams that year

    // Hint: For the list of teams, you can create an list element for each team.
    // Hint: Select the appropriate ids to update the text content.

    d3.select('#edition').text(oneWorldCup.EDITION);
    d3.select('#host').text(oneWorldCup.host);
    d3.select('#winner').text(oneWorldCup.winner);
    d3.select('#silver').text(oneWorldCup.runner_up);

    d3.select('#teams').html('')
        .append('ul')
        .selectAll('li').data(oneWorldCup.teams_names)
        .enter()
        .append('li')
        .text(function(d) {
            return d;
        });
}

function updateProfile(oneCountry) {

    // ******* TODO: PART III *******

    // Update the text elements in the infoBox to reflect:
    // World Cup Title, host, winner, runner_up, and all participating teams that year

    // Hint: For the list of teams, you can create an list element for each team.
    // Hint: Select the appropriate ids to update the text content.

    countryProfile = d3.select("#profile")

    countryProfile
        .select('#country').text(country_codes[oneCountry.id]);

    participation = countryProfile.select('#participation').html('')
         .append('ul')

    years_won = countryProfile.select('#years_won').html('')
         .append('ul')

    years_runner_up = countryProfile.select('#years_runner_up').html('')
         .append('ul')

    for (row in allWorldCupData) {
        for (teams in allWorldCupData[row].teams_iso) {
            if (oneCountry.id == allWorldCupData[row].teams_iso[teams]) {
                participation
                    .append('li')
                    .text(allWorldCupData[row].year)
            }
        }
        if (country_codes[oneCountry.id] == allWorldCupData[row].winner) {
            years_won
                .append('li')
                .text(allWorldCupData[row].year)
        }
        if (country_codes[oneCountry.id] == allWorldCupData[row].runner_up) {
            years_runner_up
                .append('li')
                .text(allWorldCupData[row].year)
        }
    }

}

/**
 * Renders and updated the map and the highlights on top of it
 *
 * @param the json data with the shape of all countries
 */
function drawMap(world) {

    //(note that projection is global!
    // updateMap() will need it to add the winner/runner_up markers.)

    projection = d3.geoConicConformal().scale(150).translate([400, 350]);

    // ******* TODO: PART IV *******

    // Draw the background (country outlines; hint: use #map)
    // Make sure and add gridlines to the map

    // Hint: assign an id to each country path to make it easier to select afterwards
    // we suggest you use the variable in the data element's .id field to set the id

    // Make sure and give your paths the appropriate class (see the .css selectors at
    // the top of the provided html file)

    // Define default path generator
    var path = d3.geoPath()
            .projection(projection);

    var grat = d3.geoGraticule();

    d3.select('#map').append('path')
        .datum(grat)
        .classed("grat", true)
        .attr("d", path);

    //Bind data and create one path per GeoJSON feature
    map = d3.select('#map').selectAll('path.countries')
                .data(topojson.feature(world, world.objects.countries).features)
                .enter()    
                .append("path")
                // here we use the familiar d attribute again to define the path
                .attr("d", path)
                .classed("countries", true)
                .attr("id", function (d) {
                    return d.id
                })

    country = d3.select("#map").selectAll("path")

    country.on("click", countryClickEvent)
}

/**
 * Clears the map
 */
function clearMap() {

    // ******* TODO: PART V*******
    //Clear the map of any colors/markers; You can do this with inline styling or by
    //defining a class style in styles.css

    //Hint: If you followed our suggestion of using classes to style
    //the colors and markers for hosts/teams/winners, you can use
    //d3 selection and .classed to set these classes on and off here.
    
    d3.select('#map').selectAll(".team")  
        .classed("team", false)
        .classed("countries", true)
    d3.select('#map').select(".host")
        .classed("host", false)  
        .classed("countries", true)
    d3.select('#points')
        .html('')
}


/**
 * Update Map with info for a specific FIFA World Cup
 * @param the data for one specific world cup
 */
function updateMap(worldcupData) {

    //Clear any previous selections;
    clearMap();

    // ******* TODO: PART V *******

    // Add a marker for the winner and runner up to the map.

    //Hint: remember we have a conveniently labeled class called .winner
    // as well as a .silver. These have styling attributes for the two
    //markers.

    d3.select('#points')
        .append("circle")
        .attr("transform", "translate(" + 
            projection([worldcupData.win_pos[0],worldcupData.win_pos[1]]) + ")")
        .style("r", 8)
        .attr("class", "gold")

    d3.select('#points')
        .append("circle")
        .attr("transform", "translate(" + 
            projection([worldcupData.ru_pos[0],worldcupData.ru_pos[1]]) + ")")
        .style("r", 8)
        .attr("class", "silver")


    //Select the host country and change it's color accordingly.

    //Iterate through all participating teams and change their color as well.

    //We strongly suggest using classes to style the selected countries.


    for (var i in worldcupData.teams_iso) {
        if (worldcupData.teams_iso[i] == selectedCountry) {

        }
        else {
            var teams = d3.select('#map').select("#" + worldcupData.teams_iso[i])
                .attr("class", "team")
        }
    }

    if (worldcupData.host_country_code == selectedCountry) {}
    else {
        d3.select('#map').select("#" + worldcupData.host_country_code)  
            .attr("class", "host")
    }
}

/* DATA LOADING */

// This is where execution begins; everything
// above this is just function definitions
// (nothing actually happens)

//Load in json data to make map
d3.json("data/world.json", function (error, world) {
    if (error) throw error;
    drawMap(world);
});

// Load CSV file
d3.csv("data/fifa-world-cup.csv", function (error, csv) {

    csv.forEach(function (d) {

        // Convert numeric values to 'numbers'
        d.year = +d.YEAR;
        d.teams = +d.TEAMS;
        d.matches = +d.MATCHES;
        d.goals = +d.GOALS;
        d.avg_goals = +d.AVERAGE_GOALS;
        d.attendance = +d.AVERAGE_ATTENDANCE;
        //Lat and Lons of gold and silver medals teams
        d.win_pos = [+d.WIN_LON, +d.WIN_LAT];
        d.ru_pos = [+d.RUP_LON, +d.RUP_LAT];

        //Break up lists into javascript arrays
        d.teams_iso = d3.csvParse(d.TEAM_LIST).columns;
        d.teams_names = d3.csvParse(d.TEAM_NAMES).columns;

    });

    // Store csv data in a global variable
    allWorldCupData = csv;
    // Draw the Bar chart for the first time
    updateBarChart('attendance');
});
