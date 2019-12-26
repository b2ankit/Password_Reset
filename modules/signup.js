var mongoose = require('mongoose');


bodyparser = require("body-parser");

mongoose.connect('mongodb://localhost:27017/password_forget',{useNewUrlParser: true, useUnifiedTopology: true})


var conn = mongoose.Connection;

var signupSchema = new mongoose.Schema({
    name:String,
    email:String,
    password:String,
    
});

var signupModel = mongoose.model('login',signupSchema);

module.exports=signupModel;