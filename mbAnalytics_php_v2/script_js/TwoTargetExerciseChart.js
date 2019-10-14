/* Classe che modella i grafici del dettaglio
 * relativi al quinto esercizio,
 * ovvero quello della tempo medio di reazione con due obiettivi
 */

// Costruttore
function TwoTargetExerciseChart(jsonData, exerciseType, sessionID) {
	
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
		d.width = +d.width;
		d.height = +d.height;
		d.x1 = +d.x1;
		d.y1 = +d.y1;
		d.x2 = +d.x2;
		d.y2 = +d.y2;
		d.margin = +d.margin;
		
		// Informazioni da visualizzare
		d.meanReactionTime = +d.meanReactionTime;
		d.accuracy = +d.accuracy;
		d.totTaps = +d.totTaps;

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
												["accuracy", "meanReactionTime", "totTaps"],
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
	this.targetMargin = dataHeader[0].margin; 

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
		d.touched_timeStampR = +d.touched_timeStampR;
		d.xR = +d.xR;
		d.yR = +d.yR;		
		d.circle_appearing_timeR = +d.circle_appearing_timeR;
		d.circle_active = d.circle_active;
		
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
		return obj1.touched_timeStampR - obj2.touched_timeStampR;
	});

	// Ordino i valori della sessione 2	
	dataRow2.sort(function(obj1, obj2) {
		return obj1.touched_timeStampR - obj2.touched_timeStampR;
	});

	// Ordino i valori della sessione 3
	dataRow3.sort(function(obj1, obj2) {
		return obj1.touched_timeStampR - obj2.touched_timeStampR;
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
	
	var selfCN = this;
	for (var i = 1; i <= 4; i++) {
		var sessionColor = selfCN.sessionColorArray[i - 1];
		$("#bt-grafico" + sessionID + "_" + i)
			.css("background-color", sessionColor);
		
		var svg = selfCN.createSvgN(i);
		var strokeWidth = selfCN.y(selfCN.targetMargin / selfCN.screenHeight);
		selfCN.createTargets(svg, selfCN.getArrayTargetCoordN(), strokeWidth, i);	
		
		if (i < 4) {
			selfCN.createDotPath(svg, dataRow[i - 1], selfCN.x, selfCN.y, sessionColor, i);
			selfCN.createTextInfo(dataHeader[i - 1], i);
		}	else {
			for (var j = 0; j <= 2; j++) {
				sessionColor = selfCN.sessionColorArray[j];
				selfCN.createDotPath(svg, dataRow[j], selfCN.x, selfCN.y, sessionColor, j + 1);
			}
			var averageHeader = this.getAverageHeader(dataHeader);
			selfCN.createTextInfo(averageHeader, i);
		}
		
		selfCN.createInvisibleTargets(svg, selfCN.getArrayTargetCoordN(), strokeWidth, i);
	}
	
}

// Crea il contenitore SVG per disegnare il grafico normalizzato
TwoTargetExerciseChart.prototype.createSvgN = function(sessionNumber) {
	
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

// Ritorna un array con le coordinate normalizzate per creare gli obiettivi
TwoTargetExerciseChart.prototype.getArrayTargetCoordN = function() {
	var coordinateTarget = []; 
	coordinateTarget.push({x: this.x(this.x1 / this.screenWidth),
											 y: this.y(this.y1 / this.screenHeight)});
	coordinateTarget.push({x: this.x(this.x2 / this.screenWidth),
											 y: this.y(this.y2 / this.screenHeight)});
	
	return coordinateTarget;
}

// Ritorna un array con le coordinate reali per creare gli obiettivi
TwoTargetExerciseChart.prototype.getArrayTargetCoord = function() {
	var coordinateTarget = []; 
	coordinateTarget.push({x: this.x1, y: this.y1});
	coordinateTarget.push({x: this.x2, y: this.y2});
	
	return coordinateTarget;
}

// Crea il quadrato "obiettivo" in base alle coordinate e al contenitore passato
TwoTargetExerciseChart.prototype.createTargets = function(svg, arrayCoordTarget, strokeWidth, index) {
	
	//Recupero le coordinate normalizzate
	for (var i=0; i < arrayCoordTarget.length; i++) {
		svg.append("circle")
			.attr("class", "session-target-" + i)
		  .attr("cx", arrayCoordTarget[i].x)
		  .attr("cy", arrayCoordTarget[i].y)
		  .attr("r", strokeWidth)
		  .attr("fill", "#E9E9E9");	
	}
}

TwoTargetExerciseChart.prototype.createInvisibleTargets = function(svg, arrayCoordTarget, strokeWidth, index) {
	
	var sessionColorArray = this.sessionColorArray;
	
	//Recupero le coordinate normalizzate
	for (var i=0; i < arrayCoordTarget.length; i++) {
		svg.append("circle")
			.attr("class", "session-target-" + i)
		  .attr("cx", arrayCoordTarget[i].x)
		  .attr("cy", arrayCoordTarget[i].y)
		  .attr("r", strokeWidth)
		  .attr("fill", "rgba(0,0,0,0)")
		  .on("mouseover", function() {    
		  	var activeTarget = this.attributes["class"].value.replace("session-target-", "");
		  	if (index < 4) {
		  		svg.selectAll(".dot.session-" + index + "." + "target-active-" + activeTarget)
		  			.attr("fill", sessionColorArray[index - 1]);
		  	} else {
		  		for (var j = 0; j <= 2; j++) {
		  			svg.selectAll(".dot.session-" + (j + 1) + "." + "target-active-" + activeTarget)
		  			.attr("fill", sessionColorArray[j]);
		  		}
		  	}
		  })
		  .on("mouseout", function(d) {  
		  	var activeTarget = this.attributes["class"].value.replace("session-target-", "");
		  	if (index < 4) {
		  		svg.selectAll(".dot.session-" + index + "." + "target-active-" + activeTarget)
		  		.attr("fill", "none");
		  	} else {
		  		for (var j = 0; j <= 2; j++) {
		  			svg.selectAll(".dot.session-" + (j + 1) + "." + "target-active-" + activeTarget)
		  			.attr("fill", "none");
		  		}
		  	}
		  });			
	}
}

// Crea i punti toccati dall'utente
TwoTargetExerciseChart.prototype.createDotPath = function(svg, dataVal, x, y, color, index) {
	
	svg.selectAll(".dot.session-" + index)
	  .data(dataVal)
	  .enter().append("circle")
	    .attr("class", function(d) { 
	    	return "dot session-" + index + " target-active-" + d.circle_active; 
	    })
	    .attr("r", 5)
	    .attr("cx", function(d) { return x(d.xN); })
	    .attr("cy", function(d) { return y(d.yN); })
	    .attr("fill", "none")
	    .attr("stroke", color)
	    .attr("stroke-width", 1)
	    .attr("stroke-opacity", 0.6);
}

// Crea un riepilogo con le informazioni sul grafico
TwoTargetExerciseChart.prototype.createTextInfo = function(dataH, sessionNumber) {
	
	var sessionValue = this.sessionID + "_" + sessionNumber;
//	var intestazione = "";
//	if (sessionNumber == 4) {
//		intestazione = "<strong>Media dei valori:</strong><br>"; 
//	}
	
	var dettaglioVariabili = "";
	var variabili = ["accuracy", "meanReactionTime", "totTaps"];
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
TwoTargetExerciseChart.prototype.getAverageHeader = function(dataH) {
	   
	var sumDataH = { accuracy: 0, meanReactionTime: 0, totTaps: 0};

	dataH.forEach(function(d) {
		sumDataH.accuracy += d.accuracy;
		sumDataH.meanReactionTime += d.meanReactionTime;
		sumDataH.totTaps += d.totTaps;
	});
	
	sumDataH.accuracy = sumDataH.accuracy / 3;
	sumDataH.meanReactionTime = sumDataH.meanReactionTime / 3;
	sumDataH.totTaps = sumDataH.totTaps  / 3;
	
	return sumDataH;
}

// Funzione che apre un'altra tab e mostra il grafico a dimensioni reali:
// recupera le dimensioni del dispositivo utilizzato dall'utente
// e stampa le traccie utilizzando i dati reali (non normalizzati)
TwoTargetExerciseChart.prototype.showSvgRealDimensions = function(sessionNumber) {

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
	
	this.createTargets(svg, this.getArrayTargetCoord(), this.targetMargin);
	
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
		 	 
		 svg.selectAll(".dot.session-" + index)
		  .data(selectData[i])
		  .enter().append("circle")
			  .attr("class", function(d) { 
			  	return "dot session-" + index + " target-active-" + d.circle_active; 
			  })
			  .attr("cx", function(d) { return d.xR; })
			  .attr("cy", function(d) { return d.yR; })
			  .attr("r", 5)
			  .attr("fill", "none")
		    .attr("stroke", color)
		    .attr("stroke-width", 1)
		    .attr("stroke-opacity", 0.6);
	 }
	
  return true;
}