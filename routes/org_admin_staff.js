'use strict'
var db= require('./db');
var connection=db.connection;
var users=require("./users")
var departments=require("./departments")
var designations=require("./positions")
exports.index=function index(data) {
	var res=data.res;
	var req=data.req;
	var rq=data.rq;
		if(rq=="get-default"){
			departments.get_all_depts(data,function () {
				designations.get_psns(data,function () {
				
					db.ajres(data)
				})
				
			})
		}


		else if (rq == "get-staff") {
		    get_staff(data, function () {
		        db.ajres(data)
		    })
		}
		else if (rq == "add-staff") {
			data.name=req.query.name;
			data.email=req.query.email;
			users.add_user(data,function () {
			    add_staff(data, function () {
		            get_staff(data, function () {
		                db.ajres(data)
		            })
			    })
			})
		}
		else if (rq == "remove-staff") {
		    remove_staff(data, function () {
		        get_staff(data, function () {
		            db.ajres(data)
		        })
		    })
		}
		else if (rq == "edit-staff") {
			edit_staff(data, function () {
		    get_staff(data, function () {
		        db.ajres(data)
		    })
		  })
		}

	else{

		res.render("org_admin-staff",data)
	}
}



function add_staff(data,callback) {
		var req=data.req;
		var org_id=req.query.org_id;
		var userid=data.userid;
		var dept_id=req.query.dept_id;
		var designation_id=req.query.designation_id;
		var arr=[userid,designation_id,dept_id]
		var q="INSERT INTO staff(userid,designation_id,dept_id) VALUES (?,?,?)"
		connection.query(q,arr,function (err,rst) {
			if(err){return console.log(err.sqlMessage)}
			callback()

		})
	}


function get_staff(data,callback) {
		var req=data.req;
		var dept_id=req.query.dept_id;
		var clms="staff.id,name,email,userid,psn"
		var q="SELECT "+clms+" FROM staff,users,designations WHERE users.id=staff.userid AND designations.id=designation_id AND dept_id=?"
		connection.query(q,[dept_id],function (err,rst) {
			if(err){return console.log(err.sqlMessage)}
			data.staff=rst;
			callback()

		})
	}