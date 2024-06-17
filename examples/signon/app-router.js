/**
 * Basic example demonstrating passport-steam usage within Express framework
 * This example uses Express's router to separate the steam authentication routes
 */
var express = require('express')
  , passport = require('passport')
//  , util = require('util')
//  , session = require('express-session')
  , SteamStrategy = require('../../').Strategy
  , authRoutes = require('./routes/auth')
  , { OPENID_RETURN_URL, OPENID_REALM, STEAM_API_KEY, OPENID_IDENTIFIER_FIELD } = require('./conf');

var { logger } = require('./logger.js');

var morgan = require('morgan');
var morganMiddleware = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  {
    stream: {
      // Configure Morgan to use our custom logger with the http severity
      write: (message) => logger.info(message.trim()),
    },
  }
);

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Steam profile is serialized
//   and deserialized.
// passport.serializeUser(function(user, done) {
//   done(null, user);
// });
// 
// passport.deserializeUser(function(obj, done) {
//   done(null, obj);
// });

var strat = new SteamStrategy({
    returnURL: OPENID_RETURN_URL,
    realm: OPENID_REALM,
    apiKey: STEAM_API_KEY,
    identifierField: OPENID_IDENTIFIER_FIELD
  },
  function(identifier, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      logger.info('steam profile info', profile);
      // To keep the example simple, the user's Steam profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Steam account with a user record in your database,
      // and return that user instead.
      profile.identifier = identifier;
      return done(null, profile);
    });
  }
);

authRoutes.strat = strat;

// Use the SteamStrategy within Passport.
//   Strategies in passport require a `validate` function, which accept
//   credentials (in this case, an OpenID identifier and profile), and invoke a
//   callback with a user object.
passport.use(strat);

var app = express();

app.use(morganMiddleware);

// configure Express
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// app.use(session({
//     secret: 'your secret',
//     name: 'name of session id',
//     resave: true,
//     saveUninitialized: true}));

// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
// app.use(passport.session());
app.use(express.static(__dirname + '/../../public'));

// app.get('/', function(req, res){
//   res.render('index', { user: req.user });
// });
// 
// app.get('/account', ensureAuthenticated, function(req, res){
//   res.render('account', { user: req.user });
// });
// 
// app.get('/logout', function(req, res){
//   req.logout();
//   res.redirect('/');
// });

// See views/auth.js for authentication routes
app.use('/auth', authRoutes);

// health check for infra
app.get('/health', function(req, res){
  res.sendStatus(200);
});

app.listen(3000);

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
// function ensureAuthenticated(req, res, next) {
//   if (req.isAuthenticated()) { return next(); }
//   res.redirect('/');
// }