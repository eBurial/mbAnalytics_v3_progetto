const mysql = require('mysql');
const CONFIG = require('../node/config.json');
const connection = mysql.createConnection({
    host: CONFIG.host,
    user: CONFIG.user,
    password: CONFIG.password,
    database: CONFIG.database
});

const MEDICO_DATA = "medicodata";
const MASCHERA_DATA = "mascheradata";

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
module.exports.creaTabella = function(nome_tabella,callback){
    switch(nome_tabella){
        case 'medicodata': var query = "CREATE TABLE IF NOT EXISTS " + nome_tabella + " (ID int(11) NOT NULL AUTO_INCREMENT,medicoID varchar(255) COLLATE utf8_bin DEFAULT NULL,nome varchar(255) COLLATE utf8_bin DEFAULT NULL,cognome varchar(255) COLLATE utf8_bin DEFAULT NULL,email varchar(255) COLLATE utf8_bin DEFAULT NULL,password varchar(255) COLLATE utf8_bin DEFAULT NULL,dataInserimento datetime DEFAULT NULL,attivo varchar(255) DEFAULT NULL,activeDatabases varchar(255) DEFAULT NULL,lastLanguage varchar(2),PRIMARY KEY (ID)) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin AUTO_INCREMENT=1 ;"; break;
        case 'mascheradata': var query = "CREATE TABLE IF NOT EXISTS " + nome_tabella +"(ID int(11) NOT NULL AUTO_INCREMENT,mascheraID varchar(255) COLLATE utf8_bin DEFAULT NULL,medicoID varchar(255) COLLATE utf8_bin DEFAULT NULL,titolo varchar(255) COLLATE utf8_bin DEFAULT NULL,descrizione varchar(255) COLLATE utf8_bin DEFAULT NULL,ordine varchar(255) COLLATE utf8_bin DEFAULT NULL,PRIMARY KEY (ID)) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin AUTO_INCREMENT=1 ;";break;
        case 'graficodata': var query = "CREATE TABLE IF NOT EXISTS " + nome_tabella + " (ID int(11) NOT NULL AUTO_INCREMENT,graficoID varchar(255) COLLATE utf8_bin DEFAULT NULL,mascheraID varchar(255) COLLATE utf8_bin DEFAULT NULL,medicoID varchar(255) COLLATE utf8_bin DEFAULT NULL,databaseID varchar(255) COLLATE utf8_bin DEFAULT NULL,tipoGrafico varchar(255) COLLATE utf8_bin DEFAULT NULL,tipoEsercizio varchar(255) COLLATE utf8_bin DEFAULT NULL,listaVariabili varchar(255) COLLATE utf8_bin DEFAULT NULL,filtroEtaMin int(11) DEFAULT NULL,filtroEtaMax int(11) DEFAULT NULL,filtroAmpiezzaIntervalloEta int(11) DEFAULT NULL,filtroListaValoriIntervalli varchar(255) COLLATE utf8_bin DEFAULT NULL,filtroGenere varchar(255) COLLATE utf8_bin DEFAULT NULL,filtroManoDominante varchar(255) COLLATE utf8_bin DEFAULT NULL,filtroManoSessione varchar(255) COLLATE utf8_bin DEFAULT NULL,PRIMARY KEY (ID)) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin AUTO_INCREMENT=1 ;"; break;
        default: console.err("Nome tabella non gestito");break;
    }
    connection.query(query,function(err){
        if(err){
            callback(err);
        }else{
            console.log("Tabella creata");
        }
    });
}
module.exports.updateDatabaseMedico = function(medicoID,databases,callback){
    connection.query("UPDATE " + MEDICO_DATA + " SET activeDatabases = '"+databases +"' WHERE medicoID ='"+ medicoID+"';",function(err){
        if(err){
            callback(err);
        }else{
            console.log("Database medico aggiornati");
        }
    });
}

module.exports.registraMedico = function(credenziali,callback){
    var currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    //var id = funzione per generare id random

    var ID = function () {
        // Math.random should be unique because of its seeding algorithm.
        // Convert it to base 36 (numbers + letters), and grab the first 9 characters
        // after the decimal.
        return '_' + Math.random().toString(36).substr(2, 9);
    };
    var idUser = ID();
    connection.query("INSERT INTO " + MEDICO_DATA + " (medicoID, nome, cognome, email,password, dataInserimento, attivo, activeDatabases, lastLanguage) VALUES ('"+idUser+"','"+ credenziali.nome_registrazione+"','"+ credenziali.cognome_registrazione +"','"+ credenziali.email_registrazione+"','"+credenziali.pwd_registrazione+"','"+currentTime+"','0',"+ null+",'EN');",function(err){
        if(err){
            callback(err);
        }else{
            console.log("Registrazione medico effettuata");
        }
    });


}

module.exports.getMascheraByMedicoId = function(medicoID,callback){
    connection.query("SELECT mascheraID, medicoID, titolo, descrizione, ordine FROM " + MASCHERA_DATA +" WHERE medicoID = '"  +medicoID + "';",function(err,result){
        if(err){
            callback(err,null)
        }else{
            if(result.lenght > 0) callback(null,result);
            else callback(null,-1);
        }
    });
}