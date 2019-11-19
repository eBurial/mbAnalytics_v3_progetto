const mysql = require('mysql');
const CONFIG = require('./config_mbStudy.json');

const connection = mysql.createConnection({
    host: CONFIG.host,
    user: CONFIG.user,
    password: CONFIG.password,
    database: CONFIG.database
});



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
        else callback(null,result);
    })
}