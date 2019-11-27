/**
 * Classe che mi crea un oggetto di tipo Histogram
 * ovvero un oggetto che modella un istogramma,
 * che contiene l'etità astratta del grafico,
 * la gestione dei filtri, la crezione e l'aggiornamento
 * della parte grafica e l'interazione con l'utente
 */

// Costruttore
function Histogram(chartEntity)
{
    // Entità
    this.chartEntity = chartEntity;
    // Creo il formato per le etichette
    this.formatCount = d3.format(",.0f");

    // Dati relativi al contenitore del grafico
    this.margin = {top: 20, right: 10, bottom: 50, left: 80};		// Margini
    this.width = 850 - this.margin.left - this.margin.right;		// Larghezza
    this.height = 500 - this.margin.top - this.margin.bottom;		// Altezza

    // Inizializzo
    this.x = null;
    this.minX = 0;
    this.maxX = 1;
    this.y = null;
    this.xAxis = null;
    this.yAxis = null;

}

// Creazione della parte grafica
Histogram.prototype.createVisualChart = function() {

    var chartEntity = this.chartEntity;

    var margin = this.margin;
    var height = this.height;
    var width = this.width;

    // Variabile dell'asse X
    var variabileX = this.getVariabileX();
    var unitaDiMisuraX = unitaDiMisuraChartArray[variabileX];
    var siglaUnitaDiMisuraX = siglaUnitaDiMisuraArray[unitaDiMisuraX];
    var labelVarX = labelChartArray[variabileX];
    if (siglaUnitaDiMisuraX != "") {
        labelVarX += " (" + siglaUnitaDiMisuraX + ")";
    }

    var x = this.updateX(chartEntity, variabileX, unitaDiMisuraX);
    var minX = this.minX;
    var data = this.updateData(chartEntity, x, variabileX);
    var y = this.updateY(data);
    var xAxis = this.updateXAxis(x);
    var yAxis = this.updateYAxis(y);

    // Creo il tooltip
    var tip = d3.tip()
    .attr("id", "d3-tip-" + chartEntity.id)
    .attr("class", "d3-tip")
    .offset([-10, 0])
    .html(function(d) {

        // Creo il valore da visualizzare nel tooltip
        return '<span class="tip-label">' + labelVarX + ': ' + '</span>' +
            '<span class="tip-value">' + d.x + ' - ' + (d.x + d.dx) + '</span><br>' +
            '<span class="tip-label">' + labelChartArray.frequency + ': ' + '</span>' + 
            '<span class="tip-value">' + d.y + '</span><br>';
    })

    // Creo l'elemento SVG dove disegnare il grafico
    // applicanto una trasformazione
    // in particolare faccio una traslazione di tutti gli elementi
    var svg = d3.select("#grafico-" + chartEntity.id)
    .style("width", (width + margin.left + margin.right) + "px")
    .style("height", (height + margin.top + margin.bottom) + "px")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.call(tip);

    // Seleziono tutti gli elementi dell'istogramma
    // e se necessario ne creo di nuovi in base ai dati passati
    // applico inoltre una trasformazione ad ogni elemento 
    // per evitare sovrapposizioni
    var bar = svg.selectAll(".bar-histogram")
    .data(data)
    .enter().append("g")
    .attr("class", "bar-histogram")
    .attr("transform", function(d) { 
        return "translate(" + x(d.x) + "," + y(d.y) + ")"; 
    });

    // Aggiungo il rettangolo che mostrerà la distribuzione
    // specifico la coordinata x (influenzata dalla trasformazione applicata precedentemente)
    // la larghezza del rettangolo
    // l'altezza del rettangolo
    bar.append("rect")
        .attr("x", 0)
        .attr("width", function(d) {
        if ((minX >= 0 ) && ((x(d.dx) - 1) > 0)) {
            return x(d.dx) - 1;
        } else {
            return (width / data.length) - 1}
    })
        .attr("height", function(d) { 
        return height - y(d.y); 
    })
        .on("mouseover", tip.show)
        .on("mouseout", tip.hide);

    // Aggiungo l'asse delle X e l'etichetta
    svg.append("g")
        .attr("class", "x axis-histogram")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("class", "xlabel")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", margin.bottom - 20)
        .text(labelVarX);

    // Aggiungo l'asse delle Y e l'etichetta
    svg.append("g")
        .attr("class", "y axis-histogram")
        .attr("transform", "translate(0,0)")
        .call(yAxis)
        .append("text")
        .attr("class", "ylabel")
        .attr("y", 0 - margin.left + 20)
        .attr("dy", ".71em")
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "end")
        .text(labelChartArray.frequency);
}

// Funzione per aggiornare il grafico
Histogram.prototype.updateVisualChart = function() {

    var chartEntity = this.chartEntity;	
    var height = this.height;
    var width = this.width;
    var variabileX = this.getVariabileX();
    var unitaDiMisuraX = unitaDiMisuraChartArray[variabileX];
    var x = this.updateX(chartEntity, variabileX, unitaDiMisuraX);
    var minX = this.minX;
    var data = this.updateData(chartEntity, this.x, variabileX);
    var y = this.updateY(data);
    var yAxis = this.updateYAxis(y);

    // Recupero l'element
    var svg = d3.select("#grafico-" + chartEntity.id);

    // Aggiorno gli attributi delle barre
    svg.selectAll(".bar-histogram")
        .data(data).transition()
        .attr("class", "bar-histogram")
        .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

    // Aggiorno i rettangoli
    svg.selectAll("rect").data(data).transition()
        .attr("x", 0)
        .attr("width", function(d) {
        if ((minX >= 0 ) && ((x(d.dx) - 1) > 0)) { 
            return x(d.dx) - 1;
        } else {
            return (width / data.length) - 1}
    })
        .attr("height", function(d) { 
        return height - y(d.y); 
    });

    // Aggiorno l'asse y
    svg.selectAll("g.y.axis-histogram").call(yAxis);

}

Histogram.prototype.updateX = function(chartEntity, variabileX, unitaDiMisuraX) {

    //Calcolo il massimo e il minimo
    // Se è una percentuale posso comprenderla tra 0 e 1
    // Altrimenti devo trovare il minimo e il massimo
    this.minX = 0;
    this.maxX = 1;
    if (unitaDiMisuraX != PERCENTUALE) {
        this.minX = d3.min(chartEntity.jsonData, function(d) { return parseFloat(d[variabileX]); });
    }
    this.maxX = d3.max(chartEntity.jsonData, function(d) { return parseFloat(d[variabileX]); });
    // Incremento il massimo, altrimenti l'ultimo intervallo non si vede
    this.maxX = this.maxX * 1.05;

    // Creo la scala per l'asse delle X
    // Dominio: minimo e massimo della base di dati
    // Range: la larghezza del grafico
    this.x = d3.scale.linear()
        .domain([this.minX, this.maxX])					
        .range([0, this.width]);

    return this.x;
}

// Metodo che ritorna la variabile utilizzata
Histogram.prototype.getVariabileX = function() {
    return this.chartEntity.variableList[0];
}

// Creo la scala per l'asse delle y con
// Dominio: 0 e il massimo calcolato della distribuzione
// Range: l'altezza del grafico, invertito 
// perchè il sistema di riferimento parte dall'angolo in alto a sinistra
Histogram.prototype.updateY = function(data) {
    this.y = d3.scale.linear()
        .domain([0, d3.max(data, function(d) { return d.y; })])		
        .range([this.height, 0]);

    return this.y;
}


// Creo l'asse delle X, specificando
// la scala con .scale
// la posizione con .orient
Histogram.prototype.updateXAxis = function(x) {
    this.xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    return this.xAxis;
}

//Creo l'asse delle Y, specificando
//la scala con .scale
//la posizione con .orient
Histogram.prototype.updateYAxis = function(y) {

    this.yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    return this.yAxis;
}

// Aggiorno la base di dati dalla quale viene creato l'istogramma
Histogram.prototype.updateData = function(chartEntity, x, variabileX) {

    // Creo l'istogramma specificando:
    // quante colonne deve avere con .bins
    // il valore da prendere il considerazione per creare la distribuzione con .value
    // la base di dati
    var data = d3.layout.histogram()
    .bins(x.ticks(40))
    //.range([this.minX, this.maxX])
    .value(function(d) { 
        if (chartEntity.filterElement(d)) {
            return parseFloat(d[variabileX]);
        } 
    })
    (chartEntity.jsonData);

    $("#totale-sessioni-" + chartEntity.id)
        .text(customLabelsArray.numberSessions + ": " + chartEntity.jsonData.length);

    // Sommo tutte le frequenze per ottenere il numero di sessioni visualizzate
    var sommaFreq = 0;
    data.forEach(function(d) {sommaFreq += d.y})
    $("#totale-sessioni-mostrate-" + chartEntity.id)
        .text(customLabelsArray.displayedSessions + ": " + sommaFreq);

    return data;
}