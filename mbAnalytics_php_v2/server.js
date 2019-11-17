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


//redirext alla pagina di login (per admin)
const redirectLogin = (req,res,next) => {
    if(!req.session.userId){
        res.redirect('/login')
    }else{
        next();
    }
}
//redirect al pannello admin 
const redirectAdminPanel = (req,res,next) => {
    if(req.session.userId){
        return res.redirect('/pannelloAdmin')
    }else{
        next();
    }
}
const redirectMainPage = (req,res,next) => {
    if(req.session.userId){
        return res.redirect('/mainpage')
    }else{
        next();
    }
}
const redirectUserLogin = (req,res,next) => {
    if(!req.session.userId){
        res.redirect('/index')
    }else{
        next();
    }
}
app.get('/',redirectLogin, function(request, response) {
    const {userId} = request.session;
    return response.redirect('/pannelloAdmin');
});
app.get('/login',redirectAdminPanel,function(request,response){
    return response.sendfile(__dirname + '/PannelloAdmin/index.html')})
//autenticazione admin
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

app.post('/authUser',function(request,response){
    var username = request.body.email_login_user;
    var password = request.body.pwd_login_user;
    if(username && password){
        connection.query('SELECT * FROM medicodata WHERE ? = email AND ? = password;', [username, password], function(error, results, fields) {
            if (results.length != 0) {
                request.session.loggedin = true;
                request.session.userId = results[0].medicoID;
                request.session.nome = results[0].nome;
                request.session.cognome = results[0].cognome;
                request.session.save(function(){
                    response.redirect("/mainpage");
                })
            } else {
                response.send('Incorrect Username and/or Password!');
            }			
             return response.end();
        });
    }
});
app.get('/mainpage',redirectUserLogin,function(request,response){
    var maschere;
    //debug console 
    console.log(ejsLint.lint("./views/mainpage.ejs",null));
    async.setImmediate(() => admin_services.getMascheraByMedicoId(request.session.userId,function(err,result){
        if(err) throw err;
        else{
            maschere = result;
        }
    })); 
    response.render(path.join(__dirname + '/views/mainpage.ejs'),{
        maschere: maschere,
        nome_medico: request.session.nome,
        cognome_medico: request.session.cognome,
    });
    response.end();
});

//Gestisce il pannello admin 
app.get('/pannelloAdmin',redirectLogin, function(request, response) {
    var lista_medici,medicodataTableExists,mascheradataTableExists,graficodataTableExists;
    databaseArrayText = ["mbFirstStudy", "mbPublicIT", "mbClinicElderly", "mbClinicDisabled"];
    async.parallel([
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
                medicodataTableExists = res;
                callback(null);
            })
        },
        function queryExistMascheradataTable(callback){
            admin_services.checkExistMascheradataTable(function(err,res){
                if(err){
                    callback(err,null);
                    return
                }
                mascheradataTableExists = res;
                callback(null);
            })
        },
        function queryExistGraficodataTable(callback){
            admin_services.checkExistGraficodataTable(function(err,res){
                if(err){
                    callback(err,null);
                    return
                }
                mascheradataTableExists = res;
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
//richiama tutte le funzioni che operano sul database dei medici
app.post('/gestioneMedici',function(request,response){
    if(request.body.disabilita_medico){
        console.log("Richiesta di disabilitare un medico");
        admin_services.updateStatoMedico("0",request.body.disabilita_medico,function(err){
            if(err) throw err;
            else done();
        });
    }
    if(request.body.abilita_medico){
        console.log("Richiesta di abilitare un medico");
        admin_services.updateStatoMedico("1",request.body.abilita_medico,function(err){
            if(err) throw err;
            else done();
        });
    }
    if(request.body.elimina_medico){
        console.log("Richiesta di eliminare un medico");
        admin_services.eliminaMedico(request.body.elimina_medico,function(err){
            if(err) throw err;
            else done();
        });
    }
    if(request.body.databases){
        console.log("Richiesta di aggiornamento databases");
        admin_services.updateDatabaseMedico(request.body.id_medico,request.body.databases,function(err){
            if(err)throw err;
            else done();
        });
    }
    return response.end();       
});
app.post("/gestioneDbMotorbrain",function(request,response){
    if(request.body.crea_tabella){
        console.log("Creazione tabella mancante");
        admin_services.creaTabella(request.body.crea_tabella,function(err){
            if(err) throw err;
            else done();
        });
    }
    return response.end();
});
app.post("/registrazioneUtente",function(request,response){
    console.log(request.body.medicoID);
    admin_services.registraMedico(request.body,function(err){
        if(err) throw err;
    });
    response.redirect("/index");
    response.end();

});
//Gestisce la home page dell'utente 
app.get("/index",redirectMainPage,function(request,response){
    response.render(path.join(__dirname + '/views/index.ejs'));
    response.end();
});
app.get('/logout',redirectLogin,function(request,response){
            request.session.destroy(function(error){
            if(error){ 
                console.log("Errore nel logout");
            }
        })
        return response.redirect("/");
    });
app.listen(3000,function(){
    console.log("Listening on 3000");
});