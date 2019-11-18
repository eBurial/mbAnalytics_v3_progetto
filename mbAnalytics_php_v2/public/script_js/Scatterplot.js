/**
 * Classe che mi crea un oggetto di tipo Scatterplot
 * ovvero un oggetto che modella uno scatterplot
 * che contiene: l'etitÃ  astratta del grafico,
 * la gestione dei filtri, la crezione e l'aggiornamento
 * della parte grafica e l'interazione con l'utente
 */

// Costruttore
function Scatterplot(chartEntity)
{
    // EntitÃ 
    this.chartEntity = chartEntity;

    // Creo il formato per le etichette
    this.formatCount = d3.format(",.0f");

    // Dati relativi al contenitore del grafico
    this.margin = {top: 20, right: 20, bottom: 80, left: 80};		// Margini
    this.width = 860 - this.margin.left - this.margin.right;		// Larghezza
    this.height = 600 - this.margin.top - this.margin.bottom;		// Altezza

}

//Funzione utilizzata per creare uno scatterplot
Scatterplot.prototype.createVisualChart = function() {

    var chartEntity = this.chartEntity;

    var margin = this.margin;
    var height = this.height;
    var width = this.width;

    // Variabile dell'asse X
    var variabileX = chartEntity.variableList[0];
    this.variabileX = variabileX;
    var unitaDiMisuraX = unitaDiMisuraChartArray[variabileX];
    var siglaUnitaDiMisuraX = siglaUnitaDiMisuraArray[unitaDiMisuraX];
    var labelVarX = labelChartArray[variabileX];
    if (siglaUnitaDiMisuraX != "") {
        labelVarX += " (" + siglaUnitaDiMisuraX + ")";
    }

    // Variabile dell'asse Y
    var variabileY = chartEntity.variableList[1];
    this.variabileY = variabileY;
    var unitaDiMisuraY = unitaDiMisuraChartArray[variabileY];
    var siglaUnitaDiMisuraY = siglaUnitaDiMisuraArray[unitaDiMisuraY];
    var labelVarY = labelChartArray[variabileY];
    if (siglaUnitaDiMisuraY != "") {
        labelVarY += " (" + siglaUnitaDiMisuraY + ")";
    }

    // Filtro i dati
    var data = chartEntity.jsonData;

    // Creo il tooltip
    var tip = d3.tip()
    .attr("id", "d3-tip-" + chartEntity.id)
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {

        // Creo il valore da visualizzare nel tooltip
        return '<span class="tip-label">' + filtersLabelsArray.userGender + ': </span>' +
            '<span class="tip-value">' + genderArrayMap[""+d.gender] + '</span><br>' +
            '<span class="tip-label">' + filtersLabelsArray.sessionHand + ': </span>' +
            '<span class="tip-value">' + handArrayMap[""+d.hand] + '</span><br>' +
            '<span class="tip-label">' + labelVarX + ': </span>' +
            '<span class="tip-value">' +  d[variabileX] + '</span><br>' +
            '<span class="tip-label">' + labelVarY + ': </span>' +
            '<span class="tip-value">' + d[variabileY] + '</span><br>';
    });

    // Calcolo il minimo e massimo per l'asse delle X
    var minX = 0;
    var maxX = 1;
    if (unitaDiMisuraX != PERCENTUALE) {
        minX = d3.min(data, function(d) { return parseFloat(d[variabileX]); });
    }
    maxX = d3.max(data, function(d) { return parseFloat(d[variabileX]); });

    // Creo la scala per l'asse delle X
    var x = d3.scale.linear()
    .domain([minX, maxX])
    .range([0, width]);

    // Calcolo il minimo e massimo per l'asse delle Y
    var minY = 0;
    var maxY = 1;
    if (unitaDiMisuraY != PERCENTUALE) {
        minY = d3.min(data, function(d) { return parseFloat(d[variabileY]); });
    }
    maxY = d3.max(data, function(d) { return parseFloat(d[variabileY]); });

    // Creo la scala per l'asse delle Y
    var y = d3.scale.linear()
    .domain([minY, maxY])
    .range([height, 0]);

    // Creo una scala di colori
    var color = d3.scale.category10();

    // Creo l'asse delle X, specificando
    // la scala con .scale
    // la posizione con .orient
    var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");
    //.tickSize(-height);

    // Creo l'asse delle Y, specificando
    // la scala con .scale
    // la posizione con .orient
    var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");
    //.tickSize(-width);

    // Creo l'elemento SVG dove disegnare il grafico
    // applicanto una trasformazione
    // in particolare faccio una traslazione di tutti gli elementi
    var svg = d3.select("#grafico-" + chartEntity.id)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Disegno l'asse delle X
    svg.append("g")
        .attr("class", "x axis-scatterplot")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("class", "xlabel")
        .attr("x", width)
        .attr("y", 30)
        .style("text-anchor", "end")
        .text(labelVarX);

    // Disegno l'asse delle Y
    svg.append("g")
        .attr("class", "y axis-scatterplot")
        .call(yAxis)
        .append("text")
        .attr("class", "ylabel")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 20)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text(labelVarY)

    svg.call(tip);

    svg.selectAll(".dot-scatterplot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot-scatterplot")
        .attr("r", 3.5)
        .attr("cx", function(d) { return x(d[variabileX]); })
        .attr("cy", function(d) { return y(d[variabileY]); })
        .attr("display",  function(d) {
        if (chartEntity.filterElement(d)) {
            return "inline";
        }	else {
            return "none";
        }
    })
        .style("fill", function(d) { 
        if (d.status == 0) {
            return color(d.hand); 
        } else {
            return COLOR_ELEM_ESCLUSI;
        }
    })
        .on("mouseover", tip.show)
        .on("mouseout", tip.hide)
        .on("click", function(d) {
        //var btVisualizza = $("#bt-visualizza-grafico-" + chartEntity.id)

        showExerciseDetail(chartEntity.database,
                           chartEntity.exerciseType,
                           d.userID,
                           d.sessionID,
                           d.age,
                           d.dominantHand,
                           d.hand,
                           d.status,
                           chartEntity.id)
    });

    // Titolo della legenda
    svg.append("text")
        .attr("x", 0)
        .attr("y", height + margin.top + 10)
        .attr("dy", ".75em")
        .style("text-anchor", "start")
        .text(filtersLabelsArray.sessionHand + ":");

    // Legenda
    var legend = svg.selectAll(".legend")
    .data(color.domain())
    .enter()
    .append("g")
    .attr("class", "legend")
    .attr("transform", function(d, i) { return "translate(" + (i * 100 + 150) + ",0)"; });

    // Rettangolo colorato della legenda
    legend.append("rect")
        .attr("x", 0)
        .attr("y", height + margin.top + 10)
        .attr("width", 20)
        .attr("height", 20)
        .style("fill", color);

    // Etichetta della legenda
    legend.append("text")
        .attr("x", 25)
        .attr("y", height + margin.top + 10)
        .attr("dy", ".75em")
        .style("text-anchor", "start")
        .text(function(d) { return handArrayMap[""+d]; });


    $("#totale-sessioni-" + chartEntity.id)
        .text(customLabelsArray.numberSessions + ": " + chartEntity.jsonData.length);

    var  numVisibleCircle = svg.selectAll(".dot-scatterplot[display=inline]");
    $("#totale-sessioni-mostrate-" + chartEntity.id)
        .text(customLabelsArray.displayedSessions + ": " + numVisibleCircle[0].length);
}


// Funzione per aggiornare il grafico
Scatterplot.prototype.updateVisualChart = function() {

    var chartEntity = this.chartEntity;

    // Recupero l'elemento
    var svg = d3.select("#grafico-" + chartEntity.id);

    // Aggiorno gli attributi dei cerchi
    svg.selectAll(".dot-scatterplot")
        .attr("display", function(d) {
        if (chartEntity.filterElement(d)) {
            return "inline";
        }	else{
            return "none";
        }
    });

    $("#totale-sessioni-" + chartEntity.id)
        .text(customLabelsArray.numberSessions + ": " + chartEntity.jsonData.length);

    var  numVisibleCircle = svg.selectAll(".dot-scatterplot[display=inline]");
    $("#totale-sessioni-mostrate-" + chartEntity.id)
        .text(customLabelsArray.displayedSessions + ": " + numVisibleCircle[0].length);
}