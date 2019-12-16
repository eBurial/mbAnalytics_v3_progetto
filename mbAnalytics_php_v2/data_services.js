const mysql = require('mysql');
const CONFIG = require('./config_mbStudy.json');
const admin_services = require('./admin_services');
var async = require("async");
var fs = require("fs");
var JSZip = require("jszip");
const zlib = require("zlib");
var path = require('path');
var AdmZip = require('adm-zip');


var express = require("express");
var compression = require("compression");
var app = express();
app.use(compression())

const connection = mysql.createConnection({
    host: CONFIG.host,
    user: CONFIG.user,
    password: CONFIG.password,
    database: CONFIG.database
});
var express = require("express");
var app = express();
app.use(express.static("/public"));


const GRAFICO_DATA = "graficodata";
module.exports = {
    getDataFromAverageHeaderAge: getDataFromAverageHeaderAge,
    getDataFromUserForExport: getDataFromUserForExport,
    getDataFromHeaderForExport: getDataFromHeaderForExport,
    getDataFromRowForExport: getDataFromRowForExport,
    getDataFromUser: this.getDataFromUser,
    getDataFromRow: this.getDataFromRow,
    getDataFromHeader: this.getDataFromHeader

}

module.exports.getDataFromAverageHeader = function(esercizio,callback){
    //Stringa che si andrà a costruire per le colonne
    var columns ='ID, userID, sessionID, hand, status';
    var tableName = 'averageheaderdata_' + esercizio;
    switch(esercizio){
        case "1": columns += ', accuracy, distanceTot, time, deviationIndex';break;
        case "2": columns += ', accuracy, distanceCorrect, totalSpeed, turnsInside, deviationIndex';break;
        case "3": columns += ', accuracy, distanceTot, time, deviationIndex';break;
        case "4": columns += ', adjustedAccuracy, time, adjustedSpeed, distanceTot, deviationIndex';break;
        case "5": columns += ', meanReactionTime, accuracy, totTaps';break;
        case "6": columns += ', meanReactionTime, accuracy, totTaps';break;
        default: console.log("Errore");break;
    }
    var query = "SELECT TBL_USER.age, TBL_USER.gender, TBL_USER.dominantHand, TBL_AVERAGE.* FROM (SELECT DISTINCT userID, age, gender, dominantHand FROM userdata ) AS TBL_USER,(SELECT  "+ columns + " FROM "+ tableName + ") AS TBL_AVERAGE WHERE TBL_USER.userID = TBL_AVERAGE.userID;"
    connection.query(query,function(err,result){
        if(err) callback(err,null);
        else callback(null,JSON.stringify(result));
    })
}


var getDataFromAverageHeaderAge = function(esercizio,min,max,callback){

    // Recupero la tabella in base all'esercizio
    tableName = 'averageheaderdata_' + esercizio;
    // Colonne incluse nella tabella indicata da tableName
    columns = 'ID, userID, sessionID, hand, status';
    switch(esercizio){
        case "1": columns += ', accuracy, distanceTot, time, deviationIndex';break;
        case "2": columns += ', accuracy, distanceCorrect, totalSpeed, turnsInside, deviationIndex';break;
        case "3": columns += ', accuracy, distanceTot, time, deviationIndex';break;
        case "4": columns += ', adjustedAccuracy, time, adjustedSpeed, distanceTot, deviationIndex';break;
        case "5": columns += ', meanReactionTime, accuracy, totTaps';break;
        case "6": columns += ', meanReactionTime, accuracy, totTaps';break;
        default: console.log("Errore");break;
    }
    var query = "SELECT TBL_USER.age, TBL_USER.gender, TBL_USER.dominantHand, TBL_AVERAGE.* FROM (SELECT DISTINCT userID, age, gender, dominantHand FROM userdata WHERE age >= "+min+" AND age <= "+max+") AS TBL_USER, (SELECT "+ columns +" FROM "+ tableName +") AS TBL_AVERAGE WHERE TBL_USER.userID = TBL_AVERAGE.userID"
    connection.query(query,function(err,result){
        if(err) callback(err,null);
        else callback(null,result);
    })
}

module.exports.getDataFromAverageHeaderAgeByGraficoID = function(graficoID,callback){
    var graficoID_trovato;
    var jsonData;
    async.series([
        function queryResultGraficoByID(callback){
            admin_services.getResultByGraficoID(graficoID,function(err,res){
            if(err){
                console.log("errore prima query");
                callback(err,null);
            }else {       
                if(res.length >0 ){
                    graficoID_trovato = res;
                    callback(null,null);
                }
            }
        })},
        function queryGetDataFromAverageHeaderAge(callback){ 
            getDataFromAverageHeaderAge(graficoID_trovato[0].tipoEsercizio,graficoID_trovato[0].filtroEtaMin,graficoID_trovato[0].filtroEtaMax ,function(err,res){
            if(err){
                callback(err,null);
            }else{
                if(res.length>0){
                    
                    
                    graficoID_trovato[0].listaVariabili =  graficoID_trovato[0].listaVariabili.split(",");
                    graficoID_trovato[0].filtroListaValoriIntervalli =  graficoID_trovato[0].filtroListaValoriIntervalli.split(",");
                   

                    var objResult = {
                        database:graficoID_trovato[0].databaseID,
                        grafico:graficoID_trovato[0],
                        jsonData: res
                    };
                    callback(null,JSON.stringify(objResult));

                }
            }
        })
        },
    ],function(err,res){
        if(err){
            console.log("errore qui");
            callback(err,null);
        }else{
            console.log(graficoID_trovato[0].listaVariabili);
            callback(null,res[1]);
        }
    })
}

var getDataFromUserForExport = function(database,exerciseType,ageRanges,dominantHand,sessionHand,gender,callback){
    var tableName = 'headerdata_' + exerciseType; 
    var tableName2 = 'averageheaderdata_' +exerciseType;
    var tableName3 = 'userdata';

    console.log("GETDATA FROMUSER FOR EXPORT");
    console.log("gender HAND QUERY");
    if(sessionHand == "-"){
        sessionHandQuery = "";
    }else{
        sessionHandQuery = " hand = '"+sessionHand+"' AND";
    }
    if(gender == "-"){
        genderQuery = "";
    }else{
        genderQuery = " gender = '"+gender+"' AND";
    }
    if(dominantHand == "-"){
        dominantHandQuery = "";
    }else{
        dominantHandQuery = " dominantHand = '"+dominantHand+"' AND";
    }
    var ageRangesQuery ="";
    ageRanges.forEach(function(data){
        ageRangesQuery += " (age BETWEEN "+ data + " AND "+(data + 9)+") OR";
    })
    if(ageRangesQuery != ""){
        ageRangesQuery = ageRangesQuery.substring(0,ageRangesQuery.length-2);
        ageRangesQuery = "("+ ageRangesQuery + ")";
    }

    //query finale

    var selectSql = "SELECT userID,gender,dominantHand,age";
    selectSql += " FROM "+tableName3+" WHERE userID IN (SELECT userID FROM "+ tableName2 + " WHERE " + sessionHandQuery + " status = 0 AND userID IN (SELECT userID FROM " + tableName3 + " WHERE " + genderQuery + dominantHandQuery + ageRangesQuery +"))";
    connection.query(selectSql,function(err,res){
        if(err) callback(err,null);
        else callback(null,res);
    });
}
var getDataFromHeaderForExport = function(database,exerciseType,ageRanges,dominantHand,sessionHand,gender,callback){
    var tableName = 'headerdata_'+exerciseType;
    var tableName2 = 'averageheaderdata_'+exerciseType;
    var tableName3 = 'userdata';
    //seleziono solo alcune colonne per migliorare la query 
    var keyValues = [];
    switch(exerciseType){
        case "1": keyValues = ["screenWidth", "screenHeight","circleCenterX", "circleCenterY","radiusCenter", "margin","accuracy", "distanceTot", "time", "centerCircle"];break;
        case "2": keyValues = ["screenWidth", "screenHeight","circleCenterX", "circleCenterY", "radiusCenter", "margin","accuracy", "distanceCorrect", "totalSpeed", "turnsInside", "centerCircle"];break;
        case "3": keyValues = ["screenWidth", "screenHeight","x1", "y1", "x2", "y2", "x3", "y3", "x4", "y4",	"edge", "margin","accuracy", "distanceTot", "time", "centralPerimeter "];break;
        case "4": keyValues = ["screenWidth", "screenHeight", "width", "height","x1", "y1", "x2", "y2", "x3", "y3", "x4", "y4", "x5", "y5",	"margin","adjustedAccuracy", "time", "totalLength", "adjustedSpeed", "distanceTot"];break;
        case "5": keyValues = ["screenWidth", "screenHeight", "x1", "y1", "x2", "y2", "margin","meanReactionTime", "accuracy", "totTaps"];break;
        case "6": keyValues = ["screenWidth", "screenHeight", "x1", "y1", "x2", "y2", "x3", "y3", "x4", "y4", "margin","meanReactionTime", "accuracy", "totTaps"];break;
    }
    if(sessionHand = "-"){
        var sessionHandQuery = "";
    }else{
        var sessionHandQuery = " hand = '"+sessionHand+" ' AND ";
    }
    if(gender == "-"){
        var genderQuery = "";
    }else{
        var genderQuery = " gender = '"+gender+"' AND";
    }
    if(dominantHand == "-"){
         var dominantHandQuery = "";
    }else{
        var dominantHandQuery = " dominantHand = '"+dominantHand+"' AND";
    }
    var ageRangesQuery = ""
    ageRanges.forEach(function(data){
        ageRangesQuery += " (age BETWEEN "+ data + " AND "+(data + 9)+") OR";
    })
    if(ageRangesQuery!=""){
        var ageRangesQuery = ageRangesQuery.substring(0,ageRangesQuery.length-2);
        ageRangesQuery = "("+ageRangesQuery+")";
    }
    var selectSql = "SELECT userID, sessionID, repetitionID";
    keyValues.forEach(function(keyValue){
        selectSql = selectSql + ", " + "MAX(IF(KeyValue = '" + keyValue +"', Value, NULL)) AS " + keyValue;
    })
    selectSql += " FROM " + tableName + " WHERE sessionID IN (SELECT sessionID FROM " + tableName2 + " WHERE" + sessionHandQuery + " status = 0 AND userID IN (SELECT userID FROM " + tableName3 + " WHERE" +genderQuery +dominantHandQuery + ageRangesQuery+"))"+" GROUP BY userID, sessionID, repetitionID"+" ORDER BY sessionID, repetitionID";
    connection.query(selectSql,function(err,res){
        if(err){
            callback(err,null);
        }
        else{    
            callback(null,res);
        }
    });
}
var getDataFromHeader = function(database,exerciseType,sessionID,userID,callback){
    var tableName = "headerdata_"+exerciseType;
    var keyValues = [];
    switch(exerciseType){
        case '1': keyValues = ["screenWidth", "screenHeight", "circleCenterX", "circleCenterY",	"radiusCenter", "margin","accuracy", "distanceTot", "time", "centerCircle"];break;
        case '2': keyValues = ["screenWidth", "screenHeight", "circleCenterX", "circleCenterY", "radiusCenter", "margin","accuracy", "distanceCorrect", "totalSpeed", "turnsInside", "centerCircle"];break;
        case '3': keyValues = ["screenWidth", "screenHeight","x1", "y1", "x2", "y2", "x3", "y3", "x4", "y4",	"edge", "margin","accuracy", "distanceTot", "time", "centralPerimeter "];break;
        case '4': keyValues = ["screenWidth", "screenHeight", "width", "height","x1", "y1", "x2", "y2", "x3", "y3", "x4", "y4", "x5", "y5",	"margin","adjustedAccuracy", "time", "totalLength", "adjustedSpeed", "distanceTot"];break;
        case '5': keyValues = ["screenWidth", "screenHeight", "x1", "y1", "x2", "y2", "margin","meanReactionTime", "accuracy", "totTaps"];break;
        case '6': keyValues = ["screenWidth", "screenHeight", "x1", "y1", "x2", "y2", "x3", "y3", "x4", "y4", "margin","meanReactionTime", "accuracy", "totTaps"];break;
        default:break;
    }
    var selectSql = "SELECT userID, sessionID, repetitionID ";
    keyValues.forEach(function(keyValue){
        selectSql = selectSql +  ", " +"MAX(IF(KeyValue = '" + keyValue +"', Value, NULL)) AS " +keyValue;	
    })
    selectSql = selectSql + " FROM " + tableName +" WHERE userID = '"+userID+"' AND sessionID ='" +sessionID+"' GROUP BY userID, sessionID, repetitionID ORDER BY sessionID, repetitionID";
    connection.query(selectSql,function(err,res){
        if(err){
            callback(err,null);
        }
        else{   
            callback(null,res);
        }
    });
}
var getDataFromRow = function(database,exerciseType,sessionID,callback){
    var tableName = "rowData_"+exerciseType;
    var columns = "sessionID, repetitionID, xR, yR, xN, yN";
    if((exerciseType == "1")||(exerciseType =="2")||(exerciseType == "3")||(exerciseType == 4)){
        /* Colonne tabelle rowdata_1, rowdata_2, 
			 * rowdata_3 e rowdata_4:
			 * ID, sessionID
			 * xR, yR, timeStampR, 
			 * xN, yN, timeStampN,
			 * inside, checkMovement
			 */
		    columns = columns + ',timeStampN, timeStampR';
    }else if((exerciseType == "5")||(exerciseType == "6")){
        /* Colonne tabelle rowdata_5 e rowdata_6:
		 * ID, sessionID,
		 * xR, yR, circle_appearing_timeR, touched_timeStampR,
		 * xN, yN, circle_appearing_timeN, touched_timeStampN
		 * circle_active, reaction_time, 
		 */
		 columns = columns + ',circle_active, circle_appearing_timeR, touched_timeStampR';	
    }
    var query = "SELECT " + columns + " FROM " +tableName + " WHERE sessionID = '"+sessionID+"';";
    connection.query(query,function(err,res){
        if(err){
            callback(err,null);
        }
        else{    
            callback(null,res);
        }
    });
}

module.exports.setStatusInAverageHeader = function(database,exerciseType,sessionId,newStatus,callback){
    var tableName = "averageheaderdata_"+exerciseType;
    var query = "UPDATE " + tableName +" SET status = '"+newStatus+"' WHERE sessionID = '"+ sessionId+"';";
    connection.query(query,function(err,res){
        if(err){
            callback(err,null);
        }
        else{ 
            callback(null,res);
        }
    });
}
var getDataFromRowForExport = function(database,exerciseType,ageRanges,dominantHand,sessionHand,gender,callback){
    var tableName = 'rowdata_' +exerciseType;
	var tableName2 = 'averageheaderdata_' +exerciseType;
    var tableName3 = 'userdata';

    var columns = "sessionID, repetitionID, xR, yR, xN, yN";
    if((exerciseType == "1")||(exerciseType == "2")||(exerciseType == "3")||(exerciseType == "4")){
        /* Colonne tabelle rowdata_1, rowdata_2, 
			 * rowdata_3 e rowdata_4:
			 * ID, sessionID
			 * xR, yR, timeStampR, 
			 * xN, yN, timeStampN,
			 * inside, checkMovement
			 */   
        columns = columns + ", timeStampR, timeStampN";
        var order = "sessionID, repetitionID, timeStampN";
    }else if((exerciseType == "5") || (exerciseType == 6)){
        /* Colonne tabelle rowdata_5 e rowdata_6:
			 * ID, sessionID,
			 * xR, yR, circle_appearing_timeR, touched_timeStampR,
			 * xN, yN, circle_appearing_timeN, touched_timeStampN
			 * circle_active, reaction_time, 
			 */
        columns = columns + ", circle_active, touched_timeStampN";
		var order = "sessionID, repetitionID, touched_timeStampN";
    }
    if (sessionHand == "-") {
        var sessionHandQuery = ""; 
    } else {
        var sessionHandQuery = " hand = '" + sessionHand + "' AND";
    }
    if(gender == "-"){
        var genderQuery  = "";
    }else{
        var genderQuery = " gender = '" + gender +"' AND";
    }
    if (dominantHand == "-") {
        var dominantHandQuery = ""; 
    } else {
        var dominantHandQuery = " dominantHand = '" + dominantHand + "' AND";
    }	
    var ageRangesQuery ="";
    ageRanges.forEach(function(data){
        ageRangesQuery += " (age BETWEEN "+ data + " AND "+(data + 9)+") OR";
    })
    if(ageRangesQuery != ""){
        ageRangesQuery = ageRangesQuery.substring(0,ageRangesQuery.length-2);
        ageRangesQuery = "("+ageRangesQuery+")";
    }
    var selectSql = " SELECT " + columns + " FROM " + tableName +" WHERE sessionID IN (SELECT sessionID  FROM " +tableName2 + " WHERE" + sessionHandQuery +" status = 0 AND userID IN (SELECT userID FROM " + tableName3 + " WHERE" + genderQuery + dominantHandQuery + ageRangesQuery +")) ORDER BY " + order;
    connection.query(selectSql,function(err,res){
        if(err) callback(err,null);
        else callback(null,res);
    })
}

var getDataFromUser = function(database,userID,callback){
    var tableName = "userdata";
    var selectSql = "SELECT userID, gender, dominantHand, age";
    var query = selectSql + " FROM "+tableName+" WHERE userID = '"+userID+"';";
    connection.query(query,function(err,res){
        if(err) callback(err,null);
        else callback(null,res);
    })
}
module.exports.exportData = function(datagrafico,callback){

    //decode di datagrafico
    //array_map('unlink', glob("files/*"));

    datagrafico = JSON.parse(datagrafico);
    //ste operazioni vanno fatte prima dell'async 
    
    var url = "./public/files/"+datagrafico.id+".txt";
    /*
    fs.open(url,'w',function(err,file){
        if(err) callback(err,null);
        else console.log("file correttamente aperto");
    }) */
    
    var string = "Database: "+datagrafico.database+"\n"+"Exercise: "+datagrafico.exerciseType+"\n";
    var min = datagrafico.minAge;
    var ranges = Array();
    var inizioRangeEta = min;
    datagrafico.valuesRange.forEach(function(range){
        if(range == 1){
            ranges.push(inizioRangeEta);
        }
        inizioRangeEta += datagrafico.rangeAge;
    })
    string += "Age classes: ";
    ranges.forEach(function(data){
        string += "["+data+","+(data+datagrafico.rangeAge-1)+"], ";
    })
    string += "\n";
    string += "Gender: "+datagrafico.gender+"\n"+"Dominant hand: "+datagrafico.dominantHand+"\n"+"Session hand: "+datagrafico.sessionHand+"\n";
    string += "\n";
    //Recupero i dati della sessione
    var resultUser,resultHeader,resultRow;
    async.series([
        function queryDataFromUserForExport(callback){
            getDataFromUserForExport(datagrafico["database"],datagrafico["exerciseType"],ranges,datagrafico["dominantHand"],datagrafico["sessionHand"],datagrafico["gender"],function(err,res){
                if(err) callback(err,null);
                else{
                    resultUser = res;
                    callback(null,res);
                }
            });
        },
        function queryDataFromHeaderForExport(callback){
            getDataFromHeaderForExport(datagrafico["database"],datagrafico["exerciseType"],ranges,datagrafico["dominantHand"],datagrafico["sessionHand"],datagrafico["gender"],function(err,res){
                if(err) callback(err,null);
                else{
                    resultHeader = res;                  
                    callback(null,res);
                }
            });
        },
        function queryDataFromRowForExport(callback){
            getDataFromRowForExport(datagrafico["database"],datagrafico["exerciseType"],ranges,datagrafico["dominantHand"],datagrafico["sessionHand"],datagrafico["gender"],function(err,res){
                if(err) callback(err,null);
                else{
                    resultRow = res; 
                    callback(null,res);
                }
            })
        }
    ],function(err,res){
        if(err) throw err;
        else{
            string += "userID" + ";" + "gender" + ";" + "dominantHand" + ";" + "age" + "\n";
            resultUser.forEach(function(data){
                string += data['userID'] + ";";
                string += data['gender'] + ";";
                string += data['dominantHand'] + ";";
                string += data['age'];
                string += "\n\n";
            })

            if(datagrafico.exerciseType == "1"){
                string +=  "userID" + ";" + "sessionID" + ";" + "repetitionID" + ";" + "screenWidth" + ";" + "screenHeight" + ";" + "circleCenterX" + ";" + "circleCenterY" + ";" + "radiusCenter" + ";" + "margin" + ";" + "accuracy" + ";" + "distanceTot" + ";" + "time" + ";" + "centerCircle" + "\n";
                resultHeader.forEach(function(data){
                    string += data['userID'] + ";";
                    string += data['sessionID'] + ";";
                    string += data['repetitionID'] + ";";
                    string += data['screenWidth'] + ";";
                    string += data['screenHeight'] + ";";
                    string += data['circleCenterX'] + ";";
                    string += data['circleCenterY'] + ";";
                    string += data['radiusCenter'] + ";";
                    string += data['margin'] + ";";
                    string += data['accuracy'] + ";";
                    string += data['distanceTot'] + ";";
                    string += data['time'] + ";";
                    string += data['centerCircle'];
                    string += "\n";
                })
                string += "\n";
                string += "sessionID" + ";" + "repetitionID" + ";" + "xR" + ";" + "yR" + ";" + "xN" + ";" + "yN" + ";" + "timeStampR" + ";" + "timeStampN" + "\n";
                resultRow.forEach(function(data){
                    string += data['sessionID'] + ";";
                    string += data['repetitionID'] + ";";				
                    string += data['xR'] + ";";
                    string += data['yR'] + ";";
                    string += data['xN'] + ";";
                    string += data['yN'] + ";";
                    string += data['timeStampR'] + ";";
                    string += data['timeStampN'];
                    string += "\n";
                })
            }else if(datagrafico.exerciseType == "2"){
                string += "userID" + ";" + "sessionID" + ";" + "repetitionID" + ";" + "screenWidth" + ";" + "screenHeight" + ";" + "circleCenterX" + ";" + "circleCenterY" + ";" + "radiusCenter" + ";" + "margin" + ";" + "accuracy" + ";" + "distanceCorrect" + ";" + "totalSpeed" + ";" + "turnsInside" + ";" + "centerCircle" + "\n";
                resultHeader.forEach(function(data){
                    string += data['userID'] + ";";
                    string += data['sessionID'] + ";";
                    string += data['repetitionID'] + ";";				
                    string += data['screenWidth'] + ";";
                    string += data['screenHeight'] + ";";
                    string += data['circleCenterX'] + ";";
                    string += data['circleCenterY'] + ";";
                    string += data['radiusCenter'] + ";";
                    string += data['margin'] + ";";
                    string += data['accuracy'] + ";";
                    string += data['distanceCorrect'] + ";";
                    string += data['totalSpeed'] + ";";
                    string += data['turnsInside'] + ";";
                    string += data['centerCircle'];
                    string += "\n";
                })
                string += "\n";
                string += "sessionID" + ";" + "repetitionID" + ";" + "xR" + ";" + "yR" + ";" + "xN" + ";" + "yN" + ";" + "timeStampR" + ";" + "timeStampN" + "\n";
                resultRow.forEach(function(data){
                    string += data['sessionID'] + ";";
                    string += data['repetitionID'] + ";";				
                    string += data['xR'] + ";";
                    string += data['yR'] + ";";
                    string += data['xN'] + ";";
                    string += data['yN'] + ";";
                    string += data['timeStampR'] + ";";
                    string += data['timeStampN'];
                    string += "\n";
                })
            }else if(datagrafico.exerciseType == "3"){
                    string += "userID" + ";" + "sessionID" + ";" + "repetitionID" + ";" + "screenWidth" + ";" + "screenHeight" + ";" + "x1" + ";" + "y1" + ";" + "x2" + ";" + "y2" + ";" + "x3" + ";" + "y3" + ";" + "x4" + ";" + "y4" + ";" + "edge" + ";" + "margin" + ";" +	"accuracy" + ";" + "distanceTot" + ";" + "time" + ";" + "centralPerimeter" + "\n";
                    resultHeader.forEach(function(data){
                        string += data['userID'] + ";";
                        string += data['sessionID'] + ";";
                        string += data['repetitionID'] + ";";				
                        string += data['screenWidth'] + ";";
                        string += data['screenHeight'] + ";";
                        string += data['x1'] + ";";
                        string += data['y1'] + ";";
                        string += data['x2'] + ";";
                        string += data['y2'] + ";";
                        string += data['x3'] + ";";
                        string += data['y3'] + ";";
                        string += data['x4'] + ";";
                        string += data['y4'] + ";";				
                        string += data['edge'] + ";";
                        string += data['margin'] + ";";
                        string += data['accuracy'] + ";";
                        string += data['distanceTot'] + ";";
                        string += data['time'] + ";";
                        string += data['centralPerimeter'];
                        string += "\n";
                })
                string += "\n";
                string += "sessionID" + ";" + "repetitionID" + ";" + "xR" + ";" + "yR" + ";" + "xN" + ";" + "yN" + ";" + "timeStampR" + ";" + "timeStampN" + "\n";
                resultRow.forEach(function(data){
                    string += data['sessionID'] + ";";
                    string += data['repetitionID'] + ";";				
                    string += data['xR'] + ";";
                    string += data['yR'] + ";";
                    string += data['xN'] + ";";
                    string += data['yN'] + ";";
                    string += data['timeStampR'] + ";";
                    string += data['timeStampN'];
                    string += "\n";
                })

            }else if(datagrafico.exerciseType == "4"){
                
                string += "userID" + ";" + "sessionID" + ";" + "repetitionID" + ";" + "screenWidth" + ";" + "screenHeight" + ";" + "width" + ";" + "height" + ";" +"x1" + ";" + "y1" + ";" + "x2" + ";" + "y2" + ";" + "x3" + ";" + "y3" + ";" + "x4" + ";" + "y4" + ";" + "x5" + ";" + "y5" + ";" + "margin" + ";" + "adjustedAccuracy" + ";" + "time" + ";" + "totalLength" + ";" + "adjustedSpeed" + ";" + "distanceTot" + "\n";
                resultHeader.forEach(function(data){
                    string += data['userID'] + ";";
                    string += data['sessionID'] + ";";
                    string += data['repetitionID'] + ";";				
                    string += data['screenWidth'] + ";";
                    string += data['screenHeight'] + ";";
                    string += data['width'] + ";";
                    string += data['height'] + ";";				
                    string += data['x1'] + ";";
                    string += data['y1'] + ";";
                    string += data['x2'] + ";";
                    string += data['y2'] + ";";
                    string += data['x3'] + ";";
                    string += data['y3'] + ";";
                    string += data['x4'] + ";";
                    string += data['y4'] + ";";				
                    string += data['x5'] + ";";
                    string += data['y5'] + ";";	
                    string += data['margin'] + ";";
                    string += data['adjustedAccuracy'] + ";";
                    string += data['time'] + ";";
                    string += data['totalLength'] + ";";
                    string += data['adjustedSpeed'] + ";";
                    string += data['distanceTot'];
                    string += "\n";
                })
                string += "\n";
                string += "sessionID" + ";" + "repetitionID" + ";" + "xR" + ";" + "yR" + ";" + "xN" + ";" + "yN" + ";" + "timeStampR" + ";" + "timeStampN" + "\n";
                resultRow.forEach(function(data){
                    string += data['sessionID'] + ";";
                    string += data['repetitionID'] + ";";				
                    string += data['xR'] + ";";
                    string += data['yR'] + ";";
                    string += data['xN'] + ";";
                    string += data['yN'] + ";";
                    string += data['timeStampR'] + ";";
                    string += data['timeStampN'];
                    string += "\n";
                })  
            }else if(datagrafico.exerciseType == "5"){
                string += "userID" + ";" + "sessionID" + ";" + "repetitionID" + ";" + "screenWidth" + ";" + "screenHeight" + ";" + "x1" + ";" + "y1" + ";" + "x2" + ";" + "y2" + ";" + "margin" + ";" + "meanReactionTime" + ";" + "accuracy" + ";" + "totTaps" + "\n";
                resultHeader.forEach(function(data){
                    string += data['userID'] + ";";
                    string += data['sessionID'] + ";";
                    string += data['repetitionID'] + ";";				
                    string += data['screenWidth'] + ";";
                    string += data['screenHeight'] + ";";			
                    string += data['x1'] + ";";
                    string += data['y1'] + ";";
                    string += data['x2'] + ";";
                    string += data['y2'] + ";";
                    string += data['margin'] + ";";
                    string += data['meanReactionTime'] + ";";
                    string += data['accuracy'] + ";";
                    string += data['totTaps'];
                    string += "\n";
                })
                string += "\n";

                string += "sessionID" + ";" + "repetitionID" + ";" + "xR" + ";" + "yR" + ";" + "xN" + ";" + "yN" + ";" + "circle_active" + ";" + "touched_timeStampN" + "\n";
                resultRow.forEach(function(data){
                    string += data['sessionID'] + ";";
                    string += data['repetitionID'] + ";";				
                    string += data['xR'] + ";";
                    string += data['yR'] + ";";
                    string += data['xN'] + ";";
                    string += data['yN'] + ";";
                    string += data['circle_active'] + ";";
                    string += data['touched_timeStampN'];				
                    string += "\n";
                })
            }else if(datagrafico.exerciseType == "6"){
                string += "userID" + ";" + "sessionID" + ";" + "repetitionID" + ";" + "screenWidth" + ";" + "screenHeight" + ";" +	"x1" + ";" + "y1" + ";" + "x2" + ";" + "y2" + ";" + "x3" + ";" + "y3" + ";" + "x4" + ";" + "y4" + ";" + "margin" + ";" + "meanReactionTime" + ";" + "accuracy" + ";" + "totTaps" + "\n";
                resultHeader.forEach(function(data){
                    string += data['userID'] + ";";
                    string += data['sessionID'] + ";";
                    string += data['repetitionID'] + ";";				
                    string += data['screenWidth'] + ";";
                    string += data['screenHeight'] + ";";			
                    string += data['x1'] + ";";
                    string += data['y1'] + ";";
                    string += data['x2'] + ";";
                    string += data['y2'] + ";";
                    string += data['x3'] + ";";
                    string += data['y3'] + ";";
                    string += data['x4'] + ";";
                    string += data['y4'] + ";";	
                    string += data['margin'] + ";";
                    string += data['meanReactionTime'] + ";";
                    string += data['accuracy'] + ";";
                    string += data['totTaps'];
                    string += "\n";
                })
                string += "\n";
                string += "sessionID" + ";" + "repetitionID" + ";" + "xR" + ";" + "yR" + ";" + "xN" + ";" + "yN" + ";" + "circle_active" + ";" + "touched_timeStampN" + "\n";
                resultRow.forEach(function(data){
                    string += data['sessionID'] + ";";
                    string += data['repetitionID'] + ";";				
                    string += data['xR'] + ";";
                    string += data['yR'] + ";";
                    string += data['xN'] + ";";
                    string += data['yN'] + ";";
                    string += data['circle_active'] + ";";
                    string += data['touched_timeStampN'];				
                    string += "\n";
                })
            }
            //$gzdata = gzencode($string);
            
            var zip = new AdmZip();
            zip.addFile(""+datagrafico.id+".txt", Buffer.alloc(string.length, string));
            zip.writeZip(url+".zip",function(err){
                if(err){
                    callback(err,null);
                }else{
                    console.log("zip creato");
                    callback(null,null);
                }
            });                                                             
            }
            
        }
    )
}

module.exports.exportSession = function(sessionData,callback){

    //decodifco il json della sessione
    var sessioneInfo = JSON.parse(sessionData);
    var url = "./public/files/"+sessioneInfo.sessionID+".txt";
    var resultUser;
    var resultHeader;
    var resultRow;
    var string = "";
    var esercizi = {
        "1" : "Circle-A",
        "2" : "Circle-S",
        "3" : "Square",
        "4" : "Path",
        "5" : "Tapping2",
        "6" : "Tapping4"
    }
    async.series([
        function queryDataFromUser(callback){
            getDataFromUser(sessioneInfo.database,sessioneInfo.userID,function(err,res){
                if(err) callback(err);
                else{
                    resultUser = res;
                    callback(null);
                }
            })
        },
        function queryDataFromHeader(callback){
            getDataFromHeader(sessioneInfo.database,sessioneInfo.exerciseType,sessioneInfo.sessionID,sessioneInfo.userID,function(err,res){
                if(err) callback(err);
                else{
                    resultHeader = res;
                    callback(null);
                }
            })
        },
        function queryDataFromRow(callback){
            getDataFromRow(sessioneInfo.database,sessioneInfo.exerciseType,sessioneInfo.sessionID,function(err,res){
                if(err) callback(err);
                else{
                    resultRow = res;
                    callback(null);
                }
            })
        }
    ],function(err){
        if(err) callback(err);
        else{
            console.log(resultRow);
            string += "Database: " + sessioneInfo.database + "\n" + "Exercise: " + esercizi[sessioneInfo.exerciseType] + "\n";
            // Creo contenuto file con i dati recuperati dal db (prima riga intestazione user, poi dati user, poi intestazione header, poi dati header, poi intestazione row data, poi dati row data, SEPARATORE ;)
            string += "userID" + ";" + "gender" + ";" + "dominantHand" + ";" + "age" + "\n";
            resultUser.forEach(function(data){
                string += data['userID'] + ";";
		        string += data['gender'] + ";";
		        string += data['dominantHand'] + ";";
		        string += data['age'];
		        string += "\n";
            });

            string += "\n";

        if (sessioneInfo["exerciseType"] == "1")
		{
			string += "userID" + ";" + "sessionID" + ";" + "repetitionID" + ";" + "screenWidth" + ";" + "screenHeight" + ";" + "circleCenterX" + ";" + "circleCenterY" + ";" + "radiusCenter" + ";" + "margin" + ";" + "accuracy" + ";" + "distanceTot" + ";" + "time" + ";" + "centerCircle" + "\n";
	
			resultHeader.forEach(function(data) {
				
				string += data['userID'] + ";";
				string += data['sessionID'] + ";";
				string += data['repetitionID'] + ";";
				string += data['screenWidth'] + ";";
				string += data['screenHeight'] + ";";
				string += data['circleCenterX'] + ";";
				string += data['circleCenterY'] + ";";
				string += data['radiusCenter'] + ";";
				string += data['margin'] + ";";
				string += data['accuracy'] + ";";
				string += data['distanceTot'] + ";";
				string += data['time'] + ";";
				string += data['centerCircle'];
				string += "\n";
		
			})
			
			string += "\n";
			
			string += "sessionID" + ";" + "repetitionID" + ";" + "xR" + ";" + "yR" + ";" + "xN" + ";" + "yN" + ";" + "timeStampN" + ";" + "timeStampR" + "\n";

			resultRow.forEach(function(data){
				
				string += data['sessionID'] + ";";
				string += data['repetitionID'] + ";";				
				string += data['xR'] + ";";
				string += data['yR'] + ";";
				string += data['xN'] + ";";
				string += data['yN'] + ";";
				string += data['timeStampN'] + ";";
				string += data['timeStampR'];
				string += "\n";
		
			})					
		}
		else if (sessioneInfo["exerciseType"] == "2")
		{
			string += "userID" + ";" + "sessionID" + ";" + "repetitionID" + ";" + "screenWidth" + ";" + "screenHeight" + ";" + "circleCenterX" + ";" + "circleCenterY" + ";" + "radiusCenter" + ";" + "margin" + ";" + "accuracy" + ";" + "distanceCorrect" + ";" + "totalSpeed" + ";" + "turnsInside" + ";" + "centerCircle" + "\n";
			
			resultHeader.forEach(function(data){
				
				string += data['userID'] + ";";
				string += data['sessionID'] + ";";
				string += data['repetitionID'] + ";";				
				string += data['screenWidth'] + ";";
				string += data['screenHeight'] + ";";
				string += data['circleCenterX'] + ";";
				string += data['circleCenterY'] + ";";
				string += data['radiusCenter'] + ";";
				string += data['margin'] + ";";
				string += data['accuracy'] + ";";
				string += data['distanceCorrect'] + ";";
				string += data['totalSpeed'] + ";";
				string += data['turnsInside'] + ";";
				string += data['centerCircle'];
				string += "\n";
		
			})
			
			string += "\n";
			
			string += "sessionID" + ";" + "repetitionID" + ";" + "xR" + ";" + "yR" + ";" + "xN" + ";" + "yN" + ";" + "timeStampN" + ";" + "timeStampR" + "\n";

			resultRow.forEach(function(data){
				
				string += data['sessionID'] + ";";
				string += data['repetitionID'] + ";";				
				string += data['xR'] + ";";
				string += data['yR'] + ";";
				string += data['xN'] + ";";
				string += data['yN'] + ";";
				string += data['timeStampN'] + ";";
				string += data['timeStampR'];
				string += "\n";
		
			})

		}
		else if (sessioneInfo["exerciseType"] == "3")
		{ 
			string += "userID" + ";" + "sessionID" + ";" + "repetitionID" + ";" + "screenWidth" + ";" + "screenHeight" + ";" + "x1" + ";" + "y1" + ";" + "x2" + ";" + "y2" + ";" + "x3" + ";" + "y3" + ";" + "x4" + ";" + "y4" + ";" + "edge" + ";" + "margin" + ";" +	"accuracy" + ";" + "distanceTot" + ";" + "time" + ";" + "centralPerimeter" + "\n";
			
			resultHeader.forEach(function(data) {
				
				string += data['userID'] + ";";
				string += data['sessionID'] + ";";
				string += data['repetitionID'] + ";";				
				string += data['screenWidth'] + ";";
				string += data['screenHeight'] + ";";
				string += data['x1'] + ";";
				string += data['y1'] + ";";
				string += data['x2'] + ";";
				string += data['y2'] + ";";
				string += data['x3'] + ";";
				string += data['y3'] + ";";
				string += data['x4'] + ";";
				string += data['y4'] + ";";				
				string += data['edge'] + ";";
				string += data['margin'] + ";";
				string += data['accuracy'] + ";";
				string += data['distanceTot'] + ";";
				string += data['time'] + ";";
				string += data['centralPerimeter'];
				string += "\n";
		
			})
			
			string += "\n";
			
			string += "sessionID" + ";" + "repetitionID" + ";" + "xR" + ";" + "yR" + ";" + "xN" + ";" + "yN" + ";" + "timeStampN" + ";" + "timeStampR" + "\n";

			resultRow.forEach(function(data) {
				
				string += data['sessionID'] + ";";
				string += data['repetitionID'] + ";";				
				string += data['xR'] + ";";
				string += data['yR'] + ";";
				string += data['xN'] + ";";
				string += data['yN'] + ";";
				string += data['timeStampN'] + ";";
				string += data['timeStampR'];
				string += "\n";
		
			})
		}
		else if (sessioneInfo["exerciseType"] == "4")
		{

			string += "userID" + ";" + "sessionID" + ";" + "repetitionID" + ";" + "screenWidth" + ";" + "screenHeight" + ";" + "width" + ";" + "height" + ";" +
					"x1" + ";" + "y1" + ";" + "x2" + ";" + "y2" + ";" + "x3" + ";" + "y3" + ";" + "x4" + ";" + "y4" + ";" + "x5" + ";" + "y5" + ";" + "margin" + ";" + "adjustedAccuracy" + ";" + "time" + ";" + "totalLength" + ";" + "adjustedSpeed" + ";" + "distanceTot" + "\n";

			resultHeader.forEach(function(data) {
				
				string += data['userID'] + ";";
				string += data['sessionID'] + ";";
				string += data['repetitionID'] + ";";				
				string += data['screenWidth'] + ";";
				string += data['screenHeight'] + ";";
				string += data['width'] + ";";
				string += data['height'] + ";";				
				string += data['x1'] + ";";
				string += data['y1'] + ";";
				string += data['x2'] + ";";
				string += data['y2'] + ";";
				string += data['x3'] + ";";
				string += data['y3'] + ";";
				string += data['x4'] + ";";
				string += data['y4'] + ";";				
				string += data['x5'] + ";";
				string += data['y5'] + ";";	
				string += data['margin'] + ";";
				string += data['adjustedAccuracy'] + ";";
				string += data['time'] + ";";
				string += data['totalLength'] + ";";
				string += data['adjustedSpeed'] + ";";
				string += data['distanceTot'];
				string += "\n";
		
			})
			
			string += "\n";
			
			string += "sessionID" + ";" + "repetitionID" + ";" + "xR" + ";" + "yR" + ";" + "xN" + ";" + "yN" + ";" + "timeStampN" + ";" + "timeStampR" + "\n";

			resultRow.forEach(function(data) {
				
				string += data['sessionID'] + ";";
				string += data['repetitionID'] + ";";				
				string += data['xR'] + ";";
				string += data['yR'] + ";";
				string += data['xN'] + ";";
				string += data['yN'] + ";";
				string += data['timeStampN'] + ";";
				string += data['timeStampR'];
				string += "\n";
		
			})				
		}
		else if (sessioneInfo["exerciseType"] == "5")
		{			  
			string += "userID" + ";" + "sessionID" + ";" + "repetitionID" + ";" + "screenWidth" + ";" + "screenHeight" + ";" + "x1" + ";" + "y1" + ";" + "x2" + ";" + "y2" + ";" + "margin" + ";" + "meanReactionTime" + ";" + "accuracy" + ";" + "totTaps" + "\n";
			
			resultHeader.forEach(function(data) {
				
				string += data['userID'] + ";";
				string += data['sessionID'] + ";";
				string += data['repetitionID'] + ";";				
				string += data['screenWidth'] + ";";
				string += data['screenHeight'] + ";";			
				string += data['x1'] + ";";
				string += data['y1'] + ";";
				string += data['x2'] + ";";
				string += data['y2'] + ";";
				string += data['margin'] + ";";
				string += data['meanReactionTime'] + ";";
				string += data['accuracy'] + ";";
				string += data['totTaps'];
				string += "\n";
		
			})
			
			string += "\n";
			
			string += "sessionID" + ";" + "repetitionID" + ";" + "xR" + ";" + "yR" + ";" + "xN" + ";" + "yN" + ";" + "circle_active" + ";" + "circle_appearing_timeR" + ";" + "touched_timeStampR" + "\n";

			resultRow.forEach(function(data) {
				
				string += data['sessionID'] + ";";
				string += data['repetitionID'] + ";";				
				string += data['xR'] + ";";
				string += data['yR'] + ";";
				string += data['xN'] + ";";
				string += data['yN'] + ";";
				string += data['circle_active'] + ";";
				string += data['circle_appearing_timeR'] + ";";
				string += data['touched_timeStampR'];				
				string += "\n";
			})				
		}
		else if	(sessioneInfo["exerciseType"] == "6")
		{
			string += "userID" + ";" + "sessionID" + ";" + "repetitionID" + ";" + "screenWidth" + ";" + "screenHeight" + ";" +	"x1" + ";" + "y1" + ";" + "x2" + ";" + "y2" + ";" + "x3" + ";" + "y3" + ";" + "x4" + ";" + "y4" + ";" + "margin" + ";" + "meanReactionTime" + ";" + "accuracy" + ";" + "totTaps" + "\n";
			
			resultHeader.forEach(function(data) {
				
				string += data['userID'] + ";";
				string += data['sessionID'] + ";";
				string += data['repetitionID'] + ";";				
				string += data['screenWidth'] + ";";
				string += data['screenHeight'] + ";";			
				string += data['x1'] + ";";
				string += data['y1'] + ";";
				string += data['x2'] + ";";
				string += data['y2'] + ";";
				string += data['x3'] + ";";
				string += data['y3'] + ";";
				string += data['x4'] + ";";
				string += data['y4'] + ";";	
				string += data['margin'] + ";";
				string += data['meanReactionTime'] + ";";
				string += data['accuracy'] + ";";
				string += data['totTaps'];
				string += "\n";
		
			})
			
			string += "\n";
			
			string += "sessionID" + ";" + "repetitionID" + ";" + "xR" + ";" + "yR" + ";" + "xN" + ";" + "yN" + ";" + "circle_active" + ";" + "circle_appearing_timeR" + ";" + "touched_timeStampR" + "\n";

			resultRow.forEach(function(data) {
				
				string += data['sessionID'] + ";";
				string += data['repetitionID'] + ";";				
				string += data['xR'] + ";";
				string += data['yR'] + ";";
				string += data['xN'] + ";";
				string += data['yN'] + ";";
				string += data['circle_active'] + ";";
				string += data['circle_appearing_timeR'] + ";";
				string += data['touched_timeStampR'];				
				string += "\n";
			})		
        }
        var zip = new AdmZip();
        console.log(string);
        zip.addFile(""+sessioneInfo.sessionID+".txt", Buffer.alloc(string.length, string));
        zip.writeZip(url+".zip",function(err){
        if(err){
            callback(err,null);
        }else{
        console.log("zip creato");
        callback(null,null);
        }
        }); 
        }
    })

}

module.exports.sessionDetailsInfo = function(data,callback){

    var resultHeader;
    var resultRow;
    async.series([
        function queryDataFromHeader(callback){
                getDataFromHeader(
                data.database,
                data.exerciseType, 
                data.sessionID,
                data.userID,
                function(err,res){
                    if(err) callback(err);
                    else{
                        resultHeader = res;
                        callback(null);
                    }
                });  
        },
        function queryDataFromRow(callback){  
                getDataFromRow(data.database,
                data.exerciseType,
                data.sessionID,
                function(err,res){
                    if(err) callback(err);
                    else{
                        resultRow = res;
                        callback(null);
                    }
                })  
        }
    ],function(err){
        if(err) callback(err);
        else{
            var resultObj = {'headerData':resultHeader,'rowData':resultRow};
            callback(null,resultObj)
        }      
    })
}
