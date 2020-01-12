/**
 * Classe utilizzata per modellare un oggetto Chart.
 * Sono definite le seguenti property:
 * - id: stringa che identifica univocamente il grafico;
 * - charType: stringa che identifica il tipo di grafico;
 * - database: stringa che identifica il database da cui recuperare i dati;
 * - exerciseType: stringa che identifica il tipo di esercizio collegato al grafico;
 * - variableList: array che identifica le variabili collegate alle dimensioni del grafico;
 * - jsonData: stringa che contiene i dati del grafico in formato json;
 */

// Costruttore
function ChartEntity(uniqueId) {

    // Proprietà  del grafico
    this.id = uniqueId;

    // Inizializzo i parametri
    this.database = VALUE_NOT_SELECTED;
    this.chartType = VALUE_NOT_SELECTED;
    this.exerciseType = VALUE_NOT_SELECTED;
    this.variableList = [];
    this.jsonData = null;

    // Inizializzo i filtri
    this.minAge = 10;
    this.maxAge = 100;
    this.rangeAge = 10;
    this.ageButtons = [];
    this.arrayAgeState = new Array(this.maxAge + 1);
    this.gender = genderArrayValue[0];
    this.dominantHand = handArrayValue[0];
    this.sessionHand = handArrayValue[0];
}

ChartEntity.prototype.setParameters = function(db, chartT, exType, variableList, jsonData) {
    this.database = db;
    this.chartType = chartT;
    this.exerciseType = exType;
    this.variableList = variableList;
    this.jsonData = jsonData;
}

ChartEntity.prototype.setDatabase = function(db) {
    this.database = db;
}

ChartEntity.prototype.setChartType = function(chartT) {
    this.chartType = chartT;
}

ChartEntity.prototype.setExerciseType = function(exType) {
    this.exerciseType = exType;
}

ChartEntity.prototype.setVariableAtIndex = function(index, variable) {
    if (this.variableList.length < index) {
        return;
    }

    this.variableList[index] = variable;
}

ChartEntity.prototype.setVariableList = function(variableList) {

    this.variableList = variableList;
}

ChartEntity.prototype.setJsonData = function(jsonData) {
    this.jsonData = jsonData;
}

ChartEntity.prototype.setAgeFilters = function(min, max, range) {
    this.minAge = min;
    this.maxAge = max;
    this.rangeAge = range;
};

ChartEntity.prototype.setMinAgeFilter = function(min) {

    min = parseInt(min);

    if (isNaN(min)) {
        min = 0;
    }

    if (min < 0) {
        min = 0;
    }

    this.minAge = min;
};

ChartEntity.prototype.setMaxAgeFilter = function(max) {

    max = parseInt(max);

    if (isNaN(max)) {
        max = 110;
    }

    if (max < 0) {
        max = 110;
    }

    this.maxAge = max;
};

ChartEntity.prototype.setRangeAgeFilter = function(range) {

    range = parseInt(range);

    if (isNaN(range)) {
        range = 10;
    }

    if (range < 1) {
        range = 10;
    }

    this.rangeAge = range;
};

ChartEntity.prototype.setArrayAgeState = function() {
    this.arrayAgeState = new Array(this.maxAge + 1);
    for (var i = 0; i < this.arrayAgeState.length; i++) {
        this.arrayAgeState[i] = true;
    }
}

ChartEntity.prototype.changeArrayAgeState = function(ageButton) {
    for (var i = ageButton.min; i <= ageButton.max; i++) {
        this.arrayAgeState[i] = ageButton.active;
    }
}

ChartEntity.prototype.getAgeButtonsState = function() {
    var ageButtonsState = [];
    for (var i=0; i < this.ageButtons.length; i++) {
        ageButtonsState.push(this.ageButtons[i].active ? 1 : 0);
    }

    return ageButtonsState;
}

ChartEntity.prototype.setGenderFilter = function(genderValue) {

    if (!genderValue) {
        genderValue = VALUE_NOT_SELECTED;
    }

    this.gender = genderValue;
};

ChartEntity.prototype.setDominantHandFilter = function(hand) {

    if (!hand) {
        hand = VALUE_NOT_SELECTED;
    }
    this.dominantHand = hand;


};

ChartEntity.prototype.setSessionHandFilter = function(hand) {

    if (!hand) {
        hand = VALUE_NOT_SELECTED;
    }

    this.sessionHand = hand;
};

// Metodo che ritorna la struttura HTML per la selezione dei parametri
ChartEntity.prototype.getHtmlParameters = function(db) {

    var htmlParameters = 
        '<div class="parameters-container">' +
        '<div class="lb-parametri-caption">' + filtersLabelsArray.parametersTitle + '</div>'

    // Selezione database
    htmlParameters += '<div class="parametro-container">';
    htmlParameters += '<label for="cb-database-' + this.id + '" ' + 
        'class="lb-parametro" >' + filtersLabelsArray.database + ': ' + '</label>';
    htmlParameters += '<select id="cb-database-' + this.id + '" ' +
        'class="cb-parametro" name="database-value">';
    
    var databaseArray = db.split(",");
    databaseArray.unshift(VALUE_NOT_SELECTED);

    for (var i = 0; i < databaseArray.length; i++) {
        htmlParameters += '<option value="';
        htmlParameters += databaseArray[i] + '"';

        if (databaseArray[i] == VALUE_NOT_SELECTED) {
            htmlParameters += ' disabled';
        }

        if (databaseArray[i] == this.database) {
            htmlParameters += ' selected';
        }

        htmlParameters += ' >';
        htmlParameters += databaseArray[i].toUpperCase();
        htmlParameters += '</option>';
    } 

    htmlParameters += '</select>';
    htmlParameters += '</div>'

    // Selezione esercizio
    htmlParameters += '<div class="parametro-container">';
    htmlParameters += '<label for="cb-esercizio-' + this.id + '" ' + 
        'class="lb-parametro" >' + filtersLabelsArray.exerciseType + ': ' + '</label>';
    htmlParameters += '<select id="cb-esercizio-' + this.id + '" ' +
        'class="cb-parametro" name="exercise-value">';

    for (var i = 0; i < exerciseArrayText.length; i++) {
        htmlParameters += '<option value="';
        htmlParameters += exerciseArrayValue[i] + '"';

        if (exerciseArrayValue[i] == VALUE_NOT_SELECTED) {
            htmlParameters += ' disabled';
        }

        if (exerciseArrayValue[i] == this.exerciseType) {
            htmlParameters += ' selected';
        }

        htmlParameters += ' >';
        htmlParameters += exerciseArrayText[i];
        htmlParameters += '</option>';
    } 

    htmlParameters += '</select>';
    htmlParameters += '</div>'

    // Tipo di grafico
    htmlParameters += '<div class="parametro-container">';
    htmlParameters += '<label for="cb-grafico-' + this.id + '" ' + 
        'class="lb-parametro" >' + filtersLabelsArray.graphType + ': ' + '</label>';
    htmlParameters += '<select id="cb-grafico-' + this.id + '" ' + 
        'class="cb-parametro" name="graphic-value">';

    for (var i = 0; i < chartArrayText.length; i++) {
        htmlParameters += '<option value="';
        htmlParameters += chartArrayValue[i] + '"';

        if (chartArrayValue[i] == VALUE_NOT_SELECTED) {
            htmlParameters += ' disabled';
        }

        if (chartArrayValue[i] == this.chartType) {
            htmlParameters += ' selected';
        }

        htmlParameters += ' >';
        htmlParameters += chartArrayText[i];
        htmlParameters += '</option>';
    }

    htmlParameters += '</select>';
    htmlParameters += '</div>';

    // Contenitore variabili
    htmlParameters += '<div id="container-variabili-' + this.id + '" ' + 
        'class="variables-container">' +											
        '</div>';

    // Bottone per visualizzare il grafico
    htmlParameters += '<button id="bt-visualizza-grafico-' + this.id + '" ' +
        'class="bt-positive" >' + filtersLabelsArray.createGraphButton + '</button>';

    htmlParameters += '</div>'

    return htmlParameters;

}

// Metodo che ritorna la struttura HTML per la selezione delle variabili
ChartEntity.prototype.getHtmlVariables = function(maxVariables) {
    var htmlVariables = '';

    if ((this.exerciseType == null) || 
        (this.chartType == null) ||
        (this.database == null)) {
        return htmlVariables;
    }

    if ((this.exerciseType == VALUE_NOT_SELECTED) || 
        (this.chartType == VALUE_NOT_SELECTED) ||
        (this.database == VALUE_NOT_SELECTED)) {
        return htmlVariables;
    }

    //htmlVariables += '<div class="txt-seleziona-variabili">';

    // Numero massimo delle variabili da mostrare
    //var maxVarToShow = numVarChartArray[this.chartType].numero;
    if(maxVariables != null){
        var maxVarToShow = maxVariables;
    }else{
        var maxVarToShow = numVarChartArray[this.chartType].numero;
    }

    // Variabile per mostrare il bottone che 
    //permette all'utente di aggiungere altre variabili
    var showBtAggiungiVar = !numVarChartArray[this.chartType].max;

    // Mostro tante combo quante sono le variabili da
    // collegare alle dimensioni del grafico
    for (var i = 0; i < maxVarToShow; i++) {

        if (this.variableList.length - 1 < i) {
            this.variableList[i] = VALUE_NOT_SELECTED;
        }

        // Creo label e combo per l'aggiunta della variabile
        htmlVariables += this.getHtmlCbVar(i, false);
    }

    // Mostro il bottone per aggiungere altre variabili
    if (showBtAggiungiVar) {
        htmlVariables += '<div>';
        htmlVariables += '<button id="bt-aggiungi-variabile-' + this.id + '" ' +
            'class="bt-positive bt-aggiungi-variabile">' + filtersLabelsArray.addVariableButton + '</button>';
        htmlVariables += '</div>';
    }

    //htmlVariables += '</div>';

    // Svuoto il contenuto
    $("#container-variabili-" + this.id).empty();

    // Aggiungo il nuovo contenuto
    $("#container-variabili-" + this.id).append(htmlVariables);
}

// Metodo che crea il codice HTML per la selezione di una variabile
ChartEntity.prototype.getHtmlCbVar = function(varIndex, showBtElimina) {
    var htmlCbVariable = '';

    var nVar = varIndex + 1;

    htmlCbVariable += 
        '<div>' +
        '<label class="lb-variabile" ' +
        'for="cb-variabile-' + this.id + '-' + nVar +'">' + filtersLabelsArray.genericVariable
        + ' ' + nVar + ':</label>' +
        '<select id="cb-variabile-' + this.id + '-' + nVar + '" ' +
        'class="cb-standard cb-variabile cb-variabile-' + this.id + '" ' +
        'name="bindvariable' + nVar + '-value">';

    // Aggiungo le variabili comuni
    for (var k = 0; k < varCommonTypeArrayText.length; k++) {
        htmlCbVariable += '<option value="';
        htmlCbVariable += varCommonTypeArrayValue[k] + '"';

        if (varCommonTypeArrayValue[k] == VALUE_NOT_SELECTED) {
            htmlCbVariable += ' disabled';
        }

        if (varCommonTypeArrayValue[k] == this.variableList[varIndex]) {
            htmlCbVariable += ' selected';
        }

        htmlCbVariable += ' >';
        htmlCbVariable += varCommonTypeArrayText[k];
        htmlCbVariable += '</option>';
    }

    // Aggiungo le variabili proprie dell'esercizio
    for (var j = 0; j < varTypeArrayText[this.exerciseType].length; j++) {

        htmlCbVariable += '<option value="';
        htmlCbVariable += varTypeArrayValue[this.exerciseType][j] + '"';

        if (varTypeArrayValue[this.exerciseType][j] == this.variableList[varIndex]) {
            htmlCbVariable += ' selected';
        }

        htmlCbVariable += ' >';
        htmlCbVariable += varTypeArrayText[this.exerciseType][j];
        htmlCbVariable += '</option>';
    }

    htmlCbVariable += '</select>';

    if (showBtElimina) {
        htmlCbVariable += '<button id="bt-elimina-variabile-' + this.id + '-' + nVar + '" ' +
            'class="bt-negative bt-elimina-variabile" >' + filtersLabelsArray.deleteVariableButton + '</button>';

        // Nascondo il precedente bottone
        $("#bt-elimina-variabile-" + this.id + '-' +  (nVar - 1)).hide();
    }

    htmlCbVariable += '</div>';

    return htmlCbVariable;
}

// Metodo che ritorna la struttura HTML per i filtri
ChartEntity.prototype.getHtmlFilters = function() {
    var htmlFilter = '<div id="contenitore-filtri-' + this.id + '" class="filters-container">' +
        '<div class="lb-filtri-caption">' + filtersLabelsArray.filtersTitle + '</div>' +
        '<div id="container-agefilters-' + this.id + '" class="agefilters-container">' +
        '<div class="filter-container">' +
        '<label class="lb-filtro" for="sp-agemin-' + this.id + '">' + filtersLabelsArray.minimumAge + ':</label>' +
        '<input id="sp-agemin-' + this.id + '" class="sp-filtro" name="age-min-value" ' +
        'type="number" min="0" max="110" step="1" value="' + this.minAge + '" />' +
        '</div>' +
        '<div class="filter-container">' +
        '<label class="lb-filtro" for="sp-agemax-' + this.id + '">' + filtersLabelsArray.maximumAge + ':</label>' +
        '<input id="sp-agemax-' + this.id + '" class="sp-filtro" name="age-max-value" ' +
        'type="number" min="0" max="110" step="1" value="' + this.maxAge + '" />' +
        '</div>' +					
        '<div class="filter-container">' +
        '<label class="lb-filtro" for="sp-agerange-' + this.id + '">' + filtersLabelsArray.ageIntervalWidth + ':</label>' +
        '<input id="sp-agerange-' + this.id + '" class="sp-filtro" name="age-range-value" ' +
        'type="number" min="1" max="110" step="1" value="' + this.rangeAge + '" name="age-range-value"/>' +
        '</div>' +									
        '</div>' +
        '<div class="filter-container">' +
        '<label class="lb-filtro" for=id="cb-genderfilter-' + this.id + '">' + filtersLabelsArray.userGender + ':</label>' +
        '<select id="cb-genderfilter-' + this.id + '" ' +
        'class="cb-filtro" name="gender-value">';

    for (var i = 0; i < genderArrayText.length; i++) {
        htmlFilter += '<option value="';
        htmlFilter += genderArrayValue[i] + '"';

        if (genderArrayValue[i] == this.gender) {
            htmlFilter += ' selected';
        }

        htmlFilter += ' >';
        htmlFilter += genderArrayText[i];
        htmlFilter += '</option>';
    }

    htmlFilter += '</select>' +						
        '</div>' +
        '<div class="filter-container">' +
        '<label class="lb-filtro" for=cb-dominanthandfilter-' + this.id + '" >' + filtersLabelsArray.dominantHand + ':</label>' +
        '<select id="cb-dominanthandfilter-' + this.id + '" ' +
        'class="cb-filtro" name="dominanthand-value">';

    for (var i = 0; i < handArrayText.length; i++) {
        htmlFilter += '<option value="';
        htmlFilter += handArrayValue[i] + '"';

        if (handArrayValue[i] == this.dominantHand) {
            htmlFilter += ' selected';
        }

        htmlFilter += ' >';
        htmlFilter += handArrayText[i];
        htmlFilter += '</option>';
    }

    htmlFilter += '</select>' +						
        '</div>' +
        '<div class="filter-container">' +
        '<label class="lb-filtro" for=cb-sessionhandfilter-' + this.id + '" >' + filtersLabelsArray.sessionHand + ':</label>' +
        '<select id="cb-sessionhandfilter-' + this.id + '" ' +
        'class="cb-filtro" name="sessionhand-value">';

    for (var i = 0; i < handArrayText.length; i++) {
        htmlFilter += '<option value="';
        htmlFilter += handArrayValue[i] + '"';

        if (handArrayValue[i] == this.sessionHand) {
            htmlFilter += ' selected';
        }

        htmlFilter += ' >';
        htmlFilter += handArrayText[i];
        htmlFilter += '</option>';
    }

    htmlFilter += '</select>' +						
        '</div>' +
        '<div class="disable-element"></div>' +
        '</div>';

    return htmlFilter;
};

// Metodo che crea la griglia interattiva per attivare/disattivare un intervallo di età
ChartEntity.prototype.createVisualAgeFilter = function(stateArray) {

    $("#age-svg-" + this.id).remove();

    if (!stateArray) {
        stateArray = [];
    }

    this.ageButtons = [];
    this.setArrayAgeState();
    var indexStateArray = 0;
    for (var i = this.minAge; i <= this.maxAge; i = i + this.rangeAge) {
        var limitLabel = "";
        var minVal = i;
        var maxVal = i;
        var stateButton = true;

        if (this.rangeAge > 1) {

            limitLabel = (i + this.rangeAge - 1).toString()
            maxVal = i + this.rangeAge - 1;
            if ((i + this.rangeAge - 1) > this.maxAge) {
                limitLabel = this.maxAge.toString();
                maxVal = this.maxAge;
            }

            if (i.toString() != limitLabel) {
                limitLabel = i.toString() + "-" + limitLabel;
            } 

        } else {
            limitLabel = i.toString();
        }

        if (stateArray.length > indexStateArray) {
            if (stateArray[indexStateArray] == 1) {
                stateButton = true;
            } else {
                stateButton = false;
            }
        }

        this.ageButtons.push({
            label: limitLabel,
            min: minVal,
            max: maxVal,
            active: stateButton
        });

        this.changeArrayAgeState(this.ageButtons[indexStateArray]);

        indexStateArray++;
    }

    var numColonne = 1;
    var cellW = 60;
    if (this.rangeAge > 1) {
        numColonne = 5;
        cellW = 60;
    } else {
        numColonne = 10;
        cellW = 30;
    }

    var cellH = 25;
    var w = cellW * numColonne;
    var h = 0;
    var xPos = 0;
    var yPos = 0;
    var ageButtonsIndex = 0;
    var data = [];

    while (ageButtonsIndex < this.ageButtons.length) {
        for (var c = 0; c < numColonne; c++) {
            if (ageButtonsIndex >= this.ageButtons.length) {
                break;
            }

            data.push({
                width: cellW,
                height: cellH,
                x: xPos,
                y: yPos,
                buttonIndex: ageButtonsIndex,
                label: this.ageButtons[ageButtonsIndex].label,
                active: this.ageButtons[ageButtonsIndex].active
            });

            xPos = xPos + cellW;
            ageButtonsIndex++;
        }

        xPos = 0;
        yPos = yPos + cellH;
        h = h + cellH;
    }

    var margin = {top: 5, right: 5, bottom: 5, left: 5};	// Margini
    w = w + margin.left + margin.right;		// Larghezza
    h = h + margin.top + margin.bottom;	// Altezza

    var svg = d3.select("#container-agefilters-" + this.id)
    .append("svg")
    .attr("id", "age-svg-" + this.id)
    .attr("width", w)
    .attr("height", h)
    .append("g")
    .attr("id", "age-svg-g-" + this.id)
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var btFilterAgeRange = svg.selectAll(".bt-filter-age-range")			
    .data(data).enter()
    .append("g")
    .attr("class", function(d) {
        if (d.active) {
            return "bt-filter-age-range active";
        } else {
            return "bt-filter-age-range inactive";
        }
    })
    .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
    .attr("bt-index", function(d) { return d.buttonIndex; })

    btFilterAgeRange.append("rect")
    //.attr("x", function(d) { return d.x; })
    //.attr("y", function(d) { return d.y; })
        .attr("width", function(d) { return d.width; })
        .attr("height", function(d) { return d.height; });

    btFilterAgeRange.append("text")
        .attr("dy", ".25em")
        .attr("y", cellH / 2)
        .attr("x", cellW / 2)
        .attr("text-anchor", "middle")
        .text(function(d) { return d.label; });

}

// Funzione che testa se un elemento della collezione viene scartato dai filtri
ChartEntity.prototype.filterElement = function(element) {
    // Controllo il sesso
    //console.log("sono in filter element ");
    //console.log(element);
    var genderTest = (element.gender == this.gender) || 
        (this.gender == genderArrayValue[0]);

    if (!genderTest) {
        return false;
    }

    
    var dominantHandTest = (element.dominantHand == this.dominantHand) || (this.dominantHand == handArrayValue[0]);
    //console.log("risultato test "+element.dominantHand+"  "+this.dominantHand);
    if (!dominantHandTest) {
        return false;
    }
    // Controllo la mano della sessione
    var sessionHandTest = (element.hand == this.sessionHand) || (this.sessionHand == handArrayValue[0]);
    if (!sessionHandTest) {
        return false;
    }

    // Controllo sull'eta'
    var ageTest = true;

    var age = parseInt(element.age);
    if ((age < this.minAge) || (age > this.maxAge)) {
        ageTest = false;
    } else {
        ageTest = this.arrayAgeState[age];
    }

    if (genderTest && dominantHandTest &&
        sessionHandTest && ageTest) {
        return true;
    } else {
        return false;
    }
}