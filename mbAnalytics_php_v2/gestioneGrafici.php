<?php
require_once("utility.php");
require_once("dbMotorbrainMedico.php");
require_once("dbMotorbrainMaschera.php");
require_once("dbMotorbrainGrafico.php");
require_once("dbMotorbrainHeaderdata.php");
require_once("dbMotorbrainRowdata.php");
require_once("dbMotorbrainUserdata.php");

$esercizi = array("1" => "Circle-A",
                  "2" => "Circle-S",
                  "3" => "Square",
                  "4" => "Path",
                  "5" => "Tapping2",
                  "6" => "Tapping4");

if (isset($_POST["salva_maschera"]))	// Maschera da salvare
{
    //Filtro i valori del POST HTTP rimuovendo caratteri non accettati
    $maschera = json_decode($_POST["salva_maschera"], true);

    $esito = false;

    // Controllo che le tabelle siano state create
    if (checkExistMascheradataTable() == false)
    {
        if (createMascheradataTable() == false) {
            $esito = false;
        }
    }

    if (!empty($maschera["id"]))
    {
        // Elimino la maschera
        $esito = deleteMascheraByMascheraID($maschera["id"]);

        if ($esito == false)
        {
            header("Errore nell'eliminazione della maschera.");
            exit();
        }

        // Elimino i grafici collegati alla maschera
        $esito = deleteGraficiByMascheraID($maschera["id"]);

        if ($esito == false)
        {
            header("Errore nell'eliminazione della maschera.");
            exit();
        }

    }

    $mascheraID = GetGUID();
    $esito = insertMaschera($mascheraID, 
                            $maschera["medicoID"], 
                            $maschera["titolo"], 
                            $maschera["descrizione"],
                            $maschera["ordine"]);

    foreach ($maschera["jsonChartArray"] as $grafico)
    {
        if (checkExistGraficodataTable() == false)
        {
            if (createGraficodataTable() == false) {
                $esito = false;
            }
        }

        $esito = insertGrafico($grafico["id"], $mascheraID, $maschera["medicoID"], $grafico["database"],
                               $grafico["chartType"], $grafico["exerciseType"], $grafico["variableList"], 
                               $grafico["minAge"],	$grafico["maxAge"], $grafico["rangeAge"], 
                               $grafico["valuesRange"], $grafico["gender"], $grafico["dominantHand"],
                               $grafico["sessionHand"]);
    }	 

    if ($esito == false)
    {
        header("Errore nell'abilitazione del medico.");
        exit();
    }

}
// NB: non viene più utilizzato, adesso vengono esportati i dati raw
else if (isset($_POST["esporta_grafico"]))	// Maschera da esportare
{
    //Filtro i valori del POST HTTP rimuovendo caratteri non accettati
    $grafico = json_decode($_POST["esporta_grafico"], true);

	// svuoto la cartella files (in modo che non si accumulino file sul server)
	// TODO: trovare una soluzione migliore per esportare i dati (streaming?)
	array_map('unlink', glob("files/*"));
	
	// Definisco il nome del nuovo file da scaricare
    $url = 'files/' . $grafico["id"] . '.txt.gz';

    // Creo il file
    $file = fopen($url, 'w') or die("Could not open file");

    // Scrivo le informazioni relative al grafico
    $string = "Database: " . $grafico["database"] . "\n" .
        "Tipo di grafico: " . ucfirst($grafico["chartType"]) . "\n" .
        "Tipo dell'esercizio: " . $esercizi[$grafico["exerciseType"]] . "\n" .
        "Lista delle variabili: ";

    foreach($grafico["variableList"] as $variabile) {
        $string .= ucfirst($variabile) . " ";
    }

    // Inserisco in un array i range delle età che sono attivi
    $min = $grafico["minAge"];

    foreach($grafico["valuesRange"] as $range) {
        if ($range == 1) {
            $ranges[$min] = $min + $grafico["rangeAge"] - 1;
            $min +=  $grafico["rangeAge"];
        }
        else {
            $min +=  $grafico["rangeAge"];
        }
    }

    $string .= "\n" .
        "Eta' minima: " . $grafico["minAge"] . "\n" .
        "Eta' massima: " . $grafico["maxAge"] . "\n" .
        "Classi d'età: ";

    foreach($ranges as $min => $max) {
        $string .= "[" . $min . ", " . $max . "] ";
    }

    $string .= "\nSesso: " . ucfirst($grafico["gender"]) . "\n" .
        "Mano dominante: " . ucfirst($grafico["dominantHand"]) . "\n" .
        "Mano usata durante la sessione: " . ucfirst($grafico["sessionHand"]) . "\n" .
        "Dati: ID\tuserID\t\t\t\tage\tgender\tdominant hand\tsessionID\t\t\t\t\t\t\thand\t\t";

    switch($grafico["exerciseType"]) {
        case 1:
        case 3:
            $string .= "accuracy\tdistanceTot\t\ttime\t\tdeviationIndex\n";

            foreach ($grafico["jsonData"] as $data) {

                foreach($ranges as $min => $max) {
                    // controllo che l'età sia compresa in almeno uno dei range attivi
                    if ($data["age"] >= $min && $data["age"] <= $max) {

                        // Uso solo i dati che necessari secondo i filtri
                        // L'età non serve perché i dati sono già recuperati in base all'età
                        if (($grafico["gender"] == "-" || $grafico["gender"] == $data["gender"]) &&                     // sesso
                            ($grafico["dominantHand"] == "-" || $grafico["dominantHand"] == $data['dominantHand']) &&   // mano dominante
                            ($grafico["sessionHand"] == "-" || $grafico["sessionHand"] == $data['hand']) &&             // mano usata
                            ($data["status"] == 0))                                                                     // dato non scartato
                        {
                            $string .= "\t  " .
                                $data["ID"] . "\t" .
                                $data["userID"] . "\t" .
                                $data["age"] . "\t" .
                                $data["gender"] . "\t" .
                                $data["dominantHand"] . "\t\t\t" .
                                $data["sessionID"] . "\t";

                            if ($data['hand'] == "destra")
                                $string .= $data['hand'] . "\t\t";
                            else
                                $string .= $data['hand'] . "\t";

                            if (strlen(strval($data['accuracy'])) == 8)
                                $string .= $data['accuracy'] . "\t";
                            else
                                $string .= $data['accuracy'] . "\t\t";

                            $string .= $data['distanceTot'] . "\t\t\t";

                            if (strlen(strval($data['time'])) == 8)
                                $string .= $data['time'] . "\t";
                            else
                                $string .= $data['time'] . "\t\t";

                            $string .= $data['deviationIndex'] . "\n";
                        }
                        break;
                    }
                }
            }
            break;
        case 2:
            $string .= "accuracy\tdistanceCorrect\ttotalSpeed\tturnsInside\tdeviationIndex\n";

            foreach ($grafico["jsonData"] as $data) {

                foreach($ranges as $min => $max) {
                    // controllo che l'età sia compresa in almeno uno dei range attivi
                    if ($data["age"] >= $min && $data["age"] <= $max) {

                        // Uso solo i dati che necessari secondo i filtri
                        // L'età non serve perché i dati sono già recuperati in base all'età
                        if (($grafico["gender"] == "-" || $grafico["gender"] == $data["gender"]) &&                     // sesso
                            ($grafico["dominantHand"] == "-" || $grafico["dominantHand"] == $data['dominantHand']) &&   // mano dominante
                            ($grafico["sessionHand"] == "-" || $grafico["sessionHand"] == $data['hand']) &&             // mano usata
                            ($data["status"] == 0))                                                                     // dato non scartato
                        {
                            $string .= "\t  " .
                                $data["ID"] . "\t" .
                                $data["userID"] . "\t" .
                                $data["age"] . "\t" .
                                $data["gender"] . "\t" .
                                $data["dominantHand"] . "\t\t\t" .
                                $data["sessionID"] . "\t";

                            if ($data['hand'] == "destra")
                                $string .= $data['hand'] . "\t\t";
                            else
                                $string .= $data['hand'] . "\t";

                            if (strval($data['accuracy']) == 1)
                                $string .= $data['accuracy'] . "\t\t\t";
                            else if (strlen(strval($data['accuracy'])) == 8)
                                $string .= $data['accuracy'] . "\t";
                            else
                                $string .= $data['accuracy'] . "\t\t";

                            if (strval($data['distanceCorrect']) == 1)
                                $string .= $data['distanceCorrect'] . " ";
                            else
                                $string .= $data['distanceCorrect'] . "\t\t\t";

                            $string .= $data['totalSpeed'] . "\t\t";

                            if (strlen(strval($data['turnsInside'])) == 8)
                                $string .= $data['turnsInside'] . "\t";
                            else
                                $string .= $data['turnsInside'] . "\t\t";

                            $string .= $data['deviationIndex'] . "\n";
                        }
                        break;
                    }
                }
            }
            break;
        case 4:
            $string .= "\tadjustedAccuracy\ttime\t\tadjustedSpeed\tdistanceTot\tdeviationIndex\n";

            foreach ($grafico["jsonData"] as $data) {

                foreach($ranges as $min => $max) {
                    // controllo che l'età sia compresa in almeno uno dei range attivi
                    if ($data["age"] >= $min && $data["age"] <= $max) {

                        // Uso solo i dati che necessari secondo i filtri
                        // L'età non serve perché i dati sono già recuperati in base all'età
                        if (($grafico["gender"] == "-" || $grafico["gender"] == $data["gender"]) &&                     // sesso
                            ($grafico["dominantHand"] == "-" || $grafico["dominantHand"] == $data['dominantHand']) &&   // mano dominante
                            ($grafico["sessionHand"] == "-" || $grafico["sessionHand"] == $data['hand']) &&             // mano usata
                            ($data["status"] == 0))                                                                     // dato non scartato
                        {
                            $string .= "\t  " .
                                $data["ID"] . "\t" .
                                $data["userID"] . "\t" .
                                $data["age"] . "\t" .
                                $data["gender"] . "\t" .
                                $data["dominantHand"] . "\t\t\t" .
                                $data["sessionID"] . "\t";

                            if ($data['hand'] == "destra")
                                $string .= $data['hand'] . "\t\t";
                            else
                                $string .= $data['hand'] . "\t";

                            if (strlen(strval($data['adjustedAccuracy'])) == 8)
                                $string .= $data['adjustedAccuracy'] . "\t\t\t";
                            else
                                $string .= $data['adjustedAccuracy'] . "\t\t\t\t";

                            if (strlen(strval($data['time'])) == 8)
                                $string .= $data['time'] . "\t";
                            else
                                $string .= $data['time'] . "\t\t";

                            $string .= $data['adjustedSpeed'] . "\t\t\t";

                            $string .= $data['distanceTot'] . "\t\t";

                            $string .= $data['deviationIndex'] . "\n";
                        }
                        break;
                    }
                }
            }
            break;
        case 5:
        case 6:
            $string .= "\tmeanReactionTime\taccuracy\ttotTaps\n";

            foreach ($grafico["jsonData"] as $data) {

                foreach($ranges as $min => $max) {
                    // controllo che l'età sia compresa in almeno uno dei range attivi
                    if ($data["age"] >= $min && $data["age"] <= $max) {

                        // Uso solo i dati che necessari secondo i filtri
                        // L'età non serve perché i dati sono già recuperati in base all'età
                        if (($grafico["gender"] == "-" || $grafico["gender"] == $data["gender"]) &&                     // sesso
                            ($grafico["dominantHand"] == "-" || $grafico["dominantHand"] == $data['dominantHand']) &&   // mano dominante
                            ($grafico["sessionHand"] == "-" || $grafico["sessionHand"] == $data['hand']) &&             // mano usata
                            ($data["status"] == 0))                                                                     // dato non scartato
                        {
                            $string .= "\t  " .
                                $data["ID"] . "\t" .
                                $data["userID"] . "\t" .
                                $data["age"] . "\t" .
                                $data["gender"] . "\t" .
                                $data["dominantHand"] . "\t\t\t" .
                                $data["sessionID"] . "\t";

                            if ($data['hand'] == "destra")
                                $string .= $data['hand'] . "\t\t";
                            else
                                $string .= $data['hand'] . "\t";

                            if (strlen(strval($data['meanReactionTime'])) <= 7)
                                $string .= $data['meanReactionTime'] . "\t\t\t\t";
                            else
                                $string .= $data['meanReactionTime'] . "\t\t\t";

                            if (strval($data['accuracy']) == 1)
                                $string .= $data['accuracy'] . "\t\t\t";
                            else if (strlen(strval($data['accuracy'])) <= 7)
                                $string .= $data['accuracy'] . "\t\t";
                            else
                                $string .= $data['accuracy'] . "\t";

                            $string .= $data['totTaps'] . "\n";
                        }
                        break;
                    }
                }
            }
            break;
    }

	$gzdata = gzencode($string);
	
    // Scrivo i dati del grafico
    fwrite($file, $gzdata);

    fclose($file);
}
else if (isset($_POST["elimina_maschera"]))	// Maschera da eliminare
{
    //Filtro i valori del POST HTTP rimuovendo caratteri non accettati
    $mascheraID = filter_var($_POST["elimina_maschera"], FILTER_SANITIZE_STRING);

    // Elimino la maschera
    $esito = deleteMascheraByMascheraID($mascheraID);

    if ($esito == false)
    {
        header("Errore nell'eliminazione della maschera.");
        exit();
    }

    // Elimino i grafici collegati alla maschera
    $esito = deleteGraficiByMascheraID($mascheraID);

    if ($esito == false)
    {
        header("Errore nell'eliminazione della maschera.");
        exit();
    }
}
else if (isset($_POST["esporta_sessione"]))	// Esporta dati sessione
{
	//Filtro i valori del POST HTTP rimuovendo caratteri non accettati
    $sessioneInfo = json_decode($_POST["esporta_sessione"], true);

	// svuoto la cartella files (in modo che non si accumulino file sul server)
	// TODO: trovare una soluzione migliore per esportare i dati (streaming?)
	array_map('unlink', glob("files/*"));
	
	// Definisco il nome del nuovo file da scaricare
    $url = 'files/' . $sessioneInfo["sessionID"] . '.txt.gz';

    // Creo il file
    $file = fopen($url, 'w') or die("Could not open file");
	
	// Recupero i dati della sessione
	
	$resultUser = getDataFromUser($sessioneInfo["database"],
                                      $sessioneInfo["userID"]);
	
	$resultHeader = getDataFromHeader($sessioneInfo["database"],
                                      $sessioneInfo["exerciseType"], 
                                      $sessioneInfo["sessionID"],
                                      $sessioneInfo["userID"]);
    
    $resultRow = getDataFromRow($sessioneInfo["database"],
                                $sessioneInfo["exerciseType"], 
                                $sessioneInfo["sessionID"]);

	$string .= "Database: " . $sessioneInfo["database"] . "\n" . "Exercise: " . $esercizi[$sessioneInfo["exerciseType"]] . "\n";
	
	$string .= "\n";
	
	// Creo contenuto file con i dati recuperati dal db (prima riga intestazione user, poi dati user, poi intestazione header, poi dati header, poi intestazione row data, poi dati row data, SEPARATORE ;)
	
	$string .= "userID" . ";" . "gender" . ";" . "dominantHand" . ";" . "age" . "\n";
	
	foreach ($resultUser as $data) {
	
		$string .= $data['userID'] . ";";
		$string .= $data['gender'] . ";";
		$string .= $data['dominantHand'] . ";";
		$string .= $data['age'];
		$string .= "\n";

	}
	
	$string .= "\n";
	
	if ($sessioneInfo["exerciseType"] == "1")
		{
			$string .= "userID" . ";" . "sessionID" . ";" . "repetitionID" . ";" . "screenWidth" . ";" . "screenHeight" . ";" . "circleCenterX" . ";" . "circleCenterY" . ";" . "radiusCenter" . ";" . "margin" . ";" . "accuracy" . ";" . "distanceTot" . ";" . "time" . ";" . "centerCircle" . "\n";
	
			foreach ($resultHeader as $data) {
				
				$string .= $data['userID'] . ";";
				$string .= $data['sessionID'] . ";";
				$string .= $data['repetitionID'] . ";";
				$string .= $data['screenWidth'] . ";";
				$string .= $data['screenHeight'] . ";";
				$string .= $data['circleCenterX'] . ";";
				$string .= $data['circleCenterY'] . ";";
				$string .= $data['radiusCenter'] . ";";
				$string .= $data['margin'] . ";";
				$string .= $data['accuracy'] . ";";
				$string .= $data['distanceTot'] . ";";
				$string .= $data['time'] . ";";
				$string .= $data['centerCircle'];
				$string .= "\n";
		
			}
			
			$string .= "\n";
			
			$string .= "sessionID" . ";" . "repetitionID" . ";" . "xR" . ";" . "yR" . ";" . "xN" . ";" . "yN" . ";" . "timeStampN" . ";" . "timeStampR" . "\n";

			foreach ($resultRow as $data) {
				
				$string .= $data['sessionID'] . ";";
				$string .= $data['repetitionID'] . ";";				
				$string .= $data['xR'] . ";";
				$string .= $data['yR'] . ";";
				$string .= $data['xN'] . ";";
				$string .= $data['yN'] . ";";
				$string .= $data['timeStampN'] . ";";
				$string .= $data['timeStampR'];
				$string .= "\n";
		
			}					
		}
		else if ($sessioneInfo["exerciseType"] == "2")
		{
			$string .= "userID" . ";" . "sessionID" . ";" . "repetitionID" . ";" . "screenWidth" . ";" . "screenHeight" . ";" . "circleCenterX" . ";" . "circleCenterY" . ";" . "radiusCenter" . ";" . "margin" . ";" . "accuracy" . ";" . "distanceCorrect" . ";" . "totalSpeed" . ";" . "turnsInside" . ";" . "centerCircle" . "\n";
			
			foreach ($resultHeader as $data) {
				
				$string .= $data['userID'] . ";";
				$string .= $data['sessionID'] . ";";
				$string .= $data['repetitionID'] . ";";				
				$string .= $data['screenWidth'] . ";";
				$string .= $data['screenHeight'] . ";";
				$string .= $data['circleCenterX'] . ";";
				$string .= $data['circleCenterY'] . ";";
				$string .= $data['radiusCenter'] . ";";
				$string .= $data['margin'] . ";";
				$string .= $data['accuracy'] . ";";
				$string .= $data['distanceCorrect'] . ";";
				$string .= $data['totalSpeed'] . ";";
				$string .= $data['turnsInside'] . ";";
				$string .= $data['centerCircle'];
				$string .= "\n";
		
			}
			
			$string .= "\n";
			
			$string .= "sessionID" . ";" . "repetitionID" . ";" . "xR" . ";" . "yR" . ";" . "xN" . ";" . "yN" . ";" . "timeStampN" . ";" . "timeStampR" . "\n";

			foreach ($resultRow as $data) {
				
				$string .= $data['sessionID'] . ";";
				$string .= $data['repetitionID'] . ";";				
				$string .= $data['xR'] . ";";
				$string .= $data['yR'] . ";";
				$string .= $data['xN'] . ";";
				$string .= $data['yN'] . ";";
				$string .= $data['timeStampN'] . ";";
				$string .= $data['timeStampR'];
				$string .= "\n";
		
			}

		}
		else if ($sessioneInfo["exerciseType"] == "3")
		{ 
			$string .= "userID" . ";" . "sessionID" . ";" . "repetitionID" . ";" . "screenWidth" . ";" . "screenHeight" . ";" . "x1" . ";" . "y1" . ";" . "x2" . ";" . "y2" . ";" . "x3" . ";" . "y3" . ";" . "x4" . ";" . "y4" . ";" . "edge" . ";" . "margin" . ";" .	"accuracy" . ";" . "distanceTot" . ";" . "time" . ";" . "centralPerimeter" . "\n";
			
			foreach ($resultHeader as $data) {
				
				$string .= $data['userID'] . ";";
				$string .= $data['sessionID'] . ";";
				$string .= $data['repetitionID'] . ";";				
				$string .= $data['screenWidth'] . ";";
				$string .= $data['screenHeight'] . ";";
				$string .= $data['x1'] . ";";
				$string .= $data['y1'] . ";";
				$string .= $data['x2'] . ";";
				$string .= $data['y2'] . ";";
				$string .= $data['x3'] . ";";
				$string .= $data['y3'] . ";";
				$string .= $data['x4'] . ";";
				$string .= $data['y4'] . ";";				
				$string .= $data['edge'] . ";";
				$string .= $data['margin'] . ";";
				$string .= $data['accuracy'] . ";";
				$string .= $data['distanceTot'] . ";";
				$string .= $data['time'] . ";";
				$string .= $data['centralPerimeter'];
				$string .= "\n";
		
			}
			
			$string .= "\n";
			
			$string .= "sessionID" . ";" . "repetitionID" . ";" . "xR" . ";" . "yR" . ";" . "xN" . ";" . "yN" . ";" . "timeStampN" . ";" . "timeStampR" . "\n";

			foreach ($resultRow as $data) {
				
				$string .= $data['sessionID'] . ";";
				$string .= $data['repetitionID'] . ";";				
				$string .= $data['xR'] . ";";
				$string .= $data['yR'] . ";";
				$string .= $data['xN'] . ";";
				$string .= $data['yN'] . ";";
				$string .= $data['timeStampN'] . ";";
				$string .= $data['timeStampR'];
				$string .= "\n";
		
			}

		}
		else if ($sessioneInfo["exerciseType"] == "4")
		{

			$string .= "userID" . ";" . "sessionID" . ";" . "repetitionID" . ";" . "screenWidth" . ";" . "screenHeight" . ";" . "width" . ";" . "height" . ";" .
					"x1" . ";" . "y1" . ";" . "x2" . ";" . "y2" . ";" . "x3" . ";" . "y3" . ";" . "x4" . ";" . "y4" . ";" . "x5" . ";" . "y5" . ";" . "margin" . ";" . "adjustedAccuracy" . ";" . "time" . ";" . "totalLength" . ";" . "adjustedSpeed" . ";" . "distanceTot" . "\n";

			foreach ($resultHeader as $data) {
				
				$string .= $data['userID'] . ";";
				$string .= $data['sessionID'] . ";";
				$string .= $data['repetitionID'] . ";";				
				$string .= $data['screenWidth'] . ";";
				$string .= $data['screenHeight'] . ";";
				$string .= $data['width'] . ";";
				$string .= $data['height'] . ";";				
				$string .= $data['x1'] . ";";
				$string .= $data['y1'] . ";";
				$string .= $data['x2'] . ";";
				$string .= $data['y2'] . ";";
				$string .= $data['x3'] . ";";
				$string .= $data['y3'] . ";";
				$string .= $data['x4'] . ";";
				$string .= $data['y4'] . ";";				
				$string .= $data['x5'] . ";";
				$string .= $data['y5'] . ";";	
				$string .= $data['margin'] . ";";
				$string .= $data['adjustedAccuracy'] . ";";
				$string .= $data['time'] . ";";
				$string .= $data['totalLength'] . ";";
				$string .= $data['adjustedSpeed'] . ";";
				$string .= $data['distanceTot'];
				$string .= "\n";
		
			}
			
			$string .= "\n";
			
			$string .= "sessionID" . ";" . "repetitionID" . ";" . "xR" . ";" . "yR" . ";" . "xN" . ";" . "yN" . ";" . "timeStampN" . ";" . "timeStampR" . "\n";

			foreach ($resultRow as $data) {
				
				$string .= $data['sessionID'] . ";";
				$string .= $data['repetitionID'] . ";";				
				$string .= $data['xR'] . ";";
				$string .= $data['yR'] . ";";
				$string .= $data['xN'] . ";";
				$string .= $data['yN'] . ";";
				$string .= $data['timeStampN'] . ";";
				$string .= $data['timeStampR'];
				$string .= "\n";
		
			}					
		}
		else if ($sessioneInfo["exerciseType"] == "5")
		{			  
			$string .= "userID" . ";" . "sessionID" . ";" . "repetitionID" . ";" . "screenWidth" . ";" . "screenHeight" . ";" . "x1" . ";" . "y1" . ";" . "x2" . ";" . "y2" . ";" . "margin" . ";" . "meanReactionTime" . ";" . "accuracy" . ";" . "totTaps" . "\n";
			
			foreach ($resultHeader as $data) {
				
				$string .= $data['userID'] . ";";
				$string .= $data['sessionID'] . ";";
				$string .= $data['repetitionID'] . ";";				
				$string .= $data['screenWidth'] . ";";
				$string .= $data['screenHeight'] . ";";			
				$string .= $data['x1'] . ";";
				$string .= $data['y1'] . ";";
				$string .= $data['x2'] . ";";
				$string .= $data['y2'] . ";";
				$string .= $data['margin'] . ";";
				$string .= $data['meanReactionTime'] . ";";
				$string .= $data['accuracy'] . ";";
				$string .= $data['totTaps'];
				$string .= "\n";
		
			}
			
			$string .= "\n";
			
			$string .= "sessionID" . ";" . "repetitionID" . ";" . "xR" . ";" . "yR" . ";" . "xN" . ";" . "yN" . ";" . "circle_active" . ";" . "circle_appearing_timeR" . ";" . "touched_timeStampR" . "\n";

			foreach ($resultRow as $data) {
				
				$string .= $data['sessionID'] . ";";
				$string .= $data['repetitionID'] . ";";				
				$string .= $data['xR'] . ";";
				$string .= $data['yR'] . ";";
				$string .= $data['xN'] . ";";
				$string .= $data['yN'] . ";";
				$string .= $data['circle_active'] . ";";
				$string .= $data['circle_appearing_timeR'] . ";";
				$string .= $data['touched_timeStampR'];				
				$string .= "\n";
			}				
		}
		else if	($sessioneInfo["exerciseType"] == "6")
		{
			$string .= "userID" . ";" . "sessionID" . ";" . "repetitionID" . ";" . "screenWidth" . ";" . "screenHeight" . ";" .	"x1" . ";" . "y1" . ";" . "x2" . ";" . "y2" . ";" . "x3" . ";" . "y3" . ";" . "x4" . ";" . "y4" . ";" . "margin" . ";" . "meanReactionTime" . ";" . "accuracy" . ";" . "totTaps" . "\n";
			
			foreach ($resultHeader as $data) {
				
				$string .= $data['userID'] . ";";
				$string .= $data['sessionID'] . ";";
				$string .= $data['repetitionID'] . ";";				
				$string .= $data['screenWidth'] . ";";
				$string .= $data['screenHeight'] . ";";			
				$string .= $data['x1'] . ";";
				$string .= $data['y1'] . ";";
				$string .= $data['x2'] . ";";
				$string .= $data['y2'] . ";";
				$string .= $data['x3'] . ";";
				$string .= $data['y3'] . ";";
				$string .= $data['x4'] . ";";
				$string .= $data['y4'] . ";";	
				$string .= $data['margin'] . ";";
				$string .= $data['meanReactionTime'] . ";";
				$string .= $data['accuracy'] . ";";
				$string .= $data['totTaps'];
				$string .= "\n";
		
			}
			
			$string .= "\n";
			
			$string .= "sessionID" . ";" . "repetitionID" . ";" . "xR" . ";" . "yR" . ";" . "xN" . ";" . "yN" . ";" . "circle_active" . ";" . "circle_appearing_timeR" . ";" . "touched_timeStampR" . "\n";

			foreach ($resultRow as $data) {
				
				$string .= $data['sessionID'] . ";";
				$string .= $data['repetitionID'] . ";";				
				$string .= $data['xR'] . ";";
				$string .= $data['yR'] . ";";
				$string .= $data['xN'] . ";";
				$string .= $data['yN'] . ";";
				$string .= $data['circle_active'] . ";";
				$string .= $data['circle_appearing_timeR'] . ";";
				$string .= $data['touched_timeStampR'];				
				$string .= "\n";
			}			
		}
	
	$gzdata = gzencode($string);
	
    // Scrivo i dati della sessione
    fwrite($file, $gzdata);

    fclose($file);	
}
else if (isset($_POST["esporta_tutto"]))	// Esporta dati sessione
{
	//Filtro i valori del POST HTTP rimuovendo caratteri non accettati
    $datagrafico = json_decode($_POST["esporta_tutto"], true);

	// svuoto la cartella files (in modo che non si accumulino file sul server)
	// TODO: trovare una soluzione migliore per esportare i dati (streaming?)
	array_map('unlink', glob("files/*"));
	
	// Definisco il nome del nuovo file da scaricare
    $url = 'files/' . $datagrafico["id"] . '.txt.gz';

    // Creo il file
    $file = fopen($url, 'w') or die("Could not open file");
	
	// Dati generali
    $string = "Database: " . $datagrafico["database"] . "\n" .
        "Exercise: " . $esercizi[$datagrafico["exerciseType"]] . "\n";
		
	// Inserisco in un array i range delle età che sono attivi
	// un po' di magia qui, ranges è un array associativo in cui le chiavi sono i valori min e i valori sono i valori max dei range; valuesRange è un array che ci dice se un range è selezionato (valore 1) oppure no (valore 0); in base a valuesRange e all'intervallo specificato per i valori (rangeAge) viene costruito a runtime l'array associativo 
    $min = $datagrafico["minAge"];

    foreach($datagrafico["valuesRange"] as $range) {
        if ($range == 1) {
            $ranges[$min] = $min + $datagrafico["rangeAge"] - 1;
            $min +=  $datagrafico["rangeAge"];
        }
        else {
            $min +=  $datagrafico["rangeAge"];
        }
    }

    $string .= "Age classes: ";

    foreach($ranges as $min => $max) {
        $string .= "[" . $min . ", " . $max . "], ";
    }
	
	$string .= "\n";

	$string .= "Gender: " . $datagrafico["gender"] . "\n" .
        "Dominant hand: " . $datagrafico["dominantHand"] . "\n" .
        "Session hand: " . $datagrafico["sessionHand"] . "\n";
	
	$string .= "\n";
	
	// Recupero i dati della sessione
	
	$resultUser = getDataFromUserForExport($datagrafico["database"],
                                      $datagrafico["exerciseType"],
									  $ranges,
                                      $datagrafico["dominantHand"],
                                      $datagrafico["sessionHand"],
									  $datagrafico["gender"]);
									  
	$resultHeader = getDataFromHeaderForExport($datagrafico["database"],
                                      $datagrafico["exerciseType"],
									  $ranges,
                                      $datagrafico["dominantHand"],
                                      $datagrafico["sessionHand"],
									  $datagrafico["gender"]);
    

    $resultRow = getDataFromRowForExport($datagrafico["database"],
                                      $datagrafico["exerciseType"],
									  $ranges,
                                      $datagrafico["dominantHand"],
                                      $datagrafico["sessionHand"],
									  $datagrafico["gender"]);

	
	// Creo contenuto file con i dati recuperati dal db (prima riga intestazione user, poi dati user, poi intestazione header, poi dati header, poi intestazione row data, poi dati row data, SEPARATORE ;)
	
	$string .= "userID" . ";" . "gender" . ";" . "dominantHand" . ";" . "age" . "\n";
	
	foreach ($resultUser as $data) {
	
		$string .= $data['userID'] . ";";
		$string .= $data['gender'] . ";";
		$string .= $data['dominantHand'] . ";";
		$string .= $data['age'];
		$string .= "\n";

	}
	
	$string .= "\n";
	
	if ($datagrafico["exerciseType"] == "1")
		{
			$string .= "userID" . ";" . "sessionID" . ";" . "repetitionID" . ";" . "screenWidth" . ";" . "screenHeight" . ";" . "circleCenterX" . ";" . "circleCenterY" . ";" . "radiusCenter" . ";" . "margin" . ";" . "accuracy" . ";" . "distanceTot" . ";" . "time" . ";" . "centerCircle" . "\n";
	
			foreach ($resultHeader as $data) {
				
				$string .= $data['userID'] . ";";
				$string .= $data['sessionID'] . ";";
				$string .= $data['repetitionID'] . ";";
				$string .= $data['screenWidth'] . ";";
				$string .= $data['screenHeight'] . ";";
				$string .= $data['circleCenterX'] . ";";
				$string .= $data['circleCenterY'] . ";";
				$string .= $data['radiusCenter'] . ";";
				$string .= $data['margin'] . ";";
				$string .= $data['accuracy'] . ";";
				$string .= $data['distanceTot'] . ";";
				$string .= $data['time'] . ";";
				$string .= $data['centerCircle'];
				$string .= "\n";
		
			}
			
			$string .= "\n";
			
			$string .= "sessionID" . ";" . "repetitionID" . ";" . "xR" . ";" . "yR" . ";" . "xN" . ";" . "yN" . ";" . "timeStampR" . ";" . "timeStampN" . "\n";

			foreach ($resultRow as $data) {
				
				$string .= $data['sessionID'] . ";";
				$string .= $data['repetitionID'] . ";";				
				$string .= $data['xR'] . ";";
				$string .= $data['yR'] . ";";
				$string .= $data['xN'] . ";";
				$string .= $data['yN'] . ";";
				$string .= $data['timeStampR'] . ";";
				$string .= $data['timeStampN'];
				$string .= "\n";
		
			}					
		}
		else if ($datagrafico["exerciseType"] == "2")
		{
			$string .= "userID" . ";" . "sessionID" . ";" . "repetitionID" . ";" . "screenWidth" . ";" . "screenHeight" . ";" . "circleCenterX" . ";" . "circleCenterY" . ";" . "radiusCenter" . ";" . "margin" . ";" . "accuracy" . ";" . "distanceCorrect" . ";" . "totalSpeed" . ";" . "turnsInside" . ";" . "centerCircle" . "\n";
			
			foreach ($resultHeader as $data) {
				
				$string .= $data['userID'] . ";";
				$string .= $data['sessionID'] . ";";
				$string .= $data['repetitionID'] . ";";				
				$string .= $data['screenWidth'] . ";";
				$string .= $data['screenHeight'] . ";";
				$string .= $data['circleCenterX'] . ";";
				$string .= $data['circleCenterY'] . ";";
				$string .= $data['radiusCenter'] . ";";
				$string .= $data['margin'] . ";";
				$string .= $data['accuracy'] . ";";
				$string .= $data['distanceCorrect'] . ";";
				$string .= $data['totalSpeed'] . ";";
				$string .= $data['turnsInside'] . ";";
				$string .= $data['centerCircle'];
				$string .= "\n";
		
			}
			
			$string .= "\n";
			
			$string .= "sessionID" . ";" . "repetitionID" . ";" . "xR" . ";" . "yR" . ";" . "xN" . ";" . "yN" . ";" . "timeStampR" . ";" . "timeStampN" . "\n";

			foreach ($resultRow as $data) {
				
				$string .= $data['sessionID'] . ";";
				$string .= $data['repetitionID'] . ";";				
				$string .= $data['xR'] . ";";
				$string .= $data['yR'] . ";";
				$string .= $data['xN'] . ";";
				$string .= $data['yN'] . ";";
				$string .= $data['timeStampR'] . ";";
				$string .= $data['timeStampN'];
				$string .= "\n";
		
			}	

		}
		else if ($datagrafico["exerciseType"] == "3")
		{ 
			$string .= "userID" . ";" . "sessionID" . ";" . "repetitionID" . ";" . "screenWidth" . ";" . "screenHeight" . ";" . "x1" . ";" . "y1" . ";" . "x2" . ";" . "y2" . ";" . "x3" . ";" . "y3" . ";" . "x4" . ";" . "y4" . ";" . "edge" . ";" . "margin" . ";" .	"accuracy" . ";" . "distanceTot" . ";" . "time" . ";" . "centralPerimeter" . "\n";
			
			foreach ($resultHeader as $data) {
				
				$string .= $data['userID'] . ";";
				$string .= $data['sessionID'] . ";";
				$string .= $data['repetitionID'] . ";";				
				$string .= $data['screenWidth'] . ";";
				$string .= $data['screenHeight'] . ";";
				$string .= $data['x1'] . ";";
				$string .= $data['y1'] . ";";
				$string .= $data['x2'] . ";";
				$string .= $data['y2'] . ";";
				$string .= $data['x3'] . ";";
				$string .= $data['y3'] . ";";
				$string .= $data['x4'] . ";";
				$string .= $data['y4'] . ";";				
				$string .= $data['edge'] . ";";
				$string .= $data['margin'] . ";";
				$string .= $data['accuracy'] . ";";
				$string .= $data['distanceTot'] . ";";
				$string .= $data['time'] . ";";
				$string .= $data['centralPerimeter'];
				$string .= "\n";
		
			}
			
			$string .= "\n";
			
			$string .= "sessionID" . ";" . "repetitionID" . ";" . "xR" . ";" . "yR" . ";" . "xN" . ";" . "yN" . ";" . "timeStampR" . ";" . "timeStampN" . "\n";

			foreach ($resultRow as $data) {
				
				$string .= $data['sessionID'] . ";";
				$string .= $data['repetitionID'] . ";";				
				$string .= $data['xR'] . ";";
				$string .= $data['yR'] . ";";
				$string .= $data['xN'] . ";";
				$string .= $data['yN'] . ";";
				$string .= $data['timeStampR'] . ";";
				$string .= $data['timeStampN'];
				$string .= "\n";
		
			}	

		}
		else if ($datagrafico["exerciseType"] == "4")
		{

			$string .= "userID" . ";" . "sessionID" . ";" . "repetitionID" . ";" . "screenWidth" . ";" . "screenHeight" . ";" . "width" . ";" . "height" . ";" .
					"x1" . ";" . "y1" . ";" . "x2" . ";" . "y2" . ";" . "x3" . ";" . "y3" . ";" . "x4" . ";" . "y4" . ";" . "x5" . ";" . "y5" . ";" . "margin" . ";" . "adjustedAccuracy" . ";" . "time" . ";" . "totalLength" . ";" . "adjustedSpeed" . ";" . "distanceTot" . "\n";

			foreach ($resultHeader as $data) {
				
				$string .= $data['userID'] . ";";
				$string .= $data['sessionID'] . ";";
				$string .= $data['repetitionID'] . ";";				
				$string .= $data['screenWidth'] . ";";
				$string .= $data['screenHeight'] . ";";
				$string .= $data['width'] . ";";
				$string .= $data['height'] . ";";				
				$string .= $data['x1'] . ";";
				$string .= $data['y1'] . ";";
				$string .= $data['x2'] . ";";
				$string .= $data['y2'] . ";";
				$string .= $data['x3'] . ";";
				$string .= $data['y3'] . ";";
				$string .= $data['x4'] . ";";
				$string .= $data['y4'] . ";";				
				$string .= $data['x5'] . ";";
				$string .= $data['y5'] . ";";	
				$string .= $data['margin'] . ";";
				$string .= $data['adjustedAccuracy'] . ";";
				$string .= $data['time'] . ";";
				$string .= $data['totalLength'] . ";";
				$string .= $data['adjustedSpeed'] . ";";
				$string .= $data['distanceTot'];
				$string .= "\n";
		
			}
			
			$string .= "\n";
			
			$string .= "sessionID" . ";" . "repetitionID" . ";" . "xR" . ";" . "yR" . ";" . "xN" . ";" . "yN" . ";" . "timeStampR" . ";" . "timeStampN" . "\n";

			foreach ($resultRow as $data) {
				
				$string .= $data['sessionID'] . ";";
				$string .= $data['repetitionID'] . ";";				
				$string .= $data['xR'] . ";";
				$string .= $data['yR'] . ";";
				$string .= $data['xN'] . ";";
				$string .= $data['yN'] . ";";
				$string .= $data['timeStampR'] . ";";
				$string .= $data['timeStampN'];
				$string .= "\n";
		
			}						
		}
		else if ($datagrafico["exerciseType"] == "5")
		{			  
			$string .= "userID" . ";" . "sessionID" . ";" . "repetitionID" . ";" . "screenWidth" . ";" . "screenHeight" . ";" . "x1" . ";" . "y1" . ";" . "x2" . ";" . "y2" . ";" . "margin" . ";" . "meanReactionTime" . ";" . "accuracy" . ";" . "totTaps" . "\n";
			
			foreach ($resultHeader as $data) {
				
				$string .= $data['userID'] . ";";
				$string .= $data['sessionID'] . ";";
				$string .= $data['repetitionID'] . ";";				
				$string .= $data['screenWidth'] . ";";
				$string .= $data['screenHeight'] . ";";			
				$string .= $data['x1'] . ";";
				$string .= $data['y1'] . ";";
				$string .= $data['x2'] . ";";
				$string .= $data['y2'] . ";";
				$string .= $data['margin'] . ";";
				$string .= $data['meanReactionTime'] . ";";
				$string .= $data['accuracy'] . ";";
				$string .= $data['totTaps'];
				$string .= "\n";
		
			}
			
			$string .= "\n";
			
			$string .= "sessionID" . ";" . "repetitionID" . ";" . "xR" . ";" . "yR" . ";" . "xN" . ";" . "yN" . ";" . "circle_active" . ";" . "touched_timeStampN" . "\n";

			foreach ($resultRow as $data) {
				
				$string .= $data['sessionID'] . ";";
				$string .= $data['repetitionID'] . ";";				
				$string .= $data['xR'] . ";";
				$string .= $data['yR'] . ";";
				$string .= $data['xN'] . ";";
				$string .= $data['yN'] . ";";
				$string .= $data['circle_active'] . ";";
				$string .= $data['touched_timeStampN'];				
				$string .= "\n";
			}				
		}
		else if	($datagrafico["exerciseType"] == "6")
		{
			$string .= "userID" . ";" . "sessionID" . ";" . "repetitionID" . ";" . "screenWidth" . ";" . "screenHeight" . ";" .	"x1" . ";" . "y1" . ";" . "x2" . ";" . "y2" . ";" . "x3" . ";" . "y3" . ";" . "x4" . ";" . "y4" . ";" . "margin" . ";" . "meanReactionTime" . ";" . "accuracy" . ";" . "totTaps" . "\n";
			
			foreach ($resultHeader as $data) {
				
				$string .= $data['userID'] . ";";
				$string .= $data['sessionID'] . ";";
				$string .= $data['repetitionID'] . ";";				
				$string .= $data['screenWidth'] . ";";
				$string .= $data['screenHeight'] . ";";			
				$string .= $data['x1'] . ";";
				$string .= $data['y1'] . ";";
				$string .= $data['x2'] . ";";
				$string .= $data['y2'] . ";";
				$string .= $data['x3'] . ";";
				$string .= $data['y3'] . ";";
				$string .= $data['x4'] . ";";
				$string .= $data['y4'] . ";";	
				$string .= $data['margin'] . ";";
				$string .= $data['meanReactionTime'] . ";";
				$string .= $data['accuracy'] . ";";
				$string .= $data['totTaps'];
				$string .= "\n";
		
			}
			
			$string .= "\n";
			
			$string .= "sessionID" . ";" . "repetitionID" . ";" . "xR" . ";" . "yR" . ";" . "xN" . ";" . "yN" . ";" . "circle_active" . ";" . "touched_timeStampN" . "\n";

			foreach ($resultRow as $data) {
				
				$string .= $data['sessionID'] . ";";
				$string .= $data['repetitionID'] . ";";				
				$string .= $data['xR'] . ";";
				$string .= $data['yR'] . ";";
				$string .= $data['xN'] . ";";
				$string .= $data['yN'] . ";";
				$string .= $data['circle_active'] . ";";
				$string .= $data['touched_timeStampN'];				
				$string .= "\n";
			}			
		}

	
	$gzdata = gzencode($string);
	
    // Scrivo i dati della sessione
    fwrite($file, $gzdata);

    fclose($file);	
}