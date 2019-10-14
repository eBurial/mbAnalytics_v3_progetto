<?php
require_once ("dbMotorbrainGrafico.php");
require_once("dbMotorbrainAverageHeader.php");
require_once("dbMotorbrainHeaderdata.php");
require_once("dbMotorbrainRowdata.php");

// Se è definita la variabile chartInfo
if (isset($_POST["chartInfo"]))
{

	// Decodifico il json
    $chartInfo = json_decode($_POST["chartInfo"], true);
	
    // Se è definita la variabile $chartInfo
    if (isset($chartInfo))
    {
        // Recupero i dati richiesti
        $result = getDataFromAverageHeader($chartInfo["database"], $chartInfo["esercizio"], $chartInfo["listaDimVar"]);
		
        // Codifico in formato json
        $jsonData = json_encode($result);

        // Restituisco i dati in formato json
        header('Content-Type: "application/json"');
        header("Content-Length: " . strlen($jsonData));
        echo($jsonData);
    }
}
else if (isset($_POST["graficoID"]))
{
    $graficoID = filter_var($_POST["graficoID"], FILTER_SANITIZE_STRING);

    // Recupero il grafico
    $resultGrafico = getResultByGraficoID($graficoID);

    $grafico = null;
    foreach ($resultGrafico as $g)  {
        $grafico = $g;
    }

    // Se è definita la variabile $chartInfo
    if (isset($grafico))
    {
        // Recupero i dati richiesti
        $result = getDataFromAverageHeaderAge($grafico["databaseID"], $grafico["tipoEsercizio"], json_decode($grafico["listaVariabili"]), $grafico["filtroEtaMin"], $grafico["filtroEtaMax"]);

        // IMPORTANTE: decodificare i dati codificati
        $grafico["listaVariabili"] = json_decode($grafico["listaVariabili"]);
        $grafico["filtroListaValoriIntervalli"] = json_decode($grafico["filtroListaValoriIntervalli"]);

        $resultObj = (object) array('database' => $grafico["databaseID"], 'grafico' => $grafico, 'jsonData' => $result);

        // Codifico in formato json
        $jsonData = json_encode($resultObj);

        // Restituisco i dati in formato json
        header('Content-Type: "application/json"');
        header("Content-Length: " . strlen($jsonData));
        echo($jsonData);
    }
} 
else if (isset($_POST["jsonDetailInfo"]))
{
    // Decodifico il json
    $jsonDetailInfo = json_decode($_POST["jsonDetailInfo"], true);

    // Se è definita la variabile $chartInfo
    if (isset($jsonDetailInfo))
    {
        $resultHeader = getDataFromHeader($jsonDetailInfo["database"],
                                          $jsonDetailInfo["exerciseType"], 
                                          $jsonDetailInfo["sessionID"],
                                          $jsonDetailInfo["userID"]);
        // Recupero i dati richiesti
        $resultRow = getDataFromRow($jsonDetailInfo["database"],
                                    $jsonDetailInfo["exerciseType"], 
                                    $jsonDetailInfo["sessionID"]);

        $resultObj = (object) array('headerData' => $resultHeader, 'rowData' => $resultRow);

        // Codifico in formato json
        $jsonDataDetail = json_encode($resultObj);

        // Restituisco i dati in formato json
        header('Content-Type: "application/json"');
        header("Content-Length: " . strlen($jsonDataDetail));
        echo($jsonDataDetail);
    }
}
else if (isset($_POST["chartAge"]))
{
    // Decodifico il json
    $chartInfo = json_decode($_POST["chartAge"], true);

    // Se e' definita la variabile $chartInfo
    if (isset($chartInfo))
    {
        // Recupero i dati richiesti
        $result = getDataFromAverageHeaderAge($chartInfo["database"], $chartInfo["esercizio"], $chartInfo["listaDimVar"], $chartInfo["min"], $chartInfo["max"]);

        // Codifico in formato json
        $jsonData = json_encode($result);

        // Restituisco i dati in formato json
        header('Content-Type: "application/json"');
        header("Content-Length: " . strlen($jsonData));
        echo($jsonData);

    }
}

?>