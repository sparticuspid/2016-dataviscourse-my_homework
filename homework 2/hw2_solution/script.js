/*globals alert, document, d3, console*/
// These keep JSHint quiet if you're using it (highly recommended!)

function staircase() {

    // ****** PART II solution ******
    var bars = document.getElementById('aBarChart').children,
        scale = 10,
        i;

    // Note: .children is NOT an actual array,
    // otherwise we could do something like
    // bars.forEach(function (bar) { ... })

    for (i = 0; i < bars.length; i += 1) {
        bars[i].setAttribute('height', (i+1) * scale);
    }

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


    // ****** PART IV ******

    // Select and update the 'a' bar chart bars
    //Join new data with old elements
    var aBars = d3.select('#aBarChart').selectAll('rect').data(data);

    //Exit old elements
    aBars.exit().remove();

    //Enter new elements and update aBars with merge
    aBars = aBars.enter().append('rect')
        .attrs({
            y : 0,
            width : 10
        })
        .merge(aBars);

    //Set Attributes for all elements
    aBars.attr('height', function (d) {
         return aScale(d.a);
    });
    aBars.attr('x', function (d, i) {
         return iScale(i);
    });
    aBars.on('mouseover', function (d, i) {
        this.setAttribute('fill', 'seagreen');
    });
    aBars.on('mouseout', function (d, i) {
        this.setAttribute('fill', 'steelblue');
    });

    // Select and update the 'b' bar chart bars
    var bBars = d3.select('#bBarChart').selectAll('rect').data(data);

    //Exit old elements
    bBars.exit().remove();

    //Enter new elements and update bBars with (merge)
    bBars = bBars.enter().append('rect')
        .attrs({
            y : 0,
            width : 10
        })
        .merge(bBars);


    bBars.attr('height', function (d) {
        return aScale(d.b);
    });
    bBars.attr('x', function (d, i) {
        return iScale(i);
    });
    bBars.on('mouseover', function (d, i) {
        this.setAttribute('fill', 'red');
    });
    bBars.on('mouseout', function (d, i) {
        this.setAttribute('fill', 'steelblue');
    });

    // Select and update the 'a' line chart path using this line generator
    var aLineGenerator = d3.line()
        .x(function (d, i) {
            return iScale(i);
        })
        .y(function (d) {
            return aScale(d.a);
        });
    
    d3.select('#aLineChart').attr('d', aLineGenerator(data));
    
    // Select and update the 'b' line chart path (create your own generator)
    var bLineGenerator = d3.line()
        .x(function (d, i) {
            return iScale(i);
        })
        .y(function (d) {
            return bScale(d.b);
        });
    
    d3.select('#bLineChart').attr('d', bLineGenerator(data));

    // Select and update the 'a' area chart path using this line generator
    var aAreaGenerator = d3.area()
        .x(function (d, i) {
            return iScale(i);
        })
        .y0(0)
        .y1(function (d) {
            return aScale(d.a);
        });
    
    d3.select('#aAreaChart').attr('d', aAreaGenerator(data));

    // Select and update the 'b' area chart path (create your own generator)
    var bAreaGenerator = d3.area()
        .x(function (d, i) {
            return iScale(i);
        })
        .y0(0)
        .y1(function (d) {
            return aScale(d.b);
        });
    
    d3.select('#bAreaChart').attr('d', bAreaGenerator(data));
    
    // Select and update the scatterplot points
    var scatterplotPoints = d3.select('#scatterplot').selectAll('circle').data(data);

    scatterplotPoints.exit().remove();
    scatterplotPoints = scatterplotPoints.enter().append('circle').attr('r', 5).merge(scatterplotPoints);

    scatterplotPoints.attr('cx', function (d) { return aScale(d.a); });
    scatterplotPoints.attr('cy', function (d) { return bScale(d.b); });



    // ****** PART IV ******

    // Write the data point that was clicked to the console
    scatterplotPoints.on('click', function (d) {
        console.log(d);
    });
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