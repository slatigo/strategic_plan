'use strict'
var db= require('./db');
var connection=db.connection;
var users=require("./users")
exports.index=function (data) {
	var rq=data.rq;
	var res=data.res;
	var req=data.req
	if(rq=="get-plans"){
		get_plans(data,function () {
			get_progs(data,function () {
				db.ajres(data)
			})
			
		})
	}
	else if(rq=="get-plans"){
		get_plans(data,function () {
			db.ajres(data)
		})
	}
	else if(rq=="submit-plan"){

		submit_plan(data,function () {
			get_plans(data,function () {
				db.ajres(data)
			})
		})
	}
	else if(rq=="preview-plan"){
		get_preview(data)
	}
	else{
		res.render("npa-plans",data)
	}
	
	
}
function get_plan(data,callback) {
	var req=data.req;
	var plan_id=req.query.plan_id
	var q="SELECT plans.id,prog_id,plan,prog_name,programme_goal,fy,status,DATE_FORMAT(plans.recorded,'%e %b %Y') AS recorded FROM plans,programmes WHERE plans.prog_id=programmes.id AND plans.id=?"
	connection.query(q,[plan_id],function(err,rst){
		if(err)
			return console.log(err)
		
		data.plan=rst[0];
		callback()
	})
}

function get_preview(data,cb) {
	get_plan(data,function () {
	     get_sp_objectives(data,()=>{
	     	get_sp_outcomes(data,()=>{
	     		get_sp_outcome_indicators(data,()=>{
				 get_sp_interventions(data,()=>{
				 	 get_sp_outputs(data,()=>{
				 	 	 get_sp_output_indicators(data,function () {
				 	 	 	  get_sp_output_actions(data,()=>{
				 	 	 	  	db.ajres(data);
				 	 	 	  });
				 	 	 });
				 	 });
				 });
	     			
	     		})
	     	});
	     });
	})
    
    
 
}
function get_progs(data,callback) {
	var q="SELECT *FROM programmes"
	connection.query(q,function (err,rst) {
		if(err){return console.log(err)}
		data.progs=rst;
		callback()
	})
}

//OBJECTIVES
function get_objectives(data,callback) {
	var req=data.req;
	var prog_id=req.query.prog_id
	var q="SELECT *FROM objectives WHERE prog_id=?"
	connection.query(q,[prog_id],function (err,rst) {
		if(err){return console.log(err)}
		data.objectives=rst;
		callback()
	})
}

function add_objective(data,callback) {
	var req=data.req;
	
	var objective_id=req.query.objective_id
	var org_objective=req.query.org_objective
	var plan_id=req.query.plan_id
	var q="INSERT INTO sp_objectives(plan_id,objective_id,org_objective) VALUES(?,?,?)"
	connection.query(q,[plan_id,objective_id,org_objective],function (err,rst) {
		if(err){
			if(err.errno==1062){
				data.errmsg="Objective already added"
			}
			else
				return console.log(err)
		}
		callback()
	})
}
function get_sp_objectives(data,callback) {
	var req=data.req;
	var plan_id=req.query.plan_id
	var q="SELECT *FROM sp_objectives,objectives WHERE objectives.id=objective_id AND plan_id=?"
	connection.query(q,[plan_id],function (err,rst) {
		if(err){return console.log(err)}
		data.sp_objectives=rst;
		

		callback()
	})
}

//OUTCOMES
function add_outcome(data,callback) {
	var req=data.req;
	
	var outcome_id=req.query.outcome_id
	var sp_objective_id=req.query.sp_objective_id
	var plan_id=req.query.plan_id
	var q="INSERT INTO sp_outcomes(sp_objective_id,outcome_id,plan_id) VALUES(?,,?)"
	connection.query(q,[sp_objective_id,outcome_id,plan_id],function (err,rst) {
		if(err){
			if(err.errno==1062){
				data.errmsg="Outcome already added"
			}
			else
				return console.log(err)
		}
		callback()
	})
}
function get_sp_outcomes(data,callback) {
	var req=data.req;
	var sp_objective_id=req.query.sp_objective_id
	var plan_id=req.query.plan_id
	var plan_id=req.query.plan_id;
var idq="plan_id=?"
	var arr=[plan_id]
	if(sp_objective_id){
		var idq="sp_objective_id=?"
		var arr=[sp_objective_id]
	}
	var q="SELECT *FROM sp_outcomes,outcomes WHERE outcomes.id=outcome_id AND "+idq;
	connection.query(q,arr,function (err,rst) {
		if(err){return console.log(err)}
		data.sp_outcomes=rst;
		

		callback()
	})
}
//OUTCOME INDICATORS
function add_sp_outcome_indicator(data,callback) {
	var req=data.req;
	
	var outcome_indicator_id=req.query.outcome_indicator_id
	var sp_outcome_id=req.query.sp_outcome_id
	var aoi=req.query.adapted_outcome_indicator;
	var plan_id=req.query.plan_id
	if(!aoi)
		aoi=0;
	var q="INSERT INTO sp_outcome_indicators(sp_outcome_id,outcome_indicator_id,adapted_outcome_indicator,plan_id) VALUES(?,?,?,?)"
	connection.query(q,[sp_outcome_id,outcome_indicator_id,aoi,plan_id],function (err,rst) {
		if(err){
			if(err.errno==1062){
				data.errmsg="Indicator already added"
			}
			else
				return console.log(err)
		}
		callback()
	})
}
function get_sp_outcome_indicators(data,callback) {
	var req=data.req;
	var sp_outcome_id=req.query.sp_outcome_id
	var plan_id=req.query.plan_id
	var plan_id=req.query.plan_id;
	var idq="plan_id=?"

	var arr=[plan_id]
	if(sp_outcome_id){
		var idq=" sp_outcome_id=?"
		var arr=[sp_outcome_id]
	}
	var q="SELECT sp_outcome_indicators.*, indicator FROM sp_outcome_indicators,outcome_indicators WHERE outcome_indicators.id=outcome_indicator_id AND "+idq;
	connection.query(q,arr,function (err,rst) {
		if(err){return console.log(err)}
		data.sp_outcome_indicators=rst;
		var idq="plan_id=?"
		q="SELECT tb1.* FROM sp_outcome_indicator_targets AS tb1,sp_outcome_indicators AS tb2 WHERE tb1.sp_outcome_indicator_id=tb2.id AND tb1."+idq;

		connection.query(q,arr,function (err,rst) {
			if(err){return console.log(err)}
			data.sp_outcome_indicator_targets=rst;
			callback()
		})
		
	})
}

function get_outcome_indicators(data,callback) {
	var req=data.req;
	var outcome_id=req.query.outcome_id
	var q="SELECT *FROM outcome_indicators WHERE outcome_id=?"
	connection.query(q,[outcome_id],function (err,rst) {
		if(err){return console.log(err)}
		data.outcome_indicators=rst;
		callback()
	})
}
function get_outcomes(data,callback) {
	var req=data.req;
	var objective_id=req.query.objective_id
	
	var q="SELECT *FROM outcomes WHERE objective_id=?"
	connection.query(q,[objective_id],function (err,rst) {
		if(err){return console.log(err)}
		data.outcomes=rst;
		callback()
	})
}
function add_sp_outcome_indicator_target(i,data,callback) {
	var req=data.req;
	var targets= Object.values(req.query.targets);
	if(i==targets.length){
		
		return callback()
	}
	var  id=targets[i].id;
	var fy=targets[i].fy;
	var val=targets[i].value;
	var sp_outcome_indicator_id=targets[i].sp_outcome_indicator_id;
	var plan_id=req.query.plan_id
	var q="INSERT INTO sp_outcome_indicator_targets(sp_outcome_indicator_id,fy,val,plan_id) VALUES(?,?,?,?)"
	connection.query(q,[sp_outcome_indicator_id,fy,val,plan_id],function (err,rst) {

		if(err){

			if(err.errno==1062){
				var q="UPDATE sp_outcome_indicator_targets SET fy=?,val=? WHERE id=?"
				connection.query(q,[fy,val,id],function (err,rst) {
					if(err){return console.log(err)}
						add_sp_outcome_indicator_target(++i,data,callback)
					
				})
			}
			else
				return console.log(err)
		}
		else{

			add_sp_outcome_indicator_target(++i,data,callback)
		}
		
	})
}
function get_intermediate_outcomes(data,callback) {
	var q="SELECT *FROM intermediate_outcomes"
	connection.query(q,function (err,rst) {
		if(err){return console.log(err)}
		data.intermediate_outcomes=rst;
		callback()
	})
}


//INTERVENTIONS

function add_intervention(data,callback) {
	var req=data.req;
	
	var intervention_id=req.query.intervention_id
	var sp_outcome_id=req.query.sp_outcome_id
	var plan_id=req.query.plan_id
	var q="INSERT INTO sp_interventions(sp_outcome_id,intervention_id,plan_id) VALUES(?,?,?)"
	connection.query(q,[sp_outcome_id,intervention_id,plan_id],function (err,rst) {
		if(err){
			if(err.errno==1062){
				data.errmsg="Intervention already added"
			}
			else
				return console.log(err)
		}
		callback()
	})
}
function get_sp_interventions(data,callback) {
	var req=data.req;
	var sp_outcome_id=req.query.sp_outcome_id
	var plan_id=req.query.plan_id
	var plan_id=req.query.plan_id;
var idq="plan_id=?"
	var arr=[plan_id]
	if(sp_outcome_id){
		var idq=" sp_outcome_id=?"
		var arr=[sp_outcome_id]
	}
	var q="SELECT *FROM sp_interventions,interventions WHERE interventions.id=intervention_id AND "+idq;
	connection.query(q,arr,function (err,rst) {
		if(err){return console.log(err)}
		data.sp_interventions=rst;


		callback()
	})
}

function get_interventions(data,callback) {
	var req=data.req;
	var outcome_id=req.query.outcome_id

	var q="SELECT *FROM interventions WHERE outcome_id=?"
	connection.query(q,[outcome_id],function (err,rst) {
		if(err){return console.log(err)}
		data.interventions=rst;
		callback()
	})
}


//OUTPUTS

function get_outputs(data,callback) {
	var req=data.req;
	var intervention_id=req.query.intervention_id
	var q="SELECT *FROM outputs WHERE intervention_id=?"
	connection.query(q,[intervention_id],function (err,rst) {
		if(err){return console.log(err)}
		data.outputs=rst;

		callback()
	})
}
function add_output(data,callback) {
	var req=data.req;
	
	var output_id=req.query.output_id
	var sp_intervention_id=req.query.sp_intervention_id
	var plan_id=req.query.plan_id
	var q="INSERT INTO sp_outputs(sp_intervention_id,output_id,plan_id) VALUES(?,?,?)"
	connection.query(q,[sp_intervention_id,output_id,plan_id],function (err,rst) {
		if(err){
			if(err.errno==1062){
				data.errmsg="Output already added"
			}
			else
				return console.log(err)
		}
		callback()
	})
}
function get_sp_outputs(data,callback) {
	var req=data.req;
	var sp_intervention_id=req.query.sp_intervention_id
	var plan_id=req.query.plan_id;
	var idq="plan_id=?"
	var arr=[plan_id]
	if(sp_intervention_id){
		var idq=" sp_intervention_id=?"
		var arr=[sp_intervention_id]
	}
	var q="SELECT *FROM sp_outputs,outputs WHERE outputs.id=output_id AND "+idq;
	connection.query(q,arr,function (err,rst) {
		if(err){return console.log(err)}
		data.sp_outputs=rst;
		callback()
	})
}


//OUTPUT ACTIONS
function add_sp_output_actions(data,callback) {
	var req=data.req;
	
	var output_action_id=req.query.output_action_id
	var sp_output_id=req.query.sp_output_id
	var aoi=req.query.adapted_output_action;
	var plan_id=req.query.plan_id
	if(!aoi)
		aoi=0;
	var q="INSERT INTO sp_output_actions(sp_output_id,output_action_id,adapted_output_action,plan_id) VALUES(?,?,?,?)"
	connection.query(q,[sp_output_id,output_action_id,aoi,plan_id],function (err,rst) {
		if(err){
			if(err.errno==1062){
				data.errmsg="Action already added"
			}
			else
				return console.log(err)
		}
		callback()
	})
}
function get_sp_output_actions(data,callback) {
	var req=data.req;
	var sp_output_id=req.query.sp_output_id
	var plan_id=req.query.plan_id;
var idq="tb1.plan_id=?"
	var arr=[plan_id]
	if(sp_output_id){
		var idq=" sp_output_id=?"
		var arr=[sp_output_id]

	}
	var q="SELECT tb1.*,action FROM sp_output_actions AS tb1,output_actions AS tb2 WHERE tb2.id=output_action_id AND "+idq;
	connection.query(q,arr,function (err,rst) {
		if(err){return console.log(err)}
			q=""
		data.sp_output_actions=rst;

		q="SELECT tb1.* FROM sp_output_action_budgets AS tb1,sp_output_actions AS tb2 WHERE tb1.sp_output_action_id=tb2.id AND "+idq;

		connection.query(q,arr,function (err,rst) {
			if(err){return console.log(err)}
			data.sp_output_action_budgets=rst;

			callback()
		})
		
	})
}

function get_output_actions(data,callback) {
	var req=data.req;
	var output_id=req.query.output_id

	var q="SELECT *FROM output_actions WHERE output_id=?"
	connection.query(q,[output_id],function (err,rst) {
		if(err){return console.log(err)}
		data.output_actions=rst;

		callback()
	})
}
function add_sp_output_action_budget(i,data,callback) {
	var req=data.req;

	var budgets= Object.values(req.query.budgets);
	if(i==budgets.length){
		
		return callback()
	}
	var  id=budgets[i].id;
	var fy=budgets[i].fy;
	var val=budgets[i].value;
	var sp_output_action_id=budgets[i].sp_output_action_id;
	var plan_id=req.query.plan_id
	var q="INSERT INTO sp_output_action_budgets(sp_output_action_id,fy,val,plan_id) VALUES(?,?,?,?)"
	connection.query(q,[sp_output_action_id,fy,val,plan_id],function (err,rst) {

		if(err){

			if(err.errno==1062){
				var q="UPDATE sp_output_action_budgets SET fy=?,val=? WHERE id=?"
				connection.query(q,[fy,val,id],function (err,rst) {
					if(err){return console.log(err)}
						add_sp_output_action_budget(++i,data,callback)
					
				})
			}
			else
				return console.log(err)
		}
		else{

			add_sp_output_action_budget(++i,data,callback)
		}
		
	})
}
//OUTPUT INDICATOR
//OUTPUT ACTIONS
function add_sp_output_indicators(data,callback) {
	var req=data.req;
	
	var output_indicator_id=req.query.output_indicator_id
	var sp_output_id=req.query.sp_output_id
	var aoi=req.query.adapted_output_indicator;
	var plan_id=req.query.plan_id
	if(!aoi)
		aoi=0;
	var q="INSERT INTO sp_output_indicators(sp_output_id,output_indicator_id,adapted_output_indicator,plan_id) VALUES(?,?,?,?)"
	connection.query(q,[sp_output_id,output_indicator_id,aoi,plan_id],function (err,rst) {
		if(err){
			if(err.errno==1062){
				data.errmsg="Indicator already added"
			}
			else
				return console.log(err)
		}
		callback()
	})
}
function get_sp_output_indicators(data,callback) {
	var req=data.req;
	var sp_output_id=req.query.sp_output_id
	var plan_id=req.query.plan_id;
var idq="tb1.plan_id=?"
	var arr=[plan_id]
	if(sp_output_id){
		var idq=" sp_output_id=?"
		var arr=[sp_output_id]
	}
	var q="SELECT tb1.*,indicator FROM sp_output_indicators AS tb1,output_indicators AS tb2 WHERE tb2.id=output_indicator_id AND "+idq;
	connection.query(q,arr,function (err,rst) {
		if(err){return console.log(err,q)}
		data.sp_output_indicators=rst;
		q="SELECT tb1.* FROM sp_output_indicator_targets AS tb1,sp_output_indicators AS tb2 WHERE tb1.sp_output_indicator_id=tb2.id AND "+idq;

		connection.query(q,arr,function (err,rst) {
			if(err){return console.log(err)}
			data.sp_output_indicator_targets=rst;
			callback()
		})
	})
}

function get_output_indicators(data,callback) {
	var req=data.req;
	var output_id=req.query.output_id

	var q="SELECT *FROM output_indicators WHERE  output_id=?"
	connection.query(q,[output_id],function (err,rst) {
		if(err){return console.log(err)}
		data.output_indicators=rst;
		callback()
	})
}
function add_sp_output_indicator_target(i,data,callback) {
	var req=data.req;

	var targets= Object.values(req.query.targets);
	if(i==targets.length){
		
		return callback()
	}
	var  id=targets[i].id;
	var fy=targets[i].fy;
	var val=targets[i].value;
	var sp_output_indicator_id=targets[i].sp_output_indicator_id;
	var plan_id=req.query.plan_id
	var q="INSERT INTO sp_output_indicator_targets(sp_output_indicator_id,fy,val,plan_id) VALUES(?,?,?,?)"
	connection.query(q,[sp_output_indicator_id,fy,val,plan_id],function (err,rst) {

		if(err){

			if(err.errno==1062){
				var q="UPDATE sp_output_indicator_targets SET fy=?,val=? WHERE id=?"
				connection.query(q,[fy,val,id],function (err,rst) {
					if(err){return console.log(err)}
						add_sp_output_indicator_target(++i,data,callback)
					
				})
			}
			else
				return console.log(err)
		}
		else{

			add_sp_output_indicator_target(++i,data,callback)
		}
		
	})
}
//PLANS
function get_plans(data,callback) {
	var req=data.req;
	var org_id=req.user.org_id
	var q="SELECT org_name,plans.id,prog_id,plan,prog_name,fy,status,DATE_FORMAT(plans.recorded,'%e %b %Y') AS recorded,DATE_FORMAT(plans.submission_date,'%e %b %Y') AS submission_date FROM plans,programmes,orgs WHERE plans.prog_id=programmes.id AND (status='Pending NPA Approval' OR status='Approved' OR status='Declined') AND orgs.id=plans.org_id"
	connection.query(q,function(err,rst){
		if(err)
			return console.log(err)
		data.plans=rst;
		callback()
	})
}


function add_plan(data,callback) {
	var req=data.req;
	var plan=req.query.plan;
	var org_id=req.user.org_id;

	var userid=req.user.id
	var prog_id=req.query.prog_id
	var fy=req.query.prog_id
	var q="INSERT INTO plans(plan,userid,org_id,prog_id,fy) VALUES(?,?,?,?,?)"
	connection.query(q,[plan,userid,org_id,prog_id,fy],function (err,rst) {
		if(err)
			return console.log(err)
		callback()
	})
}
function submit_plan(data,callback) {
	var req=data.req;
	var plan_id=req.query.plan_id;
	var status=req.query.action;
	var q="UPDATE plans SET status=? WHERE id=?"
	connection.query(q,[status,plan_id],function (err,rst) {
		if(err)
			return console.log(err)
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
			return console.log(err)
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
				return console.log(err)
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
		if(err){return console.log(err)}
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
				return console.log(err)
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
				return console.log(err)
		}
		callback()
	})
}