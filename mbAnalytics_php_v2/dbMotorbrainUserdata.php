<?php

function getDataFromUser($database, $userID) {

	$results = null;
	$pdo = null;

	try {

		// Creo la connessione
		$pdo = createDbConnection($database);

		// Recupero la tabella
		$tableName = 'userdata';

		// Creo la SELECT per ogni chiave
		$selectSql = "SELECT userID, gender, dominantHand, age";
		// Query
		$stmt = $pdo->prepare($selectSql . 
													" FROM " . $tableName .
		 											" WHERE userID = :userID ");

		// Sostituzione dei parametri
		$stmt->bindValue(':userID', $userID);
 
		// Esecuzione
		$stmt->execute();

		// Recupero i risultati
		$results = $stmt->fetchAll(PDO::FETCH_ASSOC);

	} catch(PDOException $e) {
		echo $e->getMessage();
	}
	finally
	{
		// Chiudo la connessione con il database
		$pdo = null;
	}

	return  $results;
}

function getDataFromUserForExport($database, $exerciseType, $ageRanges, $dominantHand, $sessionHand, $gender) {

	$results = null;
	$pdo = null;

	try {

		// Creo la connessione
		$pdo = createDbConnection($database);

		// Recupero la tabella in base all'esercizio
		$tableName = 'headerdata_' . $exerciseType;
		$tableName2 = 'averageheaderdata_' . $exerciseType;
		$tableName3 = 'userdata';

		// string defining WHERE condition for sessionHand
		if ($sessionHand == "-") {
			$sessionHandQuery = ""; 
		} else {
			$sessionHandQuery = " hand = '" . $sessionHand . "' AND";
		}
		
		// string defining WHERE condition for gender
		if ($gender == "-") {
			$genderQuery = ""; 
		} else {
			$genderQuery = " gender = '" . $gender . "' AND";
		}
		
		// string defining WHERE condition for dominantHand
		if ($dominantHand == "-") {
			$dominantHandQuery = ""; 
		} else {
			$dominantHandQuery = " dominantHand = '" . $dominantHand . "' AND";
		}		
		
		// string defining WHERE condition for ageRanges
		foreach($ageRanges as $min => $max) {
			$ageRangesQuery .= " (age BETWEEN ". $min . " AND " . $max . ") OR";
		}

		// rimuovo l'OR finale 
		// TODO: trovare soluzione migliore
		if (!empty($ageRangesQuery)) {
			$ageRangesQuery = substr($ageRangesQuery, 0, -2);
			$ageRangesQuery = "(" . $ageRangesQuery . ")";
		}
/*		
		// solo per DEBUG
		$ageRangesQuery = " age IS NOT NULL";
*/		
		// Query finale		
		$selectSql = "SELECT userID, gender, dominantHand, age";
		// TODO: semplificare questa query
		$selectSql .= " FROM " . $tableName3 . " WHERE userID IN (SELECT userID FROM " . $tableName2 . " WHERE" . $sessionHandQuery . " status = 0 AND userID IN (SELECT userID FROM " . $tableName3 . " WHERE" . 
						$genderQuery . $dominantHandQuery . $ageRangesQuery. "))";


		// Query
		$stmt = $pdo->prepare($selectSql);

		// Esecuzione
		$stmt->execute();

		// Recupero i risultati
		$results = $stmt->fetchAll(PDO::FETCH_ASSOC);

	} catch(PDOException $e) {
		echo $e->getMessage();
	}
	finally
	{
		// Chiudo la connessione con il database
		$pdo = null;
	}

	return  $results;
}

?>