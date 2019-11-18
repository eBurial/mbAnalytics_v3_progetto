<?php
require_once("dbMotorbrainInfo.php");

// Costante con il nome della tabella
define("MASCHERA_DATA", "mascheradata");

define("DB_ADMIN", "mbAdmin");

// Funzione per creare la tabella dove saranno
// salvati i dati relativi alle maschere che raggruppano più grafici
function createMascheradataTable() {

    $result = false;
    $pdo = null;

    try {

        // Creo la connessione
        $pdo = createDbConnection(DB_ADMIN);

        // SQL per creare la tabella
        $sql = "CREATE TABLE IF NOT EXISTS " . MASCHERA_DATA . " (
						ID int(11) NOT NULL AUTO_INCREMENT,
						mascheraID varchar(255) COLLATE utf8_bin DEFAULT NULL,
						medicoID varchar(255) COLLATE utf8_bin DEFAULT NULL,
						titolo varchar(255) COLLATE utf8_bin DEFAULT NULL,
						descrizione varchar(255) COLLATE utf8_bin DEFAULT NULL,
                        ordine varchar(255) COLLATE utf8_bin DEFAULT NULL,
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

    return  $result;
}

// Funzione che controlla se esiste la tabella GRAFICO_DATA
function checkExistMascheradataTable() {
    $result = false;
    $pdo = null;

    try {

        // Creo la connessione
        $pdo = createDbConnection(DB_ADMIN);

        $results = $pdo->query("SHOW TABLES LIKE '" . MASCHERA_DATA . "'");
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

// Inserisco una nuova maschera
function insertMaschera($mascheraID, $medicoID, $titolo, $descrizione, $ordine) {

    $result = false;
    $pdo = null;

    try {

        // Creo la connessione
        $pdo = createDbConnection(DB_ADMIN);

        // Query
        $stmt = $pdo->prepare("INSERT INTO " . MASCHERA_DATA . " (
												   mascheraID, medicoID, titolo, descrizione, ordine)
													 VALUES
													 (:mascheraID, :medicoID, :titolo, :descrizione, :ordine)");

        // Sostituzione dei parametri
        $stmt->bindValue(':mascheraID', $mascheraID);
        $stmt->bindValue(':medicoID', $medicoID);
        $stmt->bindValue(':titolo', $titolo);
        $stmt->bindValue(':descrizione', $descrizione);
        $stmt->bindValue(':ordine', $ordine);

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

// Recupero le maschere salvate dato il medicoID
//------------IMPLEMENTATA ---------------- 
function getMaschereByMedicoID($medicoID) {

    $result = null;
    $pdo = null;

    try {

        // Creo la connessione
        $pdo = createDbConnection(DB_ADMIN);

        // Query
        $stmt = $pdo->prepare("SELECT mascheraID, medicoID, titolo, descrizione, ordine
									 				 FROM " . MASCHERA_DATA .
                              " WHERE medicoID = :medicoID");

        // Sostituzione dei parametri
        $stmt->bindValue(':medicoID', $medicoID);

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

// Recupero la maschera dato il valore mascheraID
function getMascheraByMascheraID($mascheraID) {

    $maschera = null;
    $pdo = null;

    try {

        // Creo la connessione
        $pdo = createDbConnection(DB_ADMIN);

        // Query
        $stmt = $pdo->prepare("SELECT mascheraID, medicoID, titolo, descrizione, ordine
									 				 FROM " . MASCHERA_DATA .
                              " WHERE mascheraID = :mascheraID");

        // Sostituzione dei parametri
        $stmt->bindValue(':mascheraID', $mascheraID);

        // Esecuzione
        $stmt->execute();

        // Recupero i risultati
        $result = $stmt->fetchAll(PDO::FETCH_BOTH);

        foreach ($result as $m) {
            $maschera = $m;
        }

    } catch(PDOException $e) {
        echo $e->getMessage();
    }
    finally
    {
        // Chiudo la connessione con il database
        $pdo = null;
    }

    return  $maschera;
}

// Elimino una maschera dato il valore mascheraID
function i($mascheraID) {

    $result = false;
    $pdo = null;

    try {

        // Creo la connessione
        $pdo = createDbConnection(DB_ADMIN);

        // Query
        $stmt = $pdo->prepare("DELETE FROM " . MASCHERA_DATA . "
													WHERE mascheraID = :mascheraID");

        // Sostituzione dei parametri
        $stmt->bindValue(':mascheraID', $mascheraID);

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
