<?php
require_once("configurazione.php");

//Funzione per costruire un GUID
function GetGUID()
{
	if (function_exists("com_create_guid"))
	{
		return com_create_guid();
	}
	else
	{
		mt_srand((double)microtime()*10000);
		$charid = strtoupper(md5(uniqid(rand(), true)));
		$hyphen = chr(45);// "-"
		$uuid = //chr(123) . // "{"
			substr($charid, 0, 8) . $hyphen
			.substr($charid, 8, 4) . $hyphen
			.substr($charid,12, 4) . $hyphen
			.substr($charid,16, 4) . $hyphen
			.substr($charid,20,12);
			//.chr(125);// "}"
		return $uuid;
	}
}

//Funzione per la sicurezza
function EncryptOrDecrypt($action, $string)
{
	$output = false;

	if( $action == ENCRYPT)
	{
		$output = openssl_encrypt($string, AES_256_CBC, SECRET_KEY, 1, SECRET_IV);
		$output = base64_encode($output);
	}
	else if( $action == DECRYPT)
	{
		$string = base64_decode($string);
		$output = openssl_decrypt($string, AES_256_CBC, SECRET_KEY, 1, SECRET_IV);
	}

	return $output;
}

?>
