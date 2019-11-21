<?php
include("sessionMedico.php");

require_once("dbMotorbrainMedico.php");
require_once("dbMotorbrainMaschera.php");
require_once("dbMotorbrainGrafico.php");

$mascheraID = null;
$maschera = null;
$grafici = null;
$databases = null;

// Controllo se il parametro passato è popolato
if (isset($_POST["visualizza-maschera"])) {

    // Recupero il valore che identifica la maschera
    $mascheraID = filter_var($_POST["maschera-id"], FILTER_SANITIZE_STRING);

    // Controllo se è popolato
    if (!empty($mascheraID)) 
    {
        // Recupero la maschera
        $maschera = getMascheraByMascheraID($mascheraID);

        // Recupero l'ordine con cui i grafici sono stati salvati
        $ordine = explode(";", $maschera[4]);

        foreach ($ordine as $graficoID) {

            $grafici[] = getResultByGraficoID($graficoID)[0];
        }
    }
}
?>
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />

        <title>Gestione grafici</title>

        <!-- Fogli di stile per i vari componenti -->
        <link rel="stylesheet" type="text/css" href="./style_css/style_container.css">
        <link rel="stylesheet" type="text/css" href="./style_css/style_menu.css">
        <link rel="stylesheet" type="text/css" href="./style_css/style_controls.css">
        <link rel="stylesheet" type="text/css" href="./style_css/style_visual_age_filter.css">
        <link rel="stylesheet" type="text/css" href="./style_css/style_histogram.css">
        <link rel="stylesheet" type="text/css" href="./style_css/style_boxplot.css">
        <link rel="stylesheet" type="text/css" href="./style_css/style_scatterplot.css">
        <link rel="stylesheet" type="text/css" href="./style_css/style_parallel_coordinate_plot.css">
        <link rel="stylesheet" type="text/css" href="./style_css/style_scatterplot_matrix.css">
        <link rel="stylesheet" type="text/css" href="./style_css/style_grouped_bar_chart.css">
        <link rel="stylesheet" type="text/css" href="//code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css">

        <!-- jQuery library -->
        <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
        <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js"></script>

        <!-- D3 library -->
        <script src="//d3js.org/d3.v3.min.js"></script>

        <!-- D3 library per tooltip -->
        <script type="text/javascript" src="./script_js/d3-tip.js"></script>

        <!-- Libreria per migliorare le performance -->
        <script type="text/javascript" src="./script_js/render-queue.js"></script>

        <!-- Libreria per Parallel Sets Visualization -->
        <script type="text/javascript" src="./script_js/d3.parsets.js"></script>
        <link rel="stylesheet" type="text/css" href="./style_css/d3.parsets.css">	

        <!-- JS funzioni personalizzate -->
        <?php
        switch ($medicoSessione["lastLanguage"]) {
            case "IT":
                echo '<script type="text/javascript" src="./script_js/type_definition_ita.js"></script>';
                break;
            case "EN":
                echo '<script type="text/javascript" src="./script_js/type_definition_eng.js"></script>';
                break;
            default:
                echo '<script type="text/javascript" src="./script_js/type_definition_eng.js"></script>';
                break;
        }
        ?>

        <script type="text/javascript" src="./script_js/FactoryChart.js"></script>
        <script type="text/javascript" src="./script_js/ChartEntity.js"></script>
        <script type="text/javascript" src="./script_js/utility.js"></script>
        <script type="text/javascript" src="./script_js/session_detail.js"></script>
        <script type="text/javascript" src="./script_js/Histogram.js"></script>
        <script type="text/javascript" src="./script_js/box.js"></script>
        <script type="text/javascript" src="./script_js/Boxplot.js"></script>
        <script type="text/javascript" src="./script_js/Scatterplot.js"></script>
        <script type="text/javascript" src="./script_js/ParallelCoordinatePlot.js"></script>
        <script type="text/javascript" src="./script_js/ParallelSetPlot.js"></script>
        <script type="text/javascript" src="./script_js/ScatterplotMatrix.js"></script>
        <script type="text/javascript" src="./script_js/GroupedBarChart.js"></script>
        <script type="text/javascript" src="./script_js/CirclePrecisionExerciseChart.js"></script>
        <script type="text/javascript" src="./script_js/CircleSpeedExerciseChart.js"></script>
        <script type="text/javascript" src="./script_js/SquarePrecisionExerciseChart.js"></script>
        <script type="text/javascript" src="./script_js/LineSpeedExerciseChart.js"></script>
        <script type="text/javascript" src="./script_js/TwoTargetExerciseChart.js"></script>
        <script type="text/javascript" src="./script_js/FourTargetExerciseChart.js"></script>

        <script type="text/javascript">
            $(document).ready(function() {

                var medicoID = <?php echo '"' . $medicoSessione["medicoID"] . '"'; ?>;

                // Definisco un array per tenere in memoria i grafici
                var chartList = {};
                var factoryChart = new FactoryChart();

                // Definisco una stringa per memorizzare i grafici ordinati
                var sorted = "";

                // Definisco due variabili per il salvataggio della maschera
                var updated = false;
                var jsonMaskID = "";

                // Funzione per rendere i grafici spostabili in posizione preferita
                $("#contenitore-grafici").sortable({
                    axis: 'y',
                    zIndex: 9999,
                    cursor: 'n-resize',
                    helper: 'clone',
                    handle: '.bt-muovi-bottom-right'
                });

                // Quando un grafico viene spostato...
                $("#contenitore-grafici").on("sortupdate", function(event, ui) {
                    updated = true;
                    // ... trasformo il nuovo ordine in stringa ...
                    sorted = $(this).sortable("serialize");
                    // ... e la salvo nel sessionStorage
                    sessionStorage.setItem('sorted', sorted);
                });

                $("#contenitore-grafici").disableSelection();

                // Funzione per aggiungere un nuovo grafico al click
                $("#bt-aggiugi-grafico").click(function () {

                    // Genero l'identificativo del nuovo grafico
                    var chartID = generateUUID();
                    // Creo il nuovo grafico
                    var newChartEntity = new ChartEntity(chartID);

                    // Creo un contenitore per il grafico
                    // con la schermata di selezione dei parametri: esercizio, tipo e variabili
                    $("#contenitore-grafici").prepend(
                        '<div id="contenitore-' + newChartEntity.id + '" ' +
                        'class="container-grafico-con-strumenti">' +
                        popolateChartContainer(newChartEntity) +
                        //'<img id="img-loader-' + chartID + '" ' +
                        //'class="img-loader-inside-chart-container" src="./images/spinner.gif" />' +
                        '</div>');

                    // Nascondo il contenitore dei filtri
                    $("#contenitore-filtri-" + newChartEntity.id).hide();

                    // Collego gli eventi alle varie combo per i parametri
                    bindEventParameterControls(newChartEntity);

                    bindVisualizzaGrafico(newChartEntity);
                });

                function bindVisualizzaGrafico(newChartEntity) {
                    // Collego la funzione all'evento click del bottone crea
                    $("#bt-visualizza-grafico-" + newChartEntity.id).on("click", function() {

                        updated = true;

                        // Controllo che il campo database sia valorizzato
                        if ((newChartEntity.database == null) || 
                            (newChartEntity.database == VALUE_NOT_SELECTED)) {
                            $("#cb-database-" + newChartEntity.id).addClass("non-compilato");
                            return;
                        }

                        // Controllo che il campo esercizio sia valorizzato
                        if ((newChartEntity.exerciseType == null) || 
                            (newChartEntity.exerciseType == VALUE_NOT_SELECTED)) {
                            $("#cb-esercizio-" + newChartEntity.id).addClass("non-compilato");
                            return;
                        }

                        // Controllo che il campo grafico sia valorizzato
                        if ((newChartEntity.chartType == null) || 
                            (newChartEntity.chartType == VALUE_NOT_SELECTED)) {
                            $("#cb-grafico-" + newChartEntity.id).addClass("non-compilato");
                            return;
                        }

                        // Valore che mi dice se sono presenti errori
                        errVarList = false;
                        // Recupero i bind dimensione-variabile
                        $(".cb-variabile-" + newChartEntity.id).each(function(index) {
                            var numDim = (index + 1).toString();
                            var idElement = $(this).attr("id");
                            var idTest = "cb-variabile-" + newChartEntity.id + "-" + numDim;

                            if (idElement == idTest) {
                                if (($(this).val() == null) || 
                                    ($(this).val() == VALUE_NOT_SELECTED)) {
                                    $(this).addClass("non-compilato");
                                    errVarList = true;
                                }
                            }
                        });

                        // In caso di errori fermo la richiesta
                        if (errVarList) {
                            return;
                        }

                        // Disabilito il bottone per inserire nuovi grafici
                        $("#bt-aggiugi-grafico").prop("disabled", true);

                        // Disabilito il bottone per salvare la maschera
                        $("#bt-salva-maschera").prop("disabled", true);

                        // Disabilito il bottone per uscire dalla maschera
                        $("#bt-esci-maschera").prop("disabled", true);

                        // Nascondo il bottone di visualizzazione
                        var btVisualizzaGrafico = $(this);
                        btVisualizzaGrafico.hide();

                        // Mostro l'immagine per il caricamento
                        $("#update-img-loader-" + newChartEntity.id).show();

                        // Creo un json 
                        var jsonObjectToSend = {
                            database: newChartEntity.database,
                            grafico: newChartEntity.chartType,
                            esercizio: newChartEntity.exerciseType,
                            listaDimVar: newChartEntity.variableList
                        };

                        // Per debug
                        //console.log(jsonObjectToSend);

                        // Richiesta ajax per recuperare i dati
                        $.ajax({
                            type: "POST",
                            url: "getMotorbrainData.php",
                            dataType: "json",
                            data: { chartInfo: JSON.stringify(jsonObjectToSend) },
                            success: function(jsonData, status) {

                                // Per debug
                                //console.log(jsonData);

                                // Controllo se è un grafico già esistente
                                var newVisualChart = getChartFromList(chartList, newChartEntity.id);

                                // Se non esiste lo inserisco
                                if (newVisualChart == null) {
                                    // Assegno i dati recuperati all'entity
                                    newChartEntity.setJsonData(jsonData);

                                    // Mostro il contenitore dei filtri
                                    $("#contenitore-filtri-" + newChartEntity.id).show();

                                    // Creo un oggetto di tipo ChartEntity
                                    newVisualChart = factoryChart.createChart(newChartEntity);

                                    // Lo memorizzo nell'array
                                    chartList[newChartEntity.id] = newVisualChart;

                                    // Creo il filtro interattivo per l'età
                                    newVisualChart.chartEntity.createVisualAgeFilter(null);
                                    bindEventToButtonGridAge();

                                    try {
                                        // Creo il nuovo grafico
                                        newVisualChart.createVisualChart();
                                    }
                                    catch(err) {
                                        $(".error").text("Attenzione: errore nella creazione del grafico.");
                                        $(".error").fadeIn(400).delay(3000).fadeOut(400);
                                        console.log("Errore nella creazione del grafico:" + err);

                                        // Riabilito il pulsante per recuperare i dati in caso di errore
                                        btVisualizzaGrafico.show();
                                    }

                                    // Collego gli eventi
                                    bindEventFilterControls(newVisualChart);
                                }
                                else {
                                    // Altrimenti lo aggiorno
                                    var chartEntityUpd = newVisualChart.chartEntity;
                                    chartEntityUpd.setDatabase(newChartEntity.database);
                                    chartEntityUpd.setExerciseType(newChartEntity.exerciseType);
                                    chartEntityUpd.setChartType(newChartEntity.chartType);
                                    chartEntityUpd.setVariableList(newChartEntity.variableList);
                                    chartEntityUpd.setJsonData(jsonData);

                                    // Resetto i filtri del grafico
                                    // chartEntityUpd.setMinAgeFilter("10");
                                    // chartEntityUpd.setMaxAgeFilter("100");
                                    // chartEntityUpd.setRangeAgeFilter("10");
                                    // chartEntityUpd.createVisualAgeFilter(null);
                                    // bindEventToButtonGridAge();
                                    // chartEntityUpd.setGenderFilter("-");
                                    // chartEntityUpd.setDominantHandFilter("-");
                                    // chartEntityUpd.setSessionHandFilter("-");

                                    // Ricreo l'oggetto che rappresenta il grafico
                                    newVisualChart = factoryChart.createChart(chartEntityUpd);

                                    // Lo memorizzo nell'array
                                    delete chartList[chartEntityUpd.id];
                                    chartList[chartEntityUpd.id] = newVisualChart;

                                    try {
                                        // Creo il nuovo grafico
                                        newVisualChart.createVisualChart();

                                        // Riabilito il componente
                                        $("#contenitore-filtri-" + chartEntityUpd.id + " .disable-element").hide();

                                        // E resetto i filtri visualizzati
                                        // $("#sp-agemin-" + chartEntityUpd.id).val("10");
                                        // $("#sp-agemax-" + chartEntityUpd.id).val("100");
                                        // $("#sp-agerange-" + chartEntityUpd.id).val("10");
                                        // $("#cb-genderfilter-" + chartEntityUpd.id).val("-");
                                        // $("#cb-dominanthandfilter-" + chartEntityUpd.id).val("-");
                                        // $("#cb-sessionhandfilter-" + chartEntityUpd.id).val("-");
                                    }
                                    catch(err) {
                                        $(".error").text("Attenzione: errore nella creazione del grafico.");
                                        $(".error").fadeIn(400).delay(3000).fadeOut(400);
                                        console.log("Errore nella creazione del grafico:" + err);

                                        // Riabilito il pulsante per recuperare i dati in caso di errore
                                        btVisualizzaGrafico.show();
                                    }

                                }

                                // Trasformo il nuovo ordine dei grafici in stringa ...
                                sorted = $("#contenitore-grafici").sortable("serialize");

                                // ... e la salvo nel sessionStorage
                                sessionStorage.setItem('sorted', sorted);
                            },
                            error: function(xhr, desc, err) {
                                console.log(xhr);
                                console.log("Dettaglio: " + desc + "\nErrore: " + err);

                                // Riabilito il pulsante per recuperare i dati in caso di errore
                                btVisualizzaGrafico.show();
                            }
                        }).always(function() {
                            // Rimuovo l'immagine per il caricamento
                            $("#update-img-loader-" + newChartEntity.id).hide();

                            // Riattivo il bottone per inserire nuovi grafici
                            $("#bt-aggiugi-grafico").prop("disabled", false);

                            // Riattivo il bottone per salvare la maschera
                            $("#bt-salva-maschera").prop("disabled", false);

                            // Disabilito il bottone per uscire dalla maschera
                            $("#bt-esci-maschera").prop("disabled", false);
                        });
                    });
                }

                // Funzione che collega gli eventi per la selezione dei parametri
                function bindEventParameterControls(chartEntity) {

                    // Collego la funzione all'evento change 
                    // della combo per la selezione del database
                    $("#cb-database-" + chartEntity.id).on("change", function() {

                        // Ricarico le variabili che vanno collegate
                        // alle dimensioni del grafico scelto

                        if ($("#grafico-" + chartEntity.id).children().length > 0) {
                            // Svuoto il contenitore
                            $("#grafico-" + chartEntity.id).empty();
                            $("#totale-sessioni-" + chartEntity.id).text("");
                            $("#totale-sessioni-mostrate-" + chartEntity.id).text(""); 

                            // Rimuovo eventuali tooltip
                            $("#d3-tip-" + chartEntity.id).remove();

                            // Disabilito il componente
                            $("#contenitore-filtri-" + chartEntity.id + " .disable-element").show();

                            // Ripristino il bottone per la richiesta
                            $("#bt-visualizza-grafico-" + chartEntity.id).show();

                            // Disabilito il bottone per inserire nuovi grafici
                            $("#bt-aggiugi-grafico").prop("disabled", true);

                            // Disabilito il bottone per salvare la maschera
                            $("#bt-salva-maschera").prop("disabled", true);

                            // Disabilito il bottone per uscire dal la maschera
                            $("#bt-esci-maschera").prop("disabled", true);
                        }

                        // Dato che è stato cambiato il contenitore,
                        // svuoto la lista delle variabili selezionate
                        chartEntity.variableList = [];
                        
                        // Aggiorno il tipo di esercizio
                        chartEntity.setDatabase($(this).val());

                        // Aggiorno la parte relativa alle variabili
                        chartEntity.getHtmlVariables();
                        // Collego gli eventi
                        bindEventVariablesControl(chartEntity);
                        bindEventAggiungiVariable(chartEntity);

                        // Rimuovo eventuali feedback
                        $(this).removeClass("non-compilato");
                    });

                    // Collego la funzione all'evento change 
                    // della combo per la selezione dell'esercizio
                    $("#cb-esercizio-" + chartEntity.id).on("change", function() {

                        // Ricarico le variabili che vanno collegate
                        // alle dimensioni del grafico scelto

                        if ($("#grafico-" + chartEntity.id).children().length > 0) {
                            // Svuoto il contenitore
                            $("#grafico-" + chartEntity.id).empty();
                            $("#totale-sessioni-" + chartEntity.id).text("");
                            $("#totale-sessioni-mostrate-" + chartEntity.id).text(""); 

                            // Rimuovo eventuali tooltip
                            $("#d3-tip-" + chartEntity.id).remove();

                            // Disabilito il componente
                            $("#contenitore-filtri-" + chartEntity.id + " .disable-element").show();

                            // Ripristino il bottone per la richiesta
                            $("#bt-visualizza-grafico-" + chartEntity.id).show();

                            // Disabilito il bottone per inserire nuovi grafici
                            $("#bt-aggiugi-grafico").prop("disabled", true);

                            // Disabilito il bottone per salvare la maschera
                            $("#bt-salva-maschera").prop("disabled", true);

                            // Disabilito il bottone per uscire dal la maschera
                            $("#bt-esci-maschera").prop("disabled", true);
                        }

                        // Dato che è stato cambiato il contenitore,
                        // svuoto la lista delle variabili selezionate
                        chartEntity.variableList = [];

                        // Aggiorno il tipo di esercizio
                        chartEntity.setExerciseType($(this).val());

                        // Aggiorno la parte relativa alle variabili
                        chartEntity.getHtmlVariables();
                        // Collego gli eventi
                        bindEventVariablesControl(chartEntity);
                        bindEventAggiungiVariable(chartEntity);

                        // Rimuovo eventuali feedback
                        $(this).removeClass("non-compilato");
                    });

                    // Collego la funzione all'evento change 
                    // della combo per la selezione del grafico
                    $("#cb-grafico-" + chartEntity.id).on("change", function() {

                        // Ricarico le variabili che vanno collegate
                        // alle dimensioni del grafico scelto

                        if ($("#grafico-" + chartEntity.id).children().length > 0) {
                            // Svuoto il contenitore
                            $("#grafico-" + chartEntity.id).empty();
                            $("#totale-sessioni-" + chartEntity.id).text("");
                            $("#totale-sessioni-mostrate-" + chartEntity.id).text("");

                            // Rimuovo eventuali tooltip
                            $("#d3-tip-" + chartEntity.id).remove();

                            // Disabilito il componente
                            $("#contenitore-filtri-" + chartEntity.id + " .disable-element").show();

                            // Ripristino il bottone per la richiesta
                            $("#bt-visualizza-grafico-" + chartEntity.id).show();

                            // Disabilito il bottone per inserire nuovi grafici
                            $("#bt-aggiugi-grafico").prop("disabled", true);

                            // Disabilito il bottone per salvare la maschera
                            $("#bt-salva-maschera").prop("disabled", true);

                            // Disabilito il bottone per uscire dalla maschera
                            $("#bt-esci-maschera").prop("disabled", true);

                        }

                        // Dato che è stato cambiato il contenitore,
                        // svuoto la lista delle variabili selezionate
                        chartEntity.variableList = [];

                        // Aggiorno il tipo di grafico
                        chartEntity.setChartType($(this).val());
                        // Aggiorno la parte relativa alle variabili
                        chartEntity.getHtmlVariables();
                        // Collego gli eventi
                        bindEventVariablesControl(chartEntity);
                        bindEventAggiungiVariable(chartEntity);
                        // Rimuovo eventuali feedback
                        $(this).removeClass("non-compilato");
                    });
                }

                // Funzione per collegare l'evento change alle select delle variabili
                function bindEventVariablesControl(chartEntity) {

                    // Rimuovo il feedback per l'errore in caso di cambio del valore
                    $(".cb-variabile-" + chartEntity.id).off().on("change", function() {

                        $(this).removeClass("non-compilato");

                        // Recupero l'indice (L'indice della lista delle variabili parte da 0)
                        var index = parseInt(
                            $(this).attr("id")
                            .replace("cb-variabile-" + chartEntity.id + "-", "")
                        ) - 1;

                        // Se l'elemento non è vuoto,
                        // ovvero ha dei figli,
                        // c'è un grafico e devo aggiornarlo
                        if ($("#grafico-" + chartEntity.id).children().length > 0) {
                            // Svuoto il contenitore
                            $("#grafico-" + chartEntity.id).empty();

                            // Mostro l'immagine per il caricamento
                            $("#update-img-loader-" + chartEntity.id).show();

                            // Rimuovo eventuali tooltip
                            $("#d3-tip-" + chartEntity.id).remove();

                            // Recupero il grafico
                            var visualChart = getChartFromList(chartList, chartEntity.id);
                            // Aggiorno l'entity
                            visualChart.chartEntity.setVariableAtIndex(index, $(this).val());

                            try {
                                // Creo il nuovo grafico
                                visualChart.createVisualChart();
                            }
                            catch(err) {
                                $(".error").text("Attenzione: errore nella creazione del grafico.");
                                $(".error").fadeIn(400).delay(3000).fadeOut(400);
                                console.log("Errore nella creazione del grafico:" + err);
                            }
                            finally {
                                // Rimuovo l'immagine per il caricamento
                                $("#update-img-loader-" + chartEntity.id).hide();		
                            }
                        } else {

                            // Aggiorno la variabile della lista alla posizione indice
                            chartEntity.setVariableAtIndex(index, $(this).val());	
                        }
                    });
                }

                // Funzione per collegare l'evento click al 
                // bottone per aggiungere variabili
                function bindEventAggiungiVariable(chartEntity) {
                    // Rimuovo il feedback per l'errore in caso di cambio del valore
                    $("#bt-aggiungi-variabile-" + chartEntity.id).on("click", function() {

                        updated = true;

                        // Recupero il numero di variabili
                        var numCbVar = $(".cb-variabile-" + chartEntity.id).length;

                        if (chartEntity.variableList.length == numCbVar) {
                            chartEntity.variableList.push(VALUE_NOT_SELECTED);				
                        }

                        // Creo una nuova combo
                        var htmlCbVar = chartEntity.getHtmlCbVar(numCbVar, true);

                        // Aggiungo la combo
                        $(this).parent().before(htmlCbVar);

                        // Collego l'evento
                        bindEventVariablesControl(chartEntity);

                        // Aggiungo l'evento al bottone
                        $("#bt-elimina-variabile-" + chartEntity.id + "-" + (numCbVar + 1)).on("click", function() {

                            // Recupero il numero della variabile
                            var numVarEliminata = $(this).attr("id")
                            .replace("bt-elimina-variabile-" + chartEntity.id + "-", "");

                            // Elimino il contenitore padre
                            $(this).parent().remove();

                            // Mostro il bottone elimina precedente
                            $("#bt-elimina-variabile-" + chartEntity.id + "-" + (parseInt(numVarEliminata) - 1)).show();

                            // Se c'è già un grafico disegnato lo devo aggiornare
                            if ($("#grafico-" + chartEntity.id).children().length > 0) {
                                // Svuoto il contenitore
                                $("#grafico-" + chartEntity.id).empty();

                                // Mostro l'immagine per il caricamento
                                $("#update-img-loader-" + chartEntity.id).show();

                                // Rimuovo eventuali tooltip
                                $("#d3-tip-" + chartEntity.id).remove();

                                // Recupero il grafico
                                var visualChart = getChartFromList(chartList, chartEntity.id);
                                // Aggiorno l'entity
                                visualChart.chartEntity.variableList.pop();

                                try {
                                    // Creo il nuovo grafico
                                    visualChart.createVisualChart();
                                }
                                catch(err) {
                                    $(".error").text("Attenzione: errore nella creazione del grafico.");
                                    $(".error").fadeIn(400).delay(3000).fadeOut(400);
                                    console.log("Errore nella creazione del grafico:" + err);
                                }
                                finally {
                                    // Rimuovo l'immagine per il caricamento
                                    $("#update-img-loader-" + chartEntity.id).hide();		
                                }
                            }
                            else {
                                // Faccio semplicemente il pop
                                chartEntity.variableList.pop();
                            }

                        });

                    });
                }

                // Funzione per collegare gli eventi ai filtri
                function bindEventFilterControls(newChart) {
                    // Collego l'evento change della combo per il filtro sul sesso
                    // e aggiorno il grafico
                    $("#cb-genderfilter-" + newChart.chartEntity.id).on("change", function() {

                        updated = true;

                        var chartId = $(this).attr("id").replace("cb-genderfilter-", "");
                        var chartToBeUpd = getChartFromList(chartList, chartId);
                        chartToBeUpd.chartEntity.setGenderFilter($(this).val());
                        chartToBeUpd.updateVisualChart();										 
                    });

                    // Collego l'evento change della combo per il filtro sul mano
                    // e aggiorno il grafico
                    $("#cb-dominanthandfilter-" + newChart.chartEntity.id).on("change", function() {

                        updated = true;

                        var chartId = $(this).attr("id").replace("cb-dominanthandfilter-", "");
                        var chartToBeUpd = getChartFromList(chartList, chartId);
                        chartToBeUpd.chartEntity.setDominantHandFilter($(this).val());
                        chartToBeUpd.updateVisualChart();
                    });

                    // Collego l'evento change della combo per il filtro 
                    // sulla mano utilizzata nella sessione e aggiorno il grafico
                    $("#cb-sessionhandfilter-" + newChart.chartEntity.id).on("change", function() { 

                        updated = true;

                        var chartId = $(this).attr("id").replace("cb-sessionhandfilter-", "");
                        var chartToBeUpd = getChartFromList(chartList, chartId);
                        chartToBeUpd.chartEntity.setSessionHandFilter($(this).val());
                        chartToBeUpd.updateVisualChart();
                    });

                    // Collego l'evento change dello spin per l'età minima
                    // e aggiorno il grafico
                    $("#sp-agemin-" + newChart.chartEntity.id).on("change", function() {

                        updated = true;

                        var chartId = $(this).attr("id").replace("sp-agemin-", "");
                        var chartToBeUpd = getChartFromList(chartList, chartId);
                        chartToBeUpd.chartEntity.setMinAgeFilter($(this).val());
                        chartToBeUpd.chartEntity.createVisualAgeFilter(null);
                        bindEventToButtonGridAge();

                        var min = $(this).val();
                        var max = $("#sp-agemax-" + newChart.chartEntity.id).val();

                        // Creo un json 
                        var jsonObjectToSend = {
                            grafico: chartToBeUpd.chartEntity.chartType,
                            database: chartToBeUpd.chartEntity.database,
                            esercizio: chartToBeUpd.chartEntity.exerciseType,
                            listaDimVar: chartToBeUpd.chartEntity.variableList,
                            min: min,
                            max: max
                        };

                        // Richiesta ajax per recuperare i nuovi dati
                        $.ajax({
                            type: "POST",
                            url: "getMotorbrainData.php",
                            dataType: "json",
                            data: { chartAge : JSON.stringify(jsonObjectToSend) },
                            success: function(jsonData, status) {

                                // Controllo se è un grafico già esistente
                                var newVisualChart = getChartFromList(chartList, chartToBeUpd.chartEntity.id);

                                // Creo il nuovo
                                var chartEntityUpd = newVisualChart.chartEntity;
                                chartEntityUpd.setDatabase(chartToBeUpd.chartEntity.database);
                                chartEntityUpd.setExerciseType(chartToBeUpd.chartEntity.exerciseType);
                                chartEntityUpd.setChartType(chartToBeUpd.chartEntity.chartType);
                                chartEntityUpd.setVariableList(chartToBeUpd.chartEntity.variableList);
                                chartEntityUpd.setJsonData(jsonData);

                                // Se c'è già un grafico disegnato lo devo aggiornare
                                if ($("#grafico-" + chartToBeUpd.chartEntity.id).children().length > 0) {
                                    // Svuoto il contenitore
                                    $("#grafico-" + chartToBeUpd.chartEntity.id).empty();

                                    // Rimuovo eventuali tooltip
                                    $("#d3-tip-" + chartToBeUpd.chartEntity.id).remove();

                                    // Ricreo l'oggetto che rappresenta il grafico
                                    newVisualChart = factoryChart.createChart(chartEntityUpd);

                                    // Lo memorizzo nell'array
                                    delete chartList[chartEntityUpd.id];
                                    chartList[chartEntityUpd.id] = newVisualChart;

                                    try {
                                        // Creo il nuovo grafico
                                        newVisualChart.createVisualChart();

                                        // Riabilito il componente
                                        $("#contenitore-filtri-" + chartEntityUpd.id + " .disable-element").hide();

                                    }
                                    catch(err) {
                                        $(".error").text("Attenzione: errore nella creazione del grafico.");
                                        $(".error").fadeIn(400).delay(3000).fadeOut(400);
                                        console.log("Errore nella creazione del grafico:" + err);
                                    }
                                }
                            },
                            error: function(xhr, desc, err) {
                                console.log(xhr);
                                console.log("Dettaglio: " + desc + "\nErrore: " + err);
                            }
                        });
                    });

                    // Collego l'evento change dello spin per l'età massima
                    // e aggiorno il grafico
                    $("#sp-agemax-" + newChart.chartEntity.id).on("change", function() {

                        updated = true;

                        var chartId = $(this).attr("id").replace("sp-agemax-", "");
                        var chartToBeUpd = getChartFromList(chartList, chartId);
                        chartToBeUpd.chartEntity.setMaxAgeFilter($(this).val());
                        chartToBeUpd.chartEntity.createVisualAgeFilter(null);
                        bindEventToButtonGridAge();

                        var min = $("#sp-agemin-" + newChart.chartEntity.id).val();
                        var max = $(this).val();

                        // Creo un json 
                        var jsonObjectToSend = {
                            grafico: chartToBeUpd.chartEntity.chartType,
                            database: chartToBeUpd.chartEntity.database,
                            esercizio: chartToBeUpd.chartEntity.exerciseType,
                            listaDimVar: chartToBeUpd.chartEntity.variableList,
                            min: min,
                            max: max
                        };

                        // Richiesta ajax per recuperare i nuovi dati
                        $.ajax({
                            type: "POST",
                            url: "getMotorbrainData.php",
                            dataType: "json",
                            data: { chartAge : JSON.stringify(jsonObjectToSend) },
                            success: function(jsonData, status) {

                                // Controllo se è un grafico già esistente
                                var newVisualChart = getChartFromList(chartList, chartToBeUpd.chartEntity.id);

                                // Creo il nuovo
                                var chartEntityUpd = newVisualChart.chartEntity;
                                chartEntityUpd.setDatabase(chartToBeUpd.chartEntity.database);
                                chartEntityUpd.setExerciseType(chartToBeUpd.chartEntity.exerciseType);
                                chartEntityUpd.setChartType(chartToBeUpd.chartEntity.chartType);
                                chartEntityUpd.setVariableList(chartToBeUpd.chartEntity.variableList);
                                chartEntityUpd.setJsonData(jsonData);

                                // Se c'è già un grafico disegnato lo devo aggiornare
                                if ($("#grafico-" + chartToBeUpd.chartEntity.id).children().length > 0) {
                                    // Svuoto il contenitore
                                    $("#grafico-" + chartToBeUpd.chartEntity.id).empty();

                                    // Rimuovo eventuali tooltip
                                    $("#d3-tip-" + chartToBeUpd.chartEntity.id).remove();

                                    // Ricreo l'oggetto che rappresenta il grafico
                                    newVisualChart = factoryChart.createChart(chartEntityUpd);

                                    // Lo memorizzo nell'array
                                    delete chartList[chartEntityUpd.id];
                                    chartList[chartEntityUpd.id] = newVisualChart;

                                    try {
                                        // Creo il nuovo grafico
                                        newVisualChart.createVisualChart();

                                        // Riabilito il componente
                                        $("#contenitore-filtri-" + chartEntityUpd.id + " .disable-element").hide();

                                    }
                                    catch(err) {
                                        $(".error").text("Attenzione: errore nella creazione del grafico.");
                                        $(".error").fadeIn(400).delay(3000).fadeOut(400);
                                        console.log("Errore nella creazione del grafico:" + err);
                                    }
                                }
                            },
                            error: function(xhr, desc, err) {
                                console.log(xhr);
                                console.log("Dettaglio: " + desc + "\nErrore: " + err);
                            }
                        });
                    });

                    // Collego l'evento change dello spin per l'ampiezza dell'intervallo
                    // e aggiorno il grafico
                    $("#sp-agerange-" + newChart.chartEntity.id).on("change", function() {

                        updated = true;

                        var chartId = $(this).attr("id").replace("sp-agerange-", "");
                        var chartToBeUpd = getChartFromList(chartList, chartId);
                        chartToBeUpd.chartEntity.setRangeAgeFilter($(this).val());
                        chartToBeUpd.chartEntity.createVisualAgeFilter(null);
                        bindEventToButtonGridAge();
                        chartToBeUpd.updateVisualChart();									 
                    });

                    // Collego l'evento click al pulsante elimina
                    $("#bt-elimina-grafico-" + newChart.chartEntity.id).on("click", function() {

                  
                        var chartId = $(this).attr("id").replace("bt-elimina-grafico-", "");
                        var chartToBeUpd = getChartFromList(chartList, chartId);
                        //var indexChartToRemove = chartList.indexOf(chartToBeUpd);
                        //chartList.splice(indexChartToRemove, 1);

                        if (chartToBeUpd != null) {
                            delete chartList[chartToBeUpd.chartEntity.id];

                            // Rimuovo eventuali tooltip
                            $("#d3-tip-" + chartToBeUpd.chartEntity.id).remove();

                            $("#contenitore-" + chartToBeUpd.chartEntity.id).fadeOut(1000, function() {
                                $(this).remove();
								
								// operazioni da fare qui dentro perchè il fade è asincrono
								// ... trasformo il nuovo ordine dei grafici in stringa ...
								sorted = $("#contenitore-grafici").sortable("serialize");
								// ... e la salvo nel sessionStorage
								sessionStorage.setItem('sorted', sorted);
								
								// Segnalo aggiornamento maschera		
								updated = true;	
							});
							
											
													
                        }				 
                    });

                    // Collego l'evento click al pulsante esporta
                    $("#bt-esporta-grafico-" + newChart.chartEntity.id).on("click", function() {
                        var chartId = $(this).attr("id").replace("bt-esporta-grafico-", "");

                        var jsonChart;

                        for (var chart in chartList) {
                            if (chartList[chart].chartEntity.id == chartId) {
                                // Creo un json 
                                jsonChart = {
                                    id: chartList[chart].chartEntity.id,
                                    chartType: chartList[chart].chartEntity.chartType,
                                    database: chartList[chart].chartEntity.database,
                                    exerciseType: chartList[chart].chartEntity.exerciseType,
                                    variableList: chartList[chart].chartEntity.variableList,
                                    minAge: chartList[chart].chartEntity.minAge,
                                    maxAge: chartList[chart].chartEntity.maxAge,
                                    rangeAge: chartList[chart].chartEntity.rangeAge,
                                    valuesRange: chartList[chart].chartEntity.getAgeButtonsState(),
                                    gender: chartList[chart].chartEntity.gender,
                                    dominantHand: chartList[chart].chartEntity.dominantHand,
                                    sessionHand: chartList[chart].chartEntity.sessionHand//,
                                   // jsonData: chartList[chart].chartEntity.jsonData // verificare che serva veramente
                                };
                            }
                        }

                        // Per debug
                        // console.log(jsonChart.database);
						
						// Mostro l'immagine per il caricamento
                        $("#update-img-loader-" + newChart.chartEntity.id).show();

                        $.post("gestioneGrafici.php", {
                            esporta_tutto: JSON.stringify(jsonChart) // chiamava esporta_grafico in originale
                        }).done(function() {

							// Nascondo l'immagine per il caricamento
                            $("#update-img-loader-" + newChart.chartEntity.id).hide();
                            
							var fileName = jsonChart["id"] + ".txt.gz";
                            var url = "files/" + fileName;

                            var link = document.getElementById('a-esporta-grafico');
                            if (typeof link.download === 'string') {
                                link.href = url;
                                link.setAttribute('download', fileName);
                                link.setAttribute('style', 'text-decoration: none;')

                                //simulate click
                                link.click();

                                //remove the link when done
                                link.setAttribute("href", "#");
                            }
                        }).fail(function(xhr, ajaxOptions, thrownError) { //Se ci sono errori
                            alert(thrownError); //Messaggio di avviso con l'errore HTTP
                        });
                    });
                }

                // Funzione per collegare l'evento click 
                // alle celle della griglia degli intervalli 
                function bindEventToButtonGridAge() {
                    //Collego la funzione all'evento click
                    $(".bt-filter-age-range").off("click").on("click", function(d) {

                        updated = true;

                        var chartId = $(this).parent().attr("id").replace("age-svg-g-", "");
                        var chartToBeUpd = getChartFromList(chartList, chartId);
                        var btIndex = parseInt($(this).attr("bt-index"));

                        if ($(this).hasClass("inactive")) {
                            $(this).removeClass("inactive").addClass("active");
                            chartToBeUpd.chartEntity.ageButtons[btIndex].active = true;
                            chartToBeUpd.chartEntity.changeArrayAgeState(chartToBeUpd.chartEntity.ageButtons[btIndex]);
                            chartToBeUpd.updateVisualChart();
                        } else if ($(this).hasClass("active")) {
                            $(this).removeClass("active").addClass("inactive");
                            chartToBeUpd.chartEntity.ageButtons[btIndex].active = false;
                            chartToBeUpd.chartEntity.changeArrayAgeState(chartToBeUpd.chartEntity.ageButtons[btIndex]);
                            chartToBeUpd.updateVisualChart();
                        }
                    });
                }

                // Creo il contenitore per grafico e filtri
                function popolateChartContainer(newChartEntity) {

                    var databaseString = "<?php echo $_SESSION["databases"]; ?>";

                    var htmlString = 
                        '<div class="dati-grafico-container">' +	
                        // Parametri
                        newChartEntity.getHtmlParameters(databaseString) +
                        // Filtri								
                        newChartEntity.getHtmlFilters() +
                        '</div>' +
                        '<div class="inline-block-container">' +
                        '<div class="block-container">' +
                        '<div id="totale-sessioni-' + newChartEntity.id + '" ' +
                        'class="lb-totale-session" ></div>' +
                        '<div id="totale-sessioni-mostrate-' + newChartEntity.id + '" ' +
                        'class="lb-totale-session" ></div>' +
                        '<div id="bt-muovi-grafico-' + newChartEntity.id + '" ' +
                        'class="bt-muovi-bottom-right">' + customLabelsArray.moveGraphButton + '</div>' +
                        '<button id="bt-elimina-grafico-' + newChartEntity.id + '" ' +
                        'class="bt-elimina-bottom-right" >' + customLabelsArray.deleteGraphButton + '</button>' +
                        '<a id="a-esporta-grafico"><button id="bt-esporta-grafico-' + newChartEntity.id + '" ' +
                        'class="bt-esporta-bottom-right" >' + customLabelsArray.exportGraphButton + '</button></a>' +
                        '</div>' +
                        '<div id="grafico-' + newChartEntity.id + '" class="grafico-container" >' +
                        '</div>' +
                        '<img id="update-img-loader-' + newChartEntity.id + '" ' +
                        'class="update-chart-img-loader" src="./images/spinner.gif" />' +
                        '</div>';

                    return htmlString;
                }

                // Funzione per rimuovere il feedback di errore
                $("#txt-titolo-maschera").on("change", function() {

                    updated = true;

                    $("#txt-titolo-maschera").removeClass("non-compilato");
                });

                // Funzione per il salvataggio della maschera
                $("#bt-salva-maschera").on("click", function() {

                    // Se il titolo non è compilato non permetto di salvare
                    if ($("#txt-titolo-maschera").val() == "") {
                        $("#txt-titolo-maschera").addClass("non-compilato");
                        $(".error").text("Attenzione: inserire il titolo della maschera.");
                        $(".error").fadeIn(400).delay(3000).fadeOut(400);
                        return;
                    }

                    // Se non ci sono grafici non permetto di salvare
                    if (jQuery.isEmptyObject(chartList)) {
                        $(".error").text("Attenzione: nessun grafico inserito.");
                        $(".error").fadeIn(400).delay(3000).fadeOut(400);
                        return;
                    }

                    if (updated) {

                        $("#dialog-salva").dialog({
                            height: "auto",
                            width: 300
                        });

                        $(".ui-dialog").removeClass("ui-corner-all ui-draggable ui-resizable");
                        $(".ui-button").hide();

                        var jsonChartArray = [];
                        for (var chartId in chartList) {
                            // Creo un json 
                            var jsonChart = {
                                id: chartList[chartId].chartEntity.id,
                                database: chartList[chartId].chartEntity.database,
                                chartType: chartList[chartId].chartEntity.chartType,
                                exerciseType: chartList[chartId].chartEntity.exerciseType,
                                variableList: chartList[chartId].chartEntity.variableList,
                                minAge: chartList[chartId].chartEntity.minAge,
                                maxAge: chartList[chartId].chartEntity.maxAge,
                                rangeAge: chartList[chartId].chartEntity.rangeAge,
                                valuesRange: chartList[chartId].chartEntity.getAgeButtonsState(),
                                gender: chartList[chartId].chartEntity.gender,
                                dominantHand: chartList[chartId].chartEntity.dominantHand,
                                sessionHand: chartList[chartId].chartEntity.sessionHand
                            };

                            jsonChartArray.push(jsonChart);
                        }

                        if (jsonMaskID == "") {
                            jsonMaskID = <?php
                                if (isset($maschera)) {
                                    echo '"' . $maschera["mascheraID"] . '"';
                                } 
                                else {
                                    echo '""';
                                }?>;
                        }

                        var jsonMask = {
                            id: jsonMaskID,
                            medicoID: medicoID,
                            titolo: $("#txt-titolo-maschera").val(),
                            descrizione: $("#txt-descrizione-maschera").val(),
                            jsonChartArray: jsonChartArray,
                            ordine: sessionStorage.getItem('sorted').replace("contenitore-", "").replace(/&contenitore\-/g, ";").replace(/\[\]=/g, "-")
                        }

						//debug
                        //console.log(jsonMask);

                        $.ajax({
                            type: "POST",
                            url: "gestioneGrafici.php", 
                            data: { "salva_maschera": JSON.stringify(jsonMask) }, 
                            success: function(jsonData, status){ 
                                updated = false;

                                $("#dialog-salva").dialog( "close" );
                            },
                            error: function(xhr, desc, err) {
                                console.log(xhr);
                                console.log("Dettaglio: " + desc + "\nErrore: " + err);
                            }
                        });        
                    }
                });

                // Funzione per il salvataggio della maschera
                $("#bt-esci-maschera").on("click", function() {

                    if (updated) {

                        // Se il titolo non è compilato non permetto di salvare
                        if ($("#txt-titolo-maschera").val() == "") {
                            $("#txt-titolo-maschera").addClass("non-compilato");
                            $(".error").text("Attenzione: inserire il titolo della maschera.");
                            $(".error").fadeIn(400).delay(3000).fadeOut(400);
                            return;
                        }

                        // Se non ci sono grafici non permetto di salvare
                        if (jQuery.isEmptyObject(chartList)) {
                            $(".error").text("Attenzione: nessun grafico inserito.");
                            $(".error").fadeIn(400).delay(3000).fadeOut(400);
                            return;
                        }

                        $("#dialog-esci").dialog({
                            height: "auto",
                            width: "auto",
                            modal: true,
                            buttons: {
                                [graphPanelArray.saveExit]: function() {
                                    var jsonChartArray = [];
                                    for (var chartId in chartList) {
                                        // Creo un json 
                                        var jsonChart = {
                                            id: chartList[chartId].chartEntity.id,
                                            database: chartList[chartId].chartEntity.database,
                                            chartType: chartList[chartId].chartEntity.chartType,
                                            exerciseType: chartList[chartId].chartEntity.exerciseType,
                                            variableList: chartList[chartId].chartEntity.variableList,
                                            minAge: chartList[chartId].chartEntity.minAge,
                                            maxAge: chartList[chartId].chartEntity.maxAge,
                                            rangeAge: chartList[chartId].chartEntity.rangeAge,
                                            valuesRange: chartList[chartId].chartEntity.getAgeButtonsState(),
                                            gender: chartList[chartId].chartEntity.gender,
                                            dominantHand: chartList[chartId].chartEntity.dominantHand,
                                            sessionHand: chartList[chartId].chartEntity.sessionHand
                                        };

                                        jsonChartArray.push(jsonChart);
                                    }

                                    if (jsonMaskID == "") {
                                        jsonMaskID = <?php
                                            if (isset($maschera)) {
                                                echo '"' . $maschera["mascheraID"] . '"';
                                            } 
                                            else {
                                                echo '""';
                                            } ?>;
                                    }

                                    var jsonMask = {
                                        id: jsonMaskID,
                                        medicoID: medicoID,
                                        titolo: $("#txt-titolo-maschera").val(),
                                        descrizione: $("#txt-descrizione-maschera").val(),
                                        jsonChartArray: jsonChartArray,
                                        ordine: sessionStorage.getItem('sorted').replace("contenitore-", "").replace(/&contenitore\-/g, ";").replace(/\[\]=/g, "-")
                                    }

                                    $.ajax({
                                        type: "POST",
                                        url: "gestioneGrafici.php", 
                                        data: { "salva_maschera": JSON.stringify(jsonMask) }, 
                                        success: function(jsonData, status){ 
                                            updated = false;

                                            window.location.href = './mainpage.php';
                                        },
                                        error: function(xhr, desc, err) {
                                            console.log(xhr);
                                            console.log("Dettaglio: " + desc + "\nErrore: " + err);
                                        }
                                    });
                                },
                                [graphPanelArray.exit]: function() {
                                    window.location.href = './mainpage.php';
                                }
                            }
                        });

                        $(".ui-dialog").removeClass("ui-corner-all ui-draggable ui-resizable");
                        $(".ui-dialog button").removeClass("ui-corner-all");
                    }
                    else {
                        window.location.href = './mainpage.php';
                    }
                });

                // Funzione utilizzata per il caricamento di una maschera salvata precedentemente
                $(".container-grafico-con-strumenti").each(function() {
                    var contenitoreGraficoConStrumenti = $(this);
                    var graficoID = contenitoreGraficoConStrumenti.attr("id").replace("contenitore-", "");
                    
                    $.ajax({
                        type: "POST",
                        url: "getMotorbrainData.php",
                        dataType: "json",
                        data: { "graficoID": graficoID },
                        success: function(jsonData, status) {

                            // Per Debug
                            // console.log(jsonData);

                            // Creo un oggetto di tipo ChartEntity
                            var newChartEntity = new ChartEntity(jsonData["grafico"]["graficoID"]);
                            newChartEntity.setParameters(
                                jsonData["database"],
                                jsonData["grafico"]["tipoGrafico"],
                                jsonData["grafico"]["tipoEsercizio"],
                                jsonData["grafico"]["listaVariabili"],
                                jsonData["jsonData"]);

                            newChartEntity.setGenderFilter(jsonData["grafico"]["filtroGenere"]); 
                            newChartEntity.setDominantHandFilter(jsonData["grafico"]["filtroManoDominante"]);
                            newChartEntity.setSessionHandFilter(jsonData["grafico"]["filtroManoSessione"]);
                            newChartEntity.setMinAgeFilter(jsonData["grafico"]["filtroEtaMin"]);
                            newChartEntity.setMaxAgeFilter(jsonData["grafico"]["filtroEtaMax"]);
                            newChartEntity.setRangeAgeFilter(jsonData["grafico"]["filtroAmpiezzaIntervalloEta"]);

                            var newVisualChart = factoryChart.createChart(newChartEntity);

                            // Lo memorizzo nell'array
                            chartList[newChartEntity.id] = newVisualChart;

                            // Popolo il container
                            contenitoreGraficoConStrumenti.append(popolateChartContainer(newChartEntity));

                            // Aggiungo le variabili
                            newChartEntity.getHtmlVariables()

                            // Collego gli eventi alle varie combo per i parametri
                            bindEventParameterControls(newChartEntity);
                            // Collego gli eventi alle variabili
                            bindEventVariablesControl(newChartEntity);
                            bindEventAggiungiVariable(newChartEntity);
                            // Collego l'evento al bottone visualizza
                            bindVisualizzaGrafico(newChartEntity);
                            $("#bt-visualizza-grafico-" + newChartEntity.id).hide();
                            // Collego gli eventi ai filtri
                            bindEventFilterControls(newVisualChart);

                            // Aggiorno i filtri e il grafico con i valori salvati					
                            $("#cb-genderfilter-" + newChartEntity.id).val(newChartEntity.gender);				
                            $("#cb-dominanthandfilter-" + newChartEntity.id).val(newChartEntity.dominantHand);						
                            $("#cb-sessionhandfilter-" + newChartEntity.id).val(newChartEntity.sessionHand);						
                            $("#sp-agemin-" + newChartEntity.id).val(newChartEntity.minAge);					
                            $("#sp-agemax-" + newChartEntity.id).val(newChartEntity.maxAge);
                            $("#sp-agerange-" + newChartEntity.id).val(newChartEntity.rangeAge);

                            // Creo il filtro interattivo per l'età
                            newVisualChart.chartEntity.createVisualAgeFilter(jsonData["grafico"]["filtroListaValoriIntervalli"]);
                            bindEventToButtonGridAge();						

                            // Creo il nuovo grafico e lo aggiorno
                            newVisualChart.createVisualChart();
                        },
                        error: function(xhr, desc, err) {
                            console.log(xhr);
                            console.log("Dettaglio: " + desc + "\nErrore: " + err);
                        }
                    }).always(function() {
                        $("#img-loader-" + graficoID).remove();
                    });
                });

                // Setto tutte le stringhe della pagina
                $("#gestione").text(graphPanelArray.management);
                $("#title-maschera").text(graphPanelArray.title);
                $("#description-maschera").text(graphPanelArray.description);
                $("#bt-aggiugi-grafico").text(graphPanelArray.add);
                $("#bt-esci-maschera").text(graphPanelArray.exit);
                $("#dialog-salva").prop('title', graphPanelArray.saveAlert);
                $("#bt-salva-maschera").text(graphPanelArray.save);
                $("#dialog-esci").prop('title', graphPanelArray.exitAlert);
                $("#dialog-esci > p").text(graphPanelArray.exitAlertText);
                $(".ui-dialog-buttonset:nth-child(1)").prop('value', graphPanelArray.saveExit);
                $(".ui-dialog-buttonset:nth-child(1)").prop('value', graphPanelArray.exit);

            });
        </script>
    </head>

    <body>
        <ul>
            <li class="active"><a id="gestione" href="#gestione"></a></li>
            <li class="right-element"><a href="./logoutMedico.php">Logout</a></li>
        </ul>

        <div id="contenitore-dati-maschera" class="">
            <div>
                <label id="title-maschera" for="txt-titolo-maschera" class="lb-dati-maschera" ></label>
                <input id="txt-titolo-maschera" class="input-text-maschera" type="text"
                       name="txt-titolo-maschera"
                       placeholder="<?php 
                                    switch ($medicoSessione["lastLanguage"]) {
                                        case "IT":
                                            echo 'Titolo';
                                            break;
                                        case "EN":
                                            echo 'Title';
                                            break;
                                        default:
                                            echo 'Title';
                                            break;
                                    }
                                    ?>"
                       value="<?php 
                              if (isset($maschera)) {
                                  echo $maschera["titolo"];
                              }
                              ?>">
            </div>
            <div>
                <label id="description-maschera"  for="txt-descrizione-maschera"  class="lb-dati-maschera"></label>					
                <textarea id="txt-descrizione-maschera" class="input-textarea-maschera"
                          name="txt-descrizione-maschera" maxlength="255"
                          placeholder="<?php 
                                        switch ($medicoSessione["lastLanguage"]) {
                                            case "IT":
                                                echo 'Descrizione';
                                                break;
                                            case "EN":
                                                echo 'Description';
                                                break;
                                            default:
                                                echo 'Description';
                                                break;
                                        }
                                        ?>"><?php 
                    if (isset($maschera)) {
                        echo $maschera["descrizione"];
                    }	?></textarea>
            </div>
        </div>

        <div>
            <button id="bt-aggiugi-grafico" class="bt-positive bt-aggiungi-grafico"></button>
            <button id="bt-esci-maschera" class="bt-positive bt-esci-maschera"></button>
            <div id="dialog-esci" title="Attenzione!" hidden="true">
                <p><span class="ui-icon ui-icon-alert" style="float:left; margin:1px 12px 20px 0;"></span></p>
            </div>
            <button id="bt-salva-maschera" class="bt-positive bt-salva-maschera"></button>
            <div id="dialog-salva" title="Salvataggio in corso..." hidden="true">
                <p><center><img src="./images/spinner.gif" width="50" height="50"/></center></p>
            </div>
        </div>

        <div id="contenitore-grafici" class="graphics-grid">

            <?php 

            if (isset($grafici)) {
                foreach ($grafici as $grafico) {
                    echo '<div id="contenitore-' . $grafico["graficoID"] . '" ';
                    echo 'class="container-grafico-con-strumenti">';
                    echo '<img id="img-loader-' . $grafico["graficoID"] . '" ';
                    echo 'class="img-loader-inside-chart-container" src="./images/spinner.gif" />';
                    echo '</div>';
                }
            }
            ?>

        </div>

        <div class="error" ></div>

    </body>
</html>