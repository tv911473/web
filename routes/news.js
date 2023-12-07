const express = require('express');
// loome oma rakenduse sees toimiva miniapi
const router = express.Router(); // Suur algustaht "R" on oluline!
const pool = require('../src/databasepool').pool;

// kuna siin on miniapp router, siis koik marsruudid on temaga seotud, mitte app'iga
// kuna koik siinsed marsruudid algavad "/news", siis selle jatame ara
router.get('/', (req, res)=> {
    res.render('news');
});

router.get('/add', (req, res)=> {
    res.render('addnews');
});

router.post('/add', (req, res)=>{
    let notice = ''
    let sql = 'INSERT INTO vpnews (title, content, expire, userid) VALUES (?,?,?,1)';
    pool.getConnection((err, connection)=>{
        if(err){
            connection.release();
            throw err;
        }
        else {
            // andmebaasi osa
            connection.execute(sql, [req.body.titleInput, req.body.contentInput, req.body.expireInput], (err, result)=>{
                if (err) {
                    notice = 'Andmete salvestamine ebaõnnestus';
                    res.render('addnews', {notice: notice});
                    connection.release();
                    throw err;
                }
                else {
                    notice = req.body.titleInput + ' salvestamine õnnestus';
                    res.render('addnews', {notice: notice});
                    connection.release();
                }
            });// andmebaasi osa loppeb
        }// pool getConnection callback loppeb
    });// pool getConnection loppeb
    
});

router.get('/read', (req, res)=> {
    let sql = 'SELECT * FROM vpnews WHERE expire > CURRENT_DATE AND deleted IS NULL ORDER BY id DESC';
    let sqlResult = [];
    pool.getConnection((err, connection)=>{
        if(err){
            connection.release();
            throw err;
        }
        else {
            // andmebaasi osa
            connection.execute(sql, (err, result)=>{
                if (err){
                    res.render('readnews', {newsList: sqlResult});
                    connection.release();
                    //conn.end();
                    throw err;
                }
                else {
                    //console.log(result);
                    res.render('readnews', {newsList: result});
                    connection.release();
                    //conn.end();
                }
            });// andmebaasi osa loppeb
        }// pool getConnection callback loppeb
    });// pool getConnection loppeb
    
});

router.get('/read/:id', (req, res)=> {
    //res.render('readnews');
    let newSQL = 'SELECT * FROM vpnews WHERE id = ? AND deleted IS NULL';
    let newID = req.params.id;
    pool.getConnection((err, connection)=>{
        if(err){
            connection.release();
            throw err;
        }
        else {
            // andmebaasi osa
            connection.execute(newSQL, [newID], (err, result) => {
                if (err) {
                    connection.release();
                    throw err;
                } else {
                    if (result.length > 0) {
                        res.render('singlenews', {news: result[0]});
                        connection.release();
                    }else {
                        connection.release();
                        throw err;
                    }
                }
            });// andmebaasi osa loppeb
        }// pool getConnection callback loppeb
    });// pool getConnection loppeb
    
});

module.exports = router;