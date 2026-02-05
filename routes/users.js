'use strict'
var mysql=require("mysql");
var db= require('./db');
var ind= require('./index');
var db_url=db.db_url;
var db_user=db.db_user
var db_host=db.db_host
var db_pass=db.db_pass
var connection=db.connection;
var multer  = require('multer')
var fileUpload = require('express-fileupload');
exports.index=function (data) {
   var rq=data.rq;
   var res=data.res;
   var req=data.req
   if(rq=="add-user"){
      data.name=req.query.name;
      data.email=req.query.email;
      data.priv=req.query.priv
      add_user(data,function () {
         get_users(data,function () {
           db.ajres(data)
         })
      })
   }
   else if(rq=="edit-user"){
      data.name=req.query.name;
      data.email=req.query.email;
      data.priv=req.query.priv
      data.userid=req.query.id
      edit_user(data,function () {
         get_users(data,function () {
           db.ajres(data)
         })
      })
   }
   else if(rq=="remove-user"){
      var id=req.query.id;
      db.get_del_data("users",id,function(arr){
         data.arr=arr;
         remove_user(data,function () {
            get_users(data,function () {
              db.ajres(data)
            })
         })
      })
   }
   else if(rq=="send-reset-link"){
      data.token=1;
      data.email=req.query.email;
      ind.send_reset_code(data,function(){})
       db.ajres(data)
   }
   else if(rq=="get-users"){
      get_users(data,function () {
         db.ajres(data)
      })
   }
   else if(rq=="upload-user-sign"){
      upload_user_sign(data,function () {
         get_users(data,function () {
            db.ajres(data)
         })
      })
   }
   else{
      res.render("users",data)
   }
}
function get_users(data,callback) {
   var req=data.req;
      var os=req[data.rt].os;
     if(os){
       os=Number(os)
       if(os<0)
         os=0;
     }
     else{
       os=0;
     }
     data.os=os
     var crit=req[data.rt].crit;
     
     var arrc=[]
     if(crit=="by-name"){
         var name=req[data.rt].name;
         var q="SELECT *FROM users WHERE name LIKE '%"+name+"%' OR email=? ORDER BY created DESC LIMIT ? OFFSET ?"
         var qc="SELECT COUNT(*) AS no FROM users WHERE name LIKE '%"+name+"%' OR email=?"
         var arr=[name,db.lm,os]
         arrc=[name]
      }
      else if(crit=="priv"){
         var priv=req[data.rt].priv;
         var q="SELECT *FROM users WHERE priv=? ORDER BY created DESC LIMIT ? OFFSET ?"
          var qc="SELECT COUNT(*) AS no FROM users WHERE priv=?"
          var arr=[priv,db.lm,os]
          arrc=[priv]
      }
      else{
         var q="SELECT *FROM users ORDER BY created DESC LIMIT ? OFFSET ?"
         var qc="SELECT COUNT(*) AS no FROM users"
         var arr=[db.lm,os]
      }
   connection.query(q,arr,function (err,rst) {
      if(err)
         return console.log(err.sqlMessage)
      data.users=rst;
      db.count_query(data,qc,arrc,function(){
         callback()
      })
   })
}
exports.get_users=get_users
function upload_user_sign(data,callback) {
   var req=data.req;
   var pn=req.files.user_sign;
   var userid=req.body.userid
   var dir=process.cwd()+"/public/images/uploads/sign/"+userid+".png";
   pn.mv(dir,function  (err) {
         if(err){
           console.log(err)
           data.errmsg="Unable to upload signature, please try again"
            callback()
         }
         else{
            var q="UPDATE users SET sign=1 WHERE id=?"
            var arr=[userid]
            connection.query(q,arr,function () {
                callback()
                db.log_data(req.user.id,"users",userid,arr,"Uploading user signature");
            })
         }
        
    })
}


function add_user(data,callback) {
   var email=data.email;
   var priv=data.priv;
   var name=data.name;
   if(data.eid)
      var arr=[name,email,1]
   else
      var arr=[name,email,1,0]
   var q="INSERT INTO users (name,email,status) VALUES(?,?,?)"
   connection.query(q,arr,function (err,rst) {
      if(err){
         if(err.errno==1062)
            data.errmsg="User already exists"
         else
            return console.log(err.sqlMessage,q)
         var userid=0;
         data.axn="add"
      }
      else{
         var userid=rst.insertId
         db.log_data(data.req.user.id,"users",userid,arr,"Adding user");
      }
      data.userid=userid
      data.token=1;
      if(data.req.query.send_link&&priv!="Author")
         ind.send_reset_code(data,function(){})
      callback()
   })
}
exports.add_user=add_user;
function edit_user(data,callback) {
   var email=data.email;
   var priv=data.priv;
   var name=data.name;
   var eid=data.eid;
   if(!eid)
      eid=0
   
   if(data.axn=="add-user")
   {
      //used only if no user is found in the database for 
      add_user(data,function () {
            callback()
      })
      return 0
   }

   var q="UPDATE users SET name=?,email=? WHERE id=?"
   var arr=[name,email,data.userid]
   connection.query(q,arr,function (err,rst) {
      if(err){
         if(err.errno==1062)
            data.errmsg="Email already exists"
         else
            return console.log(err.sqlMessage,q)
      }
      callback()
      db.log_data(data.req.user.id,"users",data.userid,arr,"Editing user");
      
   })
}
exports.edit_user=edit_user
function remove_user(data,callback) {
   var id=data.req.query.id;
   var q="DELETE FROM users WHERE id=?"
   connection.query(q,[id],function (err,rst) {
      if(err){
         if(err.errno==1451)
            data.errmsg="User cannot be removed, its interlinked with other entities"
         else
            return console.log(err.sqlMessage,q)
      }
      else{
         db.log_data(data.req.user.id,"users",id,data.arr,"Deleting user");
      }
      callback()
         
      
         
       

   })
}


exports.remove_user=remove_user;

function check_user_exists(data,callback) {
   var email=data.email;
   var q="SELECT *FROM users WHERE email=?"
   connection.query(q,[email],function (err,rst) {
      if(err){return console.log(err.sqlMessage)}
         var userid=0

      if(rst.length){
         userid=rst[0].id;
         //data.errmsg="Email already exists as a user"
      }
      if(data.auto_user&&userid){
         data.email=gen_code(7)+"@401.email"

         check_user_exists(data,callback)
      }
      else
         callback(userid,rst[0])
   })
}
exports.check_user_exists=check_user_exists
function reset_to_default_password(data,callback) {
   var req=data.req;
   var email=req.query.email;
   var q="UPDATE users SET password=SHA1('123456'),status=0 WHERE email=?"
   var arr=[email]
   connection.query(q,arr,function (err,rst) {
     if(err){return console.log(err.sqlMessage)}
      var userid=req.query.userid;
      db.log_data(req.user.id,"users",userid,arr,"Changing to default password");
      callback()
   })
}
exports.reset_to_default_password=reset_to_default_password