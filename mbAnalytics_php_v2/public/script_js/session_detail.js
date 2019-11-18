/* In questo script verranno implementate le
 * funzioni che mostreranno la parte grafica 
 * per la gestione del dettaglio dell'esercizio
 */

// Mostra il contenitore:
// - exerciseType: tipo dell'esercizio
// - userID: id dell'utente
// - sessionID: id della sessione
// - eta: età dell'utente
// - manoDominante: mano dominante dell'utente
// - manoSessione: mano con cui è stata eseguita la sessione
function showExerciseDetail(database, exerciseType, userID, sessionID, 
                             eta, manoDominante, manoSessione,
                             recordStatus, chartEntityId) {

    var newHtmlGraphic = 
        '<div id="fade-dettaglio-grafico">' +
        '<div id="modal-dettaglio-grafico">' +
        '<div id="dettaglio-grafico" class="dettaglio-container">' +
        '<div>' +
        '<div class="lb-detail-container">' +
        // Tipo di esercizio
        '<div class="lb-esercizio-grafico">' +  
        exerciseArrayText[exerciseArrayValue.indexOf(exerciseType)] +	
        '</div>' +
        // UserID
        '<div>' + 
        '<div class="lb-detail-ridotta">' + customLabelsArray.userId + ':</div>' + 
        '<div class="lb-detail-value-ridotta">' + userID +	'</div>' +
        '</div>' +
        // SessioneID
        '<div>' + 
        '<div class="lb-detail-ridotta">' + customLabelsArray.sessionId + ':</div>' + 
        '<div class="lb-detail-value-ridotta">' + sessionID +	'</div>' +
        '</div>' +
        // Età della persona che ha eseguito l'esercizio
        '<div>' + 
        '<div class="lb-detail-ridotta">' + labelChartArray.age + ':</div>' + 
        '<div class="lb-detail-value-ridotta">' + eta +	'</div>' +
        '</div>' +
        // Mano dominante
        '<div>' + 
        '<div class="lb-detail-ridotta">' + filtersLabelsArray.dominantHand + ':</div>' + 
        '<div class="lb-detail-value-ridotta">' + handArrayMap[manoDominante] +	'</div>' +
        '</div>' +
        // Mano dell'esercizio
        '<div>' + 
        '<div class="lb-detail-ridotta">' + filtersLabelsArray.sessionHand + ':</div>' + 
        '<div class="lb-detail-value-ridotta">' + handArrayMap[manoSessione] +	'</div>' +
        '</div>';
    if (exerciseType != "5" && exerciseType != "6") {

        newHtmlGraphic +=
            '<div>' +
            //								'<div class="lb-detail">' + customLabelsArray.show + ':</div>' + 
            '<div class="lb-detail-value">' +
            '<input id="ck-linee" type="checkbox" name="ck-linee"' + 
            ' value="linee" /><label for="ck-linee">' + customLabelsArray.lines + '</label>' +
            '<input id="ck-punti" type="checkbox" style="margin-left: 15px;" ' + 
            'name="ck-punti" value="punti" /><label for="ck-punti">' + customLabelsArray.points + '<label>' +
            '</div>' +
            '</div>';
    }

    newHtmlGraphic += 
        '</div>' +
        // Grafico a barre
        '<div class="session-summary-container">' +

        '</div>' +
        '</div>' +	
        // Contenitore grafici delle sessioni
        '<div id="dettaglio-grafico-' + sessionID + '" class="dettaglio-grafico-container" >' +
        // Contenitore grafico session 1
        '<div id="dettaglio-grafico-' + sessionID + '_1" class="session-chart-container" >' +
        '<button id="bt-grafico' + sessionID + '_1"  class="bt-sessione" >' + customLabelsArray.session + ' 1</button>' +
        '</div>' +
        // Contenitore grafico session 2
        '<div id="dettaglio-grafico-' + sessionID + '_2" class="session-chart-container" >' +
        '<button id="bt-grafico' + sessionID + '_2"  class="bt-sessione" >' + customLabelsArray.session + ' 2</button>' +
        '</div>' +
        // Contenitore grafico session 3
        '<div id="dettaglio-grafico-' + sessionID + '_3" class="session-chart-container" >' +
        '<button id="bt-grafico' + sessionID + '_3"  class="bt-sessione" >' + customLabelsArray.session + ' 3</button>' +
        '</div>' +
        // Contenitore grafico session 4 intesa come sessioni 1, 2 e 3 nello stesso grafico
        '<div id="dettaglio-grafico-' + sessionID + '_4" class="session-chart-container" >' +
        '<button id="bt-grafico' + sessionID + '_4"  class="bt-sessione" >' + customLabelsArray.average + '</button>' +
        '</div>' +
        '<img id="detail-img-loader-' + sessionID + '" ' +
        'class="detail-img-loader" src="./images/spinner.gif" />' +
        '</div>' +
        // Contenitore per i bottoni
        '<div class="block-container">';

    // Se lo status dell'elemento è 0, 
    // significa che è incluso nella visualizzazione
    if (recordStatus == 0) {
        // Creo il bottone per escluderlo
        newHtmlGraphic += '<button id="bt-modifica-status-' + sessionID + '" ' +
            'class="bt-modifica-status-sessione status-escludi" >' + customLabelsArray.excludeButton + '</button>';
    } else if (recordStatus == 1) {
        // Se è 1, significa che è escluso e creo il bottone per includerlo
        newHtmlGraphic += '<button id="bt-modifica-status-' + sessionID + '" ' +
            'class="bt-modifica-status-sessione status-includi" >' + customLabelsArray.includeButton + '</button>';
    }
	
	newHtmlGraphic += '<a id="a-esporta-sessione"><button id="bt-esporta-sessione-' + sessionID + '" ' +
            'class="bt-esporta-sessione" >' + customLabelsArray.exportGraphButton + '</button></a>';

    newHtmlGraphic += 
        '<button id="bt-chiudi-dettaglio" ' +
        'class="bt-chiudi-bottom-right" >' + customLabelsArray.closeButton + '</button>' +
        '</div></div>' +	
        '</div>' +	
        '</div>';

    // Aggiungo il contenitore del grafico con il dettaglio dell'esercizio
    $("body").append(newHtmlGraphic);

    createExerciseDetailChart(database, exerciseType, userID, sessionID);

    //Collego l'evento click al pulsante di inclusione/esclusione dati utente
    $("#bt-modifica-status-" + sessionID).on("click", function() {
        var btModificaStatus = $(this);
        var newStatus = 0;
        if (recordStatus == 0) {
            newStatus = 1;
        } else  {
            newStatus = 0;
        }

        // Creo un json 
        var jsonStatusUpdate = {
            database: database,
            esercizio: exerciseType,
            sessioneID: sessionID,
            nuovoStatus: newStatus
        };

        // Per debug
        //    console.log(jsonStatusUpdate);

        // Richiesta ajax per recuperare i dati
        $.ajax({
            type: "POST",
            url: "setMotorbrainData.php",
            dataType: "json",
            data: { updateSessionStatus : JSON.stringify(jsonStatusUpdate) },
            success: function(response, status) {

                // Per debug
                //	      console.log(response);

                // Se è andato tutto a buon fine
                if (response == 1) {
                    // Aggiorno lo status
                    recordStatus = newStatus;

                    // Aggiorno il bottone
                    if (newStatus == 1) {
                        btModificaStatus.removeClass("status-escludi");
                        btModificaStatus.addClass("status-includi");
                        btModificaStatus.text(customLabelsArray.includeButton);
                    } else if (newStatus == 0) {
                        btModificaStatus.removeClass("status-includi");
                        btModificaStatus.addClass("status-escludi");
                        btModificaStatus.text(customLabelsArray.excludeButton);
                    } 

                    // Svuoto il contenitore
                    $("#grafico-" + chartEntityId).empty();
                    $("#bt-visualizza-grafico-" + chartEntityId).click();
                } else {
                    $(".error").text("Attenzione: errore nell'aggiornamento dello stato.");
                    $(".error").fadeIn(400).delay(3000).fadeOut(400);
                }

            },
            error: function(xhr, desc, err) {
                console.log(xhr);
                console.log("Dettaglio: " + desc + "\nErrore: " + err);

                $(".error").text("Attenzione: errore nell'aggiornamento dello stato.");
                $(".error").fadeIn(400).delay(3000).fadeOut(400);
            }
        })
            .always(function() {

        });
    });

	//Collego l'evento click al pulsante di esportazione dati sessione
	// TODO: i dati sarebbero già presenti in locale (servono a creare i grafici di dettaglio), vedere se si possono usare quelli senza passare di nuovo per il server 
    $("#bt-esporta-sessione-" + sessionID).on("click", function() {

        // Creo un json 
        var jsonSession = {
			database: database,
			exerciseType: exerciseType,
			userID: userID,
			sessionID: sessionID
        };

        // Per debug
        //    console.log(jsonSession);

        $.post("gestioneGrafici.php", {
            esporta_sessione: JSON.stringify(jsonSession)
        }).done(function() {

            var fileName = sessionID + ".txt.gz";
            var url = "files/" + fileName;

            var link = document.getElementById('a-esporta-sessione');
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
	
    //Collego l'evento click al pulsante di chiusura
    $("#bt-chiudi-dettaglio").on("click", function() { 									

        $("#fade-dettaglio-grafico").fadeOut(500, function() {
            $(this).remove();
        });						 
    });
}

// Funzione che crea il grafico che mostra il dettaglio
function createExerciseDetailChart(database, exerciseType, userID, sessionID) {

    // Creo un oggetto json con le informazioni necessarie per recuperare i dati
    var jsonDetailInfo = {
        database: database,
        exerciseType: exerciseType,
        userID: userID,
        sessionID: sessionID
    }

    //Per Debug
    //	console.log(jsonDetailInfo);

    // Eseguo una chiamata per recuperare le informazioni richieste
    $.ajax({
        type: "POST",
        url: "getMotorbrainData.php",
        dataType: "json",
        data: { jsonDetailInfo : JSON.stringify(jsonDetailInfo) },
        success: function(jsonData, status) {

            // Per Debug
            //			console.log(jsonData);

            if (jsonData == "") {
                $(".error").text("Attenzione: nessun record è stato trovato.");
                $(".error").fadeIn(400).delay(3000).fadeOut(400);
                return;
            }

            var exerciseChart = null;			
            switch (exerciseType) {
                case "1":
                    exerciseChart = new CirclePrecisionExerciseChart(jsonData, exerciseType, sessionID);
                    break; 
                case "2":
                    exerciseChart = new CircleSpeedExerciseChart(jsonData, exerciseType, sessionID);
                    break; 
                case "3":
                    exerciseChart = new SquarePrecisionExerciseChart(jsonData, exerciseType, sessionID);
                    break; 
                case "4":
                    exerciseChart = new LineSpeedExerciseChart(jsonData, exerciseType, sessionID);
                    break;
                case "5":
                    exerciseChart = new TwoTargetExerciseChart(jsonData, exerciseType, sessionID);
                    break;
                case "6":
                    exerciseChart = new FourTargetExerciseChart(jsonData, exerciseType, sessionID);
                    break;
                default: 
                    break;
                                }

        },
        error: function(xhr, desc, err) {
            console.log(xhr);
            console.log("Dettaglio: " + desc + "\nErrore: " + err);
        }
    })
        .always(function() {
        $("#detail-img-loader-" + sessionID).remove();
    });
}
