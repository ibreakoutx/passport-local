
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var flash = require('connect-flash');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.bodyParser());
app.use(express.cookieParser('thisismysecret'));
app.use(express.session());
app.use(flash());

//Passport stuff
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

var USERS = {
    vjs : 'vjspass' ,
    jay : 'jaypass' 
};

//Passport setup
passport.use( new LocalStrategy(
    function( username, password, done) {
	if ( USERS.hasOwnProperty(username) ) {
	    if ( USERS[username] == password ) 
		return done(null, username);
	    else
		return done(null, false, {message:'Incorrect password'});
	}
	else {
	    return done(null, false, {message:'User does not exist'});
	}
    })
);	    

//You may want to only pass the ID back and forth in the session
passport.serializeUser( function(user,done) {
    done(null,user);
});

passport.deserializeUser( function(user,done) {
    done(null,user);
});

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/logout', function(req,res) {
    req.logout();
    res.redirect('/');
});

function isAuthenticated(req,res,next) {
    console.log("req.user = " + req.user);

//    if (req.user != null)
    if ( req.isAuthenticated() )
	next();
    else {
	console.log("Unauthorized access: Not logged in");
	res.render('notauthorized.jade');
    }
}

app.get('/content',isAuthenticated,
	function(req,res) {
	    res.render('content.jade');
	});

app.get('/content2',isAuthenticated,
	function(req,res) {
	    res.render('content2.jade');
	});

app.post('/postit', passport.authenticate('local',
		{successRedirect: '/content',
		 failureRedirect: '/',
		 failureFlash:true }
	  )
	);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

