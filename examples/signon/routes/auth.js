var express = require('express')
  , router = express.Router()
  , passport = require('passport')
  , { OPENID_RETURN_URL, OPENID_REALM } = require('../conf');

var logger = require('winston');

// GET /auth/steam
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Steam authentication will involve redirecting
//   the user to steamcommunity.com.  After authenticating, Steam will redirect the
//   user back to this application at /auth/steam/return
router.get('/steam', function(req, res, next) {
    if (!req.query.realm || !req.query.returnURL) {
      logger.warn('missing one of realm and returnURL query parameter, fallback to strategy default realm and returnURL');
      req.query.realm = OPENID_REALM;
      req.query.returnURL = OPENID_RETURN_URL;
    }

    var authenticator = passport.authenticate('steam', { failureRedirect: '/', session: false});
    authenticator(req, res, next);
  });

// GET /auth/steam/return
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
router.get('/steam/return',
  // Issue #37 - Workaround for Express router module stripping the full url, causing assertion to fail 
  function(req, res, next) {
      req.url = req.originalUrl;
      next();
  }, 
  passport.authenticate('steam', { failureRedirect: '/', session: false }),
  function(req, res) {
    res.status(200).json(req.user);
  });

router.get('/steam/profile', function(req, res) {
  var id = req.query.id;
  router.strat.getUserProfile(id, function(err, profile) {
    if(err) {
      logger.error('get user profile error - ', err);
      res.sendStatus(400);
    } else {
      res.status(200).json(profile);
    }
  });
});

module.exports = router;