const express = require('express');
const timeInfo = require('./datetime_en');
const fs = require('fs');
const app = express();


app.set('view engine', 'ejs')
app.use(express.static('public'));

app.get('/', (req, res)=>{
    res.render('index');    //res.render sama mis res.end
});

app.get('/timenow', (req, res)=>{
    const dateNow = timeInfo.dateOfTodayEn();
    const timeNow = timeInfo.timeOfTodayEn();
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
app.listen(5126);
