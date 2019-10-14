/**
 * Classe che mi crea un oggetto di tipo ParallelSetPlot
 * ovvero un oggetto che modella un grafico a insiemi paralleli,
 * che contiene l'etitÃ  astratta del grafico,
 * la gestione dei filtri, la crezione e l'aggiornamento
 * della parte grafica e l'interazione con l'utente
 */

// Costruttore
function ParallelSetPlot(chartEntity)
{
	this.chartEntity = chartEntity;
	
	// Dati relativi al contenitore del grafico
	this.margin = {top: 20, right: 20, bottom: 80, left: 80};		// Margini
	this.width = 850 - this.margin.left - this.margin.right;		// Larghezza
	this.height = 600 - this.margin.top - this.margin.bottom;		// Altezza
	
	// Array che contiene le dimensioni del grafico:
	// corrisponde alla lista di variabili selezionata dall'utente
	this.dimensioni = this.getDimensioni();
	
	// Inizializzo
	this.chart = null;
	// Intervalli arbitrari definiti a priori per raggruppare
	// i dati in base alla frequenza
	this.y = {
			age: 20,
			accuracy: 0.2,
			distanceTot: 1000,
			deviationIndex: 0.2,
			time: 10,
			distanceCorrect: 1000,
			turnsInside: 10,
			totalSpeed: 20,
			adjustedAccuracy: 0.2,
			adjustedSpeed: 20,
			totTaps: 20,
			meanReactionTime: 2
	};
	this.data = [];
	this.svg = null;
}

ParallelSetPlot.prototype.createVisualChart = function() {
	
	var chartEntity = this.chartEntity;

	var margin = this.margin;
	var height = this.height;
	var width = this.width;
	
	var dimensioni = this.getDimensioni();	
	var y = this.y;
  	
  // Seleziono il contenitore del grafico
  var grafico = d3.select("#grafico-" + chartEntity.id)
			.style("width", (width + margin.left + margin.right) + "px")
  		.style("height", (height + margin.top + margin.bottom) + "px");
  
  this.chart = d3.parsets()
  	.width(width)
  	.height(height)
  	.dimensions(dimensioni)
  	.dimensionFormat(function(d) {
    	var unitaDiMisuraDim = unitaDiMisuraChartArray[d];
    	var siglaUnitaDiMisuraDim = siglaUnitaDiMisuraArray[unitaDiMisuraDim];
  		var labelDim = labelChartArray[d];
  		if (siglaUnitaDiMisuraDim != "") {
  			labelDim += " (" + siglaUnitaDiMisuraDim + ")";
  		}
  		return labelDim;
  	});

	this.svg = grafico.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
	var data = this.updateData(chartEntity);

	this.svg.datum(data).call(this.chart);

}

// Funzione per aggiornare il grafico
ParallelSetPlot.prototype.updateVisualChart = function() {
	
	var chartEntity = this.chartEntity;
	
	var margin = this.margin;
	var height = this.height;
	var width = this.width;
	
	var dimensioni = this.getDimensioni();	
	var y = this.y;
	
	// Rimuovo eventuali elementi
	$("#grafico-" + chartEntity.id + " > svg").remove();
	
	// Recupero l'elemento
	var svg = d3.select("#grafico-" + chartEntity.id).append("svg")
  		.attr("width", width + margin.left + margin.right)
  		.attr("height", height + margin.top + margin.bottom)
  	.append("g")
  		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
	var data = this.updateData(chartEntity);

	try {
		svg.datum(data).call(this.chart);
	}
	catch (err) {
		$(".error").text("Attenzione: errore nella creazione del grafico.");
		$(".error").fadeIn(400).delay(3000).fadeOut(400);
		console.log("Errore nella creazione del grafico:" + err);
	}
}

ParallelSetPlot.prototype.getDimensioni = function() {
	return this.chartEntity.variableList;
}

// Aggiorno la base di dati dalla quale viene creato il grafico
ParallelSetPlot.prototype.updateData = function(chartEntity) {
	
	var dimensioni = this.getDimensioni();
	var data = [];
	var y = this.y;
	
	// Funzione di aggragazione per raggruppare i dati
	function band(d, interval, dim) {
		// Controllo che l'elemento sia definito
		if (d == null || d == undefined) {
			return "No Data";
		}
		
		// Parte intera della divisione
		var quotient = Math.floor(d / interval);
		
		// Creo le etichette
		var minLabelIntervallo = quotient * interval;
		var maxLabelIntervallo = (quotient + 1) * interval;
		
		var unitaDiMisuraDim = unitaDiMisuraChartArray[dim];
		if (unitaDiMisuraDim == PERCENTUALE) {
			minLabelIntervallo = minLabelIntervallo.toFixed(2);
			maxLabelIntervallo = (maxLabelIntervallo - 0.01).toFixed(2);
		}
		else {
			maxLabelIntervallo = maxLabelIntervallo - 1;
		}
		
		var etichettaIntervallo = minLabelIntervallo + " - " + maxLabelIntervallo;
		
		return etichettaIntervallo;
	}

	// Ciclo per i dati
	chartEntity.jsonData.forEach(function(jElem) {
		
		var elemSupp = {};
		
		// Se un elemento passa i filtri selezionati dall'utente
		if (chartEntity.filterElement(jElem)) {
			// Per ogni dimensione
			dimensioni.forEach(function(dim) {
				// Applico la funzione di aggregazione
				elemSupp[dim] = band(jElem[dim], y[dim], dim);
			})
			data.push(elemSupp);
		}
	});
	
	this.data = data;
	
	$("#totale-sessioni-" + chartEntity.id)
		.text(customLabelsArray.numberSessions + ": " + chartEntity.jsonData.length);

	$("#totale-sessioni-mostrate-" + chartEntity.id)
		.text(customLabelsArray.displayedSessions + ": " + data.length);
	
	return this.data;
}
