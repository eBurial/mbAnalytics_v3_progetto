const mysql = require('mysql');
const CONFIG = require('../node/config.json');
const connection = mysql.createConnection({
    host: CONFIG.host,
    user: CONFIG.user,
    password: CONFIG.password,
    database: CONFIG.database
});

//metodo che ritorna la lista dei medici
module.exports.getMedici = function(callback){
    connection.query("SELECT medicoID, nome, cognome, email,password, dataInserimento, attivo, activeDatabases, lastLanguage FROM medicodata ORDER BY Cognome, Nome",
    function (err, result) {
        if (err){
            callback(err,null)
        }else{
            callback(null,result);   
        }
    }); 
}
module.exports.checkExistMedicodataTable = function(callback){
    connection.query("SHOW TABLES LIKE 'medicodata'",function(err,result){
        if(err){
            callback(err,null)
        }else{
            callback(null,result);
        }
    });
}
module.exports.checkExistMascheradataTable = function(callback){
    connection.query("SHOW TABLES LIKE 'mascheradata'",function(err,result){
        if(err){
            callback(err,null)
        }else{
            callback(null,result);
        }
    });
}
module.exports.checkExistGraficodataTable = function(callback){
    connection.query("SHOW TABLES LIKE 'graficodata'",function(err,result){
        if(err){
            callback(err,null)
        }else{
            callback(null,result);
        }
    });
}

