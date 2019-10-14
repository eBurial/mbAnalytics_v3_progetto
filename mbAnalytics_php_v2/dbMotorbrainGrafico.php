<?php
require_once("dbMotorbrainInfo.php");

// Costante con il nome della tabella
define("GRAFICO_DATA", "graficodata");

define("DB_ADMIN", "mbAdmin");

// Funzione per creare la tabella dove saranno
// salvati i dati relativi ai grafici dei medici
function createGraficodataTable() {

    $result = false;
    $pdo = null;

    try {

        // Creo la connessione
        $pdo = createDbConnection(DB_ADMIN);

        // SQL per creare la tabella
        $sql = "CREATE TABLE IF NOT EXISTS " . GRAFICO_DATA . " (
						ID int(11) NOT NULL AUTO_INCREMENT,
						graficoID varchar(255) COLLATE utf8_bin DEFAULT NULL,
						mascheraID varchar(255) COLLATE utf8_bin DEFAULT NULL,
						medicoID varchar(255) COLLATE utf8_bin DEFAULT NULL,
                        databaseID varchar(255) COLLATE utf8_bin DEFAULT NULL,
						tipoGrafico varchar(255) COLLATE utf8_bin DEFAULT NULL,
						tipoEsercizio varchar(255) COLLATE utf8_bin DEFAULT NULL,
						listaVariabili varchar(255) COLLATE utf8_bin DEFAULT NULL,
						filtroEtaMin int(11) DEFAULT NULL,
						filtroEtaMax int(11) DEFAULT NULL,
						filtroAmpiezzaIntervalloEta int(11) DEFAULT NULL,
						filtroListaValoriIntervalli varchar(255) COLLATE utf8_bin DEFAULT NULL,
						filtroGenere varchar(255) COLLATE utf8_bin DEFAULT NULL,
						filtroManoDominante varchar(255) COLLATE utf8_bin DEFAULT NULL,
						filtroManoSessione varchar(255) COLLATE utf8_bin DEFAULT NULL,
						PRIMARY KEY (ID)
						) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin AUTO_INCREMENT=1 ;";

        $sql = trim($sql);

        // Creo la tabella:
        // false: errore nella creazione
        $result = $pdo->exec($sql);

    } catch(PDOException $e) {
        echo $e->getMessage();
    }
    finally
    {
        // Chiudo la connessione con il database
        $pdo = null;
    }

    return $result;
}

// Funzione che controlla se esiste la tabella GRAFICO_DATA
function checkExistGraficodataTable() {
    $result = false;
    $pdo = null;

    try {

        // Creo la connessione
        $pdo = createDbConnection(DB_ADMIN);

        $results = $pdo->query("SHOW TABLES LIKE '" . GRAFICO_DATA . "'");
        if (count($results->fetchAll()) > 0) {
            $result = true;
        } else {
            $result = false;
        }

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

// Inserisco un nuovo grafico
function insertGrafico($graficoID, $mascheraID, $medicoID, $databaseID,
                       $tipoGrafico, $tipoEsercizio, $listaVariabili, $filtroEtaMin, $filtroEtaMax,
                       $filtroAmpiezzaIntervalloEta, $filtroListaValoriIntervalli, $filtroGenere, 
                       $filtroManoDominante, $filtroManoSessione) {

    $result = false;
    $pdo = null;

    try {

        // Creo la connessione
        $pdo = createDbConnection(DB_ADMIN);

        // Query
        $stmt = $pdo->prepare("INSERT INTO " . GRAFICO_DATA . " (
												   graficoID, mascheraID, medicoID,
													 databaseID, tipoGrafico, tipoEsercizio,
													 listaVariabili,	filtroEtaMin, filtroEtaMax,
													 filtroAmpiezzaIntervalloEta, filtroListaValoriIntervalli,
													 filtroGenere, filtroManoDominante, filtroManoSessione)
													 VALUES
													 (:graficoID, :mascheraID, :medicoID,
													 :databaseID, :tipoGrafico, :tipoEsercizio,
													 :listaVariabili,	:filtroEtaMin, :filtroEtaMax,
													 :filtroAmpiezzaIntervalloEta, :filtroListaValoriIntervalli,
													 :filtroGenere, :filtroManoDominante, :filtroManoSessione)");

        // Sostituzione dei parametri
        $stmt->bindValue(':graficoID', $graficoID);
        $stmt->bindValue(':mascheraID', $mascheraID);
        $stmt->bindValue(':medicoID', $medicoID);
        $stmt->bindValue(':databaseID', $databaseID);
        $stmt->bindValue(':tipoGrafico', $tipoGrafico);
        $stmt->bindValue(':tipoEsercizio', $tipoEsercizio);
        $stmt->bindValue(':listaVariabili', json_encode($listaVariabili));
        $stmt->bindValue(':filtroEtaMin', $filtroEtaMin, PDO::PARAM_INT);
        $stmt->bindValue(':filtroEtaMax', $filtroEtaMax, PDO::PARAM_INT);
        $stmt->bindValue(':filtroAmpiezzaIntervalloEta', $filtroAmpiezzaIntervalloEta,PDO::PARAM_INT);
        $stmt->bindValue(':filtroListaValoriIntervalli', json_encode($filtroListaValoriIntervalli));
        $stmt->bindValue(':filtroGenere', $filtroGenere);
        $stmt->bindValue(':filtroManoDominante', $filtroManoDominante);
        $stmt->bindValue(':filtroManoSessione', $filtroManoSessione);

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

// Recupero i grafici di una maschera
function getGraficiByMascheraID($mascheraID) {

    $result = null;
    $pdo = null;

    try {

        // Creo la connessione
        $pdo = createDbConnection(DB_ADMIN);

        // Query
        $stmt = $pdo->prepare("SELECT graficoID, mascheraID, medicoID,
													 databaseID, tipoGrafico, tipoEsercizio,
													 listaVariabili,	filtroEtaMin, filtroEtaMax,
													 filtroAmpiezzaIntervalloEta, filtroListaValoriIntervalli,
													 filtroGenere, filtroManoDominante
									 				 FROM " . GRAFICO_DATA .
                              " WHERE mascheraID = :mascheraID 
												  ORDER BY TipoEsercizio, TipoGrafico");

        // Sostituzione dei parametri
        $stmt->bindValue(':mascheraID', $mascheraID);

        // Esecuzione
        $stmt->execute();

        // Recupero i risultati
        $result = $stmt->fetchAll(PDO::FETCH_BOTH);

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

// Recupero il grafico dato il valore graficoID
function getResultByGraficoID($graficoID) {

    $result = null;
    $pdo = null;

    try {

        // Creo la connessione
        $pdo = createDbConnection(DB_ADMIN);

        // Query
        $stmt = $pdo->prepare("SELECT graficoID, mascheraID, medicoID,
													 databaseID, tipoGrafico, tipoEsercizio,
													 listaVariabili,	filtroEtaMin, filtroEtaMax,
													 filtroAmpiezzaIntervalloEta, filtroListaValoriIntervalli,
													 filtroGenere, filtroManoDominante, filtroManoSessione
									 				 FROM " . GRAFICO_DATA .
                              " WHERE graficoID = :graficoID");

        // Sostituzione dei parametri
        $stmt->bindValue(':graficoID', $graficoID);

        // Esecuzione
        $stmt->execute();

        // Recupero i risultati
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Chiudo la connessione con il database
        $pdo = null;

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

// Elimino i grafici dato il valore mascheraID
function deleteGraficiByMascheraId($mascheraID) {

    $result = false;
    $pdo = null;

    try {

        // Creo la connessione
        $pdo = createDbConnection(DB_ADMIN);

        // Query
        $stmt = $pdo->prepare("DELETE FROM " . GRAFICO_DATA . " WHERE mascheraID = :mascheraID");

        // Sostituzione dei parametri
        $stmt->bindValue(':mascheraID', $mascheraID);

        // Esecuzione
        $result = $stmt->execute();

        // Chiudo la connessione con il database
        $pdo = null;

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