/**
 * Script in cui definire costanti, enum
 * e tutti i valori utili a parametrizzare il codice
 */

// Valore utilizzato di default quando nessuna selezione è stata fatta
// Coincide con il value utilizzato nei vari array
var VALUE_NOT_SELECTED = "-";

// Costanti per i tipi di grafico
var ISTOGRAMMA = "istogramma";
var BOXPLOT = "boxplot";
var SCATTERPLOT = "scatterplot";
var PARALLEL_COORDINATE_PLOT = "parallel-coordinate-plot";
var PARALLEL_SET_PLOT = "parallel-set-plot";
var SCATTERPLOT_MATRIX = "scatterplot-matrix";

// Costanti per le unità di misura
var ANNO = "Anno";
var MILLISECONDO = "Millisecondo";
var SECONDO = "Secondo";
var PERCENTUALE = "Percentuale";
var PIXEL = "Pixel";
var CM_AL_SECONDO = "CmAlSecondo";
var NUMERO = "Numero";	// Numero di ripetizioni

// Array con i valori da visualizzare nel campo text
// della combo relativa al filtro sul sesso
// IMPORTANTE: attenzione all'ordine
var genderArrayText = ["Unspecified", "M", "F"];

// Array di valori con cui verrà popolato il campo
// value della combo relativa al filtro sul sesso
// Sono uguali a quelli usati nel database
// IMPORTANTE: attenzione all'ordine
var genderArrayValue = [VALUE_NOT_SELECTED, "uomo", "donna"];

// Array associativo che permette di risalire alla stringa 
// corretta per denotare il sesso in base al valore 
// dell'elemento nel database
var genderArrayMap = {
    "uomo": "male",
    "donna": "female"
};

// Array con i valori da visualizzare nel campo text
// della combo relativa al filtro sulla mano dominante
// IMPORTANTE: attenzione all'ordine
var handArrayText = ["Unspecified", "Right", "Left"];

// Array di valori con cui verrà popolato il campo
// value della combo relativa al filtro sulla mano dominante
// Sono uguali a quelli usati nel database
// IMPORTANTE: attenzione all'ordine
var handArrayValue = [VALUE_NOT_SELECTED, "destra", "sinistra"];

// Array associativo che permette di risalire alla stringa 
// corretta per denotare la mano in base al valore 
// dell'elemento nel database
var handArrayMap = {
    "destra": "right",
    "sinistra": "left"
};

// Array con i valori da visualizzare nel campo text
// della combo relativa al filtro sull'esercizio
// IMPORTANTE: attenzione all'ordine
var exerciseArrayText = [VALUE_NOT_SELECTED, "CIRCLE-ACCURACY", "SQUARE", 
                         "PATH", "CIRCLE-SPEED", 
                         "TAPPING-2", "TAPPING-rE4"];

// Array di valori con cui verrà popolato il campo
// value della combo relativa al filtro sull'esercizio
// Il numero indica la tabella headerdata collegata all'esercizio scelto
// IMPORTANTE: attenzione all'ordine
var exerciseArrayValue = [VALUE_NOT_SELECTED, "1", "3", "4", "2", "5", "6"];

// Array con i valori da visualizzare nel campo text
// della combo relativa al filtro sul tipo di grafico
// IMPORTANTE: attenzione all'ordine
var chartArrayText = [VALUE_NOT_SELECTED, "Histogram", "Boxplot", "Scatterplot", 
                      "Parallel coordinates plot", "Parallel sets plot",
                      "Scatterplot matrix"];

// Array associativo che permette di recuperare il titolo del grafico
// tramite il tipo
var titleChartArray = {};
titleChartArray[ISTOGRAMMA] = "Istogramma";
titleChartArray[BOXPLOT] = "Boxplot";
titleChartArray[SCATTERPLOT] = "Scatterplot";
titleChartArray[PARALLEL_COORDINATE_PLOT] = "Grafico a coordinate parallele";
titleChartArray[PARALLEL_SET_PLOT] = "Grafico ad insiemi paralleli";
titleChartArray[SCATTERPLOT_MATRIX] = "Matrice di scatterplot";

// Array di valori con cui verrà popolato il campo
// value della combo relativa al filtro sul tipo di grafico
// IMPORTANTE: attenzione all'ordine
var chartArrayValue = [VALUE_NOT_SELECTED, ISTOGRAMMA, BOXPLOT, SCATTERPLOT, 
                       PARALLEL_COORDINATE_PLOT, PARALLEL_SET_PLOT,
                       SCATTERPLOT_MATRIX];

// Array associativo che contiene quante variabili associare ad ogni grafico
// e se posso aggiungerne altre:
// - numero: indica il numero di variabili
// - max: true se numero è il massimo di variabili associabili al grafico, false altrimenti
var numVarChartArray = {};
numVarChartArray[ISTOGRAMMA] = {numero: 1, max: true}
numVarChartArray[BOXPLOT] = {numero: 1, max: true};
numVarChartArray[SCATTERPLOT] = {numero: 2, max: true};
numVarChartArray[PARALLEL_COORDINATE_PLOT] = {numero: 3, max: false};
numVarChartArray[PARALLEL_SET_PLOT] = {numero: 3, max: false};
numVarChartArray[SCATTERPLOT_MATRIX] = {numero: 3, max: false};

// Array associativo che contiene le variabili disponibili comuni
// per ogni esercizio da mostrare nel campo text della select
// IMPORTANTE: attenzione all'ordine
var varCommonTypeArrayText = [VALUE_NOT_SELECTED, "Age"];

//Array associativo che contiene le variabili disponibili comuni
//per ogni esercizio da mostrare nel campo text della select
//IMPORTANTE: attenzione all'ordine
var varCommonTypeArrayValue = [VALUE_NOT_SELECTED, "age"];

// Array associativo che contiene le variabili disponibili per ogni esercizio
// da mostrare nel campo text della select
// IMPORTANTE: attenzione all'ordine
var varTypeArrayText = {
    1: ["Accuracy", "Total distance", "Deviation index", "Time"],
    2: ["Accuracy", "Total distance", "Deviation index", "Number of internal rotations", "Total speed"],
    3: ["Accuracy", "Total distance", "Deviation index", "Time" ],
    4: ["Accuracy", "Total distance", "Deviation index", "Time", "Total speed"],
    5: ["Accuracy", "Number of taps", "Mean reaction time"],
    6: ["Accuracy", "Number of taps", "Mean reaction time"]
};

// Array associativo che contiene le variabili disponibili per ogni esercizio
// da inserire nel campo value della select
// Tali valori sono identici alle chiavi utilizzati nel database
// IMPORTANTE: attenzione all'ordine
var varTypeArrayValue = {
    1: ["accuracy", "distanceTot", "deviationIndex", "time"],
    2: ["accuracy", "distanceCorrect", "deviationIndex", "turnsInside", "totalSpeed"],
    3: ["accuracy", "distanceTot", "deviationIndex", "time"],
    4: ["adjustedAccuracy", "distanceTot", "deviationIndex", "time", "adjustedSpeed"],
    5: ["accuracy", "totTaps", "meanReactionTime"],
    6: ["accuracy", "totTaps", "meanReactionTime"]
};

// Array associativo che per ogni variabile mi restituisce 
// la label da posizionare negli assi del grafico
var labelChartArray = {
    age: "Age",
    accuracy: "Accuracy",
    distanceTot: "Total distance", 
    deviationIndex: "Deviation index", 
    time: "Time",
    adjustedAccuracy: "Accuracy",
    adjustedSpeed: "Speed",
    distanceCorrect: "Corrected distance",
    turnsInside: "Number of internal rotations",
    totalSpeed: "Total speed",
    totTaps: "Number of taps", 
    meanReactionTime: "Mean reaction time",
    frequency: "Frequency"
};

// Array associativo che per ogni variabile mi restituisce 
// l'unità di misura
var unitaDiMisuraChartArray = {
    age: ANNO,
    accuracy: PERCENTUALE,
    distanceTot: PIXEL, 
    deviationIndex: PIXEL, 
    time: SECONDO,
    adjustedAccuracy: PERCENTUALE,
    adjustedSpeed: CM_AL_SECONDO,
    distanceCorrect: PIXEL,
    turnsInside: NUMERO,
    totalSpeed: CM_AL_SECONDO,
    totTaps: NUMERO, 
    meanReactionTime: SECONDO
};

// Array associativo che per ogni unità di misura 
// mi restituisce la sigla dell'unità di misura
var siglaUnitaDiMisuraArray = {};
siglaUnitaDiMisuraArray[ANNO] = "y";
siglaUnitaDiMisuraArray[PERCENTUALE] = "%";
siglaUnitaDiMisuraArray[MILLISECONDO] = "ms";
siglaUnitaDiMisuraArray[PIXEL] = "px"
siglaUnitaDiMisuraArray[CM_AL_SECONDO] = "cm/s";
siglaUnitaDiMisuraArray[SECONDO] = "s";
siglaUnitaDiMisuraArray[NUMERO] = "";

// Array associativo che contiene le etichette personalizzate 
// per i diversi grafici e il pannello di dettaglio
var customLabelsArray = {
    exportGraphButton: "Export",
    moveGraphButton: "Move",
    deleteGraphButton: "Remove",
    numberSessions: "Number of sessions",
    displayedSessions: "Displayed sessions",
    userId: "User ID",
    sessionId: "Session ID",
    show: "Show",
    lines: "show lines",
    points: "show points",
    session: "Session",
    average: "Average",
    excludeButton: "Exclude",
    includeButton: "Include",
    closeButton: "Close"
};	

// Array associativo che contiene le etichette dei campi 
// per i diversi parametri e filtri
var filtersLabelsArray = {
    parametersTitle: "Parameters",
    database: "Database",
    exerciseType: "Exercise",
    graphType: "Graph",
    createGraphButton: "Create graph",
    genericVariable: "Var.",
    addVariableButton: "Add",
    deleteVariableButton: "Remove",
    filtersTitle: "Filters",
    minimumAge: "Minimum age",
    maximumAge: "Maximum age",
    ageIntervalWidth: "Interval width",
    userGender: "Gender",
    dominantHand: "Dominant hand",
    sessionHand: "Session hand"
};

// Colori per gli elementi del grafico
var COLOR_ELEM_ESCLUSI = "grey";
var COLOR_PCP_ELEM_BACKGROUND = "#ddd";
var COLOR_PCP_ELEM_FOREGROUND = "rgba(70,130,180,0.5)";
var COLOR_PCP_ELEM_SELECTED = "#0000FF";
var COLOR_PCP_ELEM_HOVER = "#00FF00";
var COLOR_MS_ELEM_INIT = "#4682B4";
var COLOR_MS_ELEM_FOREGROUND = "rgba(98,151,193,0.5)";
var COLOR_MS_ELEM_SELECTED = "#0000FF";

// Array associativo che contiene le etichette per la homepage
var mainpageArray = {
    settings: "Settings",
    welcome: "Welcome",
    works: "Your works",
    noMasks: "No saved masks",
    newMask: "New mask",
    title: "Title",
    description: "Description",
    display: "Display",
    delete: "Delete"
};

// Array associativo che contiene le etichette per le impostazioni
var settingsArray = {
    language: "Language",
    italian: "Italiano",
    english: "English",
    change: "Change"
};

// Array associativo che contiene le etichette per il pannello grafici
var graphPanelArray = {
    management: "Graphs' management",
    title: "Mask's title:",
    description: "Description:",
    add: "Add graph",
    exit: "Exit",
    save: "Save",
    saveAlert: "Saving in progress...",
    exitAlert: "Attention!",
    exitAlertText: "There are items not saved. Do you want to save them?",
    saveExit: "Save and exit"
};