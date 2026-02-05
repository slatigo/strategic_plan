'use strict'
var db= require('./db');
var connection=db.connection;

exports.index=function (data) {
	var rq=data.rq;
	var res=data.res
	var req=data.req

	//designationS
	if(rq=="add-psn"){

		add_psn(data,function () {
			get_psns(data,function () {
				db.ajres(data)
			})
		})
	}
	else if(rq=="edit-psn"){
		edit_psn(data,function () {
			get_psns(data,function () {
				db.ajres(data)
			})
		})
	}
	else if(rq=="remove-psn"){
		remove_psn(data,function () {
			get_psns(data,function () {
				db.ajres(data)
			})
		})
	}
	else if(rq=="get-psns"){

		get_psns(data,function () {
				db.ajres(data)
			})
	}
	else{
		
		res.render("positions",data)
	}
}

//designationS
function add_psn(data,callback) {
	var req=data.req;
	var psn=req.query.psn;
		var org_id=req.user.org_id
	var q="INSERT INTO designations(org_id,psn) VALUES(?,?)"
	connection.query(q,[org_id,psn],function (err,rst) {
		if(err)
			return console.log(err.sqlMessage)
		callback()
	})
}
function edit_psn(data,callback) {
	var req=data.req;
	var psn=req.query.psn;
	var cat=req.query.cat;
	var id=req.query.id;
	var role=req.query.role;
	var q="UPDATE designations SET psn=? WHERE id=?"
	connection.query(q,[psn,id],function (err,rst) {
		if(err)
			return console.log(err.sqlMessage)
		callback()
	})
}

function remove_psn(data,callback) {
	var req=data.req;
	var id=req.query.id;
	var q="DELETE FROM designations WHERE id=?"
	connection.query(q,[id],function () {
		callback()
	})
}
function get_psns(data,callback) {
	var req=data.req;
	var q="SELECT *FROM  designations  WHERE org_id=? ORDER BY psn ASC"
	connection.query(q,[req.user.org_id],function(err,rst){
		if(err)
			return console.log(err.sqlMessage)
		data.psns=rst;
		callback()
	})
}
exports.get_psns=get_psns