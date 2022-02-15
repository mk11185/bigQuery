const express = require('express');
var bodyParser = require('body-parser');
require('dotenv').config()
const multer = require("multer");
const route = require('./route');

const app = express();

app.use(bodyParser.json());
// app.use(multer().any());
app.use(bodyParser.urlencoded({ extended: true }));


app.use('/',route);

app.listen(process.env.PORT || 3000, function() {
	console.log('Express app running on port ' + (process.env.PORT || 3000))
});
