'use strict'
var db=require("./db")
var connection=db.connection
var plans=require("./org_admin-plans")
var multer  = require('multer')
var fileUpload = require('express-fileupload');
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
   else if(req.user.priv!="org_admin"){

      if(ajax){
        
        return res.send({errmsg:"You have no priviledge to access this account"})
      }
      else{
      	if(req.user.priv=="hdm")
         	return res.redirect("/hdm")
        	if(req.user.priv=="staff")
          	return res.redirect("/staff")
         if(req.user.priv=="admin")
            return res.redirect("/admin")
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

   if(pg=="plans"||!pg){

			plans.index(data)
			return 0;
	}
	else if(pg=="staff"){

			staff.index(data)
			return 0;
	}
	else if(pg=="designations"){
			positions.index(data)
			return 0;
	}
}

exports.index=index