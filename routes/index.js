'use strict'

var mysql=require("mysql");

var db= require('./db');

var db_url=db.dburl;

var db_url=db.db_url

var db_user=db.db_user
var db_host=db.db_host
var db_pass=db.db_pass
var connection=db.connection;

var multer  = require('multer')

var fileUpload = require('express-fileupload');

exports.index=function  (req,res) {
   
	var data={"title":"NPA-SPP",req:req,res:res};
	var dt=new Date()
	data.cyear=dt.getFullYear();
	var rq=req.query.rq;
	var crq=req.query.crq;
	data.mid=req.body.mid;
   var rq=req.query.rq;
   var crq=req.query.crq;
   data.rq=rq;

   if(!rq)
   {
        rq=req.body.rq;
        crq=req.body.crq;
   }
   if(req.cookies.user&&req.cookies.user!="0"){
        
        req.user=req.cookies.user;
    }
   else
        req.user=0
    if(rq=="create-password"){
        req.user=0;
        res.cookie("user","")
    }

   if(req.user&&rq!="reset-password"){
      
     	if(req.user.priv=="hdm")
         return res.redirect("/hdm")
        if(req.user.priv=="hr")
         return res.redirect("/hr")
     	if(req.user.priv=="principal")
         return res.redirect("/principal")
        if(req.user.priv=="staff")
         return res.redirect("/staff")

    }

    if(rq=="register"){
        db.register(data,function () {
            ajres(data)
        })
    }
    else if(rq=="send-reset-code"){
        send_reset_code(data,function () {
           ajres(data)
        })
    }
    else if(rq=="verify-code"){

        verify_code(data,function () {
           ajres(data)
        })
    }
    else if(rq=="verify"){
        verify_code(data,function () {
            res.render("index",data)
        })
     
    }
    else if(rq=="reset-password"){
        reset_password(data,function () {
           ajres(data)
        })
    }
    else if(rq=="create-password"){

        create_password(data,function () {
            ajres(data)
        })
    }
    else
        res.render("index",data)
}
function ajres(data) {
    var req=data.req;var res=data.res;
    data.req=0;data.res=0;
    res.send(data)
}
var footer="<div></br>--<br>Regards!<br><span>Human Resource Directorate, MUBS</span></div>"
function send_reset_code(data,callback) {
    var req=data.req;

    if(data.token){
        var reset_code=db.gen_code(128,1)
        var username=data.email

    }
    else{
        var reset_code=db.gen_code()
        var username=req.query.username;
    }
   

    var arr=[reset_code,username]
    var q="UPDATE users SET reset_code=?,reset_time=now() WHERE email=?"
    connection.query(q,arr,function (err,rst) {
        if(err)
            return console.log(err.sqlMessage)
        if(rst.affectedRows==0)
            data.errmsg="No such email exists"

        else{   
            var message="Your reset code is "+reset_code

            var q="SELECT *FROM users WHERE email=?"
            connection.query(q,[username],function (err,rst) {
                if(err)
                    return console.log(err.sqlMessage)
                var tableid=rst[0].id;

                if(req.user)
                    var userid=req.user.id;
                else
                    var userid=tableid;

                db.log_data(userid,"users",tableid,arr,"Sending reset code");
                var phone=rst[0].phonea;
                var email=rst[0].email;
                var num=phone;
                if(num&&num.startsWith("0")){
                   num="+256"+num.substring(1,num.length)
                    var msg={to:num,message:message};
                }
                if(db.env=="live"||1){
                    //var address=ip.address()
                   if(num){
                        db.send_sms(data,msg)
                   }
                   else
                   {
                    var address="https://hrms.mubs.ac.ug"
                    //address="http://"+address+":3005"
                    if(data.token){
                        var link=address+"?rq=verify&token="+reset_code+"&email="+email
                        var html="<div><p>Please click the link below: <br/><a href=\""+link+"\">"+link+"</a></p></div>"+footer;
                        
                    }
                    else{
                        var html="<div><p>Your password reset code is: <span style='font-size:25px;color:blue'>"+reset_code+"</span></p></div>"+footer;
                    }
                                   
                    var msg={email:email,html:html,subject:"Password Reset Code"}
                
                    db.send_email(data,msg)
                   }
                }
                else
                    console.log(message)
               })
        }
        callback()
    })
}
exports.send_reset_code=send_reset_code

function verify_code(data,callback) {
    var req=data.req;
    var username=req.query.username;
   
    var reset_code=req.query.reset_code;
    if(!reset_code){
        username=req.query.email
        reset_code=req.query.token
    }
    data.username=username
    var tb=req.query.tb;
    
    var q="SELECT *FROM users WHERE reset_code=? AND email=?"
    connection.query(q,[reset_code,username],function (err,rst) {
        if(err)
            return console.log(err.sqlMessage)
       
        if(rst.length)
        {
            var tableid=rst[0].id;
            var reset_time=rst[0].reset_time
            var dt=new Date(reset_time)
            const rts = dt.getTime();//reset time stamp
            dt=new Date()
            const cts = dt.getTime();//current timestamp
            var diff=cts-rts
            //86400000 ms in a day
            if(diff>86400000){
                data.errmsg="Verification token expired"
            }
            else{

                data.smsg="Code accepted"
                data.accepted=1

                var q="UPDATE users SET status=1,reset_code=NULL WHERE email=?"
                var arr=[username]
                connection.query(q,arr,function (err,rst) {
                    if(err)
                        return console.log(err.sqlMessage)
                    
                    db.log_data(tableid,"users",tableid,arr,"Verifying code");
                })
            }
        }
        else{
            //incorrect code
            data.errmsg="Incorrect token"
        }
        callback()
    })
}

function create_password(data,callback) {
   var req=data.req;
    var username=req.query.username
    var password=req.query.password;
    var tb=req.query.tb;
    var q="UPDATE users SET password=SHA1(?),status=1 WHERE email=?"
    var arr=[password,username,username]
    connection.query(q,arr,function (err,rst) {
        callback()
    })
}

function reset_password(data,callback) {
    var req=data.req;
    var id=req.user.id;

    var new_pass=req.query.new_pass;
    var old_pass=req.query.old_pass
    var tb=req.query.tb;

    var q="SELECT *FROM users WHERE id=? AND password=SHA1(?)"
    connection.query(q,[id,old_pass],function (err,rst) {
        if(err)
            return err;

        if(rst.length==0){
            data.errmsg="Old password is incorrect"
            return callback()
        }
        else{
            var q="UPDATE users SET password=SHA1(?),status=1 WHERE id=?"
            var arr=[new_pass,id]
            connection.query(q,arr,function (err,rst) {
                callback()
            })
        }
    })
}