/**
 * Classe che mi crea un oggetto di tipo Boxplot
 * ovvero un oggetto che modella un boxplot,
 * che contiene l'etitÃ  astratta del grafico,
 * la gestione dei filtri, la crezione e l'aggiornamento
 * della parte grafica e l'interazione con l'utente
 */

// Costruttore
function Boxplot(chartEntity, jData)
{
    //EntitÃ 
    this.chartEntity = chartEntity;

    //Dati relativi al contenitore del grafico
    this.margin = {top: 20, right: 20, bottom: 50, left: 80};		// Margini
    this.width = 850 - this.margin.left - this.margin.right;		// Larghezza
    this.height = 500 - this.margin.top - this.margin.bottom;		// Altezza

    //Mostro le etichette nel Boxplot
    this.labels = true;

    // Inizializzo
    this.x = null;
    this.y = null;
    this.minY = null;
    this.maxY = null;
    this.xAxis = null;
    this.yAxis = null;
}

// Funzione utilizzata per creare un boxplot
Boxplot.prototype.createVisualChart = function() {

    var chartEntity = this.chartEntity;

    var margin = this.margin;
    var height = this.height;
    var width = this.width;

    var variabileX = this.getVariabileX();
    var unitaDiMisuraX = this.getUnitaDiMisuraX();
    var labelVarX = this.getLabelVarX();

    var data = this.updateData(chartEntity, variabileX)
    var x = this.updateX(data);
    var minY = this.updateMinY(data);
    var maxY = this.updateMaxY(data);
    var y = this.updateY(data);
    var yAxis = this.updateYAxis(y);
    var chart = this.updateBoxplotChart();

    var svg = d3.select("#grafico-" + chartEntity.id)
    .style("width", (width + margin.left + margin.right) + "px")
    .style("height", (height + margin.top + margin.bottom) + "px")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("class", "box-boxplot")    
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");	

    var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

    // Disegno il boxplot	
    svg.selectAll(".box-boxplot")	   
        .data(data)
        .enter().append("g")
        .attr("class", "g-boxplot")
        .attr("transform", function(d) { return "translate(" +  x(d[0])  + ", 0)"; } )
        .call(chart); 

    //Aggiungo l'asse delle Y e l'etichetta
    svg.append("g")
        .attr("class", "y axis-boxplot")
        .attr("transform", "translate(0,0)")
        .call(yAxis);	

    // Aggiungo l'asse delle X
    svg.append("g")
        .attr("class", "x axis-boxplot")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

}

// Funzione per aggiornare il grafico
Boxplot.prototype.updateVisualChart = function() {

    var chartEntity = this.chartEntity;
    var variabileX = this.getVariabileX();
    var labelVarX = this.getLabelVarX();
    var data = this.updateData(chartEntity, variabileX, labelVarX)
    var minY = this.updateMinY(data);
    var maxY = this.updateMaxY(data);
    var y = this.updateY(data);
    var yAxis = this.updateYAxis(y);
    var chart = this.updateBoxplotChart();

    var svg = d3.select("#grafico-" + chartEntity.id);
    svg.selectAll(".box-boxplot").data(data)
        .select(".g-boxplot")
        .call(chart.duration(1000));

    // Aggiorno l'asse y
    svg.selectAll("g.y.axis-boxplot").call(yAxis);
}

Boxplot.prototype.updateBoxplotChart = function() {
    var chart = d3.box()
    .whiskers(iqr(1.5))
    .width(this.x.rangeBand())
    .height(this.height)	
    .domain([this.minY, this.maxY])
    .showLabels(this.labels);

    return chart;

    //Returns a function to compute the interquartile range.
    function iqr(k) {
        return function(d, i) {
            var q1 = d.quartiles[0],
                q3 = d.quartiles[2],
                iqr = (q3 - q1) * k,
                i = -1,
                j = d.length;
            while (d[++i] < q1 - iqr);
            while (d[--j] > q3 + iqr);
            return [i, j];
        };
    }
}

Boxplot.prototype.getVariabileX = function() {
    return this.chartEntity.variableList[0];
}

Boxplot.prototype.getUnitaDiMisuraX = function() {
    var variabileX = this.getVariabileX()
    return unitaDiMisuraChartArray[variabileX]
}

Boxplot.prototype.getLabelVarX = function() {
    var variabileX = this.getVariabileX();
    var labelVarX = labelChartArray[variabileX];
    var unitaDiMisuraX = this.getUnitaDiMisuraX();
    var siglaUnitaDiMisuraX = siglaUnitaDiMisuraArray[unitaDiMisuraX];	
    if (siglaUnitaDiMisuraX != "") {
        labelVarX += " (" + siglaUnitaDiMisuraX + ")";
    }

    return labelVarX;
}

Boxplot.prototype.updateX = function(data) {

    //Asse delle X
    this.x = d3.scale.ordinal()	   
        .domain( data.map(function(d) { return d[0] } ) )	    
        .rangeRoundBands([0, this.width], 0.7, 0.3);

    return this.x;
}

Boxplot.prototype.updateMinY = function(data) {
    // Calcolo il minimo
    this.minY = 0;
    if (this.getUnitaDiMisuraX() != PERCENTUALE) {
        this.minY = d3.min(data[0][1]);
    }

    return this.minY;
}

Boxplot.prototype.updateMaxY = function(data) {
    // Calcolo il massimo
    this.maxY = 1;
    //if (this.getUnitaDiMisuraX != PERCENTUALE) {
    this.maxY = d3.max(data[0][1]);
    //}

    return this.maxY;
}

Boxplot.prototype.updateY = function(data) {

    //Asse delle Y
    this.y = d3.scale.linear()
        .domain([this.minY, this.maxY])
        .range([this.height, 0]);

    return this.y;
}

Boxplot.prototype.updateYAxis = function(y) {
    this.yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    return this.yAxis;
}

//Aggiorno la base di dati dalla quale viene creato l'istogramma
Boxplot.prototype.updateData = function(chartEntity, variabileX) {

    //Trasformo i dati in un array accettabile
    var data = [];
    data[0] = [];

    data[0][0] = this.getLabelVarX();

    data[0][1] = [];
    chartEntity.jsonData.forEach(function(d) {
        if (chartEntity.filterElement(d)) {
            data[0][1].push(parseFloat(d[variabileX]));
        }
    });

    $("#totale-sessioni-" + chartEntity.id)
        .text(customLabelsArray.numberSessions + ": " + chartEntity.jsonData.length);

    $("#totale-sessioni-mostrate-" + chartEntity.id)
        .text(customLabelsArray.displayedSessions + ": " + data[0][1].length);

    return data;
}
