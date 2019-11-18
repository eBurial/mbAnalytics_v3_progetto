/* Classe che modella i grafici del dettaglio
 * relativi al secondo esercizio,
 * ovvero quello del quadrato di precisione
 */

// Costruttore
function SquarePrecisionExerciseChart(jsonData, exerciseType, sessionID) {
	
	this.jsonData = jsonData;
	this.exerciseType = exerciseType;
	this.sessionID = sessionID;
	
	// Dati relativi al contenitore del grafico
	this.margin = {top: 0, right: 0, bottom: 0, left: 0};				// Margini
	this.width = 200;																						// Larghezza
	this.height = 300;																					// Altezza
	
	// Dati relativi alla scala: 
	// dato che la scala Ã¨ normalizzata,
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
		d.x1 = +d.x1;
		d.y1 = +d.y1;
		d.x2 = +d.x2;
		d.y2 = +d.y2;
		d.x3 = +d.x3;
		d.y3 = +d.y3;
		d.x4 = +d.x4;
		d.y4 = +d.y4;
		d.edge = +d.edge;
		d.margin = +d.margin;
	
		// Informazioni da visualizzare
		d.accuracy = +d.accuracy;
		d.distanceTot = +d.distanceTot;
		d.time = +d.time;
		d.centralPerimeter  = +d.centralPerimeter ;
		
		// Calcolo
		d.deviationIndex = (d.distanceTot - d.centralPerimeter ) / 
		 									 (d.distanceTot + d.centralPerimeter );
	
		if (d.repetitionID == "1") {
			dataHeader[0] = d;
		} else if (d.repetitionID == "2") {
			dataHeader[1] = d;
		} else if (d.repetitionID == "3") {
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
	this.x1 = dataHeader[0].x1;
	this.y1 = dataHeader[0].y1;
	this.x2 = dataHeader[0].x2;
	this.y2 = dataHeader[0].y2;
	this.x3 = dataHeader[0].x3;
	this.y3 = dataHeader[0].y3;
	this.x4 = dataHeader[0].x4;
	this.y4 = dataHeader[0].y4;
	this.edge = dataHeader[0].edge;
	this.squareMargin = dataHeader[0].margin; 
	this.minEdge = this.edge - (2 * this.squareMargin);
	
	// Mantengo il rapporto per non distorcere la visualizzazione
	// mantengo fissa la larghezza e aggiorno l'altezza
	// this.height = this.width * this.screenHeight / this.screenWidth;
	
	// Mantengo il rapporto per non distorcere la visualizzazione
	// mantengo fissa l'altezza e aggiorno la larghezza
	this.width = this.height * this.screenWidth / this.screenHeight;
	
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
		
		if (d.repetitionID == "1") {
			dataRow1.push(d);
		} else if (d.repetitionID == "2") {
			dataRow2.push(d);
		} else if (d.repetitionID == "3") {
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
		selfCN.createSquareN(svg);	
		
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
SquarePrecisionExerciseChart.prototype.createSvgN = function(sessionNumber) {
	
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

// Ritorna le coordinate normalizzate per creare il quadrato
SquarePrecisionExerciseChart.prototype.getSquareCoordN = function() {
	var coordinateSquare = this.x(this.x1 / this.screenWidth) + "," +
												 this.y(this.y1 / this.screenHeight)  + " " +
												 this.x(this.x2 / this.screenWidth) + "," +
												 this.y(this.y2 / this.screenHeight)  + " " +
												 this.x(this.x3 / this.screenWidth) + "," +
												 this.y(this.y3 / this.screenHeight)  + " " +
												 this.x(this.x4 / this.screenWidth) + "," +
												 this.y(this.y4 / this.screenHeight);
	
	return coordinateSquare;
}

//Ritorna le coordinate per creare il quadrato
SquarePrecisionExerciseChart.prototype.getSquareCoord = function() {
	var coordinateSquare = this.x1 + "," + this.y1 + " " +
												 this.x2 + "," + this.y2 + " " +
												 this.x3 + "," + this.y3 + " " +
												 this.x4 + "," + this.y4;
	
	return coordinateSquare;
}

// Crea il quadrato "obiettivo" normalizzato
SquarePrecisionExerciseChart.prototype.createSquareN = function(svg) {
	
	// Recupero le coordinate normalizzate
	var coordinateSquare = this.getSquareCoordN();
	
	svg.append("polygon")
		.attr("class", "square-polygon")
	  .attr("points", coordinateSquare)
	  .attr("stroke", "#E9E9E9")
	  .attr("stroke-width", this.y(this.squareMargin / this.screenHeight))
	  .attr("fill", "none");
}

// Crea la linea tracciata dall'utente
SquarePrecisionExerciseChart.prototype.createLinePath = function(svg, dataVal, x, y, color) {
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
SquarePrecisionExerciseChart.prototype.createDotPath = function(svg, dataVal, x, y, color, index) {
	
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
SquarePrecisionExerciseChart.prototype.createTextInfo = function(dataH, sessionNumber) {
	
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
//  		  intestazione +
			  dettaglioVariabili +
			"</div>");
}

// Calcola la media tra le tre sessioni
SquarePrecisionExerciseChart.prototype.getAverageHeader = function(dataH) {
	
	var sumDataH = { accuracy: 0, time: 0, distanceTot: 0, deviationIndex: 0};
	dataH.forEach(function(d) {
		sumDataH.accuracy += d.accuracy;
		sumDataH.time += d.time;
		sumDataH.distanceTot += d.distanceTot;
		sumDataH.deviationIndex += (d.distanceTot - d.centralPerimeter ) / 
		 													 (d.distanceTot + d.centralPerimeter );
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
SquarePrecisionExerciseChart.prototype.showSvgRealDimensions = function(sessionNumber) {

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
	
	var coordinateSquare = this.getSquareCoord();
	
	svg.append("polygon")
			.attr("class", "square-polygon")
			.attr("points", coordinateSquare)
			.attr("stroke", "#E9E9E9")
			.attr("stroke-width", this.squareMargin)
			.attr("fill", "none");

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