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
const data_services = require('./data_services');
const ejsLint = require('ejs-lint');
var compression = require('compression')
var app = express();
app.use(compression())
//DEBUGGER EJS
console.log(ejsLint.lint("./views/pannelloAdmin.ejs",null));

//Credenziali di accesso al database
var connection = mysql.createConnection({
    host: CONFIG.host,
    user: CONFIG.user,
    password: CONFIG.password,
    database: CONFIG.database,
});
//var sessionStore = new MySQLStore(options_session, connection);
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
app.use(express.static("/public/script_js"));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
//Funzioni di redirect che vietano l'accesso a pagine non consentite
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
    return response.sendfile(__dirname + '/PannelloAdmin/index.html')
})
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
                request.session.last_language = results[0].lastLanguage;
                request.session.databases = results[0].activeDatabases;
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
    async.parallel([
        function queryMascheraById(callback){
            admin_services.getMascheraByMedicoId(request.session.userId,function(err,result){
                if(err) throw err;
                else{
                    maschere = result;
                    callback(null);
                }
            })
        }
    ],function(err){
        if(err) throw err;
        else{
            response.render(path.join(__dirname + '/views/mainpage.ejs'),{
                maschere: maschere,
                nome_medico: request.session.nome,
                cognome_medico: request.session.cognome,
                last_language: request.session.last_language
            });
            return response.end();
        }
    });
});
app.get('/pannelloAdmin',redirectLogin, function(request, response) {
    var lista_medici,medicodataTableExists,mascheradataTableExists,graficodataTableExists;
    var databaseArrayText = ["mbFirstStudy", "mbPublicIT", "mbClinicElderly", "mbClinicDisabled"];
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
app.post('/cambioLingua',function(request,response){
    async.series([
        function queryUpdateLingua(callback){
            admin_services.updateLinguaMedico(request.session.userId,request.body.languages,function(err){
            if(err) callback(err);
            else {
                console.log("Lingua aggiornata");
                request.session.last_language = request.body.languages;
                callback(null);
            }
        });
    }],function(err){
        if(err) throw err;
        else response.redirect("/mainpage");
    return response.end();
    });
});
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
        response.redirect("/index");
    });
    response.end();
});
app.get("/index",redirectMainPage,function(request,response){
    response.render(path.join(__dirname + '/views/index.ejs'));
    response.end();
});

// LOGOUT 
app.get('/logoutAdmin',redirectLogin,function(request,response){
            request.session.destroy(function(error){
            if(error){ 
                console.log("Errore nel logout");
            }
        })
        return response.redirect("/");
});
app.get('/logoutMedico',redirectUserLogin,function(request,response){
    request.session.destroy(function(error){
    if(error){ 
        console.log("Errore nel logout");
        }
    else{
        console.log("Logout avvenuto correttamente");
    }
    });
return response.redirect("/index");
});

app.get("/pannelloGrafici",function(request,response){
    response.render(path.join(__dirname + '/views/pannelloGrafici.ejs'),{
        last_language: request.session.last_language,
        medicoID: request.session.userId,
        activeDatabases: request.session.databases,
        maschera: null,
        grafici: null
    })
    response.end();
});
app.post("/pannelloGrafici",redirectUserLogin,function(request,response){
    // Recupero il valore che identifica la maschera
    var grafici = new Array();
    var maschera;
    async.series([
        function queryMascheraById(callback){ 
            if(request.body.maschera_id){
                admin_services.getMascheraByMascheraID(request.body.maschera_id,function(err,res){
                    if(err) callback(err);
                    else{
                        maschera = res;
                        callback(null);
                    }
                })
            }
        },
        function queryGraficoById(callback){
            if(request.body.maschera_id){
            var ordine =  maschera[0].ordine.split(";");
            var itemProcessed = 0;
            ordine.forEach(function(graficoID){
                admin_services.getResultByGraficoID(graficoID,function(err,res){
                    if(err) callback(err);
                    else{
                        itemProcessed++;
                        grafici.push(res[0].graficoID);
                        if(itemProcessed == ordine.length){
                            callback(null);
                        }
                    }
                })
            })
         }
        }
    ],function(err){
        if(err) throw err;
        else{
        response.render(path.join(__dirname + '/views/pannelloGrafici.ejs'),{
            last_language: request.session.last_language,
            medicoID: request.session.userId,
            maschera: maschera,
            grafici: grafici,
            activeDatabases: request.session.databases
        });}
    return response.end();
    });
});



app.post("/getChartInfo",function(request,response){
    if(request.body.chartInfo){
        console.log("Richiesta recupero dati");
        var json_request = JSON.parse(request.body.chartInfo);
        data_services.getDataFromAverageHeader(json_request.esercizio,function(err,res){
            if(err) throw(err);
            else{
                response.end(res);
            }
        })
    }else{
        response.end();
    }
})
app.post("/getMotorBrainData",function(request,response){
    async.series([
        function queryRecuperoDatiChartAge(callback){
            if(request.body.chartAge){
                // PENSO SIA DA TESTARE QUANDO AVRO' I DATI NEL GRAFICO
                console.log("Sono in richiesta chart age");
                var json_request = JSON.parse(request.body.chartAge);
                data_services.getDataFromAverageHeaderAge(json_request.esercizio,json_request.min,json_request.max,function(err,res){
                    if(err) callback(err);
                    else{
                        callback(null,res);
                        response.end(res);
                    }
                })
                
            }else{
                callback(null);
            }
        },
        function queryCaricamentoGrafico(callback){
            console.log("richiesta caricamento grafico");
            if(request.body.graficoID){
                data_services.getDataFromAverageHeaderAgeByGraficoID(request.body.graficoID,function(err,res){
                    if(err){
                        callback(err,null);
                    } 
                    else{
                        callback(null,res);
                    }
                });
            }
        }
    ],function(err,res){
        if(err) {
            console.log(err)
        }
        else{
            response.json(res[1]);
            response.end();
        }
    });    
});

app.post("/salvaMaschera",function(request,response){
        console.log("Salvataggio maschera");
        var maschera;
        var mascheraID;
        if(request.body.salva_maschera){
            maschera = JSON.parse(request.body.salva_maschera);
        }
        async.series([
            function checkTabellaMaschera(callback){
                admin_services.checkExistMascheradataTable(function(err,res){
                    if(err){
                        callback(err);
                    }
                    if(res == false){
                        admin_services.creaTabella("mascheradata",function(err){
                            if(err) callback(err);
                            else callback(null);
                        })}});
                    callback(null);
            },
            function checkTabellaGrafico(callback){
                admin_services.checkExistGraficodataTable(function(err,res){
                    if(err){
                        callback(err,null);
                        return
                    }
                    if(res == false){
                        admin_services.creaTabella("graficodata",function(err){
                            if(err) callback(err);
                            else callback(null);
                        })
                    }else{
                        callback(null);
                    }
                    });
            },
            function insertMaschera(callback){
                mascheraID = admin_services.generateUUID();
                admin_services.insertMaschera(
                    mascheraID,
                    maschera.medicoID,
                    maschera.titolo,
                    maschera.descrizione,
                    maschera.ordine,
                    function(err,res){
                        if(err) callback(err);
                        else{
                            callback(null);
                        }
                    })
            },
            function insertGrafico(callback){
                maschera.jsonChartArray.forEach(function(grafico){
                    console.log(grafico.listaVariabili);
                    admin_services.insertGrafico(grafico,mascheraID,request.session.userId,function(err,res){
                        if(err) callback(err);
                        else{
                            console.log("Grafico salvato correttamente"); 
                        }
                    })
                
                })
                callback(null);
            }
        ]
        ),function(err){
            if(err) throw err;
            else{
                console.log("Salvataggio avvenuto correttamente");
            }
        }
        response.end();
});

app.post("/exportGraphs",function(request,response){
    console.log("Richiesta di esportazione");
    if(request.body.esporta_tutto){
        data_services.exportData(request.body.esporta_tutto,function(err,res){
            if(err) throw err;
            else{
                console.log("esportazione conclusa");
                return response.end();
            }
        })
    }

});
app.post("/eliminaMaschera",function(request,response){
    if(request.body.elimina_maschera){
        console.log(request.body.elimina_maschera);
        admin_services.eliminaMaschera(request.body._maschera,function(err,res){
            if(err) throw err;
            })
    }
    response.end();
});

// SERVER IN ASCOLTO
app.listen(3001,function(){
    console.log("Listening on 3001");
});