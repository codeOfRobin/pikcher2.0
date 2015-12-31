'use strict';

var express = require('express');

var app = express();

app.use('/static', express.static(__dirname + '/public'))

app.set('view engine', 'jade');
app.set('views', __dirname + '/templates');

app.get('/', function(req, res)
{
	var path = req.path
	res.locals.path = path
	res.render('index');
});

app.listen(3000, function() {
	console.log("The frontend server is running on port 3000!");
});
