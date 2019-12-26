var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");

//Require node localStorage npm
if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

//Require login module of Students
var singupModel=require('../modules/signup');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Password_Reset',username:"" });
});

router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Password_Reset',username:"",msg:null});
});


router.post('/login',function(req,res,next){
 
  var email=req.body.email;
  var password=req.body.password;

  var loginFilter = singupModel.findOne({$and:[{email:email},{password:password}]});
  loginFilter.exec(function(err,data){
    if(err)throw err;
    else
    { 
      if(data !==null){
      var user = data.name;
      var id = data.id;

      //start the token
      var token = jwt.sign({userId:id},'LoginToken');

      //save signin Token in local Storage
      localStorage.setItem('userToken',token);

      //Save login username in Local Storage
      localStorage.setItem('loginUser',user);
      res.render('index',{title:'Student Records',username:user});
      // res.redirect('/');
    }
    else{
      var msg = 'Invalid Username/Password' 
      
      res.render('login',{title:'Student Records',msg:msg,username:user})
      
    }
   
  }
  })

})

router.get('/signup', function(req, res, next) {
  res.render('signup', { title: 'Password_Reset' });
});

router.post('/signup',function(req,res,next){
  var signupDetails = new singupModel({
    name:req.body.name,
    email:req.body.email,
    password:req.body.password,
  })
  signupDetails.save(function(err,res1){
    if(err) throw err;
    var msg = 'Sign Up Done Plzz login'
    var user = localStorage.getItem('loginUser');
    res.render('login', { title: 'Password_reset',msg:msg,username:user,});
  })
})

router.get('/forget',function(req,res,next){
  res.render('forget',{title:'Password_Reset',msg:null})
});


router.post('/forget', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      singupModel.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          // req.flash('error', 'No account with that email address exists.');
          console.log('Inavlid Email');
          // return res.render('/forget',{title:'Password_Reset',msg:'Invalid Email ID'});
          return res.redirect('/forget');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        singupModel.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'ankit19351@gmail.com',
          pass: process.env.GMAILPW
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'ankit19351@gmail.com',
        subject: 'Node.js Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        console.log('mail sent');
        req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forget');
  });
});





router.get('/logout', function(req, res, next) {
  localStorage.removeItem('userToken');
  localStorage.removeItem('loginUser');
  res.redirect('/');
});
module.exports = router;
