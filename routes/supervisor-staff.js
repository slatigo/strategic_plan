'use strict'
var db= require('./db');
var connection=db.connection;
var multer  = require('multer')
var fileUpload = require('express-fileupload');
var departments=require("./departments")
var positions=require("./positions")
exports.index=function (data) {
	var rq=data.rq;
	var res=data.res;
	var req=data.req
	
	if(rq=="get-defaults"){
		
			get_staff(data,function () {
				db.ajres(data)
			})
			
	
	}
	else if(rq=="get-staff"){
		get_staff(data,function () {
			db.ajres(data)
		})
	}

	else{
		res.render("supervisor-staff",data)
	}

}

function get_staff(data,callback) {
		var req=data.req;
		var dept_id=req.user.dept_id
		var clms="staff.id,name,email,userid,psn"
		var q="SELECT "+clms+" FROM staff,users,designations WHERE users.id=staff.userid AND designations.id=designation_id AND dept_id=?"
		connection.query(q,[dept_id],function (err,rst) {
			if(err){return console.log(err.sqlMessage)}
			data.staff=rst;
			callback()

		})
	}


