'use strict'
var db= require('./db');
var connection=db.connection;
var users=require("./users")
exports.index=function index(data) {
	var res=data.res;
	var rq=data.rq;

	if(rq=="add-admin"){
		add_admin(data,function () {
			get_admins(data,function () {
				db.ajres(data)
			})
		})
	}
	else if(rq=="remove-admin"){
		remove_admin(data,function () {
			get_admins(data,function () {
				db.ajres(data)
			})
		})
	}
	else if(rq=="get-admins"){
		get_admins(data,function () {
			db.ajres(data)
		})	
	}
	else if(rq=="get-users"){
      users.get_users(data,function () {
         db.ajres(data)
      })
  	}
  	 else if(rq=="get-rights"){
      get_rights(data,function (argument) {
        db.ajres(data)
      })
   }
   else if(rq=="update-rights"){
   	update_rights(data,function () {
   		get_rights(data,function (argument) {
        		db.ajres(data)
      	})
   	})
   }
	else{

		res.render("roles",data)
	}
}


function get_rights(data,callback) {
	var req=data.req;
	var priv=req[data.rt].priv;
	var userid=req[data.rt].userid;
	//raid right assignment id
	var q="SELECT *FROM (SELECT *FROM access_rules WHERE priv=?) AS ar LEFT JOIN (SELECT id AS raid, accid FROM access_allowed WHERE userid=?) AS accal ON ar.id=accal.accid"
	connection.query(q,[priv,userid],function (err,rst) {
		if(err){return console.log(err.sqlMessage)}
		data.rights=rst;

		callback()
	})
}
function update_rights(data,callback) {
	var req=data.req;

	var rm=req[data.rt].rm;//rights array for removal
	var ad=req[data.rt].ad;//rights for addition
	rm=JSON.parse(rm)
	ad=JSON.parse(ad)
	var userid=req[data.rt].userid
	add_rights(ad,userid,function () {
		remove_rights(rm,function () {
			callback()
		})
	})

}

function add_rights(ad,userid,callback) {

	if(ad.length==0)
		return callback()
	
	var q="INSERT INTO access_allowed(userid,accid) VALUES "
	for(var i=0;i<ad.length;i++){
		var rid=ad[i];
		
		q+="("+userid+","+rid+"),"
	}
	q=q.substring(q,q.length-1)
	
	connection.query(q,function (err,rst) {

		if(err){
			if(err.errno==1062)
				;
			else
				return console.log(err.sqlMessage)
		}
		callback()
	})
}
function remove_rights(rm,callback) {
	if(rm.length==0)
		return callback()
	var q="DELETE FROM access_allowed WHERE "
	for(var i=0;i<rm.length;i++){
		var id=rm[i];
		q+="id="+id+" OR "
	}
	q=q.substring(q,q.length-4)

	connection.query(q,function (err,rst) {
		if(err){return console.log(err.sqlMessage)}
		callback()
	})
}


function add_admin(data,callback) {
	var req=data.req;
	var userid=req[data.rt].userid;
	var role=req[data.rt].role
	var end_date=req.query.end_date;
	var start_date=req.query.start_date;
	var q="INSERT INTO admins(userid,role,start_date,end_date) VALUES (?,?,?,?)"
	connection.query(q,[userid,role,start_date,end_date],function (err,rst) {
		if(err){
			if(err.errno==1062)
			{
				data.errmsg="User already has the specified role"
			}
			else
				return console.log(err.sqlMessage)
		}

		callback()
	})
}
function remove_admin(data,callback) {
	var req=data.req;
	var userid=req[data.rt].userid;
	var role=req[data.rt].role
	var id=req[data.rt].id;
	var q="DELETE FROM admins WHERE id=?"
	connection.query(q,[id],function (err,rst) {
		if(err){
			return console.log(err.sqlMessage)
		}
		callback()
	})
}
function get_admins(data,callback) {
	var q="SELECT admins.id,admins.role,users.name,users.email,users.id AS userid,DATE_FORMAT(start_date,'%e %b %y') AS start_datef,DATE_FORMAT(end_date,'%e %b %y') AS end_datef,start_date,end_date FROM admins,users WHERE admins.userid=users.id"
	connection.query(q,function (err,rst) {
		if(err)
			return console.log(err.sqlMessage)
		data.admins=rst;
		
		callback()
	})
}
