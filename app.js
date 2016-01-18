var express = require("express")
var app = express()
var mongoose = require("mongoose")
var passport = require("passport")
var flash = require("connect-flash")
var morgan       = require('morgan');
var session      = require('express-session');
var router       = express.Router()
var bodyParser   = require('body-parser');
var flash = require("connect-flash")
var Parse = require('parse/node');
var InstagramStrategy = require('passport-instagram').Strategy
mongoose.connect("mongodb://localhost:27017/pikcher")
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


var userSchema = mongoose.Schema({
    instaID : String,
    displayName : String,
    username : String,
    profilePictureURL : String,
    token : String
});
var User = mongoose.model('User', userSchema);
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
                user.signUp(null, {
                    success: function(user) {
                        // Hooray! Let them use the app now.
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

app.get('/profile', isLoggedIn, function(req, res) {
    res.render('profile.jade', {
        user : req.user // get the user out of session and pass to template
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
