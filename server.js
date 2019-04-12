
const fs = require('fs');
const bodyParser = require('body-parser');
const botController = require('./bot');
const express = require('express');
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'POST');
        return res.status(200).json({});
    }
    next();
});

let routersDir = require('path').join(__dirname, 'api/routes');

fs.readdirSync(routersDir).forEach(file => {
    require('./api/routes/' + file)(app, botController);
});

// error handling
app.use((req, res, next) => {
    const err = new Error('not found!!');
    err.status = 404;
    next(err);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500).json({
        status: error.status || 500,
        message: error.message
    });
});

module.exports = app;