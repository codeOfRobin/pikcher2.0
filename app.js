'use strict';

var express = require('express')
var http = require('http');
var api = require('instagram-node').instagram();
var Parse = require('parse/node');
Parse.initialize("C9g2ActjM4VwIkIrP11wBuM5MJAaCpwytqq5KnlT", "itK5GZLqJ9zhk6in27OzfKUK3uVWtPowtaPsXTrr");

var app = express();

app.use('/static', express.static(__dirname + '/public'))

app.set('view engine', 'jade');
app.set('views', __dirname + '/templates');
api.use({
    client_id: "127e562651134461a7dbfeaedecda43a",
    client_secret: "f973439e8e5f4da3a54e906ccbf98912"
});

var redirect_uri = "http://127.0.0.1:3000/auth/instagram/callback"

exports.handleauth =


app.get('/', function(req, res)
{
    res.render('index',{user:req.user});
});

app.get('/login', function(req, res)
{
    res.render('login', { user: req.user });
});

app.get('/auth/instagram',function(req, res)
{
    res.redirect(api.get_authorization_url(redirect_uri, { scope: ['likes'], state: 'a state' }));
});

app.get('/auth/instagram/callback',function(req, res)
{
    api.authorize_user(req.query.code, redirect_uri, function(err, result)
    {
        console.log(result);
        if (err)
        {
            console.log(err.body);
            res.send("Didn't work");
        } else
        {
            console.log('Yay! Access token is ' + result.access_token);
            res.send('You made it!!');
        }
    });
});
app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});


app.listen(3000, function() {
    console.log("The frontend server is running on port 3000!");
});
