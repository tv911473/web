const express = require('express');
const fs = require('fs');
const app = express();
const mysql = require('mysql2');
const timeInfo = require('./datetime_func');
const dbInfo = require('../../vp23config');
const bodyparser = require('body-parser');
const dataBase = ('if23_taavi_ve')
// fotode laadimiseks
const multer = require('multer');
// seadistame vahevara (middleware), mis määrab üleslaadimise kataloogi
const upload = multer({dest: './public/gallery/orig/'});
const sharp =require('sharp');
const async = require('async');

app.set('view engine', 'ejs');
app.use(express.static('public'));
// järgnev kui ainult text siis "false", kui ka pilte ja muud siis "true"
app.use(bodyparser.urlencoded({extended: true}));

// loon andmebaasiga yhenduse
const conn = mysql.createConnection({
    host: dbInfo.configData.host,
    user: dbInfo.configData.user,
    password: dbInfo.configData.password,
    database: dataBase
});
// avalehel
app.get('/', (req, res)=>{
    res.render('index');    //res.render sama mis res.end
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

    conn.execute(sql, (err, result)=>{
        if (err){
            res.render('filmlist', {filmlist: sqlResult});
            //conn.end();
            throw err;
        }
        else {
            //console.log(result);
            res.render('filmlist', {filmlist: result});
            //conn.end();
        }
    });
});
app.get('/eestifilm/addfilmperson', (req, res)=>{
    res.render('addfilmperson');
});

app.get('/eestifilm/addfilmrelation', (req, res)=>{
    // kasutades async moodulit paneme mitu tegevust paralleelselt toole
    // koigepealt loome tegevuste loendi
    const myQueries = [
        function(callback){
            conn.execute('SELECT id, first_name, last_name FROM person', (err, result)=>{
                if(err){
                    return callback(err);
                }
                else {
                    return callback(null, result);
                }
            });

        },
        function(callback){
            conn.execute('SELECT id, title FROM movie', (err, result)=>{
                if(err){
                    return callback(err);
                }
                else {
                    return callback(null, result);
                }
            });

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

app.post('/eestifilm/addfilmperson', (req, res)=>{
    //res.render('addfilmperson');
    //res.send('req.body');   // veebi kontroll
    let notice = ''
    let sql = 'INSERT INTO person (first_name, last_name, birth_date) VALUES (?,?,?)';
    conn.execute(sql, [req.body.firstNameInput, req.body.lastNameInput, req.body.birthDateInput], (err, result)=>{
        if (err) {
            notice = 'Andmete salvestamine ebaõnnestus';
            res.render('addfilmperson', {notice: notice});
            throw err;
        }
        else {
            notice = req.body.firstNameInput + ' ' + req.body.lastNameInput + ' salvestamine õnnestus';
            res.render('addfilmperson', {notice: notice});
        }
    });
});
app.get('/eestifilm/singlemovie', (req, res)=>{
    let sqlCount = 'SELECT COUNT(id) FROM movie';
    let movieID = req.params.id;

    conn.execute(sqlCount,[movieID] , (err, countResult)=>{
        if (err){
            res.render('singlemovie', {singlemovie: countResult});
            //conn.end();
            throw err;
        }
        else {
            //console.log(result);
            const movieCount = countResult[0].movieCount;
            res.render('filmindex', {movieCount});
            //conn.end();
        }
    });
});

app.get('/news', (req, res)=> {
    res.render('news');
})

app.get('/news/add', (req, res)=> {
    res.render('addnews');
})

app.post('/news/add', (req, res)=>{
    //res.render('addfilmperson');
    //res.send('req.body');   // veebi kontroll
    let notice = ''
    let sql = 'INSERT INTO vpnews (title, content, expire, userid) VALUES (?,?,?,1)';
    conn.execute(sql, [req.body.titleInput, req.body.contentInput, req.body.expireInput], (err, result)=>{
        if (err) {
            notice = 'Andmete salvestamine ebaõnnestus';
            res.render('addnews', {notice: notice});
            throw err;
        }
        else {
            notice = req.body.titleInput + ' salvestamine õnnestus';
            res.render('addnews', {notice: notice});
        }
    });
});

app.get('/news/read', (req, res)=> {
    let sql = 'SELECT * FROM vpnews WHERE expire > CURRENT_DATE AND deleted IS NULL ORDER BY id DESC';
    let sqlResult = [];

    conn.execute(sql, (err, result)=>{
        if (err){
            res.render('readnews', {newsList: sqlResult});
            //conn.end();
            throw err;
        }
        else {
            //console.log(result);
            res.render('readnews', {newsList: result});
            //conn.end();
        }
    });
});

app.get('/news/read/:id', (req, res)=> {
    //res.render('readnews');
    let newSQL = 'SELECT * FROM vpnews WHERE id = ? AND deleted IS NULL';
    let newID = req.params.id;
    conn.execute(newSQL, [newID], (err, result) => {
        if (err) {
            throw err;
        } else {
            if (result.length > 0) {
                res.render('singlenews', {news: result[0]});
            }else {
                throw err;
            }
        }
    });
});

// app.get('/news/read/:id/:lang', (req, res)=> {
//     //res.render('readnews');
//     console.log(req.params);
//     console.log(req.execute);
//     res.send('Tahame uudist mille id on: ' + req.params.id);
// })

app.get('/photoupload', (req, res)=>{
    res.render('photoupload');
});

app.post('/photoupload', upload.single('photoInput'), (req, res)=>{
    let notice = '';
    console.log(req.file);
    console.log(req.body);
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
    conn.execute(sql, [fileName, req.file.originalname, req.body.altInput, req.body.privacyInput, userid], (err, result)=>{
        if(err) {
            notice = 'Foto salvestamine ebaõnnestus';
            res.render('photoupload', {notice: notice});
            throw err;
        }
        else {
            notice = 'Foto ' + req.file.originalname + ' laeti üles';
            res.render('photoupload', {notice: notice});
        }
    });
});
app.get('/photogallery', (req, res)=> {
	let photoList = [];
	let sql = 'SELECT id,filename,alttext FROM vpgallery WHERE privacy > 1 AND deleted IS NULL ORDER BY id DESC';
	conn.execute(sql, (err,result)=>{
		if (err){
            res.render('photogallery', {photoList : photoList});
			throw err;
		}
		else {
			photoList = result;
			console.log(result);
			res.render('photogallery', {photoList : photoList});
		}
	});
});

app.listen(5126);
