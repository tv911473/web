const express = require('express');
const app = express();

app.set('view engine', 'ejs')

app.get('/', (req, res)=>{
    //res.send('working!');
    //res.download('index.js');   // viiruste saatmiseks (auto download)
    res.render('index');
});

app.get('/test', (req, res)=>{
    res.send('working again!');

});

app.listen(5126);
