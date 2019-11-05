<?php
require_once("dbMotorbrainInfo.php");
function getDataFromAverageHeader($database, $exerciseType, $varList) {

    $results = null;
    $pdo = null;

    try {

        // Creo la connessione
        $pdo = createDbConnection($database);

        // Recupero la tabella in base all'esercizio
        $tableName = 'averageheaderdata_' . $exerciseType;

        // Colonne incluse nella tabella indicata da tableName
        $columns = 'ID, userID, sessionID, hand, status';

        switch ($exerciseType) {
            case "1":
                $columns = $columns . ', accuracy, distanceTot, time, deviationIndex';
                break;

            case "2":
                $columns = $columns . ', accuracy, distanceCorrect, totalSpeed, turnsInside, deviationIndex';
                break;

            case "3":
                $columns = $columns . ', accuracy, distanceTot, time, deviationIndex';
                break;

            case "4":
                $columns = $columns . ', adjustedAccuracy, time, adjustedSpeed, distanceTot, deviationIndex';
                break;

            case "5":
                $columns = $columns . ', meanReactionTime, accuracy, totTaps';
                break;

            case "6":
                $columns = $columns . ', meanReactionTime, accuracy, totTaps';
                break;
        }

        // Query
        $stmt = $pdo->prepare('SELECT TBL_USER.age, TBL_USER.gender, TBL_USER.dominantHand, TBL_AVERAGE.*
													FROM 
													(SELECT DISTINCT userID, age, gender, dominantHand 
													 FROM userdata ) AS TBL_USER,
													(SELECT ' . $columns . ' 
													 FROM ' . $tableName . ') AS TBL_AVERAGE
													WHERE TBL_USER.userID = TBL_AVERAGE.userID');

        // Esecuzione
        $stmt->execute();

        // Recupero i risultati
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    } catch(PDOException $e) {
        echo $e->getMessage();
    }
    finally
    {
        // Chiudo la connessione con il database
        $pdo = null;
    }

    return  $results;
}

function getDataFromAverageHeaderAge($database, $exerciseType, $varList, $min, $max) {

    $results = null;
    $pdo = null;

    try {

        // Creo la connessione
        $pdo = createDbConnection($database);

        // Recupero la tabella in base all'esercizio
        $tableName = 'averageheaderdata_' . $exerciseType;

        // Colonne incluse nella tabella indicata da tableName
        $columns = 'ID, userID, sessionID, hand, status';

        switch ($exerciseType) {
            case "1":
                $columns = $columns . ', accuracy, distanceTot, time, deviationIndex';
                break;

            case "2":
                $columns = $columns . ', accuracy, distanceCorrect, totalSpeed, turnsInside, deviationIndex';
                break;

            case "3":
                $columns = $columns . ', accuracy, distanceTot, time, deviationIndex';
                break;

            case "4":
                $columns = $columns . ', adjustedAccuracy, time, adjustedSpeed, distanceTot, deviationIndex';
                break;

            case "5":
                $columns = $columns . ', meanReactionTime, accuracy, totTaps';
                break;

            case "6":
                $columns = $columns . ', meanReactionTime, accuracy, totTaps';
                break;
        }

        // Query
        $stmt = $pdo->prepare('SELECT TBL_USER.age, TBL_USER.gender, TBL_USER.dominantHand, TBL_AVERAGE.*
													FROM 
													(SELECT DISTINCT userID, age, gender, dominantHand 
													 FROM userdata
                                                     WHERE age >= :min AND age <= :max) AS TBL_USER,
													(SELECT ' . $columns . ' 
													 FROM ' . $tableName . ') AS TBL_AVERAGE
													WHERE TBL_USER.userID = TBL_AVERAGE.userID');
        
        // Sostituzione dei parametri
        $stmt->bindValue(':min', $min);
        $stmt->bindValue(':max', $max);

        // Esecuzione
        $stmt->execute();

        // Recupero i risultati
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    } catch(PDOException $e) {
        echo $e->getMessage();
    }
    finally
    {
        // Chiudo la connessione con il database
        $pdo = null;
    }

    return  $results;
}

// Aggiorno lo status del record
// 0: incluso
// 1: escluso
function setStatusInAverageHeader($database, $exerciseType, $sessionID, $newStatus) {

    $results = null;
    $pdo = null;

    try {

        // Creo la connessione
        $pdo = createDbConnection($database);

        // Recupero la tabella in base all'esercizio
        $tableName = 'averageheaderdata_' . $exerciseType;

        // Query
        $stmt = $pdo->prepare("UPDATE " . $tableName . "
													SET status = :status
													WHERE sessionID = :sessionID");

        // Sostituzione dei parametri
        $stmt->bindValue(':status', $newStatus);
        $stmt->bindValue(':sessionID', $sessionID);

        // Esecuzione
        $result = $stmt->execute();

    } catch(PDOException $e) {
        echo $e->getMessage();
    }
    finally
    {
        // Chiudo la connessione con il database
        $pdo = null;
    }

    return  $result;
}

?>