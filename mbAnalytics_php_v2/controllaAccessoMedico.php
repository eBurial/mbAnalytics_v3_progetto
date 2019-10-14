<?php
require_once("configurazione.php");
require_once("utility.php");
require("dbMotorbrainMedico.php");


session_start(); // Avvio la sessione

// Variabile per memorizzare l'operazione
$opEseguita = "";

// Variabile per memorizzare i messaggi di errore relativi al login
$errLogin = ""; 

//Variabili per memorizzare i messaggi di errore relativi alla registrazione
$errEmailRegistrazione = "";
$errNomeRegistrazione = "";
$errCognomeRegistrazione = "";
$errPwdRegistrazione = "";
$errConfermaPwdRegistrazione = "";
$esitoRegistrazione = "";

$emailRegistrazione = "";
$nomeRegistrazione = "";
$cognomeRegistrazione = "";

// Se sto facendo un login
if (isset($_POST["esegui-login"])) 
{
    $opEseguita = "esegui-login";

    $emailLogin = filter_var($_POST["email-login"], FILTER_SANITIZE_EMAIL);
    $pwdLogin = $_POST["pwd-login"];
    if (empty($emailLogin) || empty($pwdLogin))
    {
        $errLogin = "Controllare le credenziali inserite";
    }
    else
    {
        // Controllo se la tabella medicodata esiste
        if (checkExistMedicodataTable() == false) {
            // Se non esiste, creo la tabella medicodata
            if (createMedicodataTable() == false) {
                $errLogin = "Errore: la tabella non esiste.";
            }
        }
				
        // Cifro la password
        $pwdLogin = EncryptOrDecrypt(ENCRYPT, $pwdLogin);
        // Recupero un utente attivo se esiste
        $medico = getMedicoAttivo($emailLogin, $pwdLogin);

        //Se trovo un utente attivo
        if (isset($medico))	
        {
            if (!empty($medico)) 
            {
                // Inizializzo la sessione
                $_SESSION["email"] = $medico["email"];
                // inserisco i database utilizzabili
                $_SESSION["databases"] = $medico["activeDatabases"];
                //Memorizzo l'orario di inizio della sessione
                $_SESSION["startTimeSession"] = time();
                // Reindirizzamento alla pagina principale
                header("location: mainpage.php");
            }
            else 
            {
                $errLogin = "Controllare le credenziali inserite.";
            }
        }
        else
        {
            $errLogin = "Controllare le credenziali inserite.";
        }
    }
} 
else if (isset($_POST["esegui-registrazione"]))	// Se sto facendo una iscrizione 
{
    $opEseguita = "esegui-registrazione";

    $emailRegistrazione = filter_var($_POST["email-registrazione"], FILTER_SANITIZE_EMAIL);
    $nomeRegistrazione = filter_var($_POST["nome-registrazione"], FILTER_SANITIZE_STRING);
    $cognomeRegistrazione = filter_var($_POST["cognome-registrazione"], FILTER_SANITIZE_STRING);
    $pwdRegistrazione = filter_var($_POST["pwd-registrazione"], FILTER_SANITIZE_STRING);
    $confermaPwdRegistrazione = filter_var($_POST["conferma-pwd-registrazione"], FILTER_SANITIZE_STRING);

    if (empty($emailRegistrazione)
        || empty($nomeRegistrazione)
        || empty($cognomeRegistrazione)
        || empty($pwdRegistrazione)
        || empty($confermaPwdRegistrazione))
    {
        if (empty($emailRegistrazione))
        {
            $errEmailRegistrazione = "Campo Email non compilato.";
        }

        if (empty($nomeRegistrazione))
        {
            $errNomeRegistrazione = "Campo Nome non compilato.";
        }

        if (empty($cognomeRegistrazione))
        {
            $errCognomeRegistrazione = "Campo Cognome non compilato.";
        }

        if (empty($pwdRegistrazione))
        {
            $errPwdRegistrazione = "Campo Password non compilato.";
        }

        if (empty($confermaPwdRegistrazione))
        {
            $errConfermaPwdRegistrazione = "Campo Conferma Password non compilato.";
        }
    }
    else if (strlen($pwdRegistrazione) < 8)
    {
        $errPwdRegistrazione = "La password deve avere almeno 8 caratteri.";
    }
    else if ($pwdRegistrazione != $confermaPwdRegistrazione)
    {
        $errPwdRegistrazione = "La password inserita &egrave; differente da quella di conferma.";
    }
    else
    {
        //Controllo se la mail inserita è già stata utilizzata
        $medico = getMedicoByEmail($emailRegistrazione);

        if (isset($medico) && !empty($medico))	//Se trovo un utente con la stessa mail restituisco un errore
        {
            $errEmailRegistrazione = "L'indirizzo email inserito &egrave; gi&agrave; stato utilizzato. Inserire un altro indirizzo email.";
        }
        else //Altrimenti inserisco l'utente
        {
            $pwdRegistrazione = EncryptOrDecrypt(ENCRYPT, $pwdRegistrazione);

            // Controllo se la tabella medicodata esiste
            if (checkExistMedicodataTable() == false) {
                // Se non esiste, creo la tabella medicodata
                if (createMedicodataTable() == false) {
                    $esitoRegistrazione = "Errore: la tabella non esiste.";
                }
            }

            $esitoInsert = insertMedico($nomeRegistrazione,
                                        $cognomeRegistrazione,
                                        $emailRegistrazione,
                                        $pwdRegistrazione);
            if ($esitoInsert == true) 
            {
                $esitoRegistrazione = "Inserimento andato a buon fine. L'account verr&agrave; attivato al pi&ugrave; presto.";
            }
            else 
            {
                $esitoRegistrazione = "Errore in fase di registrazione.";
            }

            $emailRegistrazione = "";
            $nomeRegistrazione = "";
            $cognomeRegistrazione = "";
        }
    }
}
?>