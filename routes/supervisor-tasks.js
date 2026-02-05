'use strict'
var mysql=require("mysql");
var db= require('./db');
var connection=db.connection;
var multer  = require('multer')
var fileUpload = require('express-fileupload');

exports.index=function (data) {
	var rq=data.rq;
	var res=data.res;
	var req=data.req
	var cdate=new Date()
	data.cyear=cdate.getFullYear()
	cdate=cdate.getFullYear()+"-"+(cdate.getMonth()+1)+"-"+cdate.getDate()
	data.cdate=cdate

	//cras contract renewal applications
	if(rq=="get-default"){
		get_task_envelopes(data,function () {
			db.ajres(data)
		
		})
	}
	else if(rq=="get-envelopes"){
		get_task_envelopes(data,function () {
			db.ajres(data)
		
		})
	}
	else if(rq=="submit-envelope"){
		submit_envelope(data,function () {
			get_tasks(data,function () {
				db.ajres(data)
		
			})
		})
	}
	
	else if(rq=="get-tasks"){
		get_tasks(data,function () {
			db.ajres(data)
		
		})
	}
	else if(rq=="add-task"){
		add_task(data,function () {
			get_tasks(data,function () {
				db.ajres(data)
		
			})
		})
	}
	else if(rq=="remove-task"){
		remove_task(data,function () {
			get_tasks(data,function () {
				db.ajres(data)
		
			})
		})
	}
	else if(rq=="edit-task"){
		edit_task(data,function () {
			get_tasks(data,function () {
				db.ajres(data)
		
			})
		})
	}
	else{
		res.render("supervisor-tasks",data)
	}
	

}
	function get_task_envelopes(data,callback) {
		var req=data.req;
		var status=req.query.status;
		var dept_id=req.user.dept_id
		if(!status)
			status="Pending Supervisor Review"
		
		var clms="tes.id,name,label,tes.status,DATE_FORMAT(from_date,'%e %b %Y') AS from_date_f, from_date,DATE_FORMAT(to_date,'%e %b %Y') AS to_date_f, from_date,DATE_FORMAT(time_submitted,'%e %b %Y %l %M %p') AS time_submitted"
		var q="SELECT "+clms+" FROM task_envelopes AS tes,users WHERE users.id=userid AND dept_id=? AND tes.status=?"
		connection.query(q,[dept_id,status],function (err,rst) {
			if(err){return console.log(err.sqlMessage)}
			data.envelopes=rst;

			callback()

		})
	}
	function submit_envelope(data,callback) {
		var req=data.req;
		var env_id=req.query.env_id
		var status='Reviewed';
		var remark=req.query.remark

		data.status=status;
		var arr=[status,remark,req.user.id,env_id]

		var q="UPDATE task_envelopes SET status=?,remark=?, time_reviewed=now(),reviewer_userid=? WHERE id=?"
		connection.query(q,arr,function (err,rst) {
			if(err){return console.log(err.sqlMessage)}
			callback()
		})
	}
//TASKS
function get_tasks(data,callback) {
	var req=data.req;
	var env_id=req.query.env_id;
	var q="SELECT *FROM tasks WHERE env_id=?"
	connection.query(q,[env_id],function (err,rst) {
		if(err){return console.log(err.sqlMessage)}
		data.tasks=rst;
		callback()

	})
}
function add_task(data,callback) {
	var req=data.req;
	var task=req.query.task;
	var env_id=req.query.env_id
	var arr=[env_id,task]
	var q="INSERT INTO tasks(env_id,task) VALUES (?,?)"
	connection.query(q,arr,function (err,rst) {
		if(err){return console.log(err.sqlMessage)}
		data.tasks=rst;
		callback()

	})
}
function edit_task(data,callback) {
	var req=data.req;
	var task=req.query.task;
	var id=req.query.id;
	var arr=[task]
	var q="UPDATE task SET task=? WHERE id=?"
	connection.query(q,arr,function (err,rst) {
		if(err){return console.log(err.sqlMessage)}
		callback()

	})
}
function remove_task(data,callback) {
	var req=data.req;
	var id=req.query.id;
	var arr=[id]
	var q="DELETE FROM tasks  WHERE id=?"
	connection.query(q,arr,function (err,rst) {
		if(err){return console.log(err.sqlMessage)}
		callback()

	})
}