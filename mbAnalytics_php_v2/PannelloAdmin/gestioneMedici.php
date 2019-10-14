<?php
require_once(dirname(__FILE__) . "/../dbMotorbrainMedico.php");

if (isset($_POST["abilita_medico"]))	// Medico da abilitare
{
	//Filtro i valori del POST HTTP rimuovendo caratteri non accettati
	$medicoId = filter_var($_POST["abilita_medico"], FILTER_SANITIZE_STRING);
	
	$esito = updateStatoByMedicoId($medicoId, true);
	
	if ($esito == false)
	{
		header("Errore nell'abilitazione del medico.");
		exit();
	}
}
else if (isset($_POST["databases"]))	// Medico da abilitare
{
	//Filtro i valori del POST HTTP rimuovendo caratteri non accettati
	$medicoId = filter_var($_POST["id_medico"], FILTER_SANITIZE_STRING);
	
	//Filtro i valori del POST HTTP rimuovendo caratteri non accettati
	$databases = filter_var($_POST["databases"], FILTER_SANITIZE_STRING);
	
	$esito = updateDatabasesByMedicoId($medicoId, $databases);
	
	if ($esito == false)
	{
		header("Errore nell'abilitazione del medico.");
		exit();
	}
}
else if (isset($_POST["disabilita_medico"]))	// Medico da disabilitare
{
	//Filtro i valori del POST HTTP rimuovendo caratteri non accettati
	$medicoId = filter_var($_POST["disabilita_medico"], FILTER_SANITIZE_STRING);
	
	$esito = updateStatoByMedicoId($medicoId, false);
	
	if ($esito == false)
	{
		header("Errore nella disabilitazione del medico.");
		exit();
	}
}
else if (isset($_POST["elimina_medico"]))	// Medico da eliminare
{
	//Filtro i valori del POST HTTP rimuovendo caratteri non accettati
	$medicoId = filter_var($_POST["elimina_medico"], FILTER_SANITIZE_STRING);
	
	$esito = deleteMedicoByMedicoId($medicoId);
	
	if ($esito == false)
	{
		header("Errore nell'eliminazione del medico.");
		exit();
	}
}
?>