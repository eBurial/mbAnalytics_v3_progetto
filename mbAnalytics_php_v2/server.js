var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var async = require("async");
//Gestore delle session store
var MySQLStore = require('express-mysql-session')(session);
var bodyParser = require('body-parser');
var path = require('path');
const CONFIG = require('../node/config.json');
const admin_services = require('./admin_services');

const ejsLint = require('ejs-lint');
console.log(ejsLint.lint("./views/pannelloAdmin.ejs",null));

//Credenziali di accesso al database
var connection = mysql.createConnection({
    host: CONFIG.host,
    user: CONFIG.user,
    password: CONFIG.password,
    database: CONFIG.database,
});
//var sessionStore = new MySQLStore(options_session, connection);
var app = express();
app.use(express.static(path.join(__dirname,'/public')));

//Setting del template engine
app.set('view engine','ejs');
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    store: new MySQLStore({
        host: CONFIG.host,
        user: CONFIG.user,
        password: CONFIG.password,
        database: CONFIG.database
    }),
    cookie: {maxAge: 180 * 60 *1000}
}));

//cartella che contiene file statici come script e css
app.use(express.static("/public"));
//serve per accedere alle richieste del body
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());


//il next significa semplicemente di passare alla prossima richiesta
const redirectLogin = (req,res,next) => {
    if(!req.session.userId){
        res.redirect('/login')
    }else{
        next();
    }
}

const redirectAdminPanel = (req,res,next) => {
    if(req.session.userId){
        return res.redirect('/pannelloAdmin')
    }else{
        next();
    }
}

app.get('/',redirectLogin, function(request, response) {
    const {userId} = request.session;
    //services.getMedici();
    return response.redirect('/pannelloAdmin');
});

app.get('/login',redirectAdminPanel,function(request,response){
    return response.sendfile(__dirname + '/PannelloAdmin/index.html')})

app.post('/authAdmin',redirectAdminPanel, function(request, response) {
    var username = request.body.username_admin_login;
    var password = request.body.pwd_admin_login;
    if (username && password) {
        connection.query('SELECT * FROM medicodata WHERE ? = email AND ? = password;', [username, password], function(error, results, fields) {
            if (results.length > 0) {
                request.session.loggedin = true;
                request.session.userId = username;
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
    var lista_medici,medicodataTableExists,mascheradataTableExists,graficodataTableExists;
    databaseArrayText = ["mbFirstStudy", "mbPublicIT", "mbClinicElderly", "mbClinicDisabled"];
    async.series([
        function queryMedici(callback){
            admin_services.getMedici(function(err,res){
                if(err){
                    callback(err,null);
                    return
                }
                lista_medici = res;
                callback(null);
            });
        },
        function queryExistMedicodataTable(callback){
            admin_services.checkExistMedicodataTable(function(err,res){
                if(err){
                    callback(err,null);
                    return
                }
                if(res.length > 0){
                    medicodataTableExists = true;
                }else{
                    medicodataTableExists = false;
                }
                callback(null);
            })
        },
        function queryExistMascheradataTable(callback){
            admin_services.checkExistMascheradataTable(function(err,res){
                if(err){
                    callback(err,null);
                    return
                }
                if(res.length > 0){
                    mascheradataTableExists = true;
                }else{
                    mascheradataTableExists = false;
                }
                callback(null);
            })
        },
        function queryExistGraficodataTable(callback){
            admin_services.checkExistGraficodataTable(function(err,res){
                if(err){
                    callback(err,null);
                    return
                }
                if(res.length > 0){
                    graficodataTableExists = true;
                }else{
                    graficodataTableExists = false;
                }
                callback(null);
            })
        }
    ],function(err){
        if(err){
            throw err;
        }
        else{
            response.render(path.join(__dirname + '/views/pannelloAdmin.ejs'),
                {results:lista_medici,
                 databaseArrayText:databaseArrayText,
                 medicodataTableExists:medicodataTableExists,
                 mascheradataTableExists:mascheradataTableExists,
                 graficodataTableExists:graficodataTableExists
                });
            console.log(ejsLint("./views/pannelloAdmin.ejs"),null);
            return response.end(); 
        }
    })
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
    console.log("Listening on 3000");
});