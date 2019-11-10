<?php
require_once("dbMotorbrainInfo.php");
require_once("utility.php");

// Costante con il nome della tabella
define("MEDICO_DATA", "medicodata");

define("DB_ADMIN", "mbAdmin");

// Funzione per creare la tabella dove saranno
// salvati i dati relativi ai medici
function createMedicodataTable() {

    $result = false;
    $pdo = null;

    try {

        // Creo la connessione
        $pdo = createDbConnection(DB_ADMIN);

        // SQL per creare la tabella
        $sql = "CREATE TABLE IF NOT EXISTS " . MEDICO_DATA . " (
						ID int(11) NOT NULL AUTO_INCREMENT,
						medicoID varchar(255) COLLATE utf8_bin DEFAULT NULL,
						nome varchar(255) COLLATE utf8_bin DEFAULT NULL,
						cognome varchar(255) COLLATE utf8_bin DEFAULT NULL,
						email varchar(255) COLLATE utf8_bin DEFAULT NULL,
						password varchar(255) COLLATE utf8_bin DEFAULT NULL,
						dataInserimento datetime DEFAULT NULL,
						attivo varchar(255) DEFAULT NULL,
                        activeDatabases varchar(255) DEFAULT NULL,
                        lastLanguage varchar(2),
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

// Funzione che controlla se esiste la tabella MEDICO_DATA
function checkExistMedicodataTable() {
    $result = false;
    $pdo = null;

    try {

        // Creo la connessione
        $pdo = createDbConnection(DB_ADMIN);

        $results = $pdo->query("SHOW TABLES LIKE '" . MEDICO_DATA . "'");
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

// Inserisco un nuovo medico
function insertMedico($nomeMedico, $cognomeMedico, $emailMedico, $pwdMedico) {

    $result = false;
    $pdo = null;

    try {

        // Creo la connessione
        $pdo = createDbConnection(DB_ADMIN);

        // Query
        $stmt = $pdo->prepare("INSERT INTO " . MEDICO_DATA . " (
												   medicoID, nome, cognome, email,
													 password, dataInserimento, attivo, activeDatabases, lastLanguage)
													 VALUES (:medicoID, :nome, :cognome, :email,
													 :password, :dataInserimento, :attivo, NULL, 'EN')");

        // Sostituzione dei parametri
        $stmt->bindValue(':medicoID', GetGUID());
        $stmt->bindValue(':nome', $nomeMedico);
        $stmt->bindValue(':cognome', $cognomeMedico);
        $stmt->bindValue(':email', $emailMedico);
        $stmt->bindValue(':password', $pwdMedico);
        $stmt->bindValue(':dataInserimento', date('Y-m-d H:i:s'));
        $stmt->bindValue(':attivo', false, PDO::PARAM_BOOL );

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

// Recupero un medico attivo data la mail e la password
function getMedicoAttivo($emailMedico, $pwdMedico) {

    $medico = null;
    $pdo = null;

    try {

        // Creo la connessione
        $pdo = createDbConnection(DB_ADMIN);

        // Query
        $stmt = $pdo->prepare("SELECT medicoID, nome, cognome, email,
													 password, dataInserimento, attivo, activeDatabases, lastLanguage
									 				 FROM " . MEDICO_DATA . 
                              " WHERE email = :email
														AND password = :pwdMedico
														AND attivo = :attivo");

        // Sostituzione dei parametri
        $stmt->bindValue(':email', $emailMedico);
        $stmt->bindValue(':pwdMedico', $pwdMedico);
        $stmt->bindValue(':attivo', true, PDO::PARAM_BOOL);

        // Esecuzione
        $stmt->execute();

        // Recupero i risultati
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($result as $m) {
            $medico = $m;
        }

    } catch(PDOException $e) {
        echo $e->getMessage();
    }
    finally
    {
        // Chiudo la connessione con il database
        $pdo = null;
    }

    return  $medico;
}

// Recupero un medico attivo data la mail
function getMedicoAttivoByEmail($emailMedico) {

    $medico = null;
    $pdo = null;

    try {

        // Creo la connessione
        $pdo = createDbConnection(DB_ADMIN);

        // Query
        $stmt = $pdo->prepare("SELECT medicoID, nome, cognome, email, 
													 password, dataInserimento, attivo, activeDatabases, lastLanguage
									 				 FROM " . MEDICO_DATA .
                              " WHERE email = :email  
														AND attivo = :attivo");

        // Sostituzione dei parametri
        $stmt->bindValue(':email', $emailMedico);
        $stmt->bindValue(':attivo', true, PDO::PARAM_BOOL);

        // Esecuzione
        $stmt->execute();

        // Recupero i risultati
        $result = $stmt->fetchAll(PDO::FETCH_BOTH);

        foreach ($result as $m) {
            $medico = $m;
        }

    } catch(PDOException $e) {
        echo $e->getMessage();
    }
    finally
    {
        // Chiudo la connessione con il database
        $pdo = null;
    }

    return  $medico;
}

// Recupero un medico data la mail
function getMedicoByEmail($emailMedico) {

    $medico = null;
    $pdo = null;

    try {

        // Creo la connessione
        $pdo = createDbConnection(DB_ADMIN);

        // Query
        $stmt = $pdo->prepare("SELECT medicoID, nome, cognome, email,
													 password, dataInserimento, attivo, activeDatabases, lastLanguage
									 				 FROM " . MEDICO_DATA .
                              " WHERE email = :email");

        // Sostituzione dei parametri
        $stmt->bindValue(':email', $emailMedico);

        // Esecuzione
        $stmt->execute();

        // Recupero i risultati
        $result = $stmt->fetchAll(PDO::FETCH_BOTH);

        foreach ($result as $m) {
            $medico = $m;
        }

    } catch(PDOException $e) {
        echo $e->getMessage();
    }
    finally
    {
        // Chiudo la connessione con il database
        $pdo = null;
    }

    return  $medico;
}

// Recupero un medico attivo data il medicoID
function getMedicoAttivoByMedicoID($medicoID) {

    $medico = null;
    $pdo = null;

    try {

        // Creo la connessione
        $pdo = createDbConnection(DB_ADMIN);

        // Query
        $stmt = $pdo->prepare("SELECT medicoID, nome, cognome, email,
													 password, dataInserimento, attivo, activeDatabases. lastLanguage
									 				 FROM " . MEDICO_DATA .
                              " WHERE medicoID = :medicoID AND attivo = :attivo");

        // Sostituzione dei parametri
        $stmt->bindValue(':medicoID', $medicoID);
        $stmt->bindValue(':attivo', true, PDO::PARAM_BOOL);

        // Esecuzione
        $stmt->execute();

        // Recupero i risultati
        $result = $stmt->fetchAll(PDO::FETCH_BOTH);

        foreach ($result as $m) {
            $medico = $m;
        }

    } catch(PDOException $e) {
        echo $e->getMessage();
    }
    finally
    {
        // Chiudo la connessione con il database
        $pdo = null;
    }

    return  $medico;
}

// Recupero tutti i medici
function getMedici() {
    $result = null;
    $pdo = null;
    try {
        // Creo la connessione
        $pdo = createDbConnection(DB_ADMIN);

        // Query
        $stmt = $pdo->prepare("SELECT medicoID, nome, cognome, email,
													 password, dataInserimento, attivo, activeDatabases, lastLanguage
									 				 FROM " . MEDICO_DATA .
                              " ORDER BY Cognome, Nome");

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

// Aggiorno lo stato del medico
function updateStatoByMedicoId($medicoID, $stato) {

    $result = false;
    $pdo = null;

    try {

        // Creo la connessione
        $pdo = createDbConnection(DB_ADMIN);

        // Query
        $stmt = $pdo->prepare("UPDATE " . MEDICO_DATA . " 
													SET attivo = :attivo
													WHERE medicoID = :medicoID");

        // Sostituzione dei parametri
        $stmt->bindValue(':attivo', $stato, PDO::PARAM_BOOL );
        $stmt->bindValue(':medicoID', $medicoID);

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

// Aggiorno i database utilizzabili del medico
function updateDatabasesByMedicoId($medicoID, $databases) {

    $result = false;
    $pdo = null;

    try {

        // Creo la connessione
        $pdo = createDbConnection(DB_ADMIN);

        // Query
        $stmt = $pdo->prepare("UPDATE " . MEDICO_DATA . " 
													SET activeDatabases = :databases
													WHERE medicoID = :medicoID");

        // Sostituzione dei parametri
        $stmt->bindValue(':databases', $databases);
        $stmt->bindValue(':medicoID', $medicoID);

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

// Aggiorno la lingua utilizzata del medico
function updateLanguageByMedicoId($medicoID, $language) {

    $result = false;
    $pdo = null;

    try {

        // Creo la connessione
        $pdo = createDbConnection(DB_ADMIN);

        // Query
        $stmt = $pdo->prepare("UPDATE " . MEDICO_DATA . " 
													SET lastLanguage = :language
													WHERE medicoID = :medicoID");

        // Sostituzione dei parametri
        $stmt->bindValue(':language', $language);
        $stmt->bindValue(':medicoID', $medicoID);

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

// Elimino un medico dato l'id
function deleteMedicoByMedicoId($medicoID) {

    $result = false;
    $pdo = null;

    try {

        // Creo la connessione
        $pdo = createDbConnection(DB_ADMIN);

        // Query
        $stmt = $pdo->prepare("DELETE FROM " . MEDICO_DATA . "
													WHERE medicoID = :medicoID");

        // Sostituzione dei parametri
        $stmt->bindValue(':medicoID', $medicoID);

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