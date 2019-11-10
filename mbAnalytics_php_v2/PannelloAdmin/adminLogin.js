    var mysql = require('mysql');
    var express = require('express');
    var session = require('express-session');
    //Gestore delle session store
    var MySQLStore = require('express-mysql-session')(session);
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
    //var sessionStore = new MySQLStore(options_session, connection);
    var app = express();
    app.use(express.static(path.join(__dirname,'/public')));

    var options_session = {
            host: CONFIG.host,
            port: 3306,
            user: CONFIG.user,
            password: CONFIG.password,
            database: CONFIG.database,
            clearExpired: true,
            checkExpirationInterval: 900000,
            expiration: 86400000,
            createDatabaseTable: true,
            connectionLimit: 1,
            endConnectionOnClose: true,
            charset: 'utf8mb4_bin',
            schema: {
                tableName: 'sessions',
                columnNames: {
                    session_id: 'session_id',
                    expires: 'expires',
                    data: 'data',
                }
            }
        };
        
    app.use(session({
        secret: 'secret',
        resave: false,
        saveUninitialized: true,
        store: new MySQLStore({
            host: CONFIG.host,
            port: 3306,
            user: CONFIG.user,
            password: CONFIG.password,
            database: CONFIG.database
        }),
        cookie: {maxAge: 180 * 60 *1000}
    }));

    //cartella che contiene file statici come script e css
    app.use(express.static("../public"));
    //serve per accedere alle richieste del body
    app.use(bodyParser.urlencoded({extended : true}));
    app.use(bodyParser.json());


    //il next significa semplicemente di passare alla prossima richiesta
    const redirectLogin = (req,res,next) => {
        console.log(req.session.userId);
        if(!req.session.userId){
            res.redirect('/login')
        }else{
            next();
        }
    }
    
    const redirectAdminPanel = (req,res,next) => {
        console.log(req.session.userId);
        if(req.session.userId){
            return res.redirect('/pannelloAdmin')
        }else{
            next();
        }
    }

    app.get('/',redirectLogin, function(request, response) {
        const {userId} = request.session;
        
        return response.redirect('/pannelloAdmin');
    });

    app.get('/login',redirectAdminPanel,function(request,response){
        return response.sendfile(__dirname + '/index.html')})

    app.post('/authAdmin',redirectAdminPanel, function(request, response) {
        var username = request.body.username_admin_login;
        var password = request.body.pwd_admin_login;
        if (username && password) {
            connection.query('SELECT * FROM medicodata WHERE email = ? AND password = ? ;', [username, password], function(error, results, fields) {		
                if (results.length > 0) {
                    //sessione avviata
                    request.session.loggedin = true;
                    //user name della sessione
                    request.session.userId = username;
                    //reindirizzamento
                    request.session.save(function(){
                        response.redirect('/pannelloAdmin');
                    })
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
    
    app.get('/pannelloAdmin',redirectLogin, function(request, response) {
        if (request.session.loggedin) {
            return response.sendFile(path.join(__dirname+"/pannelloAdmin.html"));
        } else {
            response.send('Please login to view this page!');
        }
        return response.end();
    });

    app.get('/logout',redirectLogin,function(request,response){
                request.session.destroy(function(error){
                if(error){ 
                    console.log("Errore nel logout");
                }
            })
            return response.redirect("/");
        })
    
    
    app.listen(3000,function(){
        console.log("Listning on 3000");
    });