/**
 * Classe che mi crea un oggetto di tipo ScatterplotMatrix
 * ovvero un oggetto che modella una matrice di scatterplot
 * che contiene: l'etità astratta del grafico,
 * la gestione dei filtri, la crezione e l'aggiornamento
 * della parte grafica e l'interazione con l'utente
 */

// Costruttore
function ScatterplotMatrix(chartEntity)
{
	// Entità
	this.chartEntity = chartEntity;
	
	// Creo il formato per le etichette
	this.formatCount = d3.format(",.0f");
	
	// Spazio tra uno scatterplot e l'altro
	this.padding = 20;
	
	// Array che contiene le dimensioni del grafico:
	// corrisponde alla lista di variabili selezionata dall'utente
	var dimensioni = this.getDimensioni();
	
	// Dati relativi al contenitore del grafico
	this.margin = {top: 20, right: 20, bottom: 50, left: 80};		// Margini
	this.width = 850 - this.margin.left - this.margin.right;		// Larghezza
	
	// Lato del singolo scatterplot (sarà disegnato come un quadrato)
	var spSize = this.getSpSize();
	
	// Altezza calcolata dalla dimensione del singolo scatterplot
	this.height = spSize * dimensioni.length;		// Altezza

	// Inizializzo 
	this.x = null;
	this.y = null;
	this.matrixRenderQueue = this.getMatrixRenderQueue();
	this.matrixRenderQueueSelection = this.getMatrixRenderQueueSelection();
}

//Funzione utilizzata per creare uno scatterplot
ScatterplotMatrix.prototype.createVisualChart = function() {
	
	var chartEntity = this.chartEntity;
	
	var margin = this.margin;
	var height = this.height;
	var width = this.width;
	var spSize = this.getSpSize();
	var padding = this.padding;
	
	// Imposto il range per l'asse delle X
	var x = this.updateX();

	// Imposto il range per l'asse delle Y
	var y = this.updateY();

	// Imposto le proprietà l'asse delle X che verrà disegnato
	var xAxis = d3.svg.axis()
	  .scale(x)
	  .orient("bottom")
	  .ticks(5);
	
	// Imposto le proprietà l'asse delle Y che verrà disegnato
	var yAxis = d3.svg.axis()
	  .scale(y)
	  .orient("left")
	  .ticks(5);

	var color = d3.scale.category10();

	// Aggiorno i dati che verranno utilizzati per popolare il grafico
	var data = this.updateData(chartEntity);
	
	var dimensioni = this.getDimensioni();
	var n = dimensioni.length;
	var dominioDimensioni = this.updateDominioDimensioni(chartEntity);
	
	this.matrixRenderQueue = this.getMatrixRenderQueue();
	this.matrixRenderQueueSelection = this.getMatrixRenderQueueSelection();
	
	// Dimensione dei singoli assi per uno scatterplot
	xAxis.tickSize(spSize * n);
	yAxis.tickSize(-spSize * n);
	
	// Seleziono il contenitore del grafico
  var grafico = d3.select("#grafico-" + chartEntity.id)
  	.style("width", (width + margin.left + margin.right) + "px")
  	.style("height", (height + margin.top + margin.bottom) + "px");
  
  // Creo un contenitore per i canvas
  var canvasContainer = grafico.append("div")
  		.attr("id", "canvas-container-sm-" + chartEntity.id)
  		.attr("class", "canvas-container-sm")
  		.style("width", (spSize * n + padding)  + "px")
	    .style("height", (spSize * n + padding) + "px")
	    .style("margin-left", margin.left + "px")
	    .style("margin-right", margin.right + "px")
	    .style("margin-top", margin.top + "px")
	    .style("margin-bottom", margin.bottom + "px")
  
	// Aggiungo il contenitore SVG necessario per contenere gli assi
	var svg = grafico
			.append("svg")
	    .attr("width", spSize * n + margin.left + margin.right)
  		.attr("height", spSize * n + margin.top + margin.bottom)
	    .attr("class", "svg-scatterplot-matrix")
	  .append("g")
	  	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
	// Aggiungo l'asse delle X per ogni scatterplot che costituisce la matrice
	svg.selectAll(".x.axis-scatterplot-matrix")
	    .data(dimensioni)
	  .enter().append("g")
	    .attr("class", "x axis-scatterplot-matrix")
	    .attr("transform", function(d, i) { 
	    	return "translate(" + (n - i - 1) * spSize + ",0)"; 
	    })
	    .each(function(d) { 
	    	x.domain(dominioDimensioni[d]); 
	    	d3.select(this).call(xAxis); 
	    })
	  .append("text")
	    .attr("class", "xlabel-scatterplot-matrix")
	    .attr("x", spSize)
	    .attr("y", height + 25)
	    .style("text-anchor", "end")
	    .text(function(d) { 
    		var unitaDiMisuraDim = unitaDiMisuraChartArray[d];
      	var siglaUnitaDiMisuraDim = siglaUnitaDiMisuraArray[unitaDiMisuraDim];
    		var labelDim = labelChartArray[d];
    		if (siglaUnitaDiMisuraDim != "") {
    			labelDim += " (" + siglaUnitaDiMisuraDim + ")";
    		}
    		return labelDim; 
    	});
	
	// Aggiungo l'asse delle Y per ogni scatterplot che costituisce la matrice
	svg.selectAll(".y.axis-scatterplot-matrix")
	    .data(dimensioni)
	  .enter().append("g")
	    .attr("class", "y axis-scatterplot-matrix")
	    .attr("transform", function(d, i) { 
	    	return "translate(0," + i * spSize + ")"; })
	    .each(function(d) { 
	    	y.domain(dominioDimensioni[d]); 
	    	d3.select(this).call(yAxis); 
	    })
	   .append("text")
	    .attr("class", "ylabel-scatterplot-matrix")
	    .attr("transform", "rotate(-90)")
	    .attr("y", 0 - margin.left + 20)
	    .attr("dy", ".71em")
	    .style("text-anchor", "end")
	    .text(function(d) { 
    		var unitaDiMisuraDim = unitaDiMisuraChartArray[d];
      	var siglaUnitaDiMisuraDim = siglaUnitaDiMisuraArray[unitaDiMisuraDim];
    		var labelDim = labelChartArray[d];
    		if (siglaUnitaDiMisuraDim != "") {
    			labelDim += " (" + siglaUnitaDiMisuraDim + ")";
    		}
    		return labelDim; 
    	});
	
	// Creo una matrice che mi contiene tutte le coppie di dimensioni
	// che utilizzerò per ogni scatterplot
	var matrice = this.getMatriceDimensioni();
 
	// Rettangolo che conterrà i punti
	var cell = svg.selectAll(".cell")
	    .data(matrice)
	  .enter().append("g")
	    .attr("class", "cell")
	    .attr("transform", function(d) { 
	    	return "translate(" + (n - d.i - 1) * spSize + "," + d.j * spSize + ")"; 
	    });
	
	cell.append("rect")
      .attr("class", "frame-scatterplot-matrix")
      .attr("x", padding / 2)
      .attr("y", padding / 2)
      .attr("width", spSize - padding)
      .attr("height", spSize - padding);
		
	/* Funzione precedente per stampare la matrice di scatterplot
	 * nel contenitore SVG
	 * Mantenuta per Debug e confronto con la nuova funzione per i canvas
	cell.each(plot);
	function plot(p) {
	  var cell = d3.select(this);
	
	  x.domain(dominioDimensioni[p.x]);
	  y.domain(dominioDimensioni[p.y]);
	
	  cell.selectAll("circle")
	      .data(data)
	    .enter().append("circle")
	    	.attr("class", "circle-scatterplot-matrix")
	      .attr("cx", function(d) { return x(d[p.x]); })
	      .attr("cy", function(d) { return y(d[p.y]); })
	      .attr("r", 3)
	      //.style("fill", function(d) { return color(d.species); });
	}
	d3.select(self.frameElement).style("height", spSize * n + padding + 20 + "px");
	*/
	
	var selfScatterplotMatrix = this;
	matrice.forEach(function(d) {
		if (d.i >= d.j) {
	  	// Aggiungo il canvas
	    canvasContainer.append("canvas")
	    	.attr("id", "canvas-sm-" + d.i + d.j +"-" + chartEntity.id)
	    	.attr("class", "canvas-scatterplot-matrix")
	  		.attr("width", spSize + "px")
	  	  .attr("height", spSize + "px")
	  	  //.style("background-color", ((d.i + d.j) % 2 == 0) ? "yellow" : "red")
	  	  //.style("opacity", 0.5)
	  	  .style("left", ((n - d.i - 1) * spSize) + "px")
	    	.style("top",  (d.j * spSize) + "px");
	    
	    // Aggiungo il canvas per la selezione
	    canvasContainer.append("canvas")
	    	.attr("id", "canvas-sm-brush-" + d.i + d.j +"-" + chartEntity.id)
	    	.attr("class", "canvas-scatterplot-matrix")
	  		.attr("width", spSize + "px")
	  	  .attr("height", spSize + "px")
	  	  .style("left", ((n - d.i - 1) * spSize) + "px")
	    	.style("top",  (d.j * spSize) + "px");
	  	  
	    // Recupero il canvas appena giunto il contesto
	    var ctx = document
	  		.getElementById("canvas-sm-" + d.i + d.j +"-" + chartEntity.id)
	  		.getContext("2d");
	
	    // Impostazioni per disegnare
	  	//ctx.strokeStyle = "rgba(0,0,0,0.8)";
	    ctx.strokeStyle = COLOR_MS_ELEM_INIT;
	  	ctx.lineWidth = "0";
	  	
	  	x.domain(dominioDimensioni[d.x]);
		  y.domain(dominioDimensioni[d.y]);
		
		  // Creo una renderQueue per il primo piano
		  var renderForeground = selfScatterplotMatrix.updateCircle();
		  selfScatterplotMatrix.matrixRenderQueue[d.i][d.j] = renderForeground;
		  
		  // Creo una renderQueue per la selezione
	 	  var renderSelection = selfScatterplotMatrix.updateCircle();
	 	  selfScatterplotMatrix.matrixRenderQueueSelection[d.i][d.j] = renderSelection;
		  
		  // Disegno i cerchi
		  renderForeground(selfScatterplotMatrix.getCircleParameters(ctx, x, y, d, data, COLOR_MS_ELEM_FOREGROUND));
		}  	
  });
	
	
	/* Funzione di selezione */
	this.brush = d3.svg.brush()
	  .x(x)
	  .y(y)
	  .on("brushstart", brushstart)
	  .on("brush", brushmove)
	  .on("brushend", brushend);
	
	cell.call(this.brush);
	
	this.brushCell;
	var dataSelection = [];
	
  function brushstart(p) {
  	
  	//Aggiorno i dati
    data = selfScatterplotMatrix.updateData(chartEntity);
  	
		matrice.forEach(function(d) {
			if (d.i >= d.j) {
				 // Recupero il canvas appena giunto il contesto
		     var ctx = document
		   		.getElementById("canvas-sm-brush-" + d.i + d.j +"-" + chartEntity.id)
		   		.getContext("2d");
		     
		 	  // Fermo eventuali operazioni di disegno in corso
		 	  selfScatterplotMatrix.matrixRenderQueueSelection[d.i][d.j].invalidate();
		  
		 	  // Cancello il canvas
		 	  ctx.clearRect(0, 0, spSize, spSize);
			}
	   });
  	
		x.domain(dominioDimensioni[p.x]);
    y.domain(dominioDimensioni[p.y]);
    
	  if (selfScatterplotMatrix.brushCell !== this) {
	    d3.select(selfScatterplotMatrix.brushCell).call(selfScatterplotMatrix.brush.clear());       
	    selfScatterplotMatrix.brushCell = this;
	  }
  }

  function brushmove(p) {
    var e = selfScatterplotMatrix.brush.extent();
   
    dataSelection = [];
    data.forEach(function(d) {
    	if ((d[p.x] > e[0][0] && d[p.x] < e[1][0]) &&
    			(d[p.y] > e[0][1] && d[p.y] < e[1][1])) {
    		
    		dataSelection.push(d);
    	}
    });
  }

  function brushend() {
  	matrice.forEach(function(d) {
  		if (d.i >= d.j) {
			 // Recupero il canvas appena giunto il contesto
	     var ctx = document
	   		.getElementById("canvas-sm-brush-" + d.i + d.j +"-" + chartEntity.id)
	   		.getContext("2d");
	
	     // Impostazioni per disegnare
	   	 //ctx.strokeStyle = "rgba(0,0,0,0.8)";
	     ctx.strokeStyle = COLOR_MS_ELEM_SELECTED;
	   	 ctx.lineWidth = "0";
	     	
	     	x.domain(dominioDimensioni[d.x]);
	   	  y.domain(dominioDimensioni[d.y]);
	   	
	   	  // Creo una renderQueue
	   	  var renderSelection = selfScatterplotMatrix.updateCircle();
	   	  selfScatterplotMatrix.matrixRenderQueueSelection[d.i][d.j] = renderSelection;
	   	  
	   	  // Disegno i cerchi
	   	  renderSelection(selfScatterplotMatrix.getCircleParameters(ctx, x, y, d, dataSelection, "#0000FF"));
  		}
  	});
  }

}

// Funzione per aggiornare il grafico
ScatterplotMatrix.prototype.updateVisualChart = function() {
	
	var chartEntity = this.chartEntity;
	var x = this.x;
	var y = this.y;
	var spSize = this.getSpSize();
	
	// Creo una matrice che mi contiene tutte le coppie di dimensioni
	// che utilizzerò per ogni scatterplot
	var matrice = this.getMatriceDimensioni();
 
	//Aggiorno i dati
  var data = this.updateData(chartEntity);
  
  var dimensioni = this.getDimensioni();
	var n = dimensioni.length;
	var dominioDimensioni = this.updateDominioDimensioni(chartEntity);
  
	d3.select(this.brushCell).call(this.brush.clear());
	
  var selfScatterplotMatrix = this;
	matrice.forEach(function(d) {
		if (d.i >= d.j) {
	    // Recupero il canvas appena giunto il contesto
	    var ctx = document
	  	.getElementById("canvas-sm-" + d.i + d.j +"-" + chartEntity.id)
	  	.getContext("2d");
	    
	    var ctxSelection = document
	  		.getElementById("canvas-sm-brush-" + d.i + d.j +"-" + chartEntity.id)
	  		.getContext("2d");
	
	    // Impostazioni per disegnare
	  	//ctx.strokeStyle = "rgba(0,0,0,0.8)";
	    ctx.strokeStyle = COLOR_MS_ELEM_INIT;
	  	ctx.lineWidth = "0";
	  
	  	// Fermo eventuali operazioni di disegno in corso
		  selfScatterplotMatrix.matrixRenderQueue[d.i][d.j].invalidate();
		  
		  // Fermo eventuali operazioni di disegno in corso
		  selfScatterplotMatrix.matrixRenderQueueSelection[d.i][d.j].invalidate();
		  
	  	// Cancello il canvas
	    ctx.clearRect(0, 0, spSize, spSize);
	    ctxSelection.clearRect(0, 0, spSize, spSize);
	    
	  	x.domain(dominioDimensioni[d.x]);
		  y.domain(dominioDimensioni[d.y]);
		
		  // Creo una renderQueue
		  var renderForeground = selfScatterplotMatrix.updateCircle();
		  selfScatterplotMatrix.matrixRenderQueue[d.i][d.j] = renderForeground;
		  
		  // Disegno i cerchi
		  renderForeground(selfScatterplotMatrix.getCircleParameters(ctx, x, y, d, data, COLOR_MS_ELEM_FOREGROUND));
		}
  });
  
}

ScatterplotMatrix.prototype.getDimensioni = function() {
	return this.chartEntity.variableList;
}

ScatterplotMatrix.prototype.getSpSize = function() {
	var dimensioni = this.getDimensioni();
	
	return Math.floor(this.width / dimensioni.length);
}

ScatterplotMatrix.prototype.getMatrixRenderQueue = function() {
	var matrixRenderQueue = [];
	var dimensioni = this.getDimensioni();
	
	for (var i = 0; i < dimensioni.length; i++) {
		matrixRenderQueue[i] = [];
		for (var j = 0; j < dimensioni.length; j++) {
			matrixRenderQueue[i][j] = null;
		}
	}
	
	return matrixRenderQueue;
}

ScatterplotMatrix.prototype.getMatrixRenderQueueSelection = function() {
	var matrixRenderQueueSelection = [];
	var dimensioni = this.getDimensioni();
	
	for (var i = 0; i < dimensioni.length; i++) {
		matrixRenderQueueSelection[i] = [];
		for (var j = 0; j < dimensioni.length; j++) {
			matrixRenderQueueSelection[i][j] = null;
		}
	}
	
	return matrixRenderQueueSelection;
}

//Metodo per creare la scala dell'asse X
ScatterplotMatrix.prototype.updateX = function() {
	var spSize = this.getSpSize();
	
	this.x = d3.scale.linear()
		.range([this.padding / 2, spSize - this.padding / 2]);
	
	return this.x;
}

//Metodo per creare la scala dell'asse Y
ScatterplotMatrix.prototype.updateY = function() {
	var spSize = this.getSpSize();
	
	this.y = d3.scale.linear()
	.range([spSize - this.padding / 2, this.padding / 2]);
	
	return this.y;
}

// Funzione per aggiornare il dominio delle dimensioni
ScatterplotMatrix.prototype.updateDominioDimensioni = function(chartEntity) {
	
	var dominioDimensioni = {};
	var dimensioni = this.getDimensioni();
	
	//Insieme di oggetti che rappresentano il minimo e il massimo
	// delle dimensioni che costituiranno i vari scatterplot
	dimensioni.forEach(function(dim) {
		
		// Recupero i dati della dimensione: unità di misura
		var unitaDiMisuraDim = unitaDiMisuraChartArray[dim];
		
		//Calcolo il minimo e massimo per l'asse delle Y
		var min = 0;
		var max = 1;
		if (unitaDiMisuraDim != PERCENTUALE) {
			min = d3.min(chartEntity.jsonData, function(d) { return parseFloat(d[dim]); });
		}
		max = d3.max(chartEntity.jsonData, function(d) { return parseFloat(d[dim]); });
		
		// Aggiungo il minimo e il massimo all'array associativo
		dominioDimensioni[dim] = [min, max];
	});
	
	return dominioDimensioni;
}

// Funzione che genera la matrice che contiene le coppie di dimensioni
ScatterplotMatrix.prototype.getMatriceDimensioni = function() {
	var dimensioni = this.getDimensioni();
  var c = [];
  var n = dimensioni.length; 
  var m = dimensioni.length; 
  var i; 
  var j;
  
  for (i = -1; ++i < n;) {
  	for (j = -1; ++j < m;) { 
  		c.push({x: dimensioni[i], i: i, y: dimensioni[j], j: j});
  	}
  }
  
  return c;
}

// Aggiorno la base di dati dalla quale viene il grafico
ScatterplotMatrix.prototype.updateData = function(chartEntity) {
	
	var data = [];
	chartEntity.jsonData.forEach(function(d) {
		if (chartEntity.filterElement(d)) {
			data.push(d);
		}
	});
	
	$("#totale-sessioni-" + chartEntity.id)
		.text(customLabelsArray.numberSessions + ": " + chartEntity.jsonData.length);

	$("#totale-sessioni-mostrate-" + chartEntity.id)
		.text(customLabelsArray.displayedSessions + ": " + data.length);
	
	return data;
}

// Aggiorno la base di dati dalla quale viene il grafico
ScatterplotMatrix.prototype.getCircleParameters = function(ctx, x, y, d, data, color) {
	
	return data.map(function(elem) {
		var xSc = x(elem[d.x]);
  	var ySc = y(elem[d.y]);
  	return [ctx, xSc, ySc, color];
	});

}

// Metodo per disegnare i cerchi
ScatterplotMatrix.prototype.updateCircle = function() {
	
	// Imposto la render queue
  var renderForeground = renderQueue(circle).rate(50);
  return renderForeground;
  
  //Funzione per disegnare i cerchi [ctx, x, y, color]
	function circle(args) {
		var ctx = args[0];
		var circeCenterX = args[1];	// Centro del cerchio, coordinata X
		var circeCenterY = args[2];	// Centro del cerchio, coordinata Y
		
		var colorCircle = args[3];	// Colore del cerchio
	  ctx.fillStyle = colorCircle;
	  
		ctx.beginPath();
	  /*
	   Parametri funzione .arc(x, y, r, sAngle, eAngle):
	   - x: coordinata X del centro del cerchio
	   - y: coordinata X del centro del cerchio;
	   - r: raggio;
	   - sAngle: angolo di inizio in radianti
	   - eAngle: angolo di fine in radianti
	  */
	  ctx.arc(circeCenterX, circeCenterY, 2, 0, 2 * Math.PI);
	  ctx.stroke();
	  ctx.fill();
	};	
}