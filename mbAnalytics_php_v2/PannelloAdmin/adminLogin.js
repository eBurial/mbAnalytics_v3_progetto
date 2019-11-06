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
    app.use(session({
        secret: 'secret',
        resave: true,
        saveUninitialized: true
    }));
    app.use(bodyParser.urlencoded({extended : true}));
    app.use(bodyParser.json());
    
    app.get('/', function(request, response) {
        response.sendFile(path.join(__dirname + '/index.html'));
    });
    connection.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
      });
    
    
    app.post('/auth', function(request, response) {
        console.log("sono qui");
        
        var username = request.body.username_admin_login;
        var password = request.body.pwd_admin_login;
        if (username && password) {
            connection.query('SELECT * FROM medicodata WHERE email = ? AND password = ? ;', [username, password], function(error, results, fields) {
                console.log(results);		
                if (results.length > 0) {
                    //sessione avviata
                    request.session.loggedin = true;
                    //user name della sessione
                    request.session.username = username;
                    //reindirizzamento
                    response.redirect('/home');
                } else {
                    response.send('Incorrect Username and/or Password!');
                }			
                response.end();
            });
        } else {
            response.send('Please enter Username and Password!');
            response.end();
        }
    });
    
    app.get('/home', function(request, response) {
        if (request.session.loggedin) {
            response.send('Welcome back, ' + request.session.username + '!');
        } else {
            response.send('Please login to view this page!');
        }
        response.end();
    });
    
    app.listen(3000,function(){
        console.log("Listning on 3000");
    });