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
var genderArrayText = ["Non specificato", "M", "F"];

// Array di valori con cui verrà popolato il campo
// value della combo relativa al filtro sul sesso
// Sono uguali a quelli usati nel database
// IMPORTANTE: attenzione all'ordine
var genderArrayValue = [VALUE_NOT_SELECTED, "uomo", "donna"];

// Array associativo che permette di risalire alla stringa 
// corretta per denotare il sesso in base al valore 
// dell'elemento nel database
var genderArrayMap = {
    "uomo": "uomo",
    "donna": "donna"
};

// Array con i valori da visualizzare nel campo text
// della combo relativa al filtro sulla mano dominante
// IMPORTANTE: attenzione all'ordine
var handArrayText = ["Non specificata", "Destra", "Sinistra"];

// Array di valori con cui verrà popolato il campo
// value della combo relativa al filtro sulla mano dominante
// Sono uguali a quelli usati nel database
// IMPORTANTE: attenzione all'ordine
var handArrayValue = [VALUE_NOT_SELECTED, "destra", "sinistra"];


// Array associativo che permette di risalire alla stringa 
// corretta per denotare la mano in base al valore 
// dell'elemento nel database
var handArrayMap = {
    "destra": "destra",
    "sinistra": "sinistra"
};

// Array con i valori da visualizzare nel campo text
// della combo relativa al filtro sull'esercizio
// IMPORTANTE: attenzione all'ordine
var exerciseArrayText = [VALUE_NOT_SELECTED, "CERCHIO-PRECISIONE", "QUADRATO", 
                         "LINEA", "CERCHIO-VELOCITA\'", 
                         "REAZIONE-2", "REAZIONE-4"];

// Array di valori con cui verrà popolato il campo
// value della combo relativa al filtro sull'esercizio
// Il numero indica la tabella headerdata collegata all'esercizio scelto
// IMPORTANTE: attenzione all'ordine
var exerciseArrayValue = [VALUE_NOT_SELECTED, "1", "3", "4", "2", "5", "6"];

// Array con i valori da visualizzare nel campo text
// della combo relativa al filtro sul tipo di grafico
// IMPORTANTE: attenzione all'ordine
var chartArrayText = [VALUE_NOT_SELECTED, "Istogramma", "Boxplot", "Scatterplot", 
                      "Grafico a coordinate parallele", "Grafico ad insiemi paralleli",
                      "Matrice di scatterplot"];

// Array associativo che permette di recuperare il titolo del grafico
// tramite il dipo
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
var varCommonTypeArrayText = [VALUE_NOT_SELECTED, "Età"];

//Array associativo che contiene le variabili disponibili comuni
//per ogni esercizio da mostrare nel campo text della select
//IMPORTANTE: attenzione all'ordine
var varCommonTypeArrayValue = [VALUE_NOT_SELECTED, "age"];

// Array associativo che contiene le variabili disponibili per ogni esercizio
// da mostrare nel campo text della select
// IMPORTANTE: attenzione all'ordine
var varTypeArrayText = {
    1: ["Accuratezza", "Distanza totale", "Indice di deviazione", "Tempo"],
    2: ["Accuratezza", "Distanza totale", "Indice di deviazione", "Numero di giri interni", "Velocità complessiva"],
    3: ["Accuratezza", "Distanza totale", "Indice di deviazione", "Tempo" ],
    4: ["Accuratezza", "Distanza totale", "Indice di deviazione", "Tempo", "Velocità totale"],
    5: ["Accuratezza", "Numero di tocchi", "Tempo medio di reazione"],
    6: ["Accuratezza", "Numero di tocchi", "Tempo medio di reazione"]
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
    age: "Età",
    accuracy: "Accuratezza",
    distanceTot: "Distanza totale", 
    deviationIndex: "Indice di deviazione", 
    time: "Tempo",
    adjustedAccuracy: "Accuratezza",
    adjustedSpeed: "Velocità",
    distanceCorrect: "Distanza corretta",
    turnsInside: "Numero di giri interni",
    totalSpeed: "Velocità totale",
    totTaps: "Numero di tocchi", 
    meanReactionTime: "Tempo medio di reazione",
	frequency: "Frequenza"
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
siglaUnitaDiMisuraArray[ANNO] = "a";
siglaUnitaDiMisuraArray[PERCENTUALE] = "%";
siglaUnitaDiMisuraArray[MILLISECONDO] = "ms";
siglaUnitaDiMisuraArray[PIXEL] = "px"
siglaUnitaDiMisuraArray[CM_AL_SECONDO] = "cm/s";
siglaUnitaDiMisuraArray[SECONDO] = "s";
siglaUnitaDiMisuraArray[NUMERO] = "";

// Array associativo che contiene le etichette personalizzate 
// per i diversi grafici e il pannello di dettaglio
var customLabelsArray = {
    exportGraphButton: "Esporta",
    moveGraphButton: "Sposta",
    deleteGraphButton: "Elimina",
    numberSessions: "Numero di sessioni",
    displayedSessions: "Sessioni visualizzate",
    userId: "ID utente",
    sessionId: "ID sessione",
    show: "Mostra",
    lines: "mostra linee",
    points: "mostra punti",
    session: "Sessione",
    average: "Media",
    excludeButton: "Escludi",
    includeButton: "Includi",
    closeButton: "Chiudi"
};	

// Array associativo che contiene le etichette dei campi 
// per i diversi parametri e filtri
var filtersLabelsArray = {
    parametersTitle: "Parametri",
    database: "Database",
    exerciseType: "Esercizio",
    graphType: "Grafico",
    createGraphButton: "Crea grafico",
    genericVariable: "Var.",
    addVariableButton: "Aggiungi",
    deleteVariableButton: "Rimuovi",
    filtersTitle: "Filtri",
    minimumAge: "Età minima",
    maximumAge: "Età massima",
    ageIntervalWidth: "Larghezza intervallo",
    userGender: "Sesso",
    dominantHand: "Mano dominante",
    sessionHand: "Mano di sessione"
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
    settings: "Impostazioni",
    welcome: "Benvenuto",
    works: "I tuoi lavori",
    noMasks: "Nessuna maschera salvata",
    newMask: "Nuova maschera",
    title: "Titolo",
    description: "Descrizione",
    display: "Visualizza",
    delete: "Elimina"
};

// Array associativo che contiene le etichette per le impostazioni
var settingsArray = {
    language: "Lingua",
    italian: "Italiano",
    english: "English",
    change: "Cambia"
};

// Array associativo che contiene le etichette per il pannello grafici
var graphPanelArray = {
    management: "Gestione grafici",
    title: "Titolo della maschera:",
    description: "Descrizione:",
    add: "Aggiungi grafico",
    exit: "Esci",
    save: "Salva",
    exitAlert: "Salvataggio in corso...",
    exitAlert: "Attenzione!",
    exitAlertText: "Ci sono degli elementi non salvati. Si desidera salvarli?",
    saveExit: "Salva ed esci"
};