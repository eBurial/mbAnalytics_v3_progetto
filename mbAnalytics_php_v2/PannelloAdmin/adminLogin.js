var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');

var CONFIG = require('../../node/config.json');

//Credenziali di accesso al database

var connection = mysql.createConnection({
	host: CONFIG.host,
	user: CONFIG.user,
	password: CONFIG.password,
	database: CONFIG.database
    });
    

    var app = express();
    
    app.use(express.static(path.join(__dirname,'/public')));
    
    app.use(session({
        secret: 'secret',
        resave: true,
        saveUninitialized: true
    }));

    //cartella che contiene file statici come script e css
    app.use(express.static("../public"));
    app.use(bodyParser.urlencoded({extended : true}));
    app.use(bodyParser.json());

    app.get('/', function(request, response) {
        response.sendFile(path.join(__dirname + '/index.html'));
    });

    
    
    app.post('/authAdmin', function(request, response) {
        var username = request.body.username_admin_login;
        var password = request.body.pwd_admin_login;
        if (username && password) {
            connection.query('SELECT * FROM medicodata WHERE email = ? AND password = ? ;', [username, password], function(error, results, fields) {		
                if (results.length > 0) {
                    //sessione avviata
                    request.session.loggedin = true;
                    //user name della sessione
                    request.session.username = username;
                    //reindirizzamento
                    return response.redirect('/pannelloAdmin');
                } else {
                    response.send('Incorrect Username and/or Password!');
                }			
                 return response.end();
            });
        } else {
            response.send('Please enter Username and Password!');
            response.end();
        }
    });
    
    app.get('/pannelloAdmin', function(request, response) {
        if (request.session.loggedin) {
            console.log("sono qui");
            return response.sendFile(path.join(__dirname+"/pannelloAdmin.html"));
        } else {
            response.send('Please login to view this page!');
        }
        return response.end();
    });
    
    app.listen(3000,function(){
        console.log("Listning on 3000");
    });