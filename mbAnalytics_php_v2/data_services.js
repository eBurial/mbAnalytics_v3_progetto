const mysql = require('mysql');
const CONFIG = require('./config_mbStudy.json');
const admin_services = require('./admin_services');
var async = require("async");

const connection = mysql.createConnection({
    host: CONFIG.host,
    user: CONFIG.user,
    password: CONFIG.password,
    database: CONFIG.database
});
const GRAFICO_DATA = "graficodata";


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
module.exports = {
    getDataFromAverageHeaderAge: getDataFromAverageHeaderAge
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
    async.series([
        function queryResultGraficoByID(callback){
            admin_services.getResultByGraficoID(graficoID,function(err,res){
            if(err) callback(err);
            else {       
                if(res.length >0 ){
                    graficoID_trovato = res[0];
                    callback(null,res);
                }
            }
        })},
        function queryGetDataFromAverageHeaderAge(callback){ 
            getDataFromAverageHeaderAge(graficoID_trovato.tipoEsercizio,graficoID_trovato.filtroEtaMin,graficoID_trovato.filtroEtaMax ,function(err,res){
            if(err) callback(err);
            else{
                if(res.length>0){
                    console.log("sono qui");
                    console.log(graficoID_trovato.listaVariabili);
                    //graficoID_trovato.listaVariabili = (JSON.stringify(graficoID_trovato.listaVariabili));
                    //graficoID_trovato.filtroListaValoriIntervalli = JSON.parse(JSON.stringify(graficoID_trovato.filtroListaValoriIntervalli));
                    

                    // --------------- son fermo qui ------------
                    resultObj = {
                        "database":graficoID_trovato.databaseID,
                        "grafico":graficoID_trovato.graficoID,
                        "jsonData":graficoID_trovato};
                    //jsonData = JSON.stringify(resultObj);
                    callback(null,JSON.parse(resultObj));

                }
            }})
        },
    ],function(err,res){
        if(err) callback(err);
        else{
            console.log("Sono qui");
            callback(res)
        }
    })
}

