/<?php
require_once("dbMotorbrainAverageHeader.php");

// Se è definita la variabile chartInfo
if (isset($_POST["updateSessionStatus"]))
{
    // Decodifico il json
    $updateSessionStatus = json_decode($_POST["updateSessionStatus"], true);

    // Se è definita la variabile $chartInfo
    if (isset($updateSessionStatus))
    {
        // Recupero i dati richiesti
        $result = setStatusInAverageHeader($updateSessionStatus["database"],
                                           $updateSessionStatus["esercizio"], 
                                           $updateSessionStatus["sessioneID"],
                                           $updateSessionStatus["nuovoStatus"]);

        echo $result;
    }
}
?>