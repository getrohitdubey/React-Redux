var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var router = express.Router();


/*router.get('/',ensureLocalAuthenticated, (req, res) => {
    res.render('index', { user : req.user });
});*/

router.get('/', (req, res) => {
    res.render('index', {user:{name:""} });
});

router.get('/register', (req, res) => {
    res.render('register', { });
});

router.post('/register', (req, res, next) => {
    Account.register(new Account({ username : req.body.username }), req.body.password, (err, account) => {
        if (err) {
          return res.render('register', { error : err.message });
        }

        passport.authenticate('local')(req, res, () => {
            req.session.save((err) => {
                if (err) {
                    return next(err);
                }
                res.redirect('/');
            });
        });
    });
});

function ensureLocalAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { 
      // res.render('index.html');
      return next(); 
    }else{
   // res.redirect('/login');
    res.redirect('/login');
    }

}


router.get('/login', (req, res) => {
    res.render('login', { user : req.user, error : "error"});
});

router.post('/login',
  passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/login',
                                   failureFlash: false })
);


/*router.post('/services/UpsertPlace', function(request, response){
  console.log(request.body);      // your JSON
   response.send(request.body);    // echo the result back
});*/

/*router.post('/login', passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }), (req, res, next) => {
  
    req.session.save((err) => {
        if (err) {
            return next(err);
        }
        console.log("login ok");
        //res.redirect('/');
        res.render('index', { user : req.user });
    });
});*/

router.post('/logout', (req, res, next) => {
    req.logout();
    res.redirect('/');
});

router.get('/ping', (req, res) => {
    res.status(200).send("pong!");
});

router.get('/property', (req, res) => {
    res.render('property', {user:{name:""} });
});

router.get('/property*', (req, res) => {
    res.render('property', {user:{name:""} });
});

module.exports = router;