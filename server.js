
const fs = require('fs');
const bodyParser = require('body-parser');
const botController = require('./bot');
const express = require('express');
const app = express();

// const gridMiddleware = require('./api/middleware/grid-migration');
const corsMiddleware = require('./api/middleware/cors');
const errorHandlerMiddleware = require('./api/middleware/error-handler');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.use(corsMiddleware);
// app.use(gridMiddleware);

let routersDir = require('path').join(__dirname, 'api/routes');
fs.readdirSync(routersDir).forEach(file => {
    require('./api/routes/' + file)(app, botController);
});

app.use(errorHandlerMiddleware.notFound);
app.use(errorHandlerMiddleware.internalError);

module.exports = app;