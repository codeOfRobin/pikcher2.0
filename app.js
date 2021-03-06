var express = require("express")
var app = express()
var passport = require("passport")
var flash = require("connect-flash")
var morgan       = require('morgan');
var session      = require('express-session');
var router       = express.Router()
var bodyParser   = require('body-parser');
var flash = require("connect-flash")
var Parse = require('parse/node');
var InstagramStrategy = require('passport-instagram').Strategy
var request = require('request')
var async = require('async')

Parse.initialize("8e83FbokMa5bCPDwhKOmcRejQQyEkVbCrmH0yQfB", "iwnQEHQPv8fc8aUw1LNC4xgVNX7bDX6Uostvd2tp");
app.use(morgan('dev'));
app.use(bodyParser());
app.set('view engine', 'jade');
app.use(session({ secret: 'ilovescotchscotchyscotchscotch' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.set('views',__dirname + '/templates');
app.use('/static',express.static(__dirname + '/static'))

passport.serializeUser(function(user, done)
{
	done(null, user.id);
});
passport.deserializeUser(function(id, done)
{
	var query = new Parse.Query(Parse.User);
	query.equalTo("objectId", id);
	query.find({
		success: function(results) {
			// results is an array of Parse.Object.
			if(results.length>0)
			{
				return done(null,results[0])
			}
		},

		error: function(error) {
			// error is an instance of Parse.Error.
		}
	});
});

passport.use(new InstagramStrategy({
	clientID: "33936fbd12974e9a971d4e9e67215004",
	clientSecret: "47a85c5d839746da9b5eaf0c114c21d0",
	callbackURL: "http://127.0.0.1:3000/auth/instagram/callback",
	scope: ['likes','public_content']
},
function(accessToken, refreshToken, profile, done) {

	var query = new Parse.Query(Parse.User);
	query.equalTo("instaID", profile.id);
	query.find({
		success: function(results) {
			// results is an array of Parse.Object.
			if(results.length>0)
			{
				return done(null,results[0])
			}
			else
			{
				var user = new Parse.User();
				user.set("username", profile.username);
				user.set("instaID", profile.id);
				user.set("displayName", profile.displayName);
				user.set("profilePictureURL", profile._json.data.profile_picture);
				user.set("token", accessToken);
				user.set("password","asdkfhksadfhksdfhksadufhier7ghvuirtybvdfgjkhgk4uy5t84587")
				user.set("imported","false")
				user.signUp(null, {
					success: function(user) {
						// Hooray! Let them use the app now.
						async.series([
							function(callback){
								getUserMedia(profile.id,accessToken)
							}
						],
						function(err,results)
						{

						}
					)
					return done(null, user);
				},
				error: function(user, error) {
					// Show the error message somewhere and let the user try again.
				}
			});
		}
	},

	error: function(error) {
		// error is an instance of Parse.Error.
	}
});
}
));

function savePhotos(url,userID)
{
    request(url, function(error, response, body) 
    {
		var photos = []
		var images = JSON.parse(body)
		for (var i=0 ; i<images.data.length ; i++)
		{
			var Photo = Parse.Object.extend("Photo")
			var photo = new Photo()
			photo.set("url",images.data[i].images.standard_resolution.url)
			photo.set("user",userID)
			photos.push(photo)
		}
        if(!images.pagination)
        {
            savePhotos(images.pagination.next_url,userID)
        }
        else
        {
            var query = new Parse.Query(Parse.User);
            query.equalTo("instaID", userID);
            query.find({
                success: function(results) {
                    var currentUser = results[0]
                    currentUser.set("imported",true)
                    currentUser.save()
                },

                error: function(error) {
                    // error is an instance of Parse.Error.
                }
            });
        }
		Parse.Object.saveAll(photos, {
			success: function(list) {
				console.log("Yay!");
				// All the objects were saved.
			},
			error: function(error) {
				// An error occurred while saving one of the objects.
			},
		});
	});
}

function getUserMedia(userID, token)
{
    savePhotos('https://api.instagram.com/v1/users/'+userID+'/media/recent/?access_token='+token,userID)
}


app.get('/', function(req, res)
{
	res.render('index.jade'); // load the index.ejs file
});
app.post('/', function (req, res) {
	res.send('POST request to homepage');
});
app.get('/auth/instagram',passport.authenticate('instagram'));

app.get('/auth/instagram/callback',
passport.authenticate('instagram', { failureRedirect: '/login' }),
function(req, res) {
	// Successful authentication, redirect home.
	res.redirect('/profile');
});

app.get('/profile', isLoggedIn, function(req, res) 
{
    var query = new Parse.Query(Parse.Object.extend("Photo"));
	query.equalTo("user", req.user.get("instaID"));
	query.find({
		success: function(results) {
			// results is an array of Parse.Object.
            	res.render('profile.jade', {params:{
                    user : req.user,
                    images:results 
                }
                
                // get the user out of session and pass to template
            });
		},

		error: function(error) {
			// error is an instance of Parse.Error.
		}
	});

});

app.get('/logout', function(req, res)
{
	req.logout();
	res.redirect('/');
});

app.post('/subscription/callback',function (req,res)
{
	res.send("done")
})

function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
	return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}

app.listen(3000)
console.log("Chal gaya BC");
