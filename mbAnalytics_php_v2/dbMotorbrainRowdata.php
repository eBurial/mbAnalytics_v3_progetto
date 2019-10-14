<?php
require_once("dbMotorbrainInfo.php");

function getDataFromRowForExport($database, $exerciseType, $ageRanges, $dominantHand, $sessionHand, $gender) {

	$results = null;
	$pdo = null;

	try {

		// Creo la connessione
		$pdo = createDbConnection($database);

		// Recupero la tabella in base all'esercizio
		$tableName = 'rowdata_' . $exerciseType;
		$tableName2 = 'averageheaderdata_' . $exerciseType;
		$tableName3 = 'userdata';
		
		// Seleziono solo alcune colonne per migliorare la query
		$columns = "sessionID, repetitionID, xR, yR, xN, yN";
		if (($exerciseType == "1") || ($exerciseType == "3") ||
				($exerciseType == "2") || ($exerciseType == "4")) 
		{
			/* Colonne tabelle rowdata_1, rowdata_2, 
			 * rowdata_3 e rowdata_4:
			 * ID, sessionID
			 * xR, yR, timeStampR, 
			 * xN, yN, timeStampN,
			 * inside, checkMovement
			 */
			$columns = $columns . ", timeStampR, timeStampN";
			$order = "sessionID, repetitionID, timeStampN";
		
		}
		else if (($exerciseType == "5") || ($exerciseType == "6")) 
		{
			/* Colonne tabelle rowdata_5 e rowdata_6:
			 * ID, sessionID,
			 * xR, yR, circle_appearing_timeR, touched_timeStampR,
			 * xN, yN, circle_appearing_timeN, touched_timeStampN
			 * circle_active, reaction_time, 
			 */
			 $columns = $columns . ", circle_active, touched_timeStampN";
			 $order = "sessionID, repetitionID, touched_timeStampN";
			
		}
		
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
		$selectSql = " SELECT " . $columns . 
					 " FROM " . $tableName . 
					 " WHERE sessionID IN (" . 
							" SELECT sessionID " . 
							" FROM " . $tableName2 . 
							" WHERE" . $sessionHandQuery . " status = 0 AND userID IN (" . 
									" SELECT userID " . 
									" FROM " . $tableName3 . 
									" WHERE" . $genderQuery . $dominantHandQuery . $ageRangesQuery . "))" . 
					" ORDER BY " . $order;
						
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

function getDataFromRow($database, $exerciseType, $sessionID) {

	$results = null;
	$pdo = null;

	try {

		// Creo la connessione
		$pdo = createDbConnection($database);

		// Recupero la tabella in base all'esercizio
		$tableName = 'rowdata_' . $exerciseType;
		
		// Seleziono solo alcune colonne per migliorare la query
		$columns = 'sessionID, repetitionID, xR, yR, xN, yN';
		if (($exerciseType == "1") || ($exerciseType == "3") ||
				($exerciseType == "2") || ($exerciseType == "4")) 
		{
			/* Colonne tabelle rowdata_1, rowdata_2, 
			 * rowdata_3 e rowdata_4:
			 * ID, sessionID
			 * xR, yR, timeStampR, 
			 * xN, yN, timeStampN,
			 * inside, checkMovement
			 */
				$columns = $columns . ',timeStampN, timeStampR';
		
		}
		else if (($exerciseType == "5") || ($exerciseType == "6")) 
		{
		/* Colonne tabelle rowdata_5 e rowdata_6:
		 * ID, sessionID,
		 * xR, yR, circle_appearing_timeR, touched_timeStampR,
		 * xN, yN, circle_appearing_timeN, touched_timeStampN
		 * circle_active, reaction_time, 
		 */
		 $columns = $columns . ',circle_active, circle_appearing_timeR, touched_timeStampR';
			
		}
		// Query
		$stmt = $pdo->prepare('SELECT ' . $columns . ' FROM ' . $tableName . '
													 WHERE sessionID = :sessionID');

		// Sostituzione dei parametri
		$stmt->bindValue(':sessionID', $sessionID, PDO::PARAM_STR);
		
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