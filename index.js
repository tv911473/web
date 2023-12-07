const fs = require('fs');
const express = require('express');
const app = express();
// kui koik db asjad pool'is siis pole seda enam vaja
const mysql = require('mysql2');
const timeInfo = require('./src/datetime_func');
// kui koik db asjad pool'is siis pole seda enam vaja
const dbInfo = require('../../vp23config');
const bodyparser = require('body-parser');
// kui koik db asjad pool'is siis pole seda enam vaja
const dataBase = ('if23_taavi_ve');
const pool = require('./src/databasepool').pool;
// fotode laadimiseks
const multer = require('multer');
// seadistame vahevara (middleware), mis määrab üleslaadimise kataloogi
const upload = multer({dest: './public/gallery/orig/'});
const sharp =require('sharp');
const async = require('async');
// paroolide cryptimiseks
const bcrypt = require('bcrypt');
// sessiooni jaoks
const session = require('express-session');

app.use(session({secret: 'minuMingiSalajaneVoti', saveUninitialized: true, resave: true}));
let mySession;

app.set('view engine', 'ejs');
app.use(express.static('public'));
// järgnev kui ainult text siis "false", kui ka pilte ja muud siis "true"
app.use(bodyparser.urlencoded({extended: true}));

// loon andmebaasiga yhenduse
// kui koik db asjad pool'is siis pole seda enam vaja
const conn = mysql.createConnection({
    host: dbInfo.configData.host,
    user: dbInfo.configData.user,
    password: dbInfo.configData.password,
    database: dataBase
});
// marsruudid (routes)

const newsRouter = require('./routes/news');
app.use('/news', newsRouter);

// avalehel
app.get('/', (req, res)=>{
    res.render('index');    //res.render sama mis res.end
});



// kasutaja sisse logimine
app.post('/', (req, res)=>{
    let notice = 'Sisesta oma andmed';
    if(!req.body.emailInput || !req.body.passwordInput){
        console.log('halvasti on')
    }
    else {
        console.log('hasti on')
        let sql = 'SELECT id, password FROM vpusers WHERE email = ?';
        // andmebaasi uhendus pool'i kaudu
        pool.getConnection((err, connection)=>{
            if(err){
                connection.release();
                throw err;
            }
            else {
                // andmebaasi osa
                connection.execute(sql, [req.body.emailInput], (err, result)=>{
                    if(err) {
                        notice = 'Tehniline viga';
                        console.log(notice);
                        res.render('index', {notice: notice});
                        connection.release();
                    }
                    else {
                        if(result[0] != null){
                            console.log(result[0].password);
                            bcrypt.compare(req.body.passwordInput, result[0].password, (err, compareresult)=>{
                                if(err){
                                    connection.release();
                                    throw err;
                                }
                                else {
                                    if(compareresult){
                                        mySession = req.session;
                                        mySession.userName = req.body.emailInput;
                                        mySession.userId = result[0].id;
                                        notice = mySession.userName + 'on sisse logitud';
                                        res.render('index', {notice: notice});
                                        connection.release();
                                    }
                                    else {
                                        console.log('ei saa sisse');
                                        res.render('index', {notice: notice});
                                        connection.release();
                                    }
                                }
                            });
                        }
                        else {
                            notice = 'Kasutajat ei leidu';
                            console.log(notice);
                            res.render('index', {notice: notice});
                            connection.release();
                        }
                    }
                });// andmebaasi osa loppeb
            }// pool getConnection callback loppeb
        });// pool getConnection loppeb
        
        //res.render('index', {notice: notice});
    }
});
app.get('/logout', (req, res)=>{
    req.session.destroy();
    mySession = null;
    console.log('Logi valja');
    res.redirect('/');
});
// kasutaja konto loomine
app.get('/signup', (req, res)=>{
    res.render('signup');
});

app.post('/signup', (req, res)=>{
    let notice = 'Ootan andmeid';
    console.log(req.body);
    if(!req.body.firstNameInput || !req.body.lastNameInput || !req.body.genderInput || !req.body.birthInput || !req.body.emailInput || req.body.passwordInput.length < 8 || req.body.passwordInput !== req.body.confirmPasswordInput){
        console.log('Andmed puuduvad voi ebakorrektne');
        notice = 'Andmed puuduvad voi ebakorrektne';
        res.render ('signup', {notice: notice});
    }
    else {
        console.log('OK');
            // "cost" 10 - tavaliselt 5 - 15: mitu iteratsiooni tehatkse soola tegemisel
        bcrypt.genSalt(10, (err, salt)=>{
            bcrypt.hash(req.body.passwordInput, salt, (err, pswdhash)=>{
                let sql = 'INSERT INTO vpusers (firstname, lastname, birthdate, gender, email, password) VALUES(?,?,?,?,?,?)';
                pool.getConnection((err, connection)=>{
                    if(err){
                        connection.release();
                        throw err;
                    }
                    else {
                        // andmebaasi osa
                        connection.execute(sql, [req.body.firstNameInput, req.body.lastNameInput, req.body.birthInput, req.body.genderInput, req.body.emailInput, pswdhash], (err, result)=>{
                            if (err){
                                console.log(err);
                                notice = 'kasutajat ei loodud';
                                res.render ('signup', {notice: notice});
                                connection.release();
                            }
                            else {
                                console.log('Kasutaja loodud');
                                notice = 'Kasutaja ' + req.body.emailInput + ' edukalt loodud';
                                res.render ('signup', {notice: notice});
                                connection.release();
                            }
                        });// andmebaasi osa loppeb
                    }// pool getConnection callback loppeb
                });// pool getConnection loppeb
                
            });
        });
    }
    // res.render('signup');
});
app.get('/timenow', (req, res)=>{
    const dateNow = timeInfo.dateOfTodayEN();
    const timeNow = timeInfo.timeOfToday();
    res.render('timenow', {nowD: dateNow, nowT: timeNow});
});
app.get('/wisdom', (req, res)=>{
    let folkWisdom = [];
    fs.readFile('public/txtfiles/vanasonad.txt', 'utf8', (err, data)=>{
        if(err){
            throw err;
        }
        else {
            folkWisdom = data.split(';');
            res.render('justlist', {h1: 'Vanasonad', wisdom: folkWisdom});
        }
    });
});

app.get('/listnames', (req, res)=>{
    let namesList = [];
    fs.readFile('public/txtfiles/log.txt', 'utf8', (err, data)=>{
        if(err){
            throw err;
        }
        else {
            namesList = data.split(';');
            res.render('namelist', {h1: 'Nimed', names: namesList});
        }
    });
});

app.get('/eestifilm', (req, res)=>{
    res.render('filmindex');
});
// /eestifilm lehel olevad lingid
app.get('/eestifilm/filmiloend', (req, res)=>{
    let sql = 'SELECT title, production_year, duration FROM movie';
    let sqlResult = [];
    pool.getConnection((err, connection)=>{
        if(err){
            throw err;
        }
        else {
            // andmebaasi osa
            connection.execute(sql, (err, result)=>{
                if (err){
                    res.render('filmlist', {filmlist: sqlResult});
                    connection.release();
                    //conn.end();
                    throw err;
                }
                else {
                    //console.log(result);
                    res.render('filmlist', {filmlist: result});
                    connection.release();
                    //conn.end();
                }
            });// andmebaasi osa loppeb
        }// pool getConnection callback loppeb
    });// pool getConnection loppeb
    
});
app.get('/eestifilm/addfilmperson', (req, res)=>{
    res.render('addfilmperson');
});

app.post('/eestifilm/addfilmperson', (req, res)=>{
    //res.render('addfilmperson');
    //res.send('req.body');   // veebi kontroll
    let notice = ''
    let sql = 'INSERT INTO person (first_name, last_name, birth_date) VALUES (?,?,?)';
    pool.getConnection((err, connection)=>{
        if(err){
            connection.release();
            throw err;
        }
        else {
            // andmebaasi osa
            connection.execute(sql, [req.body.firstNameInput, req.body.lastNameInput, req.body.birthDateInput], (err, result)=>{
                if (err) {
                    notice = 'Andmete salvestamine ebaõnnestus';
                    res.render('addfilmperson', {notice: notice});
                    connection.release();
                    throw err;
                }
                else {
                    notice = req.body.firstNameInput + ' ' + req.body.lastNameInput + ' salvestamine õnnestus';
                    res.render('addfilmperson', {notice: notice});
                    connection.release();
                }
            });// andmebaasi osa loppeb
        }// pool getConnection callback loppeb
    });// pool getConnection loppeb
});

app.get('/eestifilm/addfilmrelation', (req, res)=>{
    // kasutades async moodulit paneme mitu tegevust paralleelselt toole
    // koigepealt loome tegevuste loendi
    const myQueries = [
        function(callback){
            pool.getConnection((err, connection)=>{
                if(err){
                    connection.release();
                    throw err;
                }
                else {
                    // andmebaasi osa
                    connection.execute('SELECT id, first_name, last_name FROM person', (err, result)=>{
                        if(err){
                            connection.release();
                            return callback(err);
                        }
                        else {
                            connection.release();
                            return callback(null, result);
                        }
                    });// andmebaasi osa loppeb
                }// pool getConnection callback loppeb
            });// pool getConnection loppeb
            
        },
        function(callback){
            pool.getConnection((err, connection)=>{
                if(err){
                    connection.release();
                    throw err;
                }
                else {
                    // andmebaasi osa
                    connection.execute('SELECT id, title FROM movie', (err, result)=>{
                        if(err){
                            connection.release();
                            return callback(err);
                        }
                        else {
                            connection.release();
                            return callback(null, result);
                        }
                    });// andmebaasi osa loppeb
                }// pool getConnection callback loppeb
            });// pool getConnection loppeb
            

        },
        function(callback){
            pool.getConnection((err, connection)=>{
                if(err){
                    connection.release();
                    throw err;
                }
                else {
                    // andmebaasi osa
                    connection.execute('SELECT id, position_id FROM person_in_movie', (err, result)=>{
                        if(err){
                            connection.release();
                            return callback(err);
                        }
                        else {
                            connection.release();
                            return callback(null, result);
                            
                        }
                    });// andmebaasi osa loppeb
                }// pool getConnection callback loppeb
            });// pool getConnection loppeb
            

        } // veel ja jargmine function jne
    ];
    // paneme koik tegevused paralleelselt toole, tulemuseks list (array) uhistest tulemustest
    async.parallel(myQueries, (err, results)=>{
        if(err){
            throw err;
        }
        else {
            // siin koik asjad mis on vaja teha
            // console.log(results);
        }
    });

    res.render('addfilmrelation');
});

app.get('/eestifilm/singlemovie', (req, res) => {
    let movieID = req.query.singleMovieInput;

    if (movieID === undefined) {

        res.status(400).send('Vajalik filmi id');
        return;
    }
    let sqlCount = 'SELECT COUNT(id) AS movieCount FROM movie WHERE id = ?';
    pool.getConnection((err, connection)=>{
        if(err){
            connection.release();
            throw err;
        }
        else {
            // andmebaasi osa
            connection.execute(sqlCount, [movieID], (err, countResult) => {
                if (err) {
                    connection.release();
                    throw err;
                } else {
                    const movieCount = countResult[0].movieCount;
                    res.render('singlemovie', { movieCount });
                    connection.release();
                }
            });// andmebaasi osa loppeb
        }// pool getConnection callback loppeb
    });// pool getConnection loppeb
});

app.get('/photoupload', checkLogin, (req, res)=>{
    res.render('photoupload');
});

app.post('/photoupload', upload.single('photoInput'), (req, res)=>{
    let notice = '';
    console.log(req.file);
    console.log(req.body);
    // image/jpeg   image/png   image/gif
    const fileName = 'vp_' + Date.now() + '.jpg';
    //fs.rename(req.file.path, './public/gallery/orig/' + req.file.originalname, (err)=>{
    fs.rename(req.file.path, './public/gallery/orig/' + fileName, (err)=>{
        console.log('faili laadimisel viga' + err);
    });
    // loome kaks väiksema mõõduga pildivarianti
    sharp('./public/gallery/orig/' + fileName).resize(100,100).jpeg({quality: 90}).toFile('./public/gallery/thumbs/' + fileName);

    sharp('./public/gallery/orig/' + fileName).resize(800,600).jpeg({quality: 90}).toFile('./public/gallery/normal/' + fileName);

    // foto andmed andmetabelisse
    let sql = 'INSERT INTO vpgallery (filename, originalname, alttext, privacy, userid) VALUES(?,?,?,?,?)';
    const userid = 1;
    pool.getConnection((err, connection)=>{
        if(err){
            connection.release();
            throw err;
        }
        else {
            // andmebaasi osa
            connection.execute(sql, [fileName, req.file.originalname, req.body.altInput, req.body.privacyInput, userid], (err, result)=>{
                if(err) {
                    notice = 'Foto salvestamine ebaõnnestus';
                    res.render('photoupload', {notice: notice});
                    connection.release();
                    throw err;
                }
                else {
                    notice = 'Foto ' + req.file.originalname + ' laeti üles';
                    res.render('photoupload', {notice: notice});
                    connection.release();
                }
            });// andmebaasi osa loppeb
        }// pool getConnection callback loppeb
    });// pool getConnection loppeb
    
});
app.get('/photogallery', (req, res)=> {
	let photoList = [];
    let privacy = 3;
    if(req.session.userId){
        privacy = 2;
    };
	let sql = 'SELECT id, filename, alttext FROM vpgallery WHERE privacy >= ? AND deleted IS NULL ORDER BY id DESC';

    // andmebaasi uhendus pool'i kaudu
    pool.getConnection((err, connection)=>{
        if(err){
            connection.release();
            throw err;
        }
        else {
            // andmebaasi osa
            connection.execute(sql, [privacy], (err,result)=>{
                if (err){
                    res.render('photogallery', {photoList : photoList});
                    connection.release();
                    throw err;
                }
                else {
                    photoList = result;
                    console.log(result);
                    res.render('photogallery', {photoList : photoList});
                    connection.release();
                }
            });// andmebaasi osa loppeb
        }// pool getConnection callback loppeb
    });// pool getConnection loppeb
});

function checkLogin(req, res, next){
    console.log('kontrollime sisse logimist');
    if(req.session != null){
        if(mySession.userName){
            console.log('seeees');
            // next annab töö edasi
            next();
        }
        else {
            console.log('ei ole seeees');
            res.redirect('/');
        }
    }
    else {
        res.redirect('/');
    }
}

app.listen(5126);
