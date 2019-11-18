/*
 * Classe che mi crea un oggetto di tipo Grouped Bar Chart
 * utilizzato per vedere le statistiche delle tre sessioni 
 * che compongono un esercizio
 */

// Costruttore
function GroupedBarChart(dataHeader, variableList, sessionID, sessionColorArray)
{
	this.sessionID = sessionID;
	this.dataHeader = dataHeader;
	this.variableList = variableList;
	var sessions = [sessionID + "_1", sessionID + "_2", sessionID + "_3"];
	
	var sessionColor = {};
	sessions.forEach(function(d, i) {
		sessionColor[d] = sessionColorArray[i];
	});
	
	this.sessions = sessions;
	this.sessionColor = sessionColor;
	
	var data = [];
	variableList.forEach(function(v) {
		var supp = {};
		supp["variabile"] = v;
		supp["sessioni"] = [];
		dataHeader.forEach(function(d) {
			supp.sessioni.push({session: d.sessionID,
													sessionNumber: d.repetitionID,
													value: d[v],
												  typeVar: v});
		});
		
		data.push(supp);
	});
		
	this.data = data;
}

//Creazione della parte grafica
GroupedBarChart.prototype.createVisualChart = function(width, height, containerClass) {
	
	var margin = {top: 20, right: 20, bottom: 30, left: 40},
  width = width - margin.left - margin.right,
  height = height - margin.top - margin.bottom;

	var x0 = d3.scale.ordinal()
	  .rangeRoundBands([0, width], .1);
	
	var x1 = d3.scale.ordinal();
	
	var xAxis = d3.svg.axis()
	  .scale(x0)
	  .orient("bottom");
	
	var containerGroupeBarChart = $("." + containerClass);
	
	var tooltip = d3.select("." + containerClass).append("div")   
  		.attr("class", "tooltip")               
  		.style("opacity", 0);
	
	var svg = d3.select("." + containerClass).append("svg")
	  .attr("width", width + margin.left + margin.right)
	  .attr("height", height + margin.top + margin.bottom)
	.append("g")
	  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
	var dataHeader = this.dataHeader;
	var variableList = this.variableList;
	var labelList = [];
	variableList.forEach(function(d) {
		labelList.push(labelChartArray[d]);
	})
	var sessions = this.sessions;
	var data = this.data;
	var sessionColor = this.sessionColor;
	
	x0.domain(labelList);
	x1.domain(sessions).rangeRoundBands([0, x0.rangeBand()]);
	
	var yValues = {};
	data.forEach(function(d) {
		 
		// Calcolo il minimo e il massimo
		var minY = d3.min(d.sessioni, function(s) { 
			/* Codice per ridurre il minimo trovato
			if ((s.typeVar == "accuracy") || (s.typeVar == "adjustedAccuracy")) {
				return s.value - 0.1;
			} else if (s.typeVar == "time") {
				return s.value - 1;
			} else if ((s.typeVar == "distanceTot") || (s.typeVar == "distanceCorrect")) {
				return s.value - 100;
			} else if ((s.typeVar == "totalSpeed") || (s.typeVar == "adjustedSpeed ")) {
				return s.value - 1;
			} else if (s.typeVar == "turnsInside") {
				return s.value - 5;
			} else if (s.typeVar == "meanReactionTime") {
				return s.value - 0.1;
			} else if (s.typeVar == "totTaps") {
				return s.value - 1;
			} else {
				return s.value;
			}
			*/
			return s.value * 0.90;
		});
		var maxY = d3.max(d.sessioni, function(s) { 
			/* Codice per aumentare il massimo trovato
			if ((s.typeVar == "accuracy") || (s.typeVar == "adjustedAccuracy")) {
				return s.value + 0.1;
			} else if (s.typeVar == "time") {
				return s.value + 1;
			} else if ((s.typeVar == "distanceTot")  || (s.typeVar == "distanceCorrect")) {
				return s.value + 100;
			} else if ((s.typeVar == "totalSpeed") || (s.typeVar == "adjustedSpeed ")) {
				return s.value + 1;
			} else if (s.typeVar == "turnsInside") {
				return s.value + 5;
			} else if (s.typeVar == "meanReactionTime") {
				return s.value + 0.1;
			} else if (s.typeVar == "totTaps") {
				return s.value + 1;
			} else {
				return s.value;
			}
			*/
			return s.value * 1.10;
		});
		
		// Scala dell'asse delle y
		var y = d3.scale.linear()
			.domain([minY, maxY])
			.range([height, 0])
			.nice();
			
		yValues[d.variabile] = y;
	});
		
	svg.append("g")
	    .attr("class", "x-grouped-bar-chart axis-grouped-bar-chart")
	    .attr("transform", "translate(0," + height + ")")
	    .call(xAxis);
		
	var variable = svg.selectAll(".variable")
	    .data(data)
	  .enter().append("g")
	    .attr("class", "variable")
	    .attr("transform", function(d) { return "translate(" + x0(labelChartArray[d.variabile]) + ",0)"; });
	
	variable.selectAll("rect")
	    .data(function(d) { return d.sessioni; })
	  .enter().append("rect")
	    .attr("width", x1.rangeBand())
	    .attr("x", function(d) { return x1(d.session + "_" + d.sessionNumber); })
	    .attr("y", function(d) {
	    	var variableY = yValues[d.typeVar];
	    	return variableY(d.value); 
	    })
	    .attr("height", function(d) { 
	    	var variableY = yValues[d.typeVar];
	    	return height - variableY(d.value); })
	    .style("fill", function(d) { return sessionColor[d.session + "_" + d.sessionNumber]; })
	    .on("mouseover", function(d) {      
        tooltip.transition()        
            .duration(200)      
            .style("opacity", .9);      
        tooltip.html(
        		 '<span class="tip-label">' + customLabelsArray.session + ': </span>' +
 	    		   '<span class="tip-value">' + d.sessionNumber + '</span><br>' +
 	    		   '<span class="tip-label">' + labelChartArray[d.typeVar] + ': </span>' +
	    		   '<span class="tip-value">' + d.value + '</span><br>')  
            .style("left", (d3.event.pageX - containerGroupeBarChart.parent().offset().left) + "px")     
            .style("top", (d3.event.pageY - containerGroupeBarChart.parent().offset().top) + "px");    
        })                  
    .on("mouseout", function(d) {       
        tooltip.transition()        
            .duration(500)      
            .style("opacity", 0);   
    });
}