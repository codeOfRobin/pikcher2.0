'use strict';

var express = require('express')
var http = require('http');
var api = require('instagram-node').instagram();
var Parse = require('parse/node');
var uuid = require('node-uuid');
var cookieSession = require('cookie-session')

Parse.initialize("C9g2ActjM4VwIkIrP11wBuM5MJAaCpwytqq5KnlT", "itK5GZLqJ9zhk6in27OzfKUK3uVWtPowtaPsXTrr");

var app = express();

app.use('/static', express.static(__dirname + '/public'))
app.set('view engine', 'jade');
app.set('views', __dirname + '/templates');

app.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2']
}))

var redirect_uri = "http://127.0.0.1:3000/auth/instagram/callback"



api.use({
    client_id: "127e562651134461a7dbfeaedecda43a",
    client_secret: "f973439e8e5f4da3a54e906ccbf98912"
});

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
    api.use({
        client_id: "127e562651134461a7dbfeaedecda43a",
        client_secret: "f973439e8e5f4da3a54e906ccbf98912"
    });
    res.redirect(api.get_authorization_url(redirect_uri, { scope: ['likes','public_content'], state: 'a state' }));
});

app.get('/auth/instagram/callback',function(req, res,next)
{
    req.url = '/admin'
    next()
});

app.get('/admin',function(req,res)
{
    api.use({
        client_id: "127e562651134461a7dbfeaedecda43a",
        client_secret: "f973439e8e5f4da3a54e906ccbf98912"
    });
    var accessCode = req.session.accessCode || req.query.code

    if (!accessCode)
    {
        res.redirect('login')
        res.end();
    }
    else
    {
        // req.session.accessCode = accessCode
        api.authorize_user(accessCode, redirect_uri, function(err, result)
        {
            if (err)
            {
                console.log(err);
                res.send("Didn't work");
            } else
            {
                console.log('Yay! Access token is ' + result.access_token);
                api.use({ access_token: result.access_token });
                api.user_media_recent(result.user.id, [,] ,function(err, medias, pagination, remaining, limit)
                {
                    var photos = []
                    for (var i=0 ; i<medias.length; i+=1)
                    {
                        photos.push(medias[i].images.standard_resolution.url)
                        var Photo = Parse.Object.extend("Photo");
                        var photo = new Photo()
                        photo.set("url",medias[i].images.standard_resolution.url)
                        photo.set("user",result.user.id)
                        photo.save(null, {
                            success: function(photo) {
                                // Execute any logic that should take place after the object is saved.
                                // alert('New object created with objectId: ' + photo.id);
                            },
                            error: function(photo, error) {
                                // Execute any logic that should take place if the save fails.
                                // error is a Parse.Error with an error code and message.
                                // alert('Failed to create new object, with error code: ' + error.message);
                            }
                        });
                    }
                    console.log(photos);
                    console.log(result.user);

                    res.render('account',{photos:photos,user:result.user})
                });
            }
        });
    }

});

app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});


app.listen(3000, function() {
    console.log("The frontend server is running on port 3000!");
});
