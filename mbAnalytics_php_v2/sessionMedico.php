<?php
require("dbMotorbrainMedico.php");

session_start();// Avvio la sessione

$emailLogin_controllo = $_SESSION["email"];	//Memorizzo la sessione

//Recupero un utente medico se esiste
$medicoSessione = getMedicoAttivoByEmail($emailLogin_controllo);

if (!isset($medicoSessione))	//Se NON trovo un medico attivo
{
	header("Location: index.php"); // Reindirizzamento alla pagina di Login
}

if (empty($medicoSessione))	//Se il medico è vuoto
{
	//header("Location: index.php"); // Reindirizzamento alla pagina di Login
}
?>