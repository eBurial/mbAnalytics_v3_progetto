var mysql = require('mysql');
var CONFIG = require('../node/config.json');
var connection = mysql.createConnection({
    host: CONFIG.host,
    user: CONFIG.user,
    password: CONFIG.password,
    database: CONFIG.database
});


exports.getMedici = function(){
    console.log("Sono in get medici");
} 