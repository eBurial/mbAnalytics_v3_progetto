<?php
require_once("configAdmin.php");

session_start(); // Avvio la sessione

// Variabile per memorizzare i messaggi di errore relativi al login
$errAdminLogin = "";

// Se sto facendo un login
if (isset($_POST["esegui-admin-login"]))
{
	$opEseguita = "esegui-login";

	$usernameAdminLogin = filter_var($_POST["username-admin-login"], FILTER_SANITIZE_STRING);
	$pwdAdminLogin = $_POST["pwd-admin-login"];
	if (empty($usernameAdminLogin) || empty($pwdAdminLogin))
	{
		$errAdminLogin = "Controllare le credenziali inserite";
	}
	else
	{
		if (($usernameAdminLogin == USERNAME_ADMIN) && 
				($pwdAdminLogin == PWD_ADMIN)) 
		{
			// Inizializzo la sessione
			$_SESSION["usernameAdmin"] = $usernameAdminLogin;
			//Memorizzo l'orario di inizio della sessione
			$_SESSION["startTimeAdminSession"] = time();
			// Reindirizzamento alla pagina principale
			header("location: pannelloAdmin.php");
		}
		else
		{
			$errAdminLogin = "Controllare le credenziali inserite.";
		
		}

	}
}
?>