'use strict'
var db= require('./db');
var connection=db.connection;
var users=require("./users")
exports.index=function (data) {
	var rq=data.rq;
	var res=data.res;
	var req=data.req

	if(rq=="get-depts"){
		get_depts(data,function () {
				db.ajres(data)
			})
	}
	else if(rq=="add-dept"){
		add_dept(data,function () {

			get_depts(data,function () {
				db.ajres(data)
			})
		})
	}
	else if(rq=="edit-dept"){
		edit_dept(data,function () {
			get_depts(data,function () {
				db.ajres(data)
			})
		})
	}
	else if(rq=="remove-dept"){
		remove_dept(data,function () {
			get_depts(data,function () {
				db.ajres(data)
			})
		})
	}
	else if(rq=="add-dept-user"){
		//first remove any existing roles for the department for that user
		remove_supervisor_2(data,function () {
			add_supervisor(data,function () {
				get_supervisors(data,function () {
					get_depts(data,function () {
							db.ajres(data)
					})
				})
			})
		})
	}
	else if(rq=="remove-dept-user"){
		remove_supervisor(data,function () {
			get_supervisors(data,function () {
				get_depts(data,function () {
						db.ajres(data)
				})
			
			})
		})
	}
	else if(rq=="get-dept-users"){
		get_supervisors(data,function () {
			db.ajres(data)
		})
	}
	else if(rq=="get-users"){
      users.get_users(data,function () {
         db.ajres(data)
      })
  	}
  	
	else{
		res.render("departments",data)
	}
}


function get_depts(data,callback) {
	var req=data.req;
		var org_id=req.user.org_id
	var heads="(SELECT GROUP_CONCAT(name) AS head,dept_id FROM supervisors,users WHERE supervisors.userid=users.id GROUP BY dept_id) AS heads"
	var departments="(SELECT departments.id, departments.dept,title FROM departments WHERE org_id=?) AS departments"
	departments="(SELECT *FROM "+departments+") AS departments"
	var q="SELECT *FROM "+departments+" LEFT JOIN "+heads+" ON departments.id=heads.dept_id"
	connection.query(q,[org_id],function(err,rst){
		if(err)
			return console.log(err.sqlMessage)
		data.depts=rst;

		q="SELECT *FROM departments ORDER BY dept ASC"
		connection.query(q,function (err,rst) {
			if(err)
				return console.log(err.sqlMessage)
			data.mdepts=rst;

			callback()
		})
		
	})
}
exports.get_depts=get_depts

function get_all_depts(data,callback) {
	//cdept concatenated dept parent & dep
	var req=data.req;
	var org_id=req.user.org_id
	var q="SELECT *FROM departments AS depts WHERE org_id=? ORDER BY dept ASC"
	connection.query(q,[org_id],function (err,rst) {
		if(err){return console.log(err.sqlMessage,q)}
		for(var i=0;i<rst.length;i++){
			var dept=rst[i].dept;
			var pdept=rst[i].pdept;
			if(pdept)
				var cdept=dept+", "+pdept;
			else
				var cdept=dept;
			
			rst[i].cdept=cdept;
		}
		data.depts=rst;

		callback()
	})
}
exports.get_all_depts=get_all_depts
function add_dept(data,callback) {
	var req=data.req;
	var dept=req.query.dept;
	
	var access=req.query.access
	data.priv=access
	data.name=dept
	var title=req.query.dtitle
	var org_id=req.user.org_id
	var pdept_id=req.query.pdid

	var q="INSERT INTO departments(org_id,dept,pdept_id,title) VALUES(?,?,?,?)"
	connection.query(q,[org_id,dept,pdept_id,title],function (err,rst) {
		if(err)
			return console.log(err.sqlMessage)
		callback()
	})
}
function edit_dept(data,callback) {
	var req=data.req;
	var dept=req.query.dept;
	var id=req.query.id;
	var email=req.query.email
	var access=req.query.access
	data.priv=access;
	data.email=email
	data.userid=req.query.userid
	data.name=dept
	var title=req.query.dtitle
	var q="UPDATE departments SET dept=?,title=? WHERE id=?"
	connection.query(q,[dept,title,id],function (err,rst) {
		if(err)
			return console.log(err.sqlMessage)
		callback()
	})
}
function remove_dept(data,callback) {
	var req=data.req;
	var id=req.query.id;
	var q="DELETE FROM departments WHERE id=?"
	connection.query(q,[id],function () {
		callback()
	})
}

function add_supervisor(data,callback) {
	var req=data.req;
	var dept_id=req.query.dept_id
	var userid=req.query.userid;
	

	var q="INSERT INTO supervisors(dept_id,userid) VALUES(?,?)"
	connection.query(q,[dept_id,userid],function (err,rst) {
		if(err){
			if(err.errno==1062)
			{
				data.errmsg="User already added to the department"

			}
			else
				return console.log(err.sqlMessage)
		}
		callback()
	})
}
function get_supervisors(data,callback) {
	var req=data.req;
	var dept_id=req.query.dept_id
	var dp=req[data.rt].dp;
	var q="SELECT supervisors.*, users.name,users.email,departments.title FROM supervisors,users,departments WHERE supervisors.userid=users.id AND dept_id=? AND departments.id=supervisors.dept_id"
		var arr=[dept_id]
	
	connection.query(q,arr,function (err,rst) {
		if(err){return console.log(err.sqlMessage)}
		data.supervisors=rst;
	
		callback()
	})
}
exports.get_supervisors=get_supervisors
function remove_supervisor(data,callback) {
	var req=data.req;
	var id=req.query.id;
	var q="DELETE FROM supervisors WHERE id=?"
	connection.query(q,[id],function (err,rst) {
		if(err){
				return console.log(err.sqlMessage)
		}
		callback()
	})
}
function remove_supervisor_2(data,callback) {
	var req=data.req;
	var dept_id=req.query.dept_id;
	var userid=req.query.userid;
	var q="DELETE FROM supervisors WHERE userid=? AND dept_id=?"
	connection.query(q,[userid,dept_id],function (err,rst) {
		if(err){
				return console.log(err.sqlMessage)
		}
		callback()
	})
}