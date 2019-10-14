<?php
require_once(dirname(__FILE__) . "/../dbMotorbrainMedico.php");
require_once(dirname(__FILE__) . "/../dbMotorbrainMaschera.php");
require_once(dirname(__FILE__) . "/../dbMotorbrainGrafico.php");

if (isset($_POST["crea_tabella"]))	// Tabella da creare
{
	//Filtro i valori del POST HTTP rimuovendo caratteri non accettati
	$tabella = filter_var($_POST["crea_tabella"], FILTER_SANITIZE_STRING);
	
	$esito = false;
	if ($tabella == "medicodata") {
		$esito = createMedicodataTable();
	}
	else if ($tabella == "mascheradata") {
		$esito = createMascheradataTable();
	}
	else if ($tabella == "graficodata") {
        $esito = createGraficodataTable();
	}
	
	if ($esito == false)
	{
		header("Errore nella creazione della tabella.");
		exit();
	}
}

?>