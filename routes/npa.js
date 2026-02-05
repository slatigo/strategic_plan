'use strict'
var db=require("./db")
var connection=db.connection
var orgs=require("./admin-orgs")
var multer  = require('multer')
var fileUpload = require('express-fileupload');
var plans=require("./npa-plans")
function index(req,res){
	var dt=new Date()
	var data={title:db.title,req:req,res:res,date:dt}
   var ajax=req.query.ajax;
   if(req.cookies.user&&req.cookies.user!="0")
      req.user=req.cookies.user;
   else
      req.user=0
   if(!req.user){
      if(ajax){
        return res.send({errmsg:"Your Session expired",et:"session-expired"})
      }
      else
        return res.redirect("/")
   }
   else if(req.user.priv!="npa"){

      if(ajax){
        
        return res.send({errmsg:"You have no priviledge to access this account"})
      }
      else{
      	
         if(req.user.priv=="org_admin")
            return res.redirect("/org_admin")
      }
   }
  	data.user=req.user;
  	res.cookie("user",req.user,{maxAge: 50*60*1000})
  	data.me=req.user
   var rq=req.query.rq;
   var crq=req.query.crq;
   var pg=req.query.pg

   data.rt="query"
   if(!pg)
    {
        rq=req.body.rq;
        crq=req.body.crq;
        pg=req.body.pg;
        if(rq)
         data.rt="body"
   }	
   data.rq=rq;
  
   if(pg=="orgs"){
		orgs.index(data)
		return 0;
	}
   if(pg=="plans"||!pg){

      plans.index(data)
      return 0;
   }
	else if(pg=="users"){
			users.index(data)
			return 0;
	}
   else if(pg=="orgs"||!pg){
      orgs.index(data)
   }
}

exports.index=index