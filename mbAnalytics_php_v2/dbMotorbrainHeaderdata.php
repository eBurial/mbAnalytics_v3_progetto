<?php

function getDataFromHeader($database, $exerciseType, $sessionID, $userID) {

	$results = null;
	$pdo = null;

	try {

		// Creo la connessione
		$pdo = createDbConnection($database);

		// Recupero la tabella in base all'esercizio
		$tableName = 'headerdata_' . $exerciseType;

		// Seleziono solo alcune colonne per migliorare la query
		$keyValues = array();
		if ($exerciseType == "1")
		{
			$keyValues = array("screenWidth", "screenHeight", 
												"circleCenterX", "circleCenterY",	"radiusCenter", "margin",
												"accuracy", "distanceTot", "time", "centerCircle");
		}
		else if ($exerciseType == "2")
		{
			$keyValues = array("screenWidth", "screenHeight", 
					"circleCenterX", "circleCenterY", "radiusCenter", "margin",
					"accuracy", "distanceCorrect", "totalSpeed", "turnsInside", "centerCircle");

		}
		else if ($exerciseType == "3")
		{ 
			$keyValues = array("screenWidth", "screenHeight",
					"x1", "y1", "x2", "y2", "x3", "y3", "x4", "y4",	"edge", "margin",
					"accuracy", "distanceTot", "time", "centralPerimeter ");
		}
		else if ($exerciseType == "4")
		{

			$keyValues = array("screenWidth", "screenHeight", "width", "height",
					"x1", "y1", "x2", "y2", "x3", "y3", "x4", "y4", "x5", "y5",	"margin",
					"adjustedAccuracy", "time", "totalLength", "adjustedSpeed", "distanceTot");
		}
		else if ($exerciseType == "5")
		{			  
			$keyValues = array("screenWidth", "screenHeight", 
					"x1", "y1", "x2", "y2", "margin",
					"meanReactionTime", "accuracy", "totTaps");
		}
		else if	($exerciseType == "6")
		{
			$keyValues = array("screenWidth", "screenHeight", 
					"x1", "y1", "x2", "y2", "x3", "y3", "x4", "y4", "margin",
					"meanReactionTime", "accuracy", "totTaps");
		}
			
		// Creo la SELECT per ogni chiave
		$selectSql = "SELECT userID, sessionID, repetitionID ";
		foreach ($keyValues as $keyValue)  {
			$selectSql = $selectSql . ", " .
									 "MAX(IF(KeyValue = '" . $keyValue ."', Value, NULL)) AS " . $keyValue;			
		}
		
		// Query
		$stmt = $pdo->prepare($selectSql . 
													" FROM " . $tableName .
		 											" WHERE userID = :userID AND sessionID = :sessionID" .
													" GROUP BY userID, sessionID, repetitionID" .
													" ORDER BY sessionID, repetitionID");

		// Sostituzione dei parametri
		$stmt->bindValue(':userID', $userID);
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

function getDataFromHeaderForExport($database, $exerciseType, $ageRanges, $dominantHand, $sessionHand, $gender) {

	$results = null;
	$pdo = null;

	try {

		// Creo la connessione
		$pdo = createDbConnection($database);

		// Recupero la tabella in base all'esercizio
		$tableName = 'headerdata_' . $exerciseType;
		$tableName2 = 'averageheaderdata_' . $exerciseType;
		$tableName3 = 'userdata';

		// Seleziono solo alcune colonne per migliorare la query
		$keyValues = array();
		if ($exerciseType == "1")
		{
			$keyValues = array("screenWidth", "screenHeight", 
												"circleCenterX", "circleCenterY",	"radiusCenter", "margin",
												"accuracy", "distanceTot", "time", "centerCircle");
		}
		else if ($exerciseType == "2")
		{
			$keyValues = array("screenWidth", "screenHeight", 
					"circleCenterX", "circleCenterY", "radiusCenter", "margin",
					"accuracy", "distanceCorrect", "totalSpeed", "turnsInside", "centerCircle");

		}
		else if ($exerciseType == "3")
		{ 
			$keyValues = array("screenWidth", "screenHeight",
					"x1", "y1", "x2", "y2", "x3", "y3", "x4", "y4",	"edge", "margin",
					"accuracy", "distanceTot", "time", "centralPerimeter ");
		}
		else if ($exerciseType == "4")
		{

			$keyValues = array("screenWidth", "screenHeight", "width", "height",
					"x1", "y1", "x2", "y2", "x3", "y3", "x4", "y4", "x5", "y5",	"margin",
					"adjustedAccuracy", "time", "totalLength", "adjustedSpeed", "distanceTot");
		}
		else if ($exerciseType == "5")
		{			  
			$keyValues = array("screenWidth", "screenHeight", 
					"x1", "y1", "x2", "y2", "margin",
					"meanReactionTime", "accuracy", "totTaps");
		}
		else if	($exerciseType == "6")
		{
			$keyValues = array("screenWidth", "screenHeight", 
					"x1", "y1", "x2", "y2", "x3", "y3", "x4", "y4", "margin",
					"meanReactionTime", "accuracy", "totTaps");
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
		$selectSql = "SELECT userID, sessionID, repetitionID";
		// string defining output columns for each KeyValue in headerdata_ tables
		foreach ($keyValues as $keyValue)  {
			$selectSql = $selectSql . ", " .
									 "MAX(IF(KeyValue = '" . $keyValue ."', Value, NULL)) AS " . $keyValue;			
		}
		
		$selectSql .= " FROM " . $tableName . " WHERE sessionID IN (SELECT sessionID FROM " . $tableName2 . " WHERE" . $sessionHandQuery . " status = 0 AND userID IN (SELECT userID FROM " . $tableName3 . " WHERE" . 
						$genderQuery . $dominantHandQuery . $ageRangesQuery. "))" .
						" GROUP BY userID, sessionID, repetitionID" .
						" ORDER BY sessionID, repetitionID";


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