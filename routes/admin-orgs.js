'use strict'
var db= require('./db');
var connection=db.connection;
var users=require("./users")
exports.index=function index(data) {
	var res=data.res;
	var req=data.req;
	var rq=data.rq;
		if(rq=="get-orgs"||rq=="default"){
		
				get_orgs(data,function () {
					db.ajres(data)
				})
			
		}
		else if(rq=="add-org"){
			add_org(data,function () {
				get_orgs(data,function () {
					db.ajres(data)
				})
			})
		}

		else if(rq=="remove-org"){
			remove_org(data,function () {
				get_orgs(data,function () {
					db.ajres(data)
				})
			})
		}
		else if(rq=="edit-org"){
		get_orgs(data,function () {
			db.ajres(data)
		})	
		}
		else if(rq=="get-subscriptions"){
      get_subscriptions(data,function () {
         db.ajres(data)
      })
  	}
  	else if(rq=="remove-subscription"){
      remove_subscription(data,function () {
        db.ajres(data)
      })
   }
   	else if(rq=="add-subscription"){
   		add_subscription(data,function () {
	   			get_subscriptions(data,function () {
	        		db.ajres(data)
	      	})
   		})
   }


		else if (rq == "get-admins") {
		    get_admins(data, function () {
		        db.ajres(data)
		    })
		}
		else if (rq == "add-admin") {
			data.name=req.query.admin_name;
			data.email=req.query.admin_email;
				users.add_user(data,function () {
			    add_admin(data, function () {
            get_admins(data, function () {
                db.ajres(data)
            })
			       
			    })
			  })
		}
		else if (rq == "remove-admin") {
		    remove_admin(data, function () {
		        get_admins(data, function () {
		            db.ajres(data)
		        })
		    })
		}
		else if (rq == "edit-admin") {
			edit_admin(data, function () {
		    get_admins(data, function () {
		        db.ajres(data)
		    })
		  })
		}

	else{

		res.render("admin-orgs",data)
	}
}


function get_orgs(data,callback) {
		var req=data.req;
		var clms="orgs.id,org_name,address,phone,email,vote_code"
		
		
		var q="SELECT "+clms+" FROM orgs"
		
		connection.query(q,[req.user.id],function (err,rst) {
			if(err){return console.log(err.sqlMessage)}
			data.orgs=rst;


			callback()

		})
	}

	function add_org(data,callback) {
		var req=data.req;
		var org_name=req.query.org_name;
		var address=req.query.address;
		var phone=req.query.phone;
		var email=req.query.email
		var vote_code=req.query.vote_code
		var arr=[org_name,address,email,phone,vote_code]

		var q="INSERT INTO orgs(org_name,address,email,phone,vote_code) VALUES (?,?,?,?,?)"
		connection.query(q,arr,function (err,rst) {
			if(err){return console.log(err.sqlMessage)}
				data.org_id=rst.insertId
			callback()

		})
	}

	function edit_org(data,callback) {
		var req=data.req;
		var org_name=req.query.org_name
		var address=req.query.address;
		var email=req.query.email;
		var phone=req.query.phone;
		var id=req.query.id;
		var arr=[org_name,address,email,phone]
		var q="UPDATE orgs SET org_name=?,address=?,email=?, phone=? WHERE id=?"
		connection.query(q,arr,function (err,rst) {
			if(err){return console.log(err.sqlMessage)}
			callback()

		})
	}
	function remove_org(data,callback) {
		var req=data.req;
		var id=req.query.id;
		var arr=[id]
		var q="DELETE FROM orgs  WHERE id=?"
		connection.query(q,arr,function (err,rst) {
			if(err){return console.log(err.sqlMessage)}
			callback()

		})
	}


//SUBSCRIPTIONS
	function get_subscriptions(data,callback) {
		var req=data.req;
		var org_id=req.query.org_id;
		var clms="subscription_type,DATE_FORMAT(start_date,'%e %b %Y') AS start_date_f, end_date,DATE_FORMAT(end_date,'%e %b %Y') AS end_date_f, end_date"
		var q="SELECT "+clms+" FROM org_subscriptions WHERE org_id=?"
		connection.query(q,[org_id],function (err,rst) {
			if(err){return console.log(err.sqlMessage)}
			data.subscriptions=rst;
			

			callback()

		})
	}

	function add_subscription(data,callback) {
		var req=data.req;
		var start_date=req.query.start_date;
		var end_date=req.query.end_date;
		var subscription_type=req.query.subscription_type
		var arr=[data.org_id,start_date,end_date,subscription_type]
		
		var q="INSERT INTO org_subscriptions(org_id,start_date,end_date,subscription_type) VALUES (?,?,?,?)"
		connection.query(q,arr,function (err,rst) {
			if(err){return console.log(err.sqlMessage)}
		
			callback()

		})
	}
	function remove_subscription(data,callback) {
		var req=data.req;
		var id=req.query.id;
		var arr=[id]
		var q="DELETE FROM org_subscriptions  WHERE id=?"
		connection.query(q,arr,function (err,rst) {
			if(err){return console.log(err.sqlMessage)}
			callback()

		})
	}


function add_admin(data,callback) {
		var req=data.req;
		var org_id=req.query.org_id;
		var userid=data.userid;
		var arr=[org_id,userid]
		var q="INSERT INTO org_admins(org_id,userid) VALUES (?,?)"
		connection.query(q,arr,function (err,rst) {
			if(err){return console.log(err.sqlMessage)}
			callback()

		})
	}


function get_admins(data,callback) {
		var req=data.req;
		var org_id=req.query.org_id;
		var clms="org_admins.id,name,email,userid"
		var q="SELECT "+clms+" FROM org_admins,users WHERE users.id=org_admins.userid AND org_id=?"
		connection.query(q,[org_id],function (err,rst) {
			if(err){return console.log(err.sqlMessage)}
			data.admins=rst;
			callback()

		})
	}