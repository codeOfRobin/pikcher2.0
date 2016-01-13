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

var InstagramStrategy = require('passport-instagram').Strategy
mongoose.connect("mongodb://localhost:27017/pikcher")

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
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

passport.use(new InstagramStrategy({
    clientID: "33936fbd12974e9a971d4e9e67215004",
    clientSecret: "47a85c5d839746da9b5eaf0c114c21d0",
    callbackURL: "http://127.0.0.1:3000/auth/instagram/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
        User.findOne({ 'instaID' : profile.id }, function(err, user) {
            if (err)
            {
                return done(err)
            }

            if(user)
            {
                return done(null, user)
            }
            else
            {
                var newUser = new User()
                newUser.instaID = profile.id
                newUser.displayName = profile.displayName
                newUser.username = profile.username
                newUser.profilePictureURL = profile._json.data.profile_picture
                newUser.token = accessToken

                newUser.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, newUser);
                });
            }

        })
    });
  }
));




app.get('/', function(req, res)
{
    res.render('index.jade'); // load the index.ejs file
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

app.get('/subscription/callback',function (req,res)
{
    console.log(req.query)
	res.send(req.query["hub.challenge"])
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
