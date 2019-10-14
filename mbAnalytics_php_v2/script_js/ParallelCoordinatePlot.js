/**
 * Classe che mi crea un oggetto di tipo ParallelCoordinatePlot
 * ovvero un oggetto che modella un grafico a coordinate parallele,
 * che contiene l'etitÃ  astratta del grafico,
 * la gestione dei filtri, la crezione e l'aggiornamento
 * della parte grafica e l'interazione con l'utente
 */

// Costruttore
function ParallelCoordinatePlot(chartEntity)
{
    this.chartEntity = chartEntity;

    // Dati relativi al contenitore del grafico
    this.margin = {top: 20, right: 20, bottom: 80, left: 80};		// Margini
    this.width = 850 - this.margin.left - this.margin.right;		// Larghezza
    this.height = 600 - this.margin.top - this.margin.bottom;		// Altezza

    // Array che contiene le dimensioni del grafico:
    // corrisponde alla lista di variabili selezionata dall'utente
    var dimensioni = this.getDimensioni();

    // Inizializzo
    this.x = null;
    this.y = {};
    this.data = [];
    this.tip = null;
}

ParallelCoordinatePlot.prototype.createVisualChart = function() {

    var chartEntity = this.chartEntity;

    var margin = this.margin;
    var height = this.height;
    var width = this.width;

    var dimensioni = this.getDimensioni();

    var x = this.updateX();
    var y = this.updateY(chartEntity, height);
    var line = d3.svg.line();
    var axis = d3.svg.axis().orient("left");

    // Seleziono il contenitore del grafico
    var grafico = d3.select("#grafico-" + chartEntity.id)
    .style("width", (width + margin.left + margin.right) + "px")
    .style("height", (height + margin.top + margin.bottom) + "px");

    // Aggiungo il canvas che conterrÃ  le linee in background
    grafico.append("canvas")
        .attr("id", "canvas-background-" + chartEntity.id)
        .attr("class", "canvas-parallel-coordinates");

    // Aggiungo il canvas che conterrÃ  le linee in primo piano
    grafico.append("canvas")
        .attr("id", "canvas-foreground-" + chartEntity.id)
        .attr("class", "canvas-parallel-coordinates")

    // Imposto larghezza e altezza ai canvas
    grafico.selectAll("canvas")
        .attr("width", width)
        .attr("height", height)
        .style("margin-left", margin.left + "px")
        .style("margin-right", margin.right + "px")
        .style("margin-top", margin.top + "px")
        .style("margin-bottom", margin.bottom + "px")

    // Recupero il context del canvas
    var foregroundCtx = this.getForegroundCtx();
    var backgroundCtx = this.getBackgroundCtx();

    this.tip = grafico.append("div")   
        .attr("class", "tooltip")               
        .style("opacity", 0);

    // Aggiungo il contenitore svg per contenere gli assi
    var mainSvg = grafico.append("svg")
    .attr("class", "svg-parallel-coordinates")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

    var svg = mainSvg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var svgForeground = svg.append("g")
    .attr("class", "svg-foreground");

    // Aggiorno i dati
    var data = this.updateData(chartEntity);

    //Imposto la render queue
    this.updatePath();
    var renderBackground = this.renderBackground;
    var renderForeground = this.renderForeground;

    renderBackground( data.map(function(d) { return [d, backgroundCtx, COLOR_PCP_ELEM_BACKGROUND]; }));
    renderForeground( data.map(function(d) { 
        var color = COLOR_PCP_ELEM_FOREGROUND;
        if (d.status == 1) {
            color = COLOR_ELEM_ESCLUSI;
        }
        return [d, foregroundCtx, color]; }));

    // Aggiungo un contenitore g per ogni dimensione
    var g = svg.selectAll(".dimension")
    .data(dimensioni)
    .enter().append("g")
    .attr("class", "dimension")
    .attr("transform", function(d) { return "translate(" + x(d) + ")"; });

    // Aggiungo un asse e un titolo
    g.append("g")
        .attr("class", "axis-parallel-coordinates")
        .each(function(d) { d3.select(this).call(axis.scale(y[d])); })
        .append("text")
        .attr("text-anchor", function(d, i) { 
        if (i + 1 == dimensioni.length) {
            return "end";
        } else {
            return "middle";
        }
    })
        .attr("y", height + 20)
        .text(function(d) { 
        var unitaDiMisuraDim = unitaDiMisuraChartArray[d];
        var siglaUnitaDiMisuraDim = siglaUnitaDiMisuraArray[unitaDiMisuraDim];
        var labelDim = labelChartArray[d];
        if (siglaUnitaDiMisuraDim != "") {
            labelDim += " (" + siglaUnitaDiMisuraDim + ")";
        }
        return labelDim; 
    });

    this.addBrush(g);
}	

// Funzione per aggiornare il grafico
ParallelCoordinatePlot.prototype.updateVisualChart = function() {

    var chartEntity = this.chartEntity;
    var x = this.x;
    var y = this.y;
    var dimensioni = this.getDimensioni();

    //Recupero il context del canvas
    var foregroundCtx = this.getForegroundCtx();
    var backgroundCtx = this.getBackgroundCtx();

    //Aggiorno i dati
    var data = this.updateData(chartEntity);

    //Imposto la render queue
    var renderBackground = this.renderBackground;
    var renderForeground = this.renderForeground;

    renderBackground.invalidate();
    renderForeground.invalidate();

    // Cancello la selezione dei cammini salvati nel svg
    d3.select("#grafico-" + chartEntity.id)
        .select(".svg-parallel-coordinates g")
        .select(".svg-foreground")
        .selectAll("path").remove();

    //Cancello il primo piano
    foregroundCtx.clearRect(0, 0, this.width, this.height);

    //Cancello il background
    backgroundCtx.clearRect(0, 0, this.width, this.height);

    renderBackground( data.map(function(d) { return [d, backgroundCtx, COLOR_PCP_ELEM_BACKGROUND]; }));
    renderForeground( data.map(function(d) { 
        var color = COLOR_PCP_ELEM_FOREGROUND;
        if (d.status == 1) {
            color = COLOR_ELEM_ESCLUSI;
        }
        return [d, foregroundCtx]; 
    }));

    var g = d3.select("#grafico-" + chartEntity.id)
    .select("svg")
    .selectAll(".dimension");
    this.addBrush(g);
}

ParallelCoordinatePlot.prototype.getDimensioni = function() {
    return this.chartEntity.variableList;
}

// Metodo per creare l'asse delle X
ParallelCoordinatePlot.prototype.updateX = function() {
    this.x = d3.scale.ordinal()
        .domain(this.getDimensioni())
        .rangePoints([0, this.width]);

    return this.x;
}

// Metodo per creare le dimensioni del grafico
ParallelCoordinatePlot.prototype.updateY = function(chartEntity, height) {

    var y = {};
    var dimensioni = this.getDimensioni();
    // Insieme di oggetti che rappresenta gli assi verticali,
    // uno per ogni dimensione
    dimensioni.forEach(function(dim) {

        // Recupero i dati della dimensione: unitÃ  di misura
        var unitaDiMisuraDim = unitaDiMisuraChartArray[dim];

        //Calcolo il minimo e massimo per l'asse delle Y
        var minY = 0;
        var maxY = 1;
        if (unitaDiMisuraDim != PERCENTUALE) {
            minY = d3.min(chartEntity.jsonData, function(d) { return parseFloat(d[dim]); });
        }
        maxY = d3.max(chartEntity.jsonData, function(d) { return parseFloat(d[dim]); });

        // Creo la scala per ogni dimensione da aggiungere
        // all'array associativo
        y[dim] = d3.scale.linear()
            .domain([minY, maxY])
            .range([height, 0]);
    });

    this.y = y;

    return this.y;
}

//Aggiorno la base di dati dalla quale viene il grafico
ParallelCoordinatePlot.prototype.updateData = function(chartEntity) {

    var data = [];
    chartEntity.jsonData.forEach(function(d) {
        if (chartEntity.filterElement(d)) {
            data.push(d);
        }
    });

    this.data = data;

    $("#totale-sessioni-" + chartEntity.id)
        .text(customLabelsArray.numberSessions + ": " + chartEntity.jsonData.length);

    $("#totale-sessioni-mostrate-" + chartEntity.id)
        .text(customLabelsArray.displayedSessions + ": " + data.length);

    return this.data;
}

ParallelCoordinatePlot.prototype.getForegroundCtx = function() {
    //Recupero il context del canvas
    this.foregroundCtx = document.getElementById("canvas-foreground-" + this.chartEntity.id)
        .getContext("2d");

    // Imposto il colore
    this.foregroundCtx.strokeStyle = COLOR_PCP_ELEM_FOREGROUND;

    return this.foregroundCtx;
}

ParallelCoordinatePlot.prototype.getBackgroundCtx = function() {
    //Recupero il context del canvas
    this.backgroundCtx = document.getElementById("canvas-background-" + this.chartEntity.id)
        .getContext("2d");

    // Imposto il colore
    this.backgroundCtx.strokeStyle = COLOR_PCP_ELEM_BACKGROUND;

    return this.backgroundCtx;
}

// Metodo per aggiornare le linee
ParallelCoordinatePlot.prototype.updatePath = function() {
    var dimensioni = this.getDimensioni();
    var x = this.x;
    var y = this.y;

    // Imposto la render queue
    this.renderBackground = renderQueue(path).rate(50);
    this.renderForeground = renderQueue(path).rate(50);

    // Funzione per disegnare le linee sul canvas
    function path(args) {
        var ctx = args[1];
        var d = args[0];
        var color = args[2];

        ctx.beginPath();
        ctx.strokeStyle = color;
        dimensioni.map(function(p,i) {
            if (i == 0) {
                ctx.moveTo(x(p),y[p](d[p]));
            } else { 
                ctx.lineTo(x(p),y[p](d[p]));
            }
        });
        ctx.stroke();
    };
}

// Metodo per aggiungere il brush agli assi
ParallelCoordinatePlot.prototype.addBrush = function(g) {

    // Recupero le variabili utilizzate
    var chartEntity = this.chartEntity;
    var width = this.width;
    var height = this.height;
    var dimensioni = this.getDimensioni();
    var x = this.x;
    var y = this.y;
    var data = this.data;
    var renderForeground = this.renderForeground;
    var foregroundCtx = this.foregroundCtx;
    var tip = this.tip;

    // Rimuovo eventuali brush
    g.selectAll(".brush-parallel-coordinates")
        .each(function(d) { 
        d3.select(this)
            .call(y[d].brush.clear()); 
    });

    // Rimuovo il gruppo per evitare duplicati
    g.selectAll(".brush-parallel-coordinates").remove();

    //Aggiungo e memorizzo un elemento brush per ogni dimensione
    g.append("g")
        .attr("class", "brush-parallel-coordinates")
        .each(function(d) { 
        d3.select(this)
            .call(y[d].brush = d3.svg.brush().y(y[d]).on("brush", brush)); 
    })
        .selectAll("rect")
        .attr("x", -8)
        .attr("width", 16);

    // Gestisco un evento di tipo brush
    // Mostrando o nascondendo le linee in primo piano
    function brush() {
        var actives = dimensioni.filter(function(p) { 
            return !y[p].brush.empty(); 
        }),
            extents = actives.map(function(p) { 
                return y[p].brush.extent(); 
            });

        // Recupero le linee selezionate
        var selected = [];
        data.map(function(d) {
            return actives.every(function(p, i) {
                return extents[i][0] <= d[p] && d[p] <= extents[i][1];
            }) ? selected.push(d) : null;
        });

        // Cancello il primo piano
        foregroundCtx.clearRect(0, 0, width, height);
        // Mostro le linee selezionate
        renderForeground( selected.map(function(d) { 
            var color = "rgba(70,130,180,0.5)";
            if (d.status == 1) {
                color = "grey";
            }
            return [d, foregroundCtx, color]; 
        }));

        if (selected.length <= 100) {
            var svgForeground = d3.select("#grafico-" + chartEntity.id)
            .select(".svg-parallel-coordinates g")
            .select(".svg-foreground");

            var svgPaths = svgForeground.selectAll("path")
            .data(selected, function(d) { return d.ID; });

            svgPaths.enter().append("path")
                .attr("d", function(d) {
                var lineFunction = d3.svg.line();

                return lineFunction(dimensioni.map(function(dim) { 
                    return [x(dim), y[dim](d[dim])];
                })); 
            })
                .attr("stroke", COLOR_PCP_ELEM_SELECTED)
                .attr("stroke-opacity", 1)
                .attr("stroke-width", 1)
                .attr("fill", "none")
                .on("mouseover", function(d) {

                d3.select(this)
                    .attr("stroke", COLOR_PCP_ELEM_HOVER)
                    .attr("stroke-opacity", 1)
                    .attr("stroke-width", 2);

                var tipContainer = $("#grafico-" + chartEntity.id);
                var tipX = d3.event.pageX - tipContainer.offset().left + 10;
                var tipY = d3.event.pageY - tipContainer.offset().top;

                var htmlDim = "";
                dimensioni.forEach(function(dim) {

                    if (dim != "age") {
                        htmlDim += '<br>';
                        htmlDim += '<span class="tip-label">' + labelChartArray[dim] + ': </span>' +
                            '<span class="tip-value">' + d[dim] + '</span>';
                    }
                });

                //tip.transition()        
                //    .duration(200)      
                //    .style("opacity", .9);

                // Creo il valore da visualizzare nel tooltip
                tip.html(
                    '<span class="tip-label">' + labelChartArray.age+ ': </span>' +
                    '<span class="tip-value">' + d.age + '</span><br>' +
                    '<span class="tip-label">' + filtersLabelsArray.userGender + ': </span>' +
                    '<span class="tip-value">' + d.gender + '</span><br>' +
                    '<span class="tip-label">' + filtersLabelsArray.sessionHand + ': </span>' +
                    '<span class="tip-value">' +  d.hand + '</span>' + 
                    htmlDim)  
                    .style("left", tipX + "px")     
                    .style("top", tipY + "px")
                    .style("z-index", 10)
                    .style("opacity", 0.9);    
            })                  
                .on("mouseout", function(d) {       
                //tip.transition()        
                //	.duration(200)      
                // .style("opacity", 0);   

                tip.style("opacity", 0);   

                d3.select(this)
                    .attr("stroke", COLOR_PCP_ELEM_SELECTED)
                    .attr("stroke-opacity", 1)
                    .attr("stroke-width", 1);
            })
                .on("click", function(d) {
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

            svgPaths.exit().remove();
        } else {
            d3.select("#grafico-" + chartEntity.id)
                .select(".svg-parallel-coordinates g")
                .select(".svg-foreground")
                .selectAll("path").remove();
        }
    }

}