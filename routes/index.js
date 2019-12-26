var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');

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
    res.render('login', { title: 'student Records',msg:msg,username:user,});
  })
})



router.get('/logout', function(req, res, next) {
  localStorage.removeItem('userToken');
  localStorage.removeItem('loginUser');
  res.redirect('/');
});
module.exports = router;
