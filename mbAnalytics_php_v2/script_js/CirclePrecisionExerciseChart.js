/* Classe che modella i grafici del dettaglio
 * relativi al primo esercizio,
 * ovvero quello del cerchio di precisione
 */

// Costruttore
function CirclePrecisionExerciseChart(jsonData, exerciseType, sessionID) {
	
	this.jsonData = jsonData;
	this.exerciseType = exerciseType;
	this.sessionID = sessionID;
	
	// Dati relativi al contenitore del grafico
	this.margin = {top: 0, right: 0, bottom: 0, left: 0}; // Margini
	this.width = 200; // Larghezza
	this.height = 300; // Altezza
	
	// Dati relativi alla scala: 
	// dato che la scala è normalizzata,
	// accorcio l'intervallo da visualizzare
	this.minX = 0;
	this.maxX = 1;
	this.minY = 0;
	this.maxY = 1;
	
	// Array di colori per identificare la sessione
	this.sessionColorArray = ["#3366CC", "#109618", "#FF9900", "#990099"];
	
	// Dati relativi al tracciato guida di Motorbrain
	this.jsonHeaderData = this.jsonData["headerData"];
	// Dati relativi ai punti toccati dall'utente
	this.jsonRowData = this.jsonData["rowData"];	
	
	if (this.jsonHeaderData.length == 0) {
		return;
	}
	
	/* Gestione dati dell'header della struttura */
	var dataHeader = [];
	dataHeader[0] = null;
	dataHeader[1] = null;
	dataHeader[2] = null;
	// Conversione dei dati
	this.jsonHeaderData.forEach(function(d) {
		// Variabili utili al disegno
		d.screenWidth = +d.screenWidth;
		d.screenHeight = +d.screenHeight;
		d.circleCenterX = +d.circleCenterX;
		d.circleCenterY = +d.circleCenterY;
		d.radiusCenter = +d.radiusCenter;
		d.margin = +d.margin;
		
		// Informazioni da visualizzare
		d.accuracy = +d.accuracy;
		d.distanceTot = +d.distanceTot;
		d.time = +d.time;
		d.centerCircle = +d.centerCircle;
		
		// Calcolo
		d.deviationIndex = (d.distanceTot - d.centerCircle) / 
		 									 (d.distanceTot + d.centerCircle);
	
		if (d.repetitionID == 1) {
			dataHeader[0] = d;
		} else if (d.repetitionID == 2) {
			dataHeader[1] = d;
		} else if (d.repetitionID == 3) {
			dataHeader[2] = d;
		}
	});
	
	// Grafico a barre per comparare le variabili ad occhio
	var groupedBarChart = 
		new GroupedBarChart(dataHeader, 
												["accuracy", "time", "distanceTot"],
												sessionID,
												this.sessionColorArray);
	groupedBarChart.createVisualChart(500, 160, "session-summary-container");
	
	// Variabili relative al tracciato guida fornito da Motobrain:
	// sono tutte uguali per le varie sessioni,
	// quindi prendo i valori di una sessione qualsiasi,
	// in questo caso la prima
	this.screenWidth = dataHeader[0].screenWidth;
	this.screenHeight = dataHeader[0].screenHeight;
	this.circleCenterX = dataHeader[0].circleCenterX;
	this.circleCenterY = dataHeader[0].circleCenterY;
	this.radiusCenter = dataHeader[0].radiusCenter;
	this.circleMargin = dataHeader[0].margin;
	this.minRadius = this.radiusCenter - this.circleMargin;
	
	/* Per debug: stampa dei valori
	console.log("sh: " + screenHeight + ", sw: " + screenWidth + 
		", cx: " + circleCenterX + ", cy: " + circleCenterY +
		", rad: " + radiusCenter + "); 
	*/
	
	// Mantengo il rapporto per non distorcere la visualizzazione
	// mantengo fissa la larghezza e aggiorno l'altezza
	//this.height = this.width * this.screenHeight / this.screenWidth;
	
	// Mantengo il rapporto per non distorcere la visualizzazione
	// mantengo fissa l'altezza e aggiorno la larghezza
	this.width = this.height * this.screenWidth / this.screenHeight;
	
	/* Per debug: stampa dei valori
	console.log("h: " + height + ", w: " + width + 
							", l: " + margin.left + ", r: " + margin.right);
	*/
	
	/* Gestione dei dati delle tre sessioni: conversione e creazione della struttura dati */
	var dataRow = [];
	var dataRow1 = [];
	var dataRow2 = [];
	var dataRow3 = [];
	// Conversione dei dati
	this.jsonRowData.forEach(function(d) {
		d.timeStampR = +d.timeStampR;
		d.xR = +d.xR;
		d.yR = +d.yR;
		
		d.timeStampN = +d.timeStampN;
		d.xN = +d.xN;
		d.yN = +d.yN;
		
		if (d.repetitionID == 1) {
			dataRow1.push(d);
		} else if (d.repetitionID == 2) {
			dataRow2.push(d);
		} else if (d.repetitionID == 3) {
			dataRow3.push(d);
		}
		
	});
	
	//Ordino i valori della sessione 1
	dataRow1.sort(function(obj1, obj2) {
		return obj1.timeStampR - obj2.timeStampR;
	});

	// Ordino i valori della sessione 2	
	dataRow2.sort(function(obj1, obj2) {
		return obj1.timeStampR - obj2.timeStampR;
	});

	// Ordino i valori della sessione 3
	dataRow3.sort(function(obj1, obj2) {
		return obj1.timeStampR - obj2.timeStampR;
	});
	
	// Inserisco i tre array in un contenitore
	dataRow[0] = dataRow1;
	dataRow[1] = dataRow2;
	dataRow[2] = dataRow3;
	
	this.dataRow = dataRow;
	
	/* SVG con punti normalizzati */
	
	this.x = d3.scale.linear()
		.domain([this.minX, this.maxX])
		.range([0, this.width]);
	
	this.y = d3.scale.linear()
		.domain([this.minY, this.maxY])
		.range([0, this.height]);
	
	// Imposto i checkbox e i relativi eventi
	$("#ck-linee").prop("checked", true);
	$("#ck-linee").on("change", function() {
		if ($("#ck-linee").prop("checked")) {
			d3.select("#dettaglio-grafico-" + sessionID)
				.selectAll(".session-path")
				.attr("display", null);
		} else {
			d3.select("#dettaglio-grafico-" + sessionID)
			.selectAll(".session-path")
			.attr("display", "none");
		}
	});
	$("#ck-punti").prop("checked", true);
	$("#ck-punti").on("change", function() {
		d3.select("#dettaglio-grafico-" + sessionID)
			.selectAll(".dot")
			.attr("display", ($("#ck-punti").prop("checked")) ? "inline" : "none")
	});
	
	
	var selfCN = this;
	for (var i = 1; i <= 4; i++) {
		var sessionColor = selfCN.sessionColorArray[i - 1];
		$("#bt-grafico" + sessionID + "_" + i)
			.css("background-color", sessionColor);
		
		var svg = selfCN.createSvgN(i);
		selfCN.createCircleN(svg);	
		
		if (i < 4) {
			selfCN.createLinePath(svg, dataRow[i - 1], selfCN.x, selfCN.y, sessionColor);
			selfCN.createDotPath(svg, dataRow[i - 1], selfCN.x, selfCN.y, sessionColor, i);
			selfCN.createTextInfo(dataHeader[i - 1], i);
		}	else {
			for (var j = 0; j <= 2; j++) {
				sessionColor = selfCN.sessionColorArray[j];
				selfCN.createLinePath(svg, dataRow[j], selfCN.x, selfCN.y, sessionColor);
				selfCN.createDotPath(svg, dataRow[j], selfCN.x, selfCN.y, sessionColor, j + 1);
			}
			var averageHeader = this.getAverageHeader(dataHeader);
			selfCN.createTextInfo(averageHeader, i);
		}
	}
	
}

// Crea il contenitore SVG per disegnare il grafico normalizzato
CirclePrecisionExerciseChart.prototype.createSvgN = function(sessionNumber) {
	
	var sessionValue = this.sessionID + "_" + sessionNumber;
	
	var selfC = this;
	var svg = d3.select("#dettaglio-grafico-" + sessionValue)
			.style("padding-bottom", "50px")
		.append("svg")
			.attr("id", sessionValue)
			.attr("class", "svg-session-detail")
	  	.attr("width", this.width)
	  	.attr("height", this.height)
			.attr("viewBox", "0 0 " + this.width + " " + this.height)
			.on("click", function() {
		 
				selfC.showSvgRealDimensions(sessionNumber)
			})
	 .append("g")
	  	.attr("transform", "translate(0," +  this.height + ") scale(1,-1)");
	
	return svg;
}

// Crea il cerchio "obiettivo" normalizzato
CirclePrecisionExerciseChart.prototype.createCircleN = function(svg) {
	
	svg.append("circle")
  	.attr("cx", this.x(this.circleCenterX / this.screenWidth))
  	.attr("cy", this.y(this.circleCenterY / this.screenHeight))
  	.attr("r", this.y(this.radiusCenter / this.screenHeight))
  	.style("stroke", "#E9E9E9")
		.style("fill", "none")
  	.style("stroke-width", this.y(this.circleMargin / this.screenHeight) + "px");
}

// Crea la linea tracciata dall'utente
CirclePrecisionExerciseChart.prototype.createLinePath = function(svg, dataVal, x, y, color) {
	var lineFunction = d3.svg.line()
  	.x(function(d) { return x(d.xN); })
  	.y(function(d) { return y(d.yN); })
  	.interpolate("linear");
	
	var lineGraph = svg.append("path")
		.attr("class", "session-path")
	  .attr("d", lineFunction(dataVal))
	  .attr("stroke", color)
	  .attr("stroke-opacity", 0.6)
	  .attr("stroke-width", 2)
	  .attr("fill", "none");
}

// Crea i punti toccati dall'utente
CirclePrecisionExerciseChart.prototype.createDotPath = function(svg, dataVal, x, y, color, index) {
	
	svg.selectAll(".dot.session-" + index)
	  .data(dataVal)
	  .enter().append("circle")
	    .attr("class", "dot session-" + index)
	    .attr("r", 2)
	    .attr("cx", function(d) { return x(d.xN); })
	    .attr("cy", function(d) { return y(d.yN); })
	    .attr("fill", color)
	    .attr("fill-opacity", 0.6);
}

// Crea un riepilogo con le informazioni sul grafico
CirclePrecisionExerciseChart.prototype.createTextInfo = function(dataH, sessionNumber) {
	
	var sessionValue = this.sessionID + "_" + sessionNumber;
//	var intestazione = "";
//	if (sessionNumber == 4) {
//		intestazione = "<strong>Media dei valori:</strong><br>"; 
//	}
	   
	var dettaglioVariabili = "";
	var variabili = ["accuracy", "time", "distanceTot", "deviationIndex"];
	for (var i = 0; i < variabili.length; i++) {
		dettaglioVariabili += "<strong>" + labelChartArray[variabili[i]] + ":</strong> ";
		dettaglioVariabili += "<span style='color:red'>";
		var number = dataH[variabili[i]];
		if (getDecimalNumber(number) < 6) {
			dettaglioVariabili += number;
		} else {
			dettaglioVariabili += number.toFixed(6);
		}
		dettaglioVariabili += "</span><br>";
	}
	
	$("#dettaglio-grafico-" + sessionValue)
		.append('<div class="div-info-sessione">' +
//				intestazione +
				dettaglioVariabili +
			"</div>");
}

// Calcola la media tra le tre sessioni
CirclePrecisionExerciseChart.prototype.getAverageHeader = function(dataH) {
	
	var sumDataH = { accuracy: 0, time: 0, distanceTot: 0, deviationIndex: 0};
	dataH.forEach(function(d) {
		sumDataH.accuracy += d.accuracy;
		sumDataH.time += d.time;
		sumDataH.distanceTot += d.distanceTot;
		sumDataH.deviationIndex += (d.distanceTot - d.centerCircle) / 
		 													 (d.distanceTot + d.centerCircle);
	});
	
	sumDataH.accuracy = sumDataH.accuracy / 3;
	sumDataH.time = sumDataH.time / 3;
	sumDataH.distanceTot = sumDataH.distanceTot  / 3;
	sumDataH.deviationIndex = sumDataH.deviationIndex / 3;
	
	return sumDataH;
}

// Funzione che apre un'altra tab e mostra il grafico a dimensioni reali:
// recupera le dimensioni del dispositivo utilizzato dall'utente
// e stampa le traccie utilizzando i dati reali (non normalizzati)
CirclePrecisionExerciseChart.prototype.showSvgRealDimensions = function(sessionNumber) {

	var newWindow = window.open("");
	newWindow.document.title = "Sessione " + sessionNumber;
  var newWindowRoot = d3.select(newWindow.document.body);
   
	var svg = newWindowRoot
		.append("svg")
			.attr("id", this.sessionNumber)
	  	.attr("width", this.screenWidth)
	  	.attr("height", this.screenHeight)
			.attr("viewBox", "0 0 " + this.screenWidth + " " + this.screenHeight)
	 .append("g")
	  	.attr("transform", "translate(0," +  this.screenHeight + ") scale(1,-1)");
	
	/*
	svg.append("circle")
	  .attr("cx", this.circleCenterX)
	  .attr("cy", this.circleCenterY)
	  .attr("r", this.radiusCenter)
	  .style("stroke", "#ADADAD")
	  .style("fill", "#E9E9E9")
	  .style("stroke-width", "1px");

	svg.append("circle")
		.attr("cx", this.circleCenterX)
		.attr("cy", this.circleCenterY)
		.attr("r", this.minRadius)
		.style("stroke", "#ADADAD")
		.style("fill", "white")
		.style("stroke-width", "1px");
	*/
	
	svg.append("circle")
		.attr("cx", this.circleCenterX)
		.attr("cy", this.circleCenterY)
		.attr("r", this.radiusCenter)
		.style("stroke", "#E9E9E9")
		.style("fill", "none")
		.style("stroke-width", this.circleMargin + "px");
	
	var lineFunction = d3.svg.line()
	                     .x(function(d) { return d.xR; })
	                     .y(function(d) { return d.yR; })
	                     .interpolate("linear");
	
	 var selectData = [];
	 var color = null; 
	 var index = null;
	 if (sessionNumber < 4) {
		 selectData.push(this.dataRow[sessionNumber - 1]);
		 color = this.sessionColorArray[sessionNumber - 1];
		 index = sessionNumber - 1;
	 } else {
		 selectData = this.dataRow;
		 index = 0;
	 }
	 
	 for (var i=0; i < selectData.length; i++) {
		 
		 if (sessionNumber == 4) {
			 color = this.sessionColorArray[i];
			 index++;
		 }
		 
		 var lineGraph = svg.append("path")
				.attr("d", lineFunction(selectData[i]))
				.attr("stroke", color)
			  .attr("stroke-opacity", 0.6)
			  .attr("stroke-width", 2)
			  .attr("fill", "none");
		 
		 svg.selectAll(".dot.session-" + index)
		  .data(selectData[i])
		  .enter().append("circle")
			  .attr("class", "dot session-" + index)
			  .attr("r", 2)
			  .attr("cx", function(d) { return d.xR; })
			  .attr("cy", function(d) { return d.yR; })
			  .attr("fill", color)
			  .attr("fill-opacity", 0.6);
	 }
	
  return true;
}