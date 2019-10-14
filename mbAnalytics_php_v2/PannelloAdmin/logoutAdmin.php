<?php
	session_start();
	
	// Rimuovo tutte le variabili della sessione
	session_unset();
	
	if (session_destroy()) // Distruggo tutte le sessioni
	{
		// Reindirizzamento alla pagina di Login del Pannello di Controllo
		header("location: index.php");
	}
?>