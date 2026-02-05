'use strict'
var db= require('./db');
var connection=db.connection;
var users=require("./users")
exports.index=function index(data) {
	var res=data.res;
	var rq=data.rq;
	
	if(rq=="get-lglogs"){
		get_lg_logs(data,function () {
			db.ajres(data)
		})	
	}
	else if(rq=="get-activity"){
		get_activity(data,function () {
			db.ajres(data)
		})
	}
	else if(rq=="get-users"){
      users.get_users(data,function () {
         db.ajres(data)
      })
  	}
	else{
		res.render("admin-logs",data)
	}
}


function get_lg_logs(data,callback) {
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
   var crit=req.query.crit;
   if(crit=="name"){
   	var name=req.query.name
   	var qc="SELECT users.id,email,name,lglogs.status,uagent,DATE_FORMAT(lglogs.recorded,'%e %b %Y %r')  AS recorded FROM lglogs,users WHERE (name LIKE '%"+name+"%' OR email='"+name+"') AND lglogs.userid=users.id ORDER BY lglogs.id"
   }
   else{
   	var qc="SELECT users.id,email,name,lglogs.status,uagent,DATE_FORMAT(lglogs.recorded,'%e %b %Y %r')  AS recorded FROM lglogs,users WHERE lglogs.userid=users.id ORDER BY lglogs.id"
   }
	
	var arrc=[]
	var q=qc+" DESC LIMIT ? OFFSET ?"
	var arr=[db.lm,os]	
	connection.query(q,arr,function (err,rst) {
		if(err)
			return console.log(err.sqlMessage)
		data.lglogs=rst;
		if(qc){
			db.count_query(data,qc,arrc,function () {
				callback()
			})
		}
		else{
			callback()
		}
	})
}


function get_activity(data,callback) {
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
    var userid=req.query.userid;
    var q="SELECT userid,message,arr,DATE_FORMAT(ltime,'%e %b %Y %r')  AS ltime FROM logs WHERE userid=? ORDER BY id DESC"
    connection.query(q,[userid],function (err,rst) {
    	data.logs=rst;
    	callback()
    })
}