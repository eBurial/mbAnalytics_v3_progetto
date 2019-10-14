<?php
session_start();// Avvio la sessione

// Recupero i dati della sessione
$usernameAdmin = $_SESSION["usernameAdmin"];
$startTimeAdminSession = $_SESSION["startTimeAdminSession"];

//Se NON trovo dati relativi alla sessione
if (!isset($usernameAdmin) ||
		!isset($startTimeAdminSession))	
{
	// Reindirizzamento alla pagina di Login del Pannello di Controllo
	header("location: index.php"); 
}

//Se NON trovo dati relativi alla sessione
if (empty($usernameAdmin) ||
		empty($startTimeAdminSession))	
{
	// Reindirizzamento alla pagina di Login del Pannello di Controllo
	header("location: index.php"); 
}
?>