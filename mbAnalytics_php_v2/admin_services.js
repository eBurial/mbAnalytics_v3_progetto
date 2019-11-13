const mysql = require('mysql');
const CONFIG = require('../node/config.json');
const connection = mysql.createConnection({
    host: CONFIG.host,
    user: CONFIG.user,
    password: CONFIG.password,
    database: CONFIG.database
});

const MEDICO_DATA = "medicodata";
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
            if(result.lenght>0) callback(null,true);
            else callback(null,false);
        }
    });
}
module.exports.checkExistMascheradataTable = function(callback){
    connection.query("SHOW TABLES LIKE 'mascheradata'",function(err,result){
        if(err){
            callback(err,null)
        }else{
            if(result.lenght>0) callback(null,true);
            else callback(null,false);
        }        
    });
}
module.exports.checkExistGraficodataTable = function(callback){
    connection.query("SHOW TABLES LIKE 'graficodata'",function(err,result){
        if(err){
            callback(err,null)
        }else{
            if(result.lenght>0) callback(null,true);
            else callback(null,false);
        }
    });
}


module.exports.updateStatoMedico = function(stato,id,callback){
    console.log(id);
    connection.query("UPDATE "+MEDICO_DATA+" SET attivo = "+stato+" WHERE medicoID = '"+id+"';",function(err){
        if(err){
            callback(err);
        }else{
            console.log("stato medico cambiato");
        }
    });
}
module.exports.eliminaMedico = function(medicoID,callback){
    console.log(medicoID);
    connection.query("DELETE FROM " + MEDICO_DATA + " WHERE medicoID = '"+ medicoID +"';",function(err){
        if(err){
            callback(err);
        }else{
            console.log("medico eliminato");
        }
    });
}


