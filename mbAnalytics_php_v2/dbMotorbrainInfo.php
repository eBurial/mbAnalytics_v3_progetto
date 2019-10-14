<?php

ini_set('error_reporting', E_ALL);
ini_set('max_execution_time', 300); 	//300 seconds = 5 minutes

// Configurazione parametri database
$dbUser = 'user';		// Username
$dbPwd = 'pwd';			// Password

// Funzione per creare la connessione ad database
function createDbConnection($database) {
    
    global $dbUser, $dbPwd;
    $pdo = null;
    $db = 'mysql:host=localhost;dbname=' . $database;		// Database

    try {
        // Creo la connessione
        $pdo = new PDO($db, 
                       $dbUser, 
                       $dbPwd, 
                       array(PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES utf8'));

        $pdo->setAttribute(PDO::MYSQL_ATTR_USE_BUFFERED_QUERY, false);

    } catch(PDOException $e) {
        // Gestisto eventuali errori
        echo $e->getMessage();
    }

    // Restituisco la connessione
    return $pdo;
}

?>
