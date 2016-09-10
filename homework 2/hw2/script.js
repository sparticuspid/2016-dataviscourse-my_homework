/*globals alert, document, d3, console*/
// These keep JSHint quiet if you're using it (highly recommended!)

function staircase() {
    var c = document.getElementById("barChart1").children;
    var i;
    for (i = 0; i < c.length; i++) {
        var height = (i+1)*10;
        c[i].setAttribute("width", 10);
        c[i].setAttribute("height", height);
        c[i].setAttribute("y", 190-height);
        c[i].setAttribute("x", i*10);
    }
    //alert("children: " + c);
    //barChart1 = document.getElementById("barChart1");
}

function update(error, data) {
    if (error !== null) {
        alert("Couldn't load the dataset!");
    } else {
        // D3 loads all CSV data as strings;
        // while Javascript is pretty smart
        // about interpreting strings as
        // numbers when you do things like
        // multiplication, it will still
        // treat them as strings where it makes
        // sense (e.g. adding strings will
        // concatenate them, not add the values
        // together, or comparing strings
        // will do string comparison, not
        // numeric comparison).

        // We need to explicitly convert values
        // to numbers so that comparisons work
        // when we call d3.max()
        data.forEach(function (d) {
            d.a = parseInt(d.a);
            d.b = parseFloat(d.b);
        });
    }

    // Set up the scales
    var aScale = d3.scaleLinear()
        .domain([0, d3.max(data, function (d) {
            return d.a;
        })])
        .range([0, 150]);
    var bScale = d3.scaleLinear()
        .domain([0, d3.max(data, function (d) {
            return d.b;
        })])
        .range([0, 150]);
    var iScale = d3.scaleLinear()
        .domain([0, data.length])
        .range([0, 110]);

    // ****** TODO: PART III (you will also edit in PART V) ******

    // TODO: Select and update the 'a' bar chart bars

    var barChart1 = d3.select("#barChart1")
    var selection = barChart1.selectAll("rect")
        .data(data)
        .attr("x", 10)
        .attr("y", function (d,i) { 
            return iScale(i);
        })
        .attr("width", function (d) {
                return aScale(d.a);
        })
        .attr("height", 10)

    // TODO: Select and update the 'b' bar chart bars

    var barChart2 = d3.select("#barChart2")
    var selection = barChart2.selectAll("rect")
        .data(data)
        .attr("x", 10)
        .attr("y", function (d,i) { 
            return iScale(i);
        })
        .attr("width", function (d) {
            return bScale(d.b);
        })
        .attr("height", 10)

    // TODO: Select and update the 'a' line chart path using this line generator
    var aLineGenerator = d3.line()
        .x(function (d, i) {
            return iScale(i);
        })
        .y(function (d) {
            return aScale(d.a);
        });

    var lineChart1 = d3.select("#lineChart1")
    var selection = lineChart1.selectAll("path")
        .attr("d", aLineGenerator(data));


    // TODO: Select and update the 'b' line chart path (create your own generator)
    var bLineGenerator = d3.line()
        .x(function (d, i) {
            return iScale(i);
        })
        .y(function (d) {
            return aScale(d.b);
        });

    var lineChart2 = d3.select("#lineChart2")
    var selection = lineChart2.selectAll("path")
        .attr("d", bLineGenerator(data));


    // TODO: Select and update the 'a' area chart path using this line generator
    var aAreaGenerator = d3.area()
        .x(function (d, i) {
            return iScale(i);
        })
        .y0(0)
        .y1(function (d) {
            return aScale(d.a);
        });

    var areaChart1 = d3.select("#areaChart1")
    var selection = areaChart1.selectAll("path")
        .attr("d", aAreaGenerator(data));

    // TODO: Select and update the 'b' area chart path (create your own generator)
    var bAreaGenerator = d3.area()
        .x(function (d, i) {
            return iScale(i);
        })
        .y0(0)
        .y1(function (d) {
            return bScale(d.b);
        });

    var areaChart2 = d3.select("#areaChart2")
    var selection = areaChart2.selectAll("path")
        .attr("d", bAreaGenerator(data));

    // TODO: Select and update the scatterplot points

    var scatterPlot = d3.select("#scatterPlot")
    var selection = scatterPlot.selectAll("circle")
        .data(data)
        .attr("cx", function (d) {
            return aScale(d.a);
        })
        .attr("cy", function (d) { 
            return bScale(d.b);
        })
        .on('click', function(d,i){ 
            console.log('hi')
        });

    // ****** TODO: PART IV ******
}

function changeData() {
    // // Load the file indicated by the select menu
    var dataFile = document.getElementById('dataset').value;
    if (document.getElementById('random').checked) {
        randomSubset();
    }
    else{
        d3.csv('data/' + dataFile + '.csv', update);
    }
}

function randomSubset() {
    // Load the file indicated by the select menu,
    // and then slice out a random chunk before
    // passing the data to update()
    var dataFile = document.getElementById('dataset').value;
    if (document.getElementById('random').checked) {
        d3.csv('data/' + dataFile + '.csv', function (error, data) {
            var subset = [];
            data.forEach(function (d) {
                if (Math.random() > 0.5) {
                    subset.push(d);
                }
            });
            update(error, subset);
        });
    }
    else{
        changeData();
    }
}